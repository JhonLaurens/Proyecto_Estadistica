#!/usr/bin/env python
# test_mejoras.py - Prueba de las mejoras implementadas en Mayo 2025

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from src.analysis_bivariado import (
    calcular_diferencias_grupos, 
    calcular_chi2_contingency, 
    calcular_potencia_estadistica,
    bivariado_cat_cat,
    bivariado_cat_num
)

def test_potencia_estadistica():
    """
    Prueba el cálculo de potencia estadística con diferentes tamaños de efecto y muestras
    """
    print("\n===== PRUEBA DE CÁLCULO DE POTENCIA ESTADÍSTICA =====")
    
    casos_prueba = [
        {"d_cohen": 0.2, "n1": 30, "n2": 30, "descripcion": "Efecto pequeño, muestras medianas"},
        {"d_cohen": 0.8, "n1": 30, "n2": 30, "descripcion": "Efecto grande, muestras medianas"},
        {"d_cohen": 0.5, "n1": 10, "n2": 10, "descripcion": "Efecto mediano, muestras pequeñas"},
        {"d_cohen": 0.5, "n1": 100, "n2": 100, "descripcion": "Efecto mediano, muestras grandes"}
    ]
    
    for caso in casos_prueba:
        resultado = calcular_potencia_estadistica(
            caso["d_cohen"], caso["n1"], caso["n2"]
        )
        print(f"\nCaso: {caso['descripcion']}")
        print(f"d de Cohen: {caso['d_cohen']}, n1: {caso['n1']}, n2: {caso['n2']}")
        print(f"Potencia calculada: {resultado['potencia']:.3f}")
        print(f"Interpretación: {resultado['interpretacion']}")
        print(f"Recomendación: {resultado['recomendacion']}")
        print(f"Tamaño muestral necesario por grupo: {resultado['n_necesario_por_grupo']}")

def test_chi2_mejorado():
    """
    Prueba la función chi2 contingencia mejorada con detección automática para Fisher
    """
    print("\n===== PRUEBA DE CHI2 CONTINGENCIA Y FISHER MEJORADOS =====")
    
    # Crear un DataFrame con una tabla 2x2 con frecuencias esperadas < 5
    df_pequeno = pd.DataFrame({
        'categoria_a': ['A', 'A', 'A', 'A', 'A', 'B', 'B', 'B'],
        'categoria_b': ['X', 'X', 'X', 'X', 'Y', 'X', 'X', 'Y']
    })
    
    # Crear un DataFrame con una tabla más grande
    np.random.seed(42)
    df_grande = pd.DataFrame({
        'categoria_a': np.random.choice(['A', 'B', 'C'], size=100),
        'categoria_b': np.random.choice(['X', 'Y', 'Z'], size=100)
    })
    
    print("\nPrueba con tabla 2x2 con frecuencias esperadas pequeñas:")
    resultado_pequeno = calcular_chi2_contingency(df_pequeno, 'categoria_a', 'categoria_b')
    print(f"Prueba utilizada: {resultado_pequeno['prueba_usada']}")
    if 'estadistico_chi2' in resultado_pequeno:
        print(f"Estadístico Chi2: {resultado_pequeno['estadistico_chi2']:.3f}")
    if 'odds_ratio' in resultado_pequeno:
        print(f"Odds ratio: {resultado_pequeno['odds_ratio']:.3f}")
    print(f"p-valor: {resultado_pequeno['p_valor']:.4f}")
    print(f"V de Cramer: {resultado_pequeno['v_cramer']:.3f}")
    print(f"Interpretación: {resultado_pequeno['interpretacion_efecto']}")
    
    print("\nPrueba con tabla 3x3:")
    resultado_grande = calcular_chi2_contingency(df_grande, 'categoria_a', 'categoria_b')
    print(f"Prueba utilizada: {resultado_grande['prueba_usada']}")
    print(f"Estadístico Chi2: {resultado_grande['estadistico_chi2']:.3f}")
    print(f"p-valor: {resultado_grande['p_valor']:.4f}")
    print(f"V de Cramer: {resultado_grande['v_cramer']:.3f}")
    print(f"Interpretación: {resultado_grande['interpretacion_efecto']}")

def test_diferencias_grupos():
    """
    Prueba la función de cálculo de diferencias entre grupos con mejoras
    """
    print("\n===== PRUEBA DE CÁLCULO DE DIFERENCIAS ENTRE GRUPOS =====")
    
    # Crear datos para 3 grupos con diferencias significativas
    np.random.seed(42)
    n_por_grupo = 30
    
    # Grupo A: Media 5, desv. estándar 1
    grupo_a = np.random.normal(5, 1, n_por_grupo)
    
    # Grupo B: Media 7, desv. estándar 1
    grupo_b = np.random.normal(7, 1, n_por_grupo)
    
    # Grupo C: Media 5.2, desv. estándar 1 (similar a A)
    grupo_c = np.random.normal(5.2, 1, n_por_grupo)
    
    df = pd.DataFrame({
        'grupo': ['A'] * n_por_grupo + ['B'] * n_por_grupo + ['C'] * n_por_grupo,
        'valor': np.concatenate([grupo_a, grupo_b, grupo_c])
    })
    
    # Test para dos grupos (paramétrico)
    print("\nComparación de dos grupos (A vs B) paramétrico:")
    df_dos = df[df['grupo'].isin(['A', 'B'])]
    resultado_dos = calcular_diferencias_grupos(df_dos, 'grupo', 'valor')
    mostrar_resultados_diferencias(resultado_dos)
    
    # Test para tres grupos (ANOVA y post-hoc)
    print("\nComparación de tres grupos (ANOVA y post-hoc):")
    resultado_tres = calcular_diferencias_grupos(df, 'grupo', 'valor')
    mostrar_resultados_diferencias(resultado_tres)
    
    # Crear datos no paramétricos (distribución asimétrica)
    df_no_normal = pd.DataFrame({
        'grupo': ['A'] * n_por_grupo + ['B'] * n_por_grupo,
        'valor': np.concatenate([
            np.exp(np.random.normal(1, 0.5, n_por_grupo)),  # Log-normal
            np.exp(np.random.normal(1.5, 0.5, n_por_grupo))  # Log-normal con mayor media
        ])
    })
    
    print("\nComparación de dos grupos con distribución no normal:")
    resultado_no_param = calcular_diferencias_grupos(df_no_normal, 'grupo', 'valor')
    mostrar_resultados_diferencias(resultado_no_param)

def mostrar_resultados_diferencias(resultado):
    """Muestra los resultados de calcular_diferencias_grupos de forma organizada"""
    print(f"Prueba utilizada: {resultado.get('prueba', 'No especificada')}")
    print(f"p-valor: {resultado.get('p_valor', 'No disponible'):.4f}")
    print(f"Diferencia significativa: {resultado.get('diferencia_significativa', 'No disponible')}")
    
    # Mostrar tamaño del efecto
    for clave, valor in resultado.items():
        if 'tamaño' in clave or 'efecto' in clave:
            print(f"{clave}: {valor}")
    
    # Mostrar potencia si está disponible
    if 'analisis_potencia' in resultado:
        potencia = resultado['analisis_potencia']
        print(f"Potencia estadística: {potencia.get('potencia', 'No disponible'):.3f}")
        print(f"Interpretación: {potencia.get('interpretacion', 'No disponible')}")
        print(f"Recomendación: {potencia.get('recomendacion', 'No disponible')}")
    
    # Mostrar resultados post-hoc si están disponibles
    if 'posthoc' in resultado and 'comparaciones' in resultado['posthoc']:
        print("\nComparaciones post-hoc:")
        for comp in resultado['posthoc']['comparaciones']:
            print(f"  - {comp.get('grupo1', '')} vs {comp.get('grupo2', '')}: {comp.get('interpretacion', '')}")

def test_visualizacion_mejorada():
    """
    Prueba las visualizaciones mejoradas
    """
    print("\n===== PRUEBA DE VISUALIZACIONES MEJORADAS =====")
    
    # Crear un DataFrame de ejemplo más realista
    np.random.seed(42)
    n = 100
    
    # Datos para simular una encuesta de satisfacción
    segmentos = np.random.choice(['Personas', 'Empresas'], n)
    
    # Ratings de satisfacción condicionados al segmento
    ratings = []
    for seg in segmentos:
        if seg == 'Personas':
            ratings.append(np.random.choice([1, 2, 3, 4, 5], p=[0.05, 0.1, 0.2, 0.4, 0.25]))
        else:
            ratings.append(np.random.choice([1, 2, 3, 4, 5], p=[0.02, 0.08, 0.15, 0.35, 0.4]))
    
    # Ciudades
    ciudades = np.random.choice(['Bogotá', 'Medellín', 'Cali', 'Barranquilla'], n)
    
    # Generar edades
    edades = np.random.normal(45, 15, n).astype(int)
    edades = np.clip(edades, 18, 80)  # Restringir entre 18 y 80 años
    
    df = pd.DataFrame({
        'SEGMENTO': segmentos,
        'CIUDAD_AGENCIA': ciudades,
        'PREGUNTA_1': ratings,
        'EDAD': edades
    })
    
    print("\nVisualizando relación categórica-categórica (SEGMENTO vs CIUDAD_AGENCIA):")
    bivariado_cat_cat(df, 'SEGMENTO', 'CIUDAD_AGENCIA', export_png_dir='graficos')
    
    # Pruebas de funciones individuales
    print("\nPrueba de cálculo de diferencias entre grupos:")
    resultados = calcular_diferencias_grupos(df, 'SEGMENTO', 'PREGUNTA_1')
    print(f"Prueba utilizada: {resultados['prueba']}")
    print(f"p-valor: {resultados['p_valor']:.4f}")
    
    if 'analisis_potencia' in resultados:
        print(f"Potencia: {resultados['analisis_potencia'].get('potencia', 'No disponible')}")
    
    plt.close('all')
    print("Se generaron visualizaciones en el directorio 'graficos'")

if __name__ == "__main__":
    print("PRUEBAS DE MEJORAS DE MAYO 2025")
    print("================================")
    
    # Ejecutar pruebas
    test_potencia_estadistica()
    test_chi2_mejorado()
    test_diferencias_grupos()
    test_visualizacion_mejorada()
    
    print("\n¡Pruebas completadas!")
