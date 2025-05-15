# Módulo data_processor (auto-creado para evitar errores de importación)
import pandas as pd

def clean_and_prepare_data(df, config=None):
    """
    Limpia y prepara el DataFrame de encuestas.
    - Elimina filas completamente vacías.
    - Rellena NaN con vacío o valores apropiados.
    - Convierte columnas numéricas y de fecha si es posible.
    - Renombra columnas para estandarizar si es necesario.
    - Aplica reglas básicas de limpieza para preguntas de satisfacción.
    """
    # Eliminar filas completamente vacías
    df = df.dropna(how='all')

    # Rellenar NaN en texto con cadena vacía, en números con 0
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        else:
            df[col] = df[col].fillna('')

    # Convertir columnas de fecha si existen
    for col in df.columns:
        if 'FECHA' in col.upper():
            try:
                df[col] = pd.to_datetime(df[col], errors='coerce', dayfirst=True)
            except Exception:
                pass

    # Limpieza específica para columnas de preguntas (ejemplo: convertir a float)
    for col in df.columns:
        if col.startswith('PREGUNTA_') and not col.endswith('_LIMPIA'):
            df[col] = df[col].astype(str).str.replace(',', '.').str.replace(' ', '')
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Crear columna de comentarios limpios si existe PREGUNTA_5
    if 'PREGUNTA_5' in df.columns:
        df['PREGUNTA_5_LIMPIA'] = df['PREGUNTA_5'].astype(str).str.strip()

    # Puedes agregar más reglas de limpieza aquí según tus necesidades

    return df
