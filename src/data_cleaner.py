# data_cleaner.py
import pandas as pd

def clean_data(df):
    """Limpia y transforma el DataFrame: convierte preguntas a float, fechas, extrae año/mes."""
    cols_preguntas = ['PREGUNTA_1', 'PREGUNTA_2', 'PREGUNTA_3', 'PREGUNTA_4']
    for col in cols_preguntas:
        df[col] = df[col].astype(str).str.replace(',', '.').astype(float)
    df['FECHA_ENCUESTA'] = pd.to_datetime(df['FECHA_ENCUESTA'], format='%d/%m/%Y', errors='coerce')
    df['AÑO_ENCUESTA'] = df['FECHA_ENCUESTA'].dt.year
    df['MES_ENCUESTA'] = df['FECHA_ENCUESTA'].dt.month
    return df
