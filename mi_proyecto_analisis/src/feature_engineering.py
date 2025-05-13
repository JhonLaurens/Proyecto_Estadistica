import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, OneHotEncoder

def normalizar_variables(df, columnas=None, metodo='standard'):
    """
    Normaliza variables numéricas en el DataFrame.
    
    Args:
        df: DataFrame de pandas
        columnas: Lista de columnas a normalizar (None = todas numéricas)
        metodo: 'standard' (media=0, std=1) o 'minmax' (entre 0 y 1)
    
    Returns:
        DataFrame con columnas normalizadas
    """
    # Crear copia para no modificar el original
    resultado = df.copy()
    
    # Si no se especifican columnas, usar todas las numéricas
    if columnas is None:
        columnas = df.select_dtypes(include=[np.number]).columns
    
    # Verificar que todas las columnas existan y sean numéricas
    columnas = [col for col in columnas if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
    
    if metodo == 'standard':
        scaler = StandardScaler()
    elif metodo == 'minmax':
        scaler = MinMaxScaler()
    else:
        raise ValueError("Método no reconocido. Use 'standard' o 'minmax'.")
    
    # Aplicar normalización
    if columnas:
        resultado[columnas] = scaler.fit_transform(resultado[columnas])
    
    return resultado

def codificar_categoricas(df, columnas=None, metodo='onehot', drop_first=False):
    """
    Codifica variables categóricas en el DataFrame.
    
    Args:
        df: DataFrame de pandas
        columnas: Lista de columnas a codificar (None = todas categóricas/object)
        metodo: 'onehot', 'dummy', 'label', 'ordinal'
        drop_first: Si se elimina la primera categoría (para evitar colinealidad)
    
    Returns:
        DataFrame con columnas codificadas
    """
    # Crear copia para no modificar el original
    resultado = df.copy()
    
    # Si no se especifican columnas, usar todas las categóricas/object
    if columnas is None:
        columnas = df.select_dtypes(include=['category', 'object']).columns
    
    # Verificar que todas las columnas existan
    columnas = [col for col in columnas if col in df.columns]
    
    if metodo == 'onehot':
        # One-Hot Encoding usando sklearn
        for col in columnas:
            # Crear encoder
            encoder = OneHotEncoder(sparse=False, drop='first' if drop_first else None)
            # Transformar y crear df
            encoded = encoder.fit_transform(resultado[[col]])
            # Crear nombres de columnas
            categories = encoder.categories_[0]
            if drop_first:
                categories = categories[1:]
            col_names = [f"{col}_{cat}" for cat in categories]
            
            # Agregar al DataFrame resultado
            encoded_df = pd.DataFrame(encoded, columns=col_names, index=resultado.index)
            resultado = pd.concat([resultado, encoded_df], axis=1)
        
        # Eliminar columnas originales
        resultado = resultado.drop(columns=columnas)
    
    elif metodo == 'dummy':
        # Pandas get_dummies (similar a OneHot pero más simple)
        resultado = pd.get_dummies(resultado, columns=columnas, drop_first=drop_first)
    
    elif metodo == 'label':
        # Label encoding (0, 1, 2, ...)
        for col in columnas:
            resultado[col] = resultado[col].astype('category').cat.codes
    
    elif metodo == 'ordinal':
        # Se debe proporcionar un mapeo para ordinal encoding
        # Esta es una implementación básica
        for col in columnas:
            resultado[col] = resultado[col].astype('category').cat.codes
    
    return resultado

def crear_variables(df, operaciones=None):
    """
    Crea nuevas variables basadas en las existentes.
    
    Args:
        df: DataFrame de pandas
        operaciones: Lista de diccionarios con información para crear variables
                    [{'nombre': 'nueva_var', 'formula': 'var1 + var2'}, ...]
    
    Returns:
        DataFrame con nuevas variables
    """
    # Crear copia para no modificar el original
    resultado = df.copy()
    
    if operaciones is None:
        return resultado
    
    for op in operaciones:
        if 'nombre' not in op or 'formula' not in op:
            print("Error: Cada operación debe tener 'nombre' y 'formula'")
            continue
        
        nombre = op['nombre']
        formula = op['formula']
        
        try:
            # Evaluar la fórmula usando las columnas del DataFrame
            # Esto permite expresiones como 'columna1 + columna2' o 'np.log(columna)'
            resultado[nombre] = eval(formula, {'__builtins__': {}}, 
                                     {**{col: resultado[col] for col in resultado.columns}, 
                                      'np': np, 'pd': pd})
        except Exception as e:
            print(f"Error al crear variable '{nombre}': {e}")
    
    return resultado

def seleccionar_caracteristicas(df, metodo='varianza', umbral=0.01, n_caracteristicas=None):
    """
    Selecciona características relevantes del DataFrame.
    
    Args:
        df: DataFrame de pandas (solo columnas numéricas)
        metodo: 'varianza', 'correlacion', 'importancia'
        umbral: Umbral para filtrar características (para 'varianza' y 'correlacion')
        n_caracteristicas: Número de características a seleccionar
    
    Returns:
        DataFrame con características seleccionadas
    """
    # Crear copia para no modificar el original
    resultado = df.copy()
    
    # Trabajar solo con columnas numéricas
    numericas = df.select_dtypes(include=[np.number]).columns
    
    if metodo == 'varianza':
        # Seleccionar características con varianza > umbral
        varianzas = resultado[numericas].var()
        cols_seleccionadas = varianzas[varianzas > umbral].index.tolist()
    
    elif metodo == 'correlacion':
        # Eliminar características altamente correlacionadas entre sí
        corr_matrix = resultado[numericas].corr().abs()
        upper_tri = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
        cols_to_drop = [column for column in upper_tri.columns if any(upper_tri[column] > umbral)]
        cols_seleccionadas = [col for col in numericas if col not in cols_to_drop]
    
    elif metodo == 'importancia':
        # Este método requeriría una implementación más compleja con un modelo
        # por ejemplo, usando Random Forest para determinar importancia de características
        # Por simplicidad, aquí seleccionamos las n_caracteristicas con mayor varianza
        if n_caracteristicas is None:
            n_caracteristicas = len(numericas)
        varianzas = resultado[numericas].var().sort_values(ascending=False)
        cols_seleccionadas = varianzas.index[:n_caracteristicas].tolist()
    
    else:
        raise ValueError("Método no reconocido. Use 'varianza', 'correlacion' o 'importancia'")
    
    # Incluir columnas no numéricas en el resultado
    cols_no_numericas = [col for col in resultado.columns if col not in numericas]
    cols_finales = cols_seleccionadas + cols_no_numericas
    
    return resultado[cols_finales]
