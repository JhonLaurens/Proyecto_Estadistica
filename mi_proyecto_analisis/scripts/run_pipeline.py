import os
from src.data_processing import cargar_datos_csv, limpiar_columnas

RAW_PATH = os.path.join('..', 'data', 'raw', 'Base encuesta de satisfacción.csv')
INTERIM_PATH = os.path.join('..', 'data', 'interim', 'datos_limpios.csv')

# Ejemplo para agregar más pasos:
# from src.feature_engineering import crear_variables
# from src.visualization import generar_graficos

def main():
    df = cargar_datos_csv(RAW_PATH)
    df = limpiar_columnas(df)
    # df = crear_variables(df)  # Descomenta si implementas feature engineering
    df.to_csv(INTERIM_PATH, index=False)
    print(f"Datos limpios guardados en {INTERIM_PATH}")
    # generar_graficos(df)  # Descomenta si implementas visualizaciones

if __name__ == "__main__":
    main()
