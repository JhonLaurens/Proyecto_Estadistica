#!/usr/bin/env python
# test_mejoras_completo.py - Pruebas completas de las mejoras estadísticas
"""
Pruebas exhaustivas para validar las mejoras estadísticas implementadas en Mayo 2025.
Este script realiza pruebas con datos reales de la encuesta de satisfacción
para verificar el correcto funcionamiento de todas las mejoras.

Autor: Equipo de Estadística Coltefinanciera
Fecha: Mayo 2025
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import os
import time
import warnings

# Importar funciones de análisis
from src.data_loader import load_data
from src.data_cleaner import clean_data
from src.analysis_univariado import analisis_univariado
from src.analysis_bivariado import (
    bivariado_cat_cat, 
    bivariado_cat_num,
    calcular_chi2_contingency, 
    calcular_potencia_estadistica,
    calcular_diferencias_grupos,
    verificar_normalidad
)
from src.homogeneidad_varianzas import verificar_homogeneidad_varianzas

# Configuración
warnings.filterwarnings('ignore')  # Suprimir advertencias para salida limpia
DATA_PATH = 'Base encuesta de satisfacción.csv'
RESULTS_DIR = 'resultados_test'
GRAFICOS_DIR = os.path.join(RESULTS_DIR, 'graficos')

# Crear directorios si no existen
Path(RESULTS_DIR).mkdir(exist_ok=True)
Path(GRAFICOS_DIR).mkdir(exist_ok=True)

# Funciones de utilidad
def print_section(title):
    """Imprime un encabezado de sección formateado"""
    print(f"\n{'='*80}")
    print(f"{title}")
    print(f"{'='*80}")

def print_subsection(title):
    """Imprime un encabezado de subsección formateado"""
    print(f"\n{'-'*40}")
    print(f"{title}")
    print(f"{'-'*40}")

def run_timed(func, *args, **kwargs):
    """Ejecuta una función y mide su tiempo de ejecución"""
    start_time = time.time()
    result = func(*args, **kwargs)
    end_time = time.time()
    print(f"Tiempo de ejecución: {end_time - start_time:.2f} segundos")
    return result

# Pruebas con datos reales
def test_con_datos_reales():
    """Prueba las mejoras con datos reales de la encuesta"""
    print_section("PRUEBA CON DATOS REALES DE LA ENCUESTA")
    
    print("Cargando datos reales...")
    try:
        # Cargar y limpiar datos
        df = load_data(DATA_PATH)
        df = clean_data(df)
        print(f"Datos cargados correctamente: {len(df)} registros, {df.shape[1]} variables")
        
        # Mostrar información de muestra
        print("\nPrimeras 5 filas:")
        print(df.head())
        
        print("\nResumen estadístico de variables numéricas:")
        print(df.describe())
        
        print("\nDistribución de variables categóricas principales:")
        for col in ['SEGMENTO', 'CIUDAD_AGENCIA', 'CANAL']:
            if col in df.columns:
                print(f"\n{col}:")
                print(df[col].value_counts())
        
        return df
        
    except Exception as e:
        print(f"Error al cargar datos reales: {str(e)}")
        # Crear datos sintéticos como alternativa
        print("Generando datos sintéticos como alternativa...")
        return generar_datos_sinteticos()

def generar_datos_sinteticos(n=200):
    """Genera datos sintéticos similares a la encuesta de satisfacción"""
    np.random.seed(42)
    
    # Variables categóricas
    segmentos = np.random.choice(['Personas', 'Empresas', 'PyMES'], n, p=[0.5, 0.3, 0.2])
    ciudades = np.random.choice(['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'], n)
    canales = np.random.choice(['Oficina', 'Web', 'App', 'Call Center'], n)
    
    # Variables de satisfacción (condicionadas al segmento para crear dependencias)
    satisfaccion = []
    recomendacion = []
    
    # Definir probabilidades verificando que sumen 1
    prob_satisfaccion_personas = [0.05, 0.1, 0.2, 0.4, 0.25]
    prob_satisfaccion_empresas = [0.02, 0.08, 0.15, 0.35, 0.4]
    prob_satisfaccion_pymes = [0.03, 0.07, 0.25, 0.4, 0.25]
    
    # Probabilidades para recomendación (asegurando que sumen 1)
    prob_recomendacion_personas = [0.02, 0.02, 0.02, 0.05, 0.05, 0.1, 0.1, 0.15, 0.2, 0.2, 0.09]  # Suma = 1
    prob_recomendacion_empresas = [0.01, 0.01, 0.02, 0.02, 0.05, 0.05, 0.1, 0.2, 0.3, 0.2, 0.04]  # Suma = 1
    prob_recomendacion_pymes = [0.02, 0.02, 0.03, 0.03, 0.03, 0.05, 0.05, 0.1, 0.2, 0.25, 0.22]   # Suma = 1
    
    for seg in segmentos:
        if seg == 'Personas':
            satisfaccion.append(np.random.choice([1, 2, 3, 4, 5], p=prob_satisfaccion_personas))
            recomendacion.append(np.random.choice(range(0, 11), p=prob_recomendacion_personas))
        elif seg == 'Empresas':
            satisfaccion.append(np.random.choice([1, 2, 3, 4, 5], p=prob_satisfaccion_empresas))
            recomendacion.append(np.random.choice(range(0, 11), p=prob_recomendacion_empresas))
        else:  # PyMES
            satisfaccion.append(np.random.choice([1, 2, 3, 4, 5], p=prob_satisfaccion_pymes))
            recomendacion.append(np.random.choice(range(0, 11), p=prob_recomendacion_pymes))
    
    # Variables demográficas
    edades = np.random.normal(45, 15, n).astype(int)
    edades = np.clip(edades, 18, 80)
    
    ingresos = np.exp(np.random.normal(15, 1, n)).astype(int) // 1000 * 1000  # Distribución log-normal
    
    # Crear DataFrame
    df = pd.DataFrame({
        'SEGMENTO': segmentos,
        'CIUDAD_AGENCIA': ciudades,
        'CANAL': canales,
        'PREGUNTA_1': satisfaccion,  # Satisfacción general
        'PREGUNTA_2': recomendacion,  # Recomendación (NPS)
        'EDAD': edades,
        'INGRESOS': ingresos
    })
    
    return df

# Pruebas específicas
def test_supuestos_estadisticos(df):
    """Prueba las verificaciones de supuestos estadísticos"""
    print_section("PRUEBA DE VERIFICACIÓN DE SUPUESTOS ESTADÍSTICOS")
    
    # Variables numéricas a probar
    vars_numericas = ['EDAD', 'PREGUNTA_1', 'PREGUNTA_2']
    vars_numericas = [var for var in vars_numericas if var in df.columns]
    
    # Probar normalidad
    print_subsection("1. Verificación de Normalidad")
    for var in vars_numericas:
        print(f"\nVariable: {var}")
        resultado = verificar_normalidad(df, var)
        print(f"Estadístico Shapiro-Wilk: {resultado['estadistico']:.3f}")
        print(f"p-valor: {resultado['p_valor']:.4f}")
        print(f"Interpretación: {resultado.get('interpretacion', 'No disponible')}")
    
    # Probar homogeneidad de varianzas
    if 'SEGMENTO' in df.columns and len(vars_numericas) > 0:
        print_subsection("2. Verificación de Homogeneidad de Varianzas")
        for var in vars_numericas:
            print(f"\nVariable: {var} agrupado por SEGMENTO")
            try:
                resultado = verificar_homogeneidad_varianzas(df, 'SEGMENTO', var)
                print(f"Estadístico Levene: {resultado['estadistico']:.3f}")
                print(f"p-valor: {resultado['p_valor']:.4f}")
                print(f"Conclusión: {resultado.get('conclusion', 'No disponible')}")
            except Exception as e:
                print(f"Error al verificar homogeneidad: {str(e)}")

def test_potencia_muestra_real(df):
    """Prueba el análisis de potencia con muestras reales"""
    print_section("PRUEBA DE ANÁLISIS DE POTENCIA CON DATOS REALES")
    
    if 'SEGMENTO' not in df.columns:
        print("La variable SEGMENTO no está disponible para esta prueba")
        return
        
    # Análisis por segmentos
    segmentos = df['SEGMENTO'].unique()
    if len(segmentos) >= 2:
        # Comparar los dos primeros segmentos
        seg1, seg2 = segmentos[0], segmentos[1]
        
        print_subsection(f"Análisis de potencia para {seg1} vs {seg2}")
        
        # Variables a comparar
        vars_comparar = ['PREGUNTA_1', 'EDAD']
        vars_comparar = [var for var in vars_comparar if var in df.columns]
        
        for var in vars_comparar:
            print(f"\nVariable: {var}")
            
            # Filtrar datos
            datos_seg1 = df[df['SEGMENTO'] == seg1][var].dropna()
            datos_seg2 = df[df['SEGMENTO'] == seg2][var].dropna()
            
            # Calcular tamaño del efecto (d de Cohen)
            media1, std1 = datos_seg1.mean(), datos_seg1.std()
            media2, std2 = datos_seg2.mean(), datos_seg2.std()
            
            # Std ponderado
            n1, n2 = len(datos_seg1), len(datos_seg2)
            std_pooled = np.sqrt(((n1-1)*std1**2 + (n2-1)*std2**2) / (n1+n2-2))
            d_cohen = abs(media1 - media2) / std_pooled if std_pooled > 0 else 0
            
            print(f"Tamaños muestrales: n1={n1}, n2={n2}")
            print(f"Medias: {seg1}={media1:.2f}, {seg2}={media2:.2f}")
            print(f"d de Cohen calculado: {d_cohen:.3f}")
            
            # Calcular potencia
            resultado = calcular_potencia_estadistica(d_cohen, n1, n2)
            
            print(f"Potencia calculada: {resultado['potencia']:.3f}")
            print(f"Interpretación: {resultado['interpretacion']}")
            print(f"Recomendación: {resultado['recomendacion']}")

def test_analisis_bivariado_completo(df):
    """Prueba completa del análisis bivariado con todas las mejoras"""
    print_section("PRUEBA COMPLETA DE ANÁLISIS BIVARIADO")
    
    # 1. Relaciones categóricas
    if 'SEGMENTO' in df.columns and 'CANAL' in df.columns:
        print_subsection("1. Análisis Bivariado Categórica-Categórica")
        print("SEGMENTO vs CANAL:")
        bivariado_cat_cat(df, 'SEGMENTO', 'CANAL', export_png_dir=GRAFICOS_DIR)
    
    # 2. Relaciones categórica-numérica
    if 'SEGMENTO' in df.columns and 'PREGUNTA_1' in df.columns:
        print_subsection("2. Análisis Bivariado Categórica-Numérica")
        print("SEGMENTO vs PREGUNTA_1:")
        bivariado_cat_num(df, 'SEGMENTO', 'PREGUNTA_1', export_png_dir=GRAFICOS_DIR)
    
    # Cerrar todas las figuras para liberar memoria
    plt.close('all')

def test_casos_extremos():
    """Prueba casos extremos y manejo de errores"""
    print_section("PRUEBA DE CASOS EXTREMOS Y MANEJO DE ERRORES")
    
    # 1. Muestra muy pequeña
    print_subsection("1. Muestra extremadamente pequeña")
    df_mini = pd.DataFrame({
        'grupo': ['A', 'A', 'B', 'B'],
        'valor': [1, 2, 2, 3]
    })
    
    # Probar con chi2 (debería usar Fisher)
    resultado = calcular_chi2_contingency(df_mini, 'grupo', 'valor')
    print(f"Prueba con muestra n=4:")
    print(f"Prueba utilizada: {resultado['prueba_usada']}")
    print(f"p-valor: {resultado['p_valor']:.4f}")
    
    # 2. Datos con valores extremos
    print_subsection("2. Datos con valores extremos")
    df_extremos = pd.DataFrame({
        'grupo': ['A']*20 + ['B']*20,
        'valor': np.concatenate([
            np.random.normal(5, 1, 19).tolist() + [50],  # Un valor extremo
            np.random.normal(6, 1, 20)
        ])
    })
    
    # Supuestos de normalidad
    resultado_normal = verificar_normalidad(df_extremos, 'valor')
    print(f"Normalidad con valor extremo:")
    print(f"Estadístico: {resultado_normal['estadistico']:.3f}")
    print(f"p-valor: {resultado_normal['p_valor']:.4f}")
    print(f"Interpretación: {resultado_normal.get('interpretacion', 'No disponible')}")
    
    # Comparación de grupos con valores extremos
    resultado_dif = calcular_diferencias_grupos(df_extremos, 'grupo', 'valor')
    print(f"\nComparación con valor extremo:")
    print(f"Prueba utilizada: {resultado_dif['prueba']}")
    print(f"p-valor: {resultado_dif['p_valor']:.4f}")
    print(f"Diferencia significativa: {resultado_dif['diferencia_significativa']}")
    
    # 3. Datos faltantes
    print_subsection("3. Manejo de datos faltantes")
    df_missing = pd.DataFrame({
        'grupo': ['A']*15 + ['B']*15 + [None]*5,
        'valor': np.concatenate([
            np.random.normal(5, 1, 15),
            np.random.normal(6, 1, 15),
            [np.nan]*5
        ])
    })
    
    print(f"DataFrame con datos faltantes (antes): {len(df_missing)} filas")
    
    # Debe manejar los datos faltantes sin error
    try:
        resultado_missing = calcular_diferencias_grupos(df_missing, 'grupo', 'valor')
        print(f"Prueba exitosa con manejo de datos faltantes")
        print(f"Registros utilizados después de eliminar NA: {resultado_missing.get('n_total', 'N/A')}")
    except Exception as e:
        print(f"Error al manejar datos faltantes: {str(e)}")


# Ejecutar todas las pruebas
if __name__ == "__main__":
    print("PRUEBAS EXHAUSTIVAS DE MEJORAS ESTADÍSTICAS (MAYO 2025)")
    print("======================================================")
    
    # Cargar datos reales o generar sintéticos
    try:
        df = test_con_datos_reales()
        
        # Ejecutar las pruebas
        try:
            test_supuestos_estadisticos(df)
        except Exception as e:
            print(f"\nERROR en pruebas de supuestos estadísticos: {str(e)}")
        
        try:
            test_potencia_muestra_real(df)
        except Exception as e:
            print(f"\nERROR en pruebas de potencia estadística: {str(e)}")
        
        try:
            test_analisis_bivariado_completo(df)
        except Exception as e:
            print(f"\nERROR en pruebas de análisis bivariado: {str(e)}")
    
    except Exception as e:
        print(f"\nERROR al preparar los datos: {str(e)}")
        print("Saltando pruebas que requieren datos...")
    
    # Esta prueba no requiere los datos del dataset principal
    try:
        test_casos_extremos()
    except Exception as e:
        print(f"\nERROR en pruebas de casos extremos: {str(e)}")
    
    print("\n¡Pruebas exhaustivas completadas!")
    print(f"Visualizaciones generadas en: {GRAFICOS_DIR}")
