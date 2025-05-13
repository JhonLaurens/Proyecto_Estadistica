import os
import pandas as pd
import numpy as np

# Definir rutas principales
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_RAW_DIR = os.path.join(PROJECT_DIR, 'data', 'raw')
DATA_INTERIM_DIR = os.path.join(PROJECT_DIR, 'data', 'interim')
DATA_PROCESSED_DIR = os.path.join(PROJECT_DIR, 'data', 'processed')
REPORTS_DIR = os.path.join(PROJECT_DIR, 'reports', 'figures')

# Crear estructura de directorios
for directory in [DATA_RAW_DIR, DATA_INTERIM_DIR, DATA_PROCESSED_DIR, REPORTS_DIR]:
    os.makedirs(directory, exist_ok=True)
    print(f"✓ Directorio creado: {directory}")

# Crear dataset de ejemplo de una encuesta de satisfacción si no existe el archivo
SAMPLE_FILE_PATH = os.path.join(DATA_RAW_DIR, 'Base encuesta de satisfacción.csv')

if not os.path.exists(SAMPLE_FILE_PATH):
    print(f"Creando archivo de muestra en {SAMPLE_FILE_PATH}...")
    
    # Generar datos de muestra para una encuesta de satisfacción
    np.random.seed(42)  # Para reproducibilidad
    n_samples = 100
    
    # Datos demográficos
    edad = np.random.randint(18, 75, size=n_samples)
    genero = np.random.choice(['M', 'F', 'Otro'], size=n_samples, p=[0.48, 0.48, 0.04])
    
    # Preguntas de encuesta (1-5 escala Likert)
    p1 = np.random.randint(1, 6, size=n_samples)  # Satisfacción general
    p2 = np.random.randint(1, 6, size=n_samples)  # Atención al cliente
    p3 = np.random.randint(1, 6, size=n_samples)  # Calidad del producto
    p4 = np.random.randint(1, 6, size=n_samples)  # Relación calidad-precio
    p5 = np.random.randint(1, 6, size=n_samples)  # Recomendación
    
    # Añadir algunos valores nulos para practicar la limpieza
    p1[np.random.choice(n_samples, 5)] = np.nan
    p3[np.random.choice(n_samples, 8)] = np.nan
    
    # Canal de contacto y región
    canal = np.random.choice(['Web', 'Tienda física', 'App móvil', 'Teléfono'], size=n_samples)
    region = np.random.choice(['Norte', 'Sur', 'Este', 'Oeste', 'Centro'], size=n_samples)
    
    # Fecha de encuesta (últimos 30 días)
    import datetime
    today = datetime.date.today()
    dates = [today - datetime.timedelta(days=np.random.randint(1, 31)) for _ in range(n_samples)]
    fecha = [d.strftime('%Y-%m-%d') for d in dates]
    
    # Crear DataFrame
    df_sample = pd.DataFrame({
        'ID': range(1, n_samples + 1),
        'Edad': edad,
        'Genero': genero,
        'P1_Satisfaccion_general': p1,
        'P2_Atencion_cliente': p2,
        'P3_Calidad_producto': p3,
        'P4_Relacion_precio': p4,
        'P5_Recomendacion': p5,
        'Canal_contacto': canal,
        'Region': region,
        'Fecha_encuesta': fecha,
        'Comentarios': ['Comentario ' + str(i) if i % 5 == 0 else np.nan for i in range(n_samples)]
    })
    
    # Guardar archivo
    df_sample.to_csv(SAMPLE_FILE_PATH, sep=';', index=False)
    print(f"✓ Archivo de muestra creado con {n_samples} registros")
else:
    print(f"✓ El archivo ya existe: {SAMPLE_FILE_PATH}")

print("\nConfiguraci�n del proyecto completada. Ahora puedes ejecutar:")
print("1. El notebook de exploraci�n: jupyter notebook notebooks/01_exploracion_inicial.ipynb")
print("2. El pipeline de procesamiento: python scripts/run_pipeline.py")
