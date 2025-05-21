# analysis_bivariado.py
"""
Módulo para análisis bivariado de variables en encuestas de satisfacción.

Este módulo proporciona funciones para analizar relaciones entre pares de variables,
generando visualizaciones y estadísticas descriptivas. Soporta exportación de resultados
en múltiples formatos como Excel, PDF, PNG y JSON para visualización web con Plotly.

Autor: Equipo de Estadística Coltefinanciera
Fecha: Mayo 2025
Versión: 1.3
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
import json
import os
from scipy import stats
from scipy.stats import chi2_contingency, shapiro, mannwhitneyu, kruskal, levene, fisher_exact
import statsmodels.api as sm
from statsmodels.stats.multicomp import pairwise_tukeyhsd, MultiComparison
from statsmodels.stats.power import TTestIndPower, tt_ind_solve_power
from src.exporter import export_table_to_excel, add_figure_for_pdf, save_plot_to_png

# Funciones de validación de supuestos estadísticos

def verificar_normalidad(data, columna, alpha=0.05, plot=False):
    """
    Verifica la normalidad de una variable usando la prueba de Shapiro-Wilk.
    
    Parameters
    ----------
    data : pandas.DataFrame
        DataFrame que contiene los datos
    columna : str
        Nombre de la columna a verificar
    alpha : float, optional
        Nivel de significancia, por defecto 0.05
    plot : bool, optional
        Si se debe generar un QQ-plot, por defecto False
    
    Returns
    -------
    dict
        Resultados de la prueba incluyendo estadístico, p-valor, conclusión
        y opcionalmente la figura del QQ-plot
    """
    # Eliminar valores faltantes
    datos = data[columna].dropna()
    
    # Comprobar que hay suficientes observaciones
    if len(datos) < 3:
        return {
            "es_normal": False,
            "interpretacion": "Insuficientes observaciones para realizar la prueba de normalidad",
            "mensaje": "Se recomienda usar pruebas no paramétricas debido a la cantidad limitada de datos"
        }
    
    # Realizar prueba de Shapiro-Wilk
    estadistico, p_valor = shapiro(datos)
    
    # Interpretar resultado
    es_normal = p_valor > alpha
    
    resultado = {
        "estadistico": estadistico,
        "p_valor": p_valor,
        "es_normal": es_normal,
        "interpretacion": f"Los datos {'siguen' if es_normal else 'no siguen'} una distribución normal (p={p_valor:.4f})",
        "mensaje": f"{'Se pueden utilizar pruebas paramétricas' if es_normal else 'Se recomienda usar pruebas no paramétricas'}"
    }
    
    # Generar QQ-plot si se solicita
    if plot:
        fig = plt.figure(figsize=(10, 6))
        ax1 = fig.add_subplot(121)
        ax2 = fig.add_subplot(122)
        
        # Histograma
        ax1.hist(datos, bins=15, alpha=0.7, color='skyblue', edgecolor='black')
        ax1.set_title('Histograma')
        ax1.set_xlabel(columna)
        ax1.set_ylabel('Frecuencia')
        
        # QQ-plot
        sm.qqplot(datos, line='s', ax=ax2)
        ax2.set_title('QQ-Plot')
        
        plt.tight_layout()
        resultado["figura"] = fig
    
    return resultado

def calcular_potencia_estadistica(d_cohen, n1, n2, alpha=0.05):
    """
    Calcula la potencia estadística para una prueba t de dos muestras independientes.
    
    Parameters
    ----------
    d_cohen : float
        Tamaño del efecto (d de Cohen)
    n1 : int
        Tamaño de la primera muestra
    n2 : int
        Tamaño de la segunda muestra
    alpha : float, optional
        Nivel de significancia, por defecto 0.05
    
    Returns
    -------
    dict
        Resultados del análisis de potencia incluyendo potencia calculada,
        interpretación y recomendaciones
    """
    # Calcular potencia con library statsmodels
    power_analysis = TTestIndPower()
    potencia = power_analysis.solve_power(
        effect_size=abs(d_cohen),
        nobs1=n1,
        ratio=n2/n1,
        alpha=alpha,
        alternative='two-sided'
    )
    
    # Interpretar potencia
    if potencia < 0.5:
        interpretacion = "potencia muy baja"
        recomendacion = "Se recomienda aumentar considerablemente el tamaño muestral para detectar el efecto."
    elif potencia < 0.8:
        interpretacion = "potencia insuficiente"
        recomendacion = "Se recomienda aumentar el tamaño muestral para alcanzar una potencia de al menos 0.8."
    else:
        interpretacion = "potencia adecuada"
        recomendacion = "El tamaño muestral es adecuado para detectar el efecto con confianza."
    
    # Calcular tamaño muestral necesario para potencia de 0.8
    n_necesario = tt_ind_solve_power(
        effect_size=abs(d_cohen),
        power=0.8,
        alpha=alpha,
        ratio=n2/n1,
        alternative='two-sided'
    )
    
    return {
        "potencia": potencia,
        "interpretacion": interpretacion,
        "recomendacion": recomendacion,
        "n_necesario_por_grupo": int(np.ceil(n_necesario)),
        "n_total_actual": n1 + n2,
        "n_total_necesario": int(np.ceil(n_necesario * (1 + n2/n1)))
    }

def verificar_normalidad_por_grupos(data, var_grupo, var_numerica, alpha=0.05):
    """
    Verifica la normalidad de una variable numérica en diferentes grupos.
    
    Parameters
    ----------
    data : pandas.DataFrame
        DataFrame que contiene los datos
    var_grupo : str
        Nombre de la columna con los grupos
    var_numerica : str
        Nombre de la columna numérica a verificar
    alpha : float, optional
        Nivel de significancia, por defecto 0.05
    
    Returns
    -------
    dict
        Resultados de las pruebas para cada grupo y recomendación general
    """
    grupos = data[var_grupo].unique()
    resultados = {}
    
    for grupo in grupos:
        datos_grupo = data[data[var_grupo] == grupo][var_numerica].dropna()
        
        # Verificar que hay suficientes observaciones
        if len(datos_grupo) < 3:
            resultados[str(grupo)] = {
                "es_normal": False,
                "interpretacion": "Insuficientes observaciones",
                "mensaje": "No se puede realizar la prueba de normalidad"
            }
            continue
            
        # Realizar prueba de normalidad
        estadistico, p_valor = shapiro(datos_grupo)
        
        # Interpretar resultado
        es_normal = p_valor > alpha
        
        resultados[str(grupo)] = {
            "n": len(datos_grupo),
            "estadistico": estadistico,
            "p_valor": p_valor,
            "es_normal": es_normal,
            "interpretacion": f"Distribución {'normal' if es_normal else 'no normal'} (p={p_valor:.4f})"
        }
    
    # Verificar si todos los grupos son normales
    todos_normales = all(resultados[str(grupo)].get("es_normal", False) for grupo in grupos)
    
    return {
        "resultados_por_grupo": resultados,
        "todos_normales": todos_normales,
        "recomendacion": "Usar pruebas paramétricas" if todos_normales else "Usar pruebas no paramétricas"
    }

def calcular_chi2_contingency(df, var1, var2, alpha=0.05):
    """
    Calcula la prueba Chi-cuadrado de independencia para dos variables categóricas.
    Si no se cumplen los requisitos para Chi-cuadrado (frecuencias esperadas >= 5),
    utiliza la prueba exacta de Fisher como alternativa para tablas 2x2.
    
    Parameters
    ----------
    df : pandas.DataFrame
        DataFrame que contiene los datos
    var1 : str
        Nombre de la primera variable categórica
    var2 : str
        Nombre de la segunda variable categórica
    alpha : float, optional
        Nivel de significancia, por defecto 0.05
    
    Returns
    -------
    dict
        Resultados de la prueba incluyendo estadístico, p-valor, interpretación
        y el coeficiente V de Cramer como medida de tamaño del efecto
    """
    # Crear tabla de contingencia
    tabla = pd.crosstab(df[var1], df[var2])
    
    # Verificar requisitos mínimos para chi-cuadrado
    frecuencias_esperadas = chi2_contingency(tabla)[3]
    requisito_cumplido = (frecuencias_esperadas >= 5).all()
    
    resultados = {
        "requisito_frecuencias_cumplido": requisito_cumplido
    }
    
    # Decidir qué prueba usar
    if requisito_cumplido:
        # Realizar prueba chi-cuadrado
        chi2, p_valor, dof, expected = chi2_contingency(tabla)
        prueba_usada = "Chi-cuadrado"
        
        resultados.update({
            "prueba_usada": prueba_usada,
            "estadistico_chi2": chi2,
            "p_valor": p_valor,
            "grados_libertad": dof,
        })
    else:
        # Si no se cumplen requisitos, verificar si es tabla 2x2 para usar Fisher
        if tabla.shape == (2, 2):
            # Usar prueba exacta de Fisher para tablas 2x2
            odds_ratio, p_valor = fisher_exact(tabla)
            prueba_usada = "Exacta de Fisher"
            
            resultados.update({
                "prueba_usada": prueba_usada,
                "odds_ratio": odds_ratio,
                "p_valor": p_valor,
                "advertencia": "Se utilizó la prueba exacta de Fisher porque no se cumplían requisitos para Chi-cuadrado"
            })
        else:
            # Para tablas mayores, usar Chi-cuadrado pero con advertencia
            chi2, p_valor, dof, expected = chi2_contingency(tabla)
            prueba_usada = "Chi-cuadrado (con advertencia)"
            
            resultados.update({
                "prueba_usada": prueba_usada,
                "estadistico_chi2": chi2,
                "p_valor": p_valor,
                "grados_libertad": dof,
                "advertencia": "Algunas frecuencias esperadas son menores a 5. Los resultados deben interpretarse con precaución."
            })
    
    # Interpretar resultados
    independientes = p_valor > alpha
    
    # Calcular V de Cramer (tamaño del efecto)
    n = tabla.sum().sum()
    
    # Para las pruebas Chi-cuadrado, usar el estadístico para calcular V de Cramer
    if "estadistico_chi2" in resultados:
        chi2 = resultados["estadistico_chi2"]
        v_cramer = np.sqrt(chi2 / (n * min(tabla.shape[0]-1, tabla.shape[1]-1)))
    else:
        # Para prueba de Fisher, calcular V de Cramer a partir de una reconstrucción aproximada de Chi-cuadrado
        # basada en el p-valor (método aproximado)
        dof = (tabla.shape[0]-1) * (tabla.shape[1]-1)
        chi2_approx = stats.chi2.ppf(1 - p_valor, dof)
        v_cramer = np.sqrt(chi2_approx / (n * min(tabla.shape[0]-1, tabla.shape[1]-1)))
    
    # Interpretar tamaño del efecto
    if v_cramer < 0.1:
        interpretacion_efecto = "efecto muy pequeño"
    elif v_cramer < 0.3:
        interpretacion_efecto = "efecto pequeño"
    elif v_cramer < 0.5:
        interpretacion_efecto = "efecto moderado"
    else:
        interpretacion_efecto = "efecto grande"
        
    resultados.update({
        "interpretacion": f"Las variables {'son independientes' if independientes else 'están relacionadas'} (p={p_valor:.4f})",
        "v_cramer": v_cramer,
        "interpretacion_efecto": f"Tamaño del efecto: V de Cramer = {v_cramer:.3f}, {interpretacion_efecto}"
    })
    
    return resultados

def calcular_diferencias_grupos(df, var_grupo, var_numerica, grupo1=None, grupo2=None, alpha=0.05):
    """
    Calcula diferencias entre grupos para una variable numérica.
    Selecciona automáticamente entre pruebas paramétricas y no paramétricas
    basándose en la normalidad y homogeneidad de varianzas de los datos.
    
    Parameters
    ----------
    df : pandas.DataFrame
        DataFrame que contiene los datos
    var_grupo : str
        Nombre de la columna con los grupos
    var_numerica : str
        Nombre de la columna numérica a comparar
    grupo1 : str, optional
        Primer grupo a comparar (para comparación de dos grupos)
    grupo2 : str, optional
        Segundo grupo a comparar (para comparación de dos grupos)
    alpha : float, optional
        Nivel de significancia, por defecto 0.05
    
    Returns
    -------
    dict
        Resultados de la prueba incluyendo estadístico, p-valor, interpretación
        y medida de tamaño del efecto
    """
    # Comprobar normalidad por grupos
    normalidad = verificar_normalidad_por_grupos(df, var_grupo, var_numerica, alpha)
    
    # Identificar grupos a comparar
    grupos = df[var_grupo].unique()
    if grupo1 is not None and grupo2 is not None:
        if grupo1 in grupos and grupo2 in grupos:
            grupos_a_comparar = [grupo1, grupo2]
            comparacion_dos_grupos = True
        else:
            return {"error": f"Grupos especificados ({grupo1}, {grupo2}) no encontrados en los datos"}
    else:
        grupos_a_comparar = grupos
        comparacion_dos_grupos = len(grupos) == 2
    
    # Recopilar datos para cada grupo y verificar homogeneidad de varianzas
    datos_por_grupo = [df[df[var_grupo] == grupo][var_numerica].dropna().values for grupo in grupos_a_comparar]
    
    # Verificar homogeneidad de varianzas solo si hay suficientes observaciones
    homogeneidad_varianza = {"test_realizado": False}
    if all(len(datos) >= 3 for datos in datos_por_grupo):
        try:
            stat_levene, p_levene = levene(*datos_por_grupo)
            homogeneidad_varianza = {
                "test_realizado": True,
                "estadistico": stat_levene,
                "p_valor": p_levene,
                "varianzas_homogeneas": p_levene > alpha,
                "interpretacion": f"Las varianzas son {'homogéneas' if p_levene > alpha else 'heterogéneas'} (p={p_levene:.4f})"
            }
        except Exception as e:
            homogeneidad_varianza = {
                "test_realizado": False,
                "error": str(e),
                "varianzas_homogeneas": False,
                "interpretacion": "No se pudo verificar homogeneidad de varianzas debido a un error en el test de Levene"
            }
    
    # Realizar prueba según normalidad y número de grupos
    resultados = {
        "normalidad": normalidad,
        "homogeneidad_varianza": homogeneidad_varianza,
        "grupos_comparados": grupos_a_comparar
    }
    
    # Para dos grupos
    if comparacion_dos_grupos:
        grupo1, grupo2 = grupos_a_comparar
        datos1 = df[df[var_grupo] == grupo1][var_numerica].dropna()
        datos2 = df[df[var_grupo] == grupo2][var_numerica].dropna()
        
        # Estadísticas descriptivas
        stats1 = {
            "n": len(datos1),
            "media": datos1.mean(),
            "mediana": datos1.median(),
            "desviacion": datos1.std()
        }
        
        stats2 = {
            "n": len(datos2),
            "media": datos2.mean(),
            "mediana": datos2.median(),
            "desviacion": datos2.std()
        }
        
        resultados["estadisticas"] = {str(grupo1): stats1, str(grupo2): stats2}
        
        # Decidir qué prueba usar basado en normalidad y homogeneidad
        todos_normales = normalidad.get("todos_normales", False)
        varianzas_homogeneas = homogeneidad_varianza.get("varianzas_homogeneas", False)
          # Prueba t de Student (paramétrica) para distribuciones normales con varianzas homogéneas
        if todos_normales and varianzas_homogeneas:
            t_stat, p_valor = stats.ttest_ind(datos1, datos2, equal_var=True)
            
            # Calcular d de Cohen para el tamaño del efecto
            n1, n2 = len(datos1), len(datos2)
            s1, s2 = datos1.std(), datos2.std()
            
            # Varianza combinada
            s_pooled = np.sqrt(((n1 - 1) * s1**2 + (n2 - 1) * s2**2) / (n1 + n2 - 2))
            
            # d de Cohen
            d_cohen = abs(datos1.mean() - datos2.mean()) / s_pooled
            
            if d_cohen < 0.2:
                interpretacion_efecto = "efecto insignificante"
            elif d_cohen < 0.5:
                interpretacion_efecto = "efecto pequeño"
            elif d_cohen < 0.8:
                interpretacion_efecto = "efecto moderado"
            else:
                interpretacion_efecto = "efecto grande"
                
            # Calcular potencia estadística
            potencia = calcular_potencia_estadistica(d_cohen, n1, n2, alpha)
            
            resultados.update({
                "prueba": "t-Student para muestras independientes",
                "estadistico_t": t_stat,
                "p_valor": p_valor,
                "tamaño_efecto_d": d_cohen,
                "interpretacion_efecto": interpretacion_efecto,
                "analisis_potencia": potencia,
                "diferencia_significativa": p_valor < alpha,
                "interpretacion": f"Hay {'una' if p_valor < alpha else 'no hay'} diferencia significativa entre los grupos (p={p_valor:.4f}, {interpretacion_efecto})"
            })
        
        # Prueba t de Welch (paramétrica) para distribuciones normales con varianzas heterogéneas
        elif todos_normales and not varianzas_homogeneas:
            t_stat, p_valor = stats.ttest_ind(datos1, datos2, equal_var=False)
            
            # Calcular d de Cohen para el tamaño del efecto
            d_cohen = abs(datos1.mean() - datos2.mean()) / np.sqrt((datos1.var() + datos2.var()) / 2)
            
            if d_cohen < 0.2:
                interpretacion_efecto = "efecto insignificante"
            elif d_cohen < 0.5:
                interpretacion_efecto = "efecto pequeño"
            elif d_cohen < 0.8:
                interpretacion_efecto = "efecto moderado"
            else:
                interpretacion_efecto = "efecto grande"
                
            # Calcular potencia estadística
            potencia = calcular_potencia_estadistica(d_cohen, len(datos1), len(datos2), alpha)
            
            resultados.update({
                "prueba": "t-Welch (corrección para varianzas desiguales)",
                "estadistico_t": t_stat,
                "p_valor": p_valor,
                "tamaño_efecto_d": d_cohen,
                "interpretacion_efecto": interpretacion_efecto,
                "analisis_potencia": potencia,
                "diferencia_significativa": p_valor < alpha,
                "interpretacion": f"Hay {'una' if p_valor < alpha else 'no hay'} diferencia significativa entre los grupos (p={p_valor:.4f}, {interpretacion_efecto})"
            })
              # Prueba no paramétrica (Mann-Whitney U) para distribuciones no normales
        else:
            # Evaluar si se debe usar exact=True para muestras pequeñas
            exact = len(datos1) < 20 or len(datos2) < 20
            
            try:
                u_stat, p_valor = mannwhitneyu(datos1, datos2, alternative='two-sided', method='exact' if exact else 'auto')
                
                # Tamaño del efecto: r = Z/sqrt(N)
                n_total = len(datos1) + len(datos2)
                z_score = stats.norm.ppf(1 - p_valor/2)  # Aproximación del z-score desde p-valor bilateral
                r = abs(z_score) / np.sqrt(n_total)
                
                if r < 0.1:
                    interpretacion_efecto = "efecto insignificante"
                elif r < 0.3:
                    interpretacion_efecto = "efecto pequeño"
                elif r < 0.5:
                    interpretacion_efecto = "efecto moderado"
                else:
                    interpretacion_efecto = "efecto grande"
                
                diferencia_significativa = p_valor < alpha
                
                # Para efecto de comparación con pruebas paramétricas, calculamos d de Cohen
                d_cohen = abs(datos1.mean() - datos2.mean()) / np.sqrt((datos1.var() + datos2.var()) / 2)
                potencia = calcular_potencia_estadistica(d_cohen, len(datos1), len(datos2), alpha)
                
                resultados.update({
                    "prueba": "Mann-Whitney U (no paramétrica)",
                    "metodo_calculo": "exact" if exact else "auto",
                    "estadistico_u": u_stat,
                    "p_valor": p_valor,
                    "tamaño_efecto_r": r,
                    "interpretacion_efecto": interpretacion_efecto,
                    "analisis_potencia": potencia,
                    "diferencia_significativa": diferencia_significativa,
                    "interpretacion": f"Hay {'una' if diferencia_significativa else 'no hay'} diferencia significativa entre los grupos (p={p_valor:.4f}, {interpretacion_efecto})"
                })
                
            except Exception as e:
                # Si falla Mann-Whitney, intentar con prueba alternativa para muestras muy pequeñas
                print(f"Error en Mann-Whitney: {str(e)}. Intentando alternativa...")
                
                # Intentar con t-test si las muestras son muy pequeñas
                t_stat, p_valor = stats.ttest_ind(datos1, datos2, equal_var=False)
                d_cohen = abs(datos1.mean() - datos2.mean()) / np.sqrt((datos1.var() + datos2.var()) / 2)
                
                if d_cohen < 0.2:
                    interpretacion_efecto = "efecto insignificante"
                elif d_cohen < 0.5:
                    interpretacion_efecto = "efecto pequeño"
                elif d_cohen < 0.8:
                    interpretacion_efecto = "efecto moderado"
                else:
                    interpretacion_efecto = "efecto grande"
                
                resultados.update({
                    "prueba": "t-Welch (alternativa por fallo en Mann-Whitney)",
                    "error_prueba_original": str(e),
                    "estadistico_t": t_stat,
                    "p_valor": p_valor,
                    "tamaño_efecto_d": d_cohen,
                    "interpretacion_efecto": interpretacion_efecto,
                    "diferencia_significativa": p_valor < alpha,
                    "advertencia": "Debido a restricciones en los datos, se utilizó una prueba t en lugar de Mann-Whitney",
                    "interpretacion": f"Hay {'una' if p_valor < alpha else 'no hay'} diferencia significativa entre los grupos (p={p_valor:.4f}, {interpretacion_efecto})"
                })
    
    # Para más de dos grupos
    else:
        # Estadísticas por grupo
        stats_grupos = {}
        for grupo in grupos_a_comparar:
            datos = df[df[var_grupo] == grupo][var_numerica].dropna()
            stats_grupos[str(grupo)] = {
                "n": len(datos),
                "media": datos.mean(),
                "mediana": datos.median(),
                "desviacion": datos.std()
            }
        
        resultados["estadisticas"] = stats_grupos
        
        # Decidir qué prueba usar basado en normalidad y homogeneidad
        todos_normales = normalidad.get("todos_normales", False)
        varianzas_homogeneas = homogeneidad_varianza.get("varianzas_homogeneas", False)
          # ANOVA (paramétrica) para distribuciones normales con varianzas homogéneas
        if todos_normales and varianzas_homogeneas:
            # Preparar datos para ANOVA
            todas_observaciones = np.concatenate(datos_por_grupo)
            grupos_indices = np.concatenate([np.repeat(i, len(datos)) for i, datos in enumerate(datos_por_grupo)])
            
            # Realizar ANOVA
            try:
                f_stat, p_valor = stats.f_oneway(*datos_por_grupo)
                
                # Calcular tamaño del efecto eta cuadrado
                # Suma de cuadrados entre grupos
                sst = sum((len(datos) * (np.mean(datos) - np.mean(todas_observaciones))**2) for datos in datos_por_grupo)
                # Suma total de cuadrados
                ss_total = np.sum((todas_observaciones - np.mean(todas_observaciones))**2)
                
                eta_cuadrado = sst / ss_total
                
                if eta_cuadrado < 0.01:
                    interpretacion_efecto = "efecto insignificante"
                elif eta_cuadrado < 0.06:
                    interpretacion_efecto = "efecto pequeño"
                elif eta_cuadrado < 0.14:
                    interpretacion_efecto = "efecto moderado"
                else:
                    interpretacion_efecto = "efecto grande"
                
                diferencia_significativa = p_valor < alpha
                
                # Si hay diferencia significativa, realizar análisis post-hoc (Tukey HSD)
                resultados_posthoc = None
                if diferencia_significativa:
                    try:
                        # Preparar datos para Tukey HSD
                        df_posthoc = pd.DataFrame({
                            'valor': todas_observaciones,
                            'grupo': [grupos_a_comparar[i] for i in grupos_indices]
                        })
                        
                        # Realizar Tukey HSD y también crear objeto MultiComparison para más detalle
                        tukey = pairwise_tukeyhsd(df_posthoc['valor'], df_posthoc['grupo'], alpha=alpha)
                        mc = MultiComparison(df_posthoc['valor'], df_posthoc['grupo'])
                        tukey_summary = mc.tukeyhsd(alpha=alpha)
                        
                        # Extraer resultados en formato más amigable
                        comparaciones = []
                        for i, (group1, group2, meandiff, p_adj, lower, upper, reject) in enumerate(
                            zip(tukey.groupsunique[tukey.pairindices[:,0]], 
                                tukey.groupsunique[tukey.pairindices[:,1]],
                                tukey.meandiffs, tukey.pvalues, 
                                tukey.confint[:,0], tukey.confint[:,1], 
                                tukey.reject)):
                            
                            # Calcular d de Cohen para cada comparación
                            datos_grupo1 = df_top[df_top[var_grupo] == group1][var_numerica].dropna()
                            datos_grupo2 = df_top[df_top[var_grupo] == group2][var_numerica].dropna()
                            
                            # Varianza combinada
                            n1, n2 = len(datos_grupo1), len(datos_grupo2)
                            s1, s2 = datos_grupo1.std(), datos_grupo2.std()
                            s_pooled = np.sqrt(((n1 - 1) * s1**2 + (n2 - 1) * s2**2) / (n1 + n2 - 2))
                            
                            # d de Cohen
                            d_cohen = abs(meandiff) / s_pooled if s_pooled > 0 else 0
                            
                            # Interpretación del tamaño del efecto
                            if d_cohen < 0.2:
                                interpretacion_d = "efecto insignificante"
                            elif d_cohen < 0.5:
                                interpretacion_d = "efecto pequeño"
                            elif d_cohen < 0.8:
                                interpretacion_d = "efecto moderado"
                            else:
                                interpretacion_d = "efecto grande"
                            
                            comparaciones.append({
                                'grupo1': str(group1),
                                'grupo2': str(group2),
                                'diferencia_medias': meandiff,
                                'p_valor': p_adj,
                                'ic_inferior': lower,
                                'ic_superior': upper,
                                'significativa': reject,
                                'd_cohen': d_cohen,
                                'interpretacion_d': interpretacion_d,
                                'interpretacion': f"La diferencia entre {group1} y {group2} es {'significativa' if reject else 'no significativa'} (p={p_adj:.4f}, {interpretacion_d})"
                            })
                        
                        resultados_posthoc = {
                            'metodo': 'Tukey HSD',
                            'comparaciones': comparaciones
                        }
                    except Exception as e:
                        resultados_posthoc = {
                            'metodo': 'Tukey HSD',
                            'error': str(e),
                            'mensaje': 'No se pudo realizar análisis post-hoc debido a un error'
                        }
                
                # Calcular potencia para ANOVA
                try:
                    from statsmodels.stats.power import FTestAnovaPower
                    power_analysis = FTestAnovaPower()
                    k = len(grupos_a_comparar)  # Número de grupos
                    n_avg = np.mean([len(datos) for datos in datos_por_grupo])  # Tamaño promedio por grupo
                    
                    # Convertir eta-cuadrado a f-squared (f² = η²/(1-η²))
                    f2 = eta_cuadrado / (1 - eta_cuadrado) if eta_cuadrado < 1 else 1.0
                    f = np.sqrt(f2)
                    
                    potencia = power_analysis.solve_power(
                        effect_size=f,
                        nobs=n_avg * k,  # Tamaño total de la muestra
                        k_groups=k,
                        alpha=alpha
                    )
                    
                    analisis_potencia = {
                        "potencia": potencia,
                        "interpretacion": "potencia muy baja" if potencia < 0.5 else "potencia insuficiente" if potencia < 0.8 else "potencia adecuada",
                        "recomendacion": "Se recomienda aumentar el tamaño muestral" if potencia < 0.8 else "El tamaño muestral es adecuado"
                    }
                except Exception as e:
                    analisis_potencia = {
                        "error": str(e),
                        "mensaje": "No se pudo calcular la potencia estadística"
                    }
                
                resultados.update({
                    "prueba": "ANOVA",
                    "estadistico_f": f_stat,
                    "p_valor": p_valor,
                    "tamaño_efecto_eta_cuadrado": eta_cuadrado,
                    "interpretacion_efecto": interpretacion_efecto,
                    "diferencia_significativa": diferencia_significativa,
                    "analisis_potencia": analisis_potencia,
                    "interpretacion": f"Hay {'una' if diferencia_significativa else 'no hay'} diferencia significativa entre los grupos (p={p_valor:.4f}, {interpretacion_efecto})",
                    "posthoc": resultados_posthoc
                })
            except Exception as e:
                resultados.update({
                    "prueba": "ANOVA (fallida)",
                    "error": str(e),
                    "mensaje": "No se pudo realizar la prueba ANOVA, posiblemente debido a datos insuficientes o problemas numéricos",
                    "accion_tomada": "Intentando prueba no paramétrica como alternativa"
                })
                # Establecer flag para forzar prueba no paramétrica
                todos_normales = False
              # Prueba no paramétrica (Kruskal-Wallis) para distribuciones no normales o varianzas heterogéneas
        else:
            # Realizar prueba Kruskal-Wallis
            try:
                h_stat, p_valor = kruskal(*datos_por_grupo)
                
                # Calcular tamaño del efecto eta cuadrado (aproximación)
                n_total = sum(len(datos) for datos in datos_por_grupo)
                eta_cuadrado = (h_stat - len(grupos_a_comparar) + 1) / (n_total - len(grupos_a_comparar))
                eta_cuadrado = max(0, eta_cuadrado)  # No permitir valores negativos
                
                if eta_cuadrado < 0.01:
                    interpretacion_efecto = "efecto insignificante"
                elif eta_cuadrado < 0.06:
                    interpretacion_efecto = "efecto pequeño"
                elif eta_cuadrado < 0.14:
                    interpretacion_efecto = "efecto moderado"
                else:
                    interpretacion_efecto = "efecto grande"
                
                diferencia_significativa = p_valor < alpha
                
                # Si hay diferencia significativa, realizar análisis post-hoc para Kruskal-Wallis
                resultados_posthoc = None
                if diferencia_significativa:
                    try:
                        # Preparar datos para análisis post-hoc
                        df_posthoc = pd.DataFrame({
                            'valor': np.concatenate(datos_por_grupo),
                            'grupo': np.concatenate([np.repeat(grupo, len(datos)) for grupo, datos in zip(grupos_a_comparar, datos_por_grupo)])
                        })
                        
                        # Implementar comparaciones por pares con Mann-Whitney y corrección de Bonferroni
                        comparaciones = []
                        n_comparaciones = len(grupos_a_comparar) * (len(grupos_a_comparar) - 1) // 2
                        alpha_ajustado = alpha / n_comparaciones  # Corrección de Bonferroni
                        
                        for i, grupo1 in enumerate(grupos_a_comparar):
                            for j in range(i+1, len(grupos_a_comparar)):
                                grupo2 = grupos_a_comparar[j]
                                
                                datos_grupo1 = df_posthoc[df_posthoc['grupo'] == grupo1]['valor'].values
                                datos_grupo2 = df_posthoc[df_posthoc['grupo'] == grupo2]['valor'].values
                                
                                # Usar Mann-Whitney U con método exact para muestras pequeñas
                                exact = len(datos_grupo1) < 20 or len(datos_grupo2) < 20
                                try:
                                    u_stat, p_adj = mannwhitneyu(datos_grupo1, datos_grupo2, alternative='two-sided', 
                                                               method='exact' if exact else 'auto')
                                    
                                    # Calcular r para el tamaño del efecto
                                    n1, n2 = len(datos_grupo1), len(datos_grupo2)
                                    z_score = stats.norm.ppf(1 - p_adj/2) if p_adj < 0.999 else 0
                                    r = abs(z_score) / np.sqrt(n1 + n2)
                                    
                                    # Interpretar tamaño del efecto
                                    if r < 0.1:
                                        interpretacion_r = "efecto insignificante"
                                    elif r < 0.3:
                                        interpretacion_r = "efecto pequeño"
                                    elif r < 0.5:
                                        interpretacion_r = "efecto moderado"
                                    else:
                                        interpretacion_r = "efecto grande"
                                    
                                    # Verificar significancia con alpha ajustado
                                    significativa = p_adj < alpha_ajustado
                                    
                                    comparaciones.append({
                                        'grupo1': str(grupo1),
                                        'grupo2': str(grupo2),
                                        'estadistico_u': u_stat,
                                        'p_valor': p_adj,
                                        'p_valor_ajustado': p_adj * n_comparaciones,  # Volver a ajustar para reportar
                                        'alpha_ajustado': alpha_ajustado,
                                        'tamaño_efecto_r': r,
                                        'interpretacion_r': interpretacion_r,
                                        'significativa': significativa,
                                        'interpretacion': f"La diferencia entre {grupo1} y {grupo2} es {'significativa' if significativa else 'no significativa'} (p-ajustado={p_adj:.4f}, {interpretacion_r})"
                                    })
                                except Exception as e:
                                    comparaciones.append({
                                        'grupo1': str(grupo1),
                                        'grupo2': str(grupo2),
                                        'error': str(e),
                                        'mensaje': f"No se pudo comparar {grupo1} vs {grupo2} debido a un error"
                                    })
                        
                        resultados_posthoc = {
                            'metodo': 'Mann-Whitney con corrección de Bonferroni',
                            'alpha_original': alpha,
                            'alpha_ajustado': alpha_ajustado,
                            'n_comparaciones': n_comparaciones,
                            'comparaciones': comparaciones
                        }
                    except Exception as e:
                        resultados_posthoc = {
                            'metodo': 'Comparaciones post-hoc',
                            'error': str(e),
                            'mensaje': 'No se pudo realizar análisis post-hoc debido a un error'
                        }
                
                resultados.update({
                    "prueba": "Kruskal-Wallis H (no paramétrica)",
                    "estadistico_h": h_stat,
                    "p_valor": p_valor,
                    "tamaño_efecto_eta_cuadrado": eta_cuadrado,
                    "interpretacion_efecto": interpretacion_efecto,
                    "diferencia_significativa": diferencia_significativa,
                    "posthoc": resultados_posthoc,
                    "interpretacion": f"Hay {'una' if diferencia_significativa else 'no hay'} diferencia significativa entre los grupos (p={p_valor:.4f}, {interpretacion_efecto})"
                })
            except Exception as e:
                # Si falla Kruskal-Wallis, informar el error
                resultados.update({
                    "prueba": "Kruskal-Wallis (fallida)",
                    "error": str(e),
                    "mensaje": "No se pudo realizar la prueba Kruskal-Wallis, posiblemente debido a datos insuficientes o problemas numéricos"
                })
                
                # En caso de fallo, intentar con una prueba alternativa como ANOVA aunque no sea ideal
                try:
                    f_stat, p_valor = stats.f_oneway(*datos_por_grupo)
                    
                    resultados.update({
                        "prueba_alternativa": "ANOVA (usada como alternativa)",
                        "estadistico_f": f_stat,
                        "p_valor_alternativo": p_valor,
                        "advertencia": "Debido a un error en Kruskal-Wallis, se utilizó ANOVA como alternativa. Interpretar con precaución.",
                        "interpretacion": f"Según ANOVA, hay {'una' if p_valor < alpha else 'no hay'} diferencia significativa entre los grupos (p={p_valor:.4f})"
                    })
                except:
                    # Si también falla ANOVA, no podemos hacer más
                    resultados.update({
                        "advertencia": "No se pudo realizar ninguna prueba estadística para comparar los grupos."
                    })
    
    return resultados

def bivariado_cat_cat(df, var1, var2, top_n=5, export_excel_path=None, export_pdf_path=None, export_png_dir=None, export_json_dir=None):
    """
    Realiza análisis bivariado entre dos variables categóricas y genera visualizaciones.
    
    Esta función crea tablas de contingencia y gráficos de barras para analizar
    la relación entre dos variables categóricas. También realiza pruebas estadísticas 
    como Chi-cuadrado para determinar independencia y calcula el tamaño del efecto
    con V de Cramer. Exporta los resultados en diversos formatos.
    
    Args:
        df (pandas.DataFrame): DataFrame con los datos a analizar
        var1 (str): Nombre de la primera variable categórica (eje X)
        var2 (str): Nombre de la segunda variable categórica (colores/series)
        top_n (int o None, opcional): Número máximo de categorías a mostrar. Por defecto 5.
            Si es None, se utilizan todas las categorías.
        export_excel_path (str, opcional): Ruta donde exportar resultados en Excel
        export_pdf_path (str, opcional): Ruta donde exportar gráficos en PDF
        export_png_dir (str, opcional): Directorio donde guardar imágenes PNG
        export_json_dir (str, opcional): Directorio donde guardar JSON para web
        
    Returns:
        pandas.DataFrame: Tabla de contingencia normalizada por filas
        
    Ejemplo:
        >>> bivariado_cat_cat(encuestas_df, 'CIUDAD_AGENCIA', 'SEGMENTO', 
                             export_json_dir='data')
    """
    # Filtrar solo las top_n categorías más frecuentes de var1, o usar todas si top_n es None
    if top_n is None:
        df_top = df.copy()  # Usar todas las categorías
    else:
        top_vals = df[var1].value_counts().nlargest(top_n).index
        df_top = df[df[var1].isin(top_vals)]
    
    # Crear tabla de contingencia absoluta y porcentual
    cross_tab_abs = pd.crosstab(df_top[var1], df_top[var2])
    cross_tab_pct = pd.crosstab(df_top[var1], df_top[var2], normalize='index') * 100
      # Realizar prueba de chi-cuadrado para verificar independencia
    resultados_chi2 = calcular_chi2_contingency(df_top, var1, var2)
    
    # Imprimir información detallada en consola
    print(f"\n{'='*80}")
    print(f"ANÁLISIS BIVARIADO: {var1.upper()} vs {var2.upper()}")
    print(f"{'='*80}")
    
    # Tabla de contingencia absoluta
    print("\n1. TABLA DE CONTINGENCIA (FRECUENCIAS ABSOLUTAS):")
    print(cross_tab_abs.to_string())
    
    # Tabla de contingencia porcentual
    print("\n2. TABLA DE CONTINGENCIA (PORCENTAJES POR FILA):")
    print(cross_tab_pct.round(1).to_string())
    
    # Resumen de los hallazgos principales
    print(f"\n3. RESUMEN DE HALLAZGOS PRINCIPALES:")
    for idx in cross_tab_pct.index:
        top_cat = cross_tab_pct.loc[idx].idxmax()
        top_val = cross_tab_pct.loc[idx].max()
        print(f"   - En {idx}: {top_cat} es el más frecuente ({top_val:.1f}%)")
      # Resultado detallado de la prueba Chi-cuadrado
    print(f"\n4. PRUEBA DE INDEPENDENCIA:")
    print(f"   - Prueba utilizada: {resultados_chi2.get('prueba_usada', 'Chi-cuadrado')}")
    
    if 'estadistico_chi2' in resultados_chi2:
        print(f"   - Estadístico Chi²: {resultados_chi2['estadistico_chi2']:.3f}")
        print(f"   - Grados de libertad: {resultados_chi2['grados_libertad']}")
    elif 'odds_ratio' in resultados_chi2:
        print(f"   - Odds ratio: {resultados_chi2['odds_ratio']:.3f}")
        
    print(f"   - Valor p: {resultados_chi2['p_valor']:.4f}")
    print(f"   - {resultados_chi2['interpretacion']}")
    print(f"   - {resultados_chi2['interpretacion_efecto']}")
    
    # Verificación de requisitos para Chi-cuadrado
    print(f"\n   - Requisito de frecuencias esperadas >= 5: {'Cumplido' if resultados_chi2['requisito_frecuencias_cumplido'] else 'No cumplido'}")
    if 'advertencia' in resultados_chi2:
        print(f"     Advertencia: {resultados_chi2['advertencia']}")
    elif not resultados_chi2['requisito_frecuencias_cumplido']:
        print(f"     Advertencia: Algunas frecuencias esperadas son menores a 5, lo que puede afectar la validez de la prueba.")
        print(f"     Considere combinar categorías con pocos casos o utilizar pruebas alternativas.")
          
    # Crear visualización con Matplotlib
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(18, 10))
    
    # Gráfico de barras agrupadas
    cross_tab_pct.plot(kind='bar', stacked=False, ax=ax1, colormap='Spectral')
    ax1.set_title(f'Distribución de {var2} por {var1}', fontsize=14, fontweight='bold')
    ax1.set_ylabel('Porcentaje (%)', fontsize=12)
    ax1.set_xlabel(var1, fontsize=12)
    ax1.tick_params(axis='x', rotation=45, labelsize=10)
      # Añadir anotación estadística
    ax1.annotate(
        f"Prueba: {resultados_chi2.get('prueba_usada', 'Chi-cuadrado')}\np = {resultados_chi2['p_valor']:.4f}\n{resultados_chi2['interpretacion_efecto'].split(': ')[1]}",
        xy=(0.02, 0.98), xycoords='axes fraction',
        bbox=dict(boxstyle="round,pad=0.3", fc="white", alpha=0.8),
        fontsize=10, ha='left', va='top'
    )
    
    # Gráfico de barras apiladas (stacked)
    cross_tab_pct.plot(kind='bar', stacked=True, ax=ax2, colormap='Spectral')
    ax2.set_title(f'Composición proporcional de {var2} por {var1}', fontsize=14, fontweight='bold')
    ax2.set_ylabel('Porcentaje (%)', fontsize=12)
    ax2.set_xlabel(var1, fontsize=12)
    ax2.tick_params(axis='x', rotation=45, labelsize=10)
    
    # Añadir etiquetas de porcentaje en el gráfico apilado para valores >= 10%
    for i, (idx, row) in enumerate(cross_tab_pct.iterrows()):
        cum_sum = 0
        for j, v in enumerate(row):
            if v >= 10:  # Solo etiquetar valores significativos (>=10%)
                ax2.text(i, cum_sum + v/2, f"{v:.0f}%", ha='center', va='center', 
                         fontsize=9, fontweight='bold', color='white')
            cum_sum += v
    
    plt.tight_layout()
    fig = plt.gcf()
    
    # Exportar a diferentes formatos si se especifican rutas
    if export_pdf_path:
        add_figure_for_pdf(fig)
        
    if export_excel_path:
        # Exportar ambas tablas en diferentes hojas
        export_table_to_excel(cross_tab_abs, f'{var1}_vs_{var2}_abs', export_excel_path)
        export_table_to_excel(cross_tab_pct, f'{var1}_vs_{var2}_pct', export_excel_path)
        
    if export_png_dir:
        os.makedirs(export_png_dir, exist_ok=True)
        save_plot_to_png(fig, os.path.join(export_png_dir, f"bivariado_{var1}_vs_{var2}.png"))
        
    if export_json_dir:
        os.makedirs(export_json_dir, exist_ok=True)
        
        # Exportar ambas tablas como JSON
        cross_tab_abs.to_json(
            os.path.join(export_json_dir, f"tabla_{var1}_vs_{var2}_abs.json"),
            force_ascii=False, indent=2
        )
        
        cross_tab_pct.round(2).to_json(
            os.path.join(export_json_dir, f"tabla_{var1}_vs_{var2}_pct.json"),
            force_ascii=False, indent=2
        )
        
        # Generar JSON compatible con Plotly para visualización web
        # 1. Gráfico de barras agrupadas
        plotly_data_grouped = []
        for column in cross_tab_pct.columns:
            plotly_data_grouped.append({
                "x": cross_tab_pct.index.tolist(),
                "y": cross_tab_pct[column].tolist(),
                "type": "bar",
                "name": str(column)
            })
        
        # 2. Gráfico de barras apiladas
        plotly_data_stacked = []
        for column in cross_tab_pct.columns:
            plotly_data_stacked.append({
                "x": cross_tab_pct.index.tolist(),
                "y": cross_tab_pct[column].tolist(),
                "type": "bar",
                "name": str(column)
            })
        
        # Guardar JSON para Plotly con ambos tipos de gráficos
        with open(os.path.join(export_json_dir, f"plotly_bivariado_{var1}_vs_{var2}.json"), 'w', encoding='utf-8') as f:
            json.dump({
                "data_grouped": plotly_data_grouped,
                "data_stacked": plotly_data_stacked,
                "layout_grouped": {
                    "title": {
                        "text": f"Distribución de {var2} por {var1}",
                        "font": {"size": 18}
                    },
                    "xaxis": {"title": var1},
                    "yaxis": {"title": "Porcentaje (%)"},
                    "barmode": "group",                "annotations": [
                        {
                            "text": f"Prueba: {resultados_chi2.get('prueba_usada', 'Chi-cuadrado')}<br>p = {resultados_chi2['p_valor']:.4f}",
                            "showarrow": False,
                            "xref": "paper",
                            "yref": "paper",
                            "x": 0,
                            "y": 1,
                            "xanchor": "left",
                            "yanchor": "top",
                            "bgcolor": "rgba(255, 255, 255, 0.8)",
                            "bordercolor": "rgba(0, 0, 0, 0.2)",
                            "borderwidth": 1,
                            "borderpad": 4
                        }
                    ]
                },
                "layout_stacked": {
                    "title": {
                        "text": f"Composición proporcional de {var2} por {var1}",
                        "font": {"size": 18}
                    },
                    "xaxis": {"title": var1},
                    "yaxis": {"title": "Porcentaje (%)"},
                    "barmode": "stack",
                    "annotations": [
                        {
                            "text": f"V de Cramer = {resultados_chi2['v_cramer']:.3f}<br>({resultados_chi2['interpretacion_efecto'].split(': ')[1]})",
                            "showarrow": False,
                            "xref": "paper",
                            "yref": "paper",
                            "x": 0,
                            "y": 1,
                            "xanchor": "left",
                            "yanchor": "top",
                            "bgcolor": "rgba(255, 255, 255, 0.8)",
                            "bordercolor": "rgba(0, 0, 0, 0.2)",
                            "borderwidth": 1,
                            "borderpad": 4
                        }
                    ]
                }
            }, f, ensure_ascii=False, indent=2)
              # Guardar resultados estadísticos en un archivo separado
        with open(os.path.join(export_json_dir, f"estadisticas_{var1}_vs_{var2}.json"), 'w', encoding='utf-8') as f:
            stats_data = {
                "prueba_independencia": {
                    "prueba_usada": resultados_chi2.get('prueba_usada', 'Chi-cuadrado'),
                    "p_valor": resultados_chi2['p_valor'],
                    "interpretacion": resultados_chi2['interpretacion'],
                    "requisito_frecuencias_cumplido": resultados_chi2['requisito_frecuencias_cumplido']
                },
                "tamaño_efecto": {
                    "v_cramer": resultados_chi2['v_cramer'],
                    "interpretacion": resultados_chi2['interpretacion_efecto']
                },
                "resumen_categorias": [
                    {
                        "categoria": str(idx),
                        "valor_mas_frecuente": str(cross_tab_pct.loc[idx].idxmax()),
                        "porcentaje": float(cross_tab_pct.loc[idx].max())
                    } for idx in cross_tab_pct.index
                ]
            }
            
            # Agregar estadísticos específicos según la prueba
            if 'estadistico_chi2' in resultados_chi2:
                stats_data["prueba_independencia"]["estadistico"] = resultados_chi2['estadistico_chi2']
                stats_data["prueba_independencia"]["grados_libertad"] = resultados_chi2['grados_libertad']
            elif 'odds_ratio' in resultados_chi2:
                stats_data["prueba_independencia"]["odds_ratio"] = resultados_chi2['odds_ratio']
            
            # Agregar advertencias si existen
            if 'advertencia' in resultados_chi2:
                stats_data["prueba_independencia"]["advertencia"] = resultados_chi2['advertencia']
                
            json.dump(stats_data, f, ensure_ascii=False, indent=2)
    
    plt.close(fig)
    return cross_tab_pct


def bivariado_cat_num(df, var_cat, var_num, top_n=5, export_excel_path=None, export_pdf_path=None, export_png_dir=None, export_json_dir=None):
    """
    Realiza análisis bivariado entre una variable categórica y una numérica.
    
    Esta función genera box plots y estadísticas descriptivas para analizar
    la distribución de una variable numérica a través de las categorías de una
    variable categórica. También realiza pruebas estadísticas para determinar
    diferencias significativas entre grupos y calcula tamaños de efecto.
    Exporta los resultados en diversos formatos.
    
    Args:
        df (pandas.DataFrame): DataFrame con los datos a analizar
        var_cat (str): Nombre de la variable categórica (eje X)
        var_num (str): Nombre de la variable numérica (eje Y)
        top_n (int o None, opcional): Número máximo de categorías a mostrar. Por defecto 5.
            Si es None, se utilizan todas las categorías.
        export_excel_path (str, opcional): Ruta donde exportar resultados en Excel
        export_pdf_path (str, opcional): Ruta donde exportar gráficos en PDF
        export_png_dir (str, opcional): Directorio donde guardar imágenes PNG
        export_json_dir (str, opcional): Directorio donde guardar JSON para web
        
    Returns:
        pandas.DataFrame: Tabla resumen con estadísticas por categoría
        
    Ejemplo:
        >>> bivariado_cat_num(encuestas_df, 'SEGMENTO', 'PREGUNTA_1', 
                             export_json_dir='data')
    """
    # Filtrar solo las top_n categorías más frecuentes de var_cat, o usar todas si top_n es None
    if top_n is None:
        df_top = df.copy()  # Usar todas las categorías
    else:
        top_vals = df[var_cat].value_counts().nlargest(top_n).index
        df_top = df[df[var_cat].isin(top_vals)]
      # Verificar supuestos estadísticos para var_num
    normalidad_global = verificar_normalidad(df_top, var_num)
    normalidad_por_grupos = verificar_normalidad_por_grupos(df_top, var_cat, var_num)
    
    # Calcular diferencias entre grupos con el análisis estadístico completo
    resultados_diff = calcular_diferencias_grupos(df_top, var_cat, var_num)
    
    # Generar estadísticas descriptivas por grupo con el análisis de potencia
    summary = df_top.groupby(var_cat)[var_num].agg(
        cantidad='count',
        Minimo='min',
        Q1=lambda x: x.quantile(0.25),
        Mediana='median',
        Promedio='mean',
        Q3=lambda x: x.quantile(0.75),
        Maximo='max',
        Desviacion='std',
        Error_estandar=lambda x: x.std() / np.sqrt(x.count()),  # Error estándar de la media
    )
    
    # Añadir intervalos de confianza del 95%
    t_critical = stats.t.ppf(0.975, summary['cantidad'] - 1)  # Valor crítico de t para 95% de confianza
    summary['IC_95_inf'] = summary['Promedio'] - t_critical * summary['Error_estandar']
    summary['IC_95_sup'] = summary['Promedio'] + t_critical * summary['Error_estandar']
    
    # Imprimir información detallada en consola
    print(f"\n{'='*80}")
    print(f"ANÁLISIS BIVARIADO: {var_cat.upper()} vs {var_num.upper()}")
    print(f"{'='*80}")
    
    # Información sobre normalidad y homogeneidad de varianzas
    print(f"\n1. VERIFICACIÓN DE SUPUESTOS ESTADÍSTICOS:")
    print(f"   - Normalidad global para {var_num}: {normalidad_global['interpretacion']}")
    print(f"   - {normalidad_global['mensaje']}")
    
    # Normalidad por grupos
    print("\n   - Normalidad por grupos:")
    for grupo, resultado in normalidad_por_grupos['resultados_por_grupo'].items():
        print(f"     * {grupo}: {resultado.get('interpretacion', 'No evaluado')} (n={resultado.get('n', 'N/A')})")
    
    # Homogeneidad de varianzas
    if resultados_diff.get('homogeneidad_varianza', {}).get('test_realizado', False):
        print(f"\n   - Homogeneidad de varianzas: {resultados_diff['homogeneidad_varianza']['interpretacion']}")
    
    # Recomendación de prueba
    print(f"\n   - Recomendación: {normalidad_por_grupos['recomendacion']}")
    
    # Detalles de la prueba estadística utilizada
    print(f"\n2. PRUEBA ESTADÍSTICA APLICADA:")
    print(f"   - Prueba utilizada: {resultados_diff['prueba']}")
    print(f"   - Resultado: {resultados_diff['interpretacion']}")
    print(f"   - Valor p: {resultados_diff['p_valor']:.4f}")
    
    # Mostrar estadístico específico según la prueba
    if 'estadistico_t' in resultados_diff:
        print(f"   - Estadístico t: {resultados_diff['estadistico_t']:.3f}")
    elif 'estadistico_u' in resultados_diff:
        print(f"   - Estadístico U: {resultados_diff['estadistico_u']:.1f}")
    elif 'estadistico_f' in resultados_diff:
        print(f"   - Estadístico F: {resultados_diff['estadistico_f']:.3f}")
    elif 'estadistico_h' in resultados_diff:
        print(f"   - Estadístico H: {resultados_diff['estadistico_h']:.3f}")
    
    # Información sobre el tamaño del efecto    print(f"   - {resultados_diff['interpretacion_efecto']}")
    
    # Si hay análisis de potencia estadística, mostrarlo
    if 'analisis_potencia' in resultados_diff and 'potencia' in resultados_diff['analisis_potencia']:
        print(f"\n   - Potencia estadística: {resultados_diff['analisis_potencia']['potencia']:.2f}")
        print(f"   - {resultados_diff['analisis_potencia']['interpretacion']}")
        print(f"   - {resultados_diff['analisis_potencia']['recomendacion']}")
    
    # Resultados post-hoc si hay diferencias significativas en ANOVA
    if resultados_diff.get('posthoc') and 'comparaciones' in resultados_diff['posthoc']:
        print("\n3. ANÁLISIS POST-HOC:")
        print(f"   - Método: {resultados_diff['posthoc']['metodo']}")
        for comp in resultados_diff['posthoc']['comparaciones']:
            print(f"   - {comp['interpretacion']}")
    
    # Generar visualización: boxplot + swarmplot para mejor visualización
    plt.figure(figsize=(16, 10))
    
    # Crear layout de 2x1 para gráficos
    gs = plt.GridSpec(2, 1, height_ratios=[2, 1], hspace=0.3)
    
    # 1. Boxplot con swarmplot superpuesto
    ax1 = plt.subplot(gs[0])
    
    # Boxplot con notch para visualizar intervalos de confianza de la mediana
    sns.boxplot(data=df_top, x=var_cat, y=var_num, palette="coolwarm", notch=True, ax=ax1)
    
    # Añadir puntos individuales con jitter para mejor visualización
    sns.swarmplot(data=df_top, x=var_cat, y=var_num, color=".25", size=4, alpha=0.5, ax=ax1)
    
    # Añadir título y etiquetas
    ax1.set_title(f'{var_num} por {var_cat}', fontsize=16, fontweight='bold')
    ax1.set_xlabel(var_cat, fontsize=12)
    ax1.set_ylabel(var_num, fontsize=12)
    plt.setp(ax1.get_xticklabels(), rotation=45, ha='right')
    
    # Añadir anotación estadística
    ax1.annotate(
        f"Prueba: {resultados_diff['prueba']}\np={resultados_diff['p_valor']:.4f}\n{resultados_diff['interpretacion_efecto']}",
        xy=(0.02, 0.98), xycoords='axes fraction',
        bbox=dict(boxstyle="round,pad=0.3", fc="white", alpha=0.8),
        fontsize=10, ha='left', va='top'
    )
    
    # 2. Segundo gráfico: barras con intervalos de confianza
    ax2 = plt.subplot(gs[1])
    
    # Preparar datos para barras con IC
    summary_plot = pd.DataFrame(index=summary.index)
    summary_plot['Media'] = summary['Promedio']
    summary_plot['Error_std'] = summary['Error_estandar']
    summary_plot['IC_inf'] = summary['IC_95_inf']
    summary_plot['IC_sup'] = summary['IC_95_sup']
    
    # Graficar barras con errores
    bar_colors = sns.color_palette("coolwarm", len(summary_plot))
    bars = ax2.bar(x=range(len(summary_plot)), height=summary_plot['Media'], yerr=summary_plot['Error_std'],
                  capsize=10, alpha=0.7, color=bar_colors)
    
    # Añadir etiquetas con valores encima de cada barra
    for i, bar in enumerate(bars):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + summary_plot['Error_std'].iloc[i] + 0.05,
                f"{summary_plot['Media'].iloc[i]:.2f}", ha='center', va='bottom', fontsize=9, fontweight='bold')
    
    # Añadir línea horizontal para media global
    media_global = df_top[var_num].mean()
    ax2.axhline(y=media_global, color='black', linestyle='--', alpha=0.7, 
               label=f"Media global: {media_global:.2f}")
    
    # Configurar ejes y etiquetas
    ax2.set_xticks(range(len(summary_plot)))
    ax2.set_xticklabels(summary_plot.index, rotation=45, ha='right')
    ax2.set_title(f'Promedio e Intervalos de Confianza (95%) de {var_num} por {var_cat}', fontsize=14)
    ax2.set_ylabel(var_num, fontsize=12)
    ax2.set_xlabel(var_cat, fontsize=12)
    ax2.legend()
    
    # Añadir texto con interpretación estadística
    if resultados_diff['diferencia_significativa']:
        result_text = f"Hay diferencias significativas entre los grupos (p={resultados_diff['p_valor']:.4f})"
    else:
        result_text = f"No hay diferencias significativas entre los grupos (p={resultados_diff['p_valor']:.4f})"
    
    ax2.annotate(
        result_text,
        xy=(0.5, -0.2), xycoords='axes fraction',
        bbox=dict(boxstyle="round,pad=0.3", fc="white", alpha=0.8),
        fontsize=10, ha='center', va='top'
    )
    
    plt.tight_layout()
    fig = plt.gcf()
    
    # Exportar a diferentes formatos
    if export_pdf_path:
        add_figure_for_pdf(fig)
        
    if export_png_dir:
        os.makedirs(export_png_dir, exist_ok=True)
        save_plot_to_png(fig, os.path.join(export_png_dir, f"bivariado_{var_cat}_vs_{var_num}.png"))
          # Ordenar el summary por promedio para mejor visualización
    summary = summary.sort_values(by='Promedio', ascending=False)
    
    print("\n4. RESUMEN ESTADÍSTICO POR CATEGORÍA:")
    print(summary.round(2).to_string())
    
    # Información adicional sobre extremos
    print(f"\n   - Categoría con mayor promedio: {summary['Promedio'].idxmax()} ({summary['Promedio'].max():.2f})")
    print(f"   - Categoría con menor promedio: {summary['Promedio'].idxmin()} ({summary['Promedio'].min():.2f})")
    
    # Exportar a Excel si se especifica
    if export_excel_path:
        export_table_to_excel(summary, f'{var_cat}_vs_{var_num}', export_excel_path)
    
    # Exportar como JSON para visualización web si se especifica
    if export_json_dir:
        os.makedirs(export_json_dir, exist_ok=True)
        
        # JSON para tabla de datos
        summary.round(2).to_json(
            os.path.join(export_json_dir, f"tabla_{var_cat}_vs_{var_num}.json"),
            force_ascii=False, indent=2
        )
        
        # Calcular datos para box plot en Plotly
        boxplot_data = []
        for category in df_top[var_cat].unique():
            category_data = df_top[df_top[var_cat] == category][var_num].dropna()
            if len(category_data) > 0:
                boxplot_data.append({
                    "type": "box",
                    "y": category_data.tolist(),
                    "name": str(category),
                    "boxpoints": "suspectedoutliers",
                    "marker": {"size": 3},
                    "line": {"width": 1},
                    "boxmean": True  # Mostrar la media además de la mediana
                })
        
        # JSON compatible con Plotly para visualización web interactiva
        with open(os.path.join(export_json_dir, f"plotly_bivariado_{var_cat}_vs_{var_num}.json"), 'w', encoding='utf-8') as f:
            json.dump({
                "data": boxplot_data,
                "layout": {
                    "title": {
                        "text": f"{var_num} por {var_cat}",
                        "font": {"size": 18}
                    },
                    "xaxis": {"title": var_cat},
                    "yaxis": {"title": var_num},
                    "boxmode": "group",
                    "showlegend": True,
                    "annotations": [
                        {
                            "text": f"Prueba: {resultados_diff['prueba']}<br>p={resultados_diff['p_valor']:.4f}",
                            "showarrow": False,
                            "xref": "paper",
                            "yref": "paper",
                            "x": 0,
                            "y": 1,
                            "xanchor": "left",
                            "yanchor": "top",
                            "bgcolor": "rgba(255, 255, 255, 0.8)",
                            "bordercolor": "rgba(0, 0, 0, 0.2)",
                            "borderwidth": 1,
                            "borderpad": 4
                        }
                    ]
                }
            }, f, ensure_ascii=False, indent=2)
        
        # Exportar resultados estadísticos detallados en un archivo separado
        resultados_estadisticos = {
            "normalidad_global": {
                "es_normal": normalidad_global["es_normal"],
                "estadistico": normalidad_global.get("estadistico", None),
                "p_valor": normalidad_global.get("p_valor", None),
                "interpretacion": normalidad_global["interpretacion"]
            },
            "normalidad_por_grupos": {
                grupo: {
                    "n": info.get("n", 0),
                    "es_normal": info.get("es_normal", False),
                    "estadistico": info.get("estadistico", None),
                    "p_valor": info.get("p_valor", None),
                    "interpretacion": info.get("interpretacion", "No evaluado")
                } for grupo, info in normalidad_por_grupos["resultados_por_grupo"].items()
            },
            "homogeneidad_varianzas": {
                "test_realizado": resultados_diff.get('homogeneidad_varianza', {}).get('test_realizado', False),
                "varianzas_homogeneas": resultados_diff.get('homogeneidad_varianza', {}).get('varianzas_homogeneas', False),
                "estadistico": resultados_diff.get('homogeneidad_varianza', {}).get('estadistico', None),
                "p_valor": resultados_diff.get('homogeneidad_varianza', {}).get('p_valor', None),
                "interpretacion": resultados_diff.get('homogeneidad_varianza', {}).get('interpretacion', "No evaluado")
            },
            "prueba_diferencia": {
                "nombre_prueba": resultados_diff["prueba"],
                "p_valor": resultados_diff["p_valor"],
                "diferencia_significativa": resultados_diff["diferencia_significativa"],
                "interpretacion": resultados_diff["interpretacion"],
                "tamaño_efecto": resultados_diff["interpretacion_efecto"]
            }
        }
        
        # Agregar estadísticos específicos según la prueba
        if 'estadistico_t' in resultados_diff:
            resultados_estadisticos["prueba_diferencia"]["estadistico_t"] = resultados_diff["estadistico_t"]
            resultados_estadisticos["prueba_diferencia"]["tamaño_efecto_d"] = resultados_diff.get("tamaño_efecto_d", None)
        elif 'estadistico_u' in resultados_diff:
            resultados_estadisticos["prueba_diferencia"]["estadistico_u"] = resultados_diff["estadistico_u"]
            resultados_estadisticos["prueba_diferencia"]["tamaño_efecto_r"] = resultados_diff.get("tamaño_efecto_r", None)
        elif 'estadistico_f' in resultados_diff:
            resultados_estadisticos["prueba_diferencia"]["estadistico_f"] = resultados_diff["estadistico_f"]
            resultados_estadisticos["prueba_diferencia"]["tamaño_efecto_eta_cuadrado"] = resultados_diff.get("tamaño_efecto_eta_cuadrado", None)
        elif 'estadistico_h' in resultados_diff:
            resultados_estadisticos["prueba_diferencia"]["estadistico_h"] = resultados_diff["estadistico_h"]
            resultados_estadisticos["prueba_diferencia"]["tamaño_efecto_eta_cuadrado"] = resultados_diff.get("tamaño_efecto_eta_cuadrado", None)
            
        # Añadir resultados post-hoc si están disponibles
        if resultados_diff.get('posthoc') and 'comparaciones' in resultados_diff['posthoc']:
            resultados_estadisticos["prueba_diferencia"]["analisis_posthoc"] = {
                "metodo": resultados_diff['posthoc']['metodo'],
                "comparaciones": resultados_diff['posthoc']['comparaciones']
            }
          # Guardar resultados estadísticos como JSON
        with open(os.path.join(export_json_dir, f"estadisticas_{var_cat}_vs_{var_num}.json"), 'w', encoding='utf-8') as f:
            json.dump(resultados_estadisticos, f, ensure_ascii=False, indent=2)
            
        # Generar JSON con datos para gráficos interactivos con confianza estadística
        with open(os.path.join(export_json_dir, f"plotly_bivariado_avanzado_{var_cat}_vs_{var_num}.json"), 'w', encoding='utf-8') as f:
            # Preparar datos para visualización
            datos_con_intervalos = []
            for categoria in summary.index:
                datos_con_intervalos.append({
                    "categoria": str(categoria),
                    "media": float(summary.loc[categoria, 'Promedio']),
                    "mediana": float(summary.loc[categoria, 'Mediana']),
                    "q1": float(summary.loc[categoria, 'Q1']),
                    "q3": float(summary.loc[categoria, 'Q3']),
                    "min": float(summary.loc[categoria, 'Minimo']),
                    "max": float(summary.loc[categoria, 'Maximo']),
                    "n": int(summary.loc[categoria, 'cantidad']),
                    "ic_inf": float(summary.loc[categoria, 'IC_95_inf']),
                    "ic_sup": float(summary.loc[categoria, 'IC_95_sup']),
                    "error_std": float(summary.loc[categoria, 'Error_estandar'])
                })
                
            # Agregar metadata sobre significancia para marcar gráficamente
            significancia_entre_grupos = []
            if resultados_diff.get('posthoc') and 'comparaciones' in resultados_diff['posthoc']:
                for comp in resultados_diff['posthoc']['comparaciones']:
                    if comp.get('significativa', False):
                        significancia_entre_grupos.append({
                            "grupo1": comp.get('grupo1', ''),
                            "grupo2": comp.get('grupo2', ''),
                            "p_valor": comp.get('p_valor', 1.0),
                            "diferencia": comp.get('diferencia_medias', 0),
                            "efecto": comp.get('interpretacion_d', '') if 'd_cohen' in comp else 
                                     comp.get('interpretacion_r', '')
                        })
            
            json.dump({
                "datos_categorias": datos_con_intervalos,
                "estadisticas": {
                    "prueba_utilizada": resultados_diff["prueba"],
                    "p_valor": resultados_diff["p_valor"],
                    "diferencia_significativa": resultados_diff["diferencia_significativa"],
                    "tamaño_efecto": {k: v for k, v in resultados_diff.items() if "tamaño" in k or "efecto" in k},
                    "potencia": resultados_diff.get("analisis_potencia", {}).get("potencia", None)
                },
                "significancia_entre_grupos": significancia_entre_grupos,
                "layout_barras": {
                    "title": f"Medias de {var_num} por {var_cat} con IC 95%",
                    "xaxis": {"title": var_cat},
                    "yaxis": {"title": var_num},
                    "showlegend": True
                },
                "layout_boxplot": {
                    "title": f"Distribución de {var_num} por {var_cat}",
                    "xaxis": {"title": var_cat},
                    "yaxis": {"title": var_num}
                }
            }, f, ensure_ascii=False, indent=2)
    
    plt.close(fig)
    return summary
