# data_loader.py
import pandas as pd

def load_data(filepath):
    """Carga el archivo CSV de satisfacción."""
    return pd.read_csv(filepath, sep=';', encoding='utf-8-sig')
