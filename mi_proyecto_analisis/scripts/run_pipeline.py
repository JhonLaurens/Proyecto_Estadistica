import os
import sys
import pandas as pd

# Asegurar que los módulos sean encontrados
sys.path.append(os.path.abspath('..'))

from src.data_processing import cargar_datos_csv, limpiar_columnas, manejar_nulos, convertir_tipos
from src.feature_engineering import crear_variables, normalizar_variables, codificar_categoricas
from src.visualization import generar_graficos

# Definir rutas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_PATH = os.path.join('..', 'notebooks', 'data', 'raw', 'Base encuesta de satisfacción.csv')
INTERIM_PATH = os.path.join('..', 'notebooks', 'data', 'interim', 'datos_limpios.csv')
PROCESSED_PATH = os.path.join('..', 'notebooks', 'data', 'processed', 'datos_procesados.csv')
REPORTS_PATH = os.path.join('..', 'notebooks', 'reports', 'figures')

def pipeline_completo(raw_path=RAW_PATH, interim_path=INTERIM_PATH, 
                     processed_path=PROCESSED_PATH, reports_path=REPORTS_PATH):
    """
    Ejecuta el flujo completo de procesamiento de datos:
    1. Carga de datos
    2. Limpieza y preprocesamiento
    3. Ingeniería de características
    4. Generación de visualizaciones
    5. Guardado de resultados
    """
    print("1. Cargando datos...")
    df = cargar_datos_csv(raw_path)
    
    print("2. Limpiando datos...")
    df = limpiar_columnas(df)
    
    # Manejo de valores nulos
    df = manejar_nulos(df, estrategia='reemplazar_media')
    
    # Convertir tipos si es necesario
    # Ejemplo: conversiones = {'edad': 'int', 'fecha': 'datetime'}
    # df = convertir_tipos(df, conversiones)
    
    print("3. Guardando datos intermedios...")
    os.makedirs(os.path.dirname(interim_path), exist_ok=True)
    df.to_csv(interim_path, index=False)
    print(f"Datos limpios guardados en {interim_path}")
    
    print("4. Aplicando ingeniería de características...")
    # Ejemplo de creación de nuevas variables
    # operaciones = [
    #    {'nombre': 'indice_satisfaccion', 'formula': 'df["pregunta1"] + df["pregunta2"]'}
    # ]
    # df = crear_variables(df, operaciones)
    
    # Normalizar variables numéricas
    df_numericas = df.select_dtypes(include=['number'])
    if not df_numericas.empty:
        df = normalizar_variables(df, metodo='standard')
    
    # Codificar variables categóricas
    df_categoricas = df.select_dtypes(include=['object', 'category'])
    if not df_categoricas.empty:
        df = codificar_categoricas(df, metodo='dummy')
    
    print("5. Guardando datos procesados...")
    os.makedirs(os.path.dirname(processed_path), exist_ok=True)
    df.to_csv(processed_path, index=False)
    print(f"Datos procesados guardados en {processed_path}")
    
    print("6. Generando visualizaciones...")
    generar_graficos(df, carpeta_destino=reports_path)
    
    print("Pipeline completado con éxito.")
    return df

def main():
    """Función principal que ejecuta el pipeline."""
    try:
        pipeline_completo()
    except Exception as e:
        print(f"Error al ejecutar el pipeline: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
