import pandas as pd

def cargar_datos_csv(path, sep=';'):
    """Carga un archivo CSV y retorna un DataFrame de pandas."""
    return pd.read_csv(path, sep=sep)

def limpiar_columnas(df):
    """Ejemplo: elimina espacios en nombres de columnas y convierte a minúsculas."""
    df.columns = [col.strip().lower().replace(' ', '_') for col in df.columns]
    return df
