import sys
import os
import pandas as pd
import numpy as np

# Añadir el directorio padre al path para importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.data_processing import cargar_datos_csv, manejar_nulos, detectar_outliers, convertir_tipos

def crear_datos_prueba():
    """Crea un DataFrame de prueba con valores nulos y outliers"""
    np.random.seed(42)  # Para reproducibilidad
    
    df = pd.DataFrame({
        'edad': [25, 30, np.nan, 22, 65, 18, 45, np.nan, 90, 35],
        'salario': [50000, 60000, 55000, np.nan, 150000, 45000, 70000, 65000, np.nan, 60000],
        'categoria': ['A', 'B', 'A', 'C', np.nan, 'B', 'A', 'C', 'B', np.nan],
        'fecha': ['2023-01-01', '2023-02-15', np.nan, '2023-03-10', '2023-04-20', 
                 '2023-05-05', np.nan, '2023-06-15', '2023-07-01', '2023-08-30']
    })
    
    return df

def test_cargar_datos():
    print("\n=== PRUEBA: cargar_datos_csv ===")
    # Prueba con archivo que no existe
    df = cargar_datos_csv("archivo_inexistente.csv")
    print(f"DataFrame vacío creado: {df.empty}")
    
    # Si hay un archivo de prueba disponible, descomentar:
    # df = cargar_datos_csv("../data/raw/Base encuesta de satisfacción.csv")
    # print(f"DataFrame cargado: {df.shape}")

def test_manejar_nulos():
    print("\n=== PRUEBA: manejar_nulos ===")
    df = crear_datos_prueba()
    print("DataFrame original:")
    print(df.head())
    print(f"Valores nulos: {df.isna().sum().sum()}")
    
    # Probar diferentes estrategias
    estrategias = ['eliminar_filas', 'reemplazar_media', 'reemplazar_mediana', 'reemplazar_moda', 'reemplazar_valor']
    
    for estrategia in estrategias:
        print(f"\nProbando estrategia: {estrategia}")
        if estrategia == 'reemplazar_valor':
            df_limpio = manejar_nulos(df, estrategia=estrategia, valor_reemplazo=0)
        else:
            df_limpio = manejar_nulos(df, estrategia=estrategia)
        
        print(f"Valores nulos después: {df_limpio.isna().sum().sum()}")

def test_detectar_outliers():
    print("\n=== PRUEBA: detectar_outliers ===")
    df = crear_datos_prueba()
    
    # Detectar outliers con IQR
    outliers_iqr = detectar_outliers(df, metodo='iqr')
    print("Outliers detectados (IQR):")
    print(outliers_iqr)
    
    # Detectar outliers con Z-score
    outliers_z = detectar_outliers(df, metodo='zscore', umbral=2)
    print("\nOutliers detectados (Z-score):")
    print(outliers_z)

def test_convertir_tipos():
    print("\n=== PRUEBA: convertir_tipos ===")
    df = crear_datos_prueba()
    
    conversiones = {
        'edad': 'int',
        'salario': 'float',
        'categoria': 'category',
        'fecha': 'datetime'
    }
    
    df_convertido = convertir_tipos(df, conversiones)
    
    print("Tipos antes de conversión:")
    print(df.dtypes)
    print("\nTipos después de conversión:")
    print(df_convertido.dtypes)

if __name__ == "__main__":
    print("Ejecutando pruebas de funciones...")
    
    test_cargar_datos()
    test_manejar_nulos()
    test_detectar_outliers()
    test_convertir_tipos()
    
    print("\nPruebas completadas.")
