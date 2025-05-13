import pandas as pd
import numpy as np

def cargar_datos_csv(path, sep=';'):
    """Carga un archivo CSV y retorna un DataFrame de pandas."""
    try:
        return pd.read_csv(path, sep=sep)
    except FileNotFoundError:
        print(f"Error: El archivo '{path}' no existe.")
        return pd.DataFrame()
    except Exception as e:
        print(f"Error al cargar el archivo: {str(e)}")
        return pd.DataFrame()

def limpiar_columnas(df):
    """Ejemplo: elimina espacios en nombres de columnas y convierte a minúsculas."""
    df.columns = [col.strip().lower().replace(' ', '_') for col in df.columns]
    return df

def manejar_nulos(df, estrategia='eliminar_filas', valor_reemplazo=None, columnas=None):
    """
    Maneja valores nulos en el DataFrame.
    
    Args:
        df: DataFrame de pandas
        estrategia: 'eliminar_filas', 'eliminar_columnas', 'reemplazar_media', 
                   'reemplazar_mediana', 'reemplazar_moda', 'reemplazar_valor'
        valor_reemplazo: Valor a usar si estrategia es 'reemplazar_valor'
        columnas: Lista de columnas a procesar (None = todas)
    
    Returns:
        DataFrame procesado
    """
    # Validar parámetros de entrada
    if not isinstance(df, pd.DataFrame):
        raise TypeError("El parámetro df debe ser un DataFrame de pandas")
        
    if df.empty:
        print("Advertencia: El DataFrame está vacío")
        return df.copy()
        
    estrategias_validas = ['eliminar_filas', 'eliminar_columnas', 'reemplazar_media', 
                          'reemplazar_mediana', 'reemplazar_moda', 'reemplazar_valor']
    if estrategia not in estrategias_validas:
        raise ValueError(f"Estrategia no válida. Opciones: {', '.join(estrategias_validas)}")
        
    if estrategia == 'reemplazar_valor' and valor_reemplazo is None:
        raise ValueError("Debe proporcionar un valor de reemplazo cuando la estrategia es 'reemplazar_valor'")
    
    # Crear copia para no modificar el original
    resultado = df.copy()
    
    # Determinar columnas a procesar y validarlas
    if columnas is not None:
        if not isinstance(columnas, (list, tuple, pd.Index)):
            columnas = [columnas]  # Convertir a lista si es un solo valor
        
        # Verificar que todas las columnas existen
        cols_invalidas = [col for col in columnas if col not in df.columns]
        if cols_invalidas:
            raise ValueError(f"Columnas no encontradas en el DataFrame: {cols_invalidas}")
        
        cols_to_process = columnas
    else:
        cols_to_process = df.columns
    
    # Verificar si hay valores nulos para procesar
    if not df[cols_to_process].isna().any().any():
        print("Información: No se encontraron valores nulos que procesar")
        return resultado
    
    # Resto de la implementación
    try:
        if estrategia == 'eliminar_filas':
            if columnas:
                resultado = resultado.dropna(subset=cols_to_process)
            else:
                resultado = resultado.dropna()
        
        elif estrategia == 'eliminar_columnas':
            resultado = resultado.drop(columns=[col for col in cols_to_process if resultado[col].isna().any()])
        
        elif estrategia == 'reemplazar_media':
            for col in cols_to_process:
                if pd.api.types.is_numeric_dtype(resultado[col]):
                    if resultado[col].isna().any():  # Solo procesar si hay NAs
                        resultado[col].fillna(resultado[col].mean(), inplace=True)
                else:
                    print(f"Advertencia: La columna '{col}' no es numérica y se omitirá para calcular la media")
        
        elif estrategia == 'reemplazar_mediana':
            for col in cols_to_process:
                if pd.api.types.is_numeric_dtype(resultado[col]):
                    if resultado[col].isna().any():
                        resultado[col].fillna(resultado[col].median(), inplace=True)
                else:
                    print(f"Advertencia: La columna '{col}' no es numérica y se omitirá para calcular la mediana")
        
        elif estrategia == 'reemplazar_moda':
            for col in cols_to_process:
                if resultado[col].isna().any():
                    if len(resultado[col].mode()) > 0:
                        resultado[col].fillna(resultado[col].mode()[0], inplace=True)
                    else:
                        print(f"Advertencia: No se pudo determinar la moda para la columna '{col}'")
        
        elif estrategia == 'reemplazar_valor':
            for col in cols_to_process:
                if resultado[col].isna().any():
                    resultado[col].fillna(valor_reemplazo, inplace=True)
        
    except Exception as e:
        print(f"Error durante el procesamiento: {str(e)}")
        raise
    
    # Verificar el resultado
    nulos_antes = df[cols_to_process].isna().sum().sum()
    nulos_despues = resultado[cols_to_process].isna().sum().sum()
    print(f"Valores nulos antes: {nulos_antes}, después: {nulos_despues}")
    print(f"Se procesaron {nulos_antes - nulos_despues} valores nulos")
    
    return resultado

def detectar_outliers(df, columnas=None, metodo='iqr', umbral=1.5):
    """
    Detecta outliers en columnas numéricas.
    
    Args:
        df: DataFrame de pandas
        columnas: Lista de columnas a analizar (None = todas numéricas)
        metodo: 'iqr' (Rango intercuartílico) o 'zscore'
        umbral: Para IQR, multiplicador de IQR; para zscore, número de desviaciones estándar
    
    Returns:
        DataFrame con índices y columnas que contienen outliers
    """
    # Si no se especifican columnas, usar todas las numéricas
    if columnas is None:
        columnas = df.select_dtypes(include=[np.number]).columns
    
    outliers = pd.DataFrame(columns=['columna', 'indice', 'valor'])
    
    for col in columnas:
        if not pd.api.types.is_numeric_dtype(df[col]):
            continue
            
        if metodo == 'iqr':
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - umbral * IQR
            upper_bound = Q3 + umbral * IQR
            
            # Encontrar outliers
            indices = df[(df[col] < lower_bound) | (df[col] > upper_bound)].index
            
        elif metodo == 'zscore':
            from scipy import stats
            z_scores = np.abs(stats.zscore(df[col].dropna()))
            indices = df.index[df[col].notna()][z_scores > umbral]
        
        # Agregar outliers encontrados al DataFrame
        for idx in indices:
            outliers = pd.concat([outliers, pd.DataFrame({
                'columna': [col],
                'indice': [idx],
                'valor': [df.loc[idx, col]]
            })], ignore_index=True)
    
    return outliers

def convertir_tipos(df, conversiones=None):
    """
    Convierte tipos de datos de columnas.
    
    Args:
        df: DataFrame de pandas
        conversiones: Diccionario {columna: tipo}
                     Ejemplo: {'edad': 'int', 'salario': 'float', 'fecha': 'datetime'}
    
    Returns:
        DataFrame con tipos convertidos
    """
    resultado = df.copy()
    
    if not conversiones:
        return resultado
    
    for col, tipo in conversiones.items():
        if col not in resultado.columns:
            print(f"Advertencia: La columna '{col}' no existe en el DataFrame")
            continue
            
        try:
            if tipo == 'int':
                resultado[col] = pd.to_numeric(resultado[col], errors='coerce').astype('Int64')  # Int64 permite NaN
            elif tipo == 'float':
                resultado[col] = pd.to_numeric(resultado[col], errors='coerce')
            elif tipo == 'datetime':
                resultado[col] = pd.to_datetime(resultado[col], errors='coerce')
            elif tipo == 'category':
                resultado[col] = resultado[col].astype('category')
            elif tipo == 'string':
                resultado[col] = resultado[col].astype('string')
            else:
                resultado[col] = resultado[col].astype(tipo)
        except Exception as e:
            print(f"Error al convertir columna '{col}' a {tipo}: {e}")
    
    return resultado
