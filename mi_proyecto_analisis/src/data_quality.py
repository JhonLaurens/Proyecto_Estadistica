import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

def generar_perfil_datos(df, output_dir=None):
    """
    Genera un perfil básico de calidad de datos y estadísticas descriptivas.
    
    Args:
        df: DataFrame de pandas a analizar
        output_dir: Directorio donde guardar los gráficos generados (opcional)
    
    Returns:
        Dict con métricas de calidad de datos
    """
    if not isinstance(df, pd.DataFrame):
        raise TypeError("Se requiere un DataFrame de pandas")
        
    if df.empty:
        print("El DataFrame está vacío")
        return {}
    
    # Crear directorio de salida si es necesario
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    
    # Recopilar métricas básicas
    metricas = {
        'num_filas': len(df),
        'num_columnas': len(df.columns),
        'memoria_uso_mb': df.memory_usage(deep=True).sum() / (1024 * 1024),
        'columnas': {}
    }
    
    # Valores nulos
    nulos_por_columna = df.isnull().sum()
    porcentaje_nulos = (nulos_por_columna / len(df)) * 100
    
    # Duplicados
    metricas['filas_duplicadas'] = df.duplicated().sum()
    metricas['porcentaje_duplicados'] = (metricas['filas_duplicadas'] / len(df)) * 100
    
    # Análisis por columna
    for columna in df.columns:
        col_metrics = {
            'tipo': str(df[columna].dtype),
            'nulos': nulos_por_columna[columna],
            'porcentaje_nulos': porcentaje_nulos[columna],
            'valores_unicos': df[columna].nunique()
        }
        
        # Estadísticas para columnas numéricas
        if pd.api.types.is_numeric_dtype(df[columna]):
            col_metrics.update({
                'min': df[columna].min(),
                'max': df[columna].max(),
                'media': df[columna].mean(),
                'mediana': df[columna].median(),
                'desviacion_std': df[columna].std()
            })
            
            # Detección de outliers
            Q1 = df[columna].quantile(0.25)
            Q3 = df[columna].quantile(0.75)
            IQR = Q3 - Q1
            outliers = ((df[columna] < (Q1 - 1.5 * IQR)) | 
                        (df[columna] > (Q3 + 1.5 * IQR))).sum()
            col_metrics['outliers'] = outliers
            col_metrics['porcentaje_outliers'] = (outliers / df[columna].count()) * 100
            
            # Generar histograma si se especifica un directorio de salida
            if output_dir:
                plt.figure(figsize=(10, 6))
                sns.histplot(df[columna].dropna(), kde=True)
                plt.title(f'Distribución de {columna}')
                plt.savefig(os.path.join(output_dir, f'hist_{columna}.png'))
                plt.close()
        
        # Estadísticas para columnas categóricas/texto
        elif pd.api.types.is_object_dtype(df[columna]) or pd.api.types.is_categorical_dtype(df[columna]):
            # Top 5 valores más frecuentes
            value_counts = df[columna].value_counts().nlargest(5)
            col_metrics['top_valores'] = value_counts.to_dict()
            
            # Generar gráfico de barras si se especifica un directorio de salida
            if output_dir and df[columna].nunique() < 20:  # Solo si hay un número razonable de categorías
                plt.figure(figsize=(10, 6))
                sns.countplot(y=df[columna], order=df[columna].value_counts().index[:10])
                plt.title(f'Distribución de {columna}')
                plt.tight_layout()
                plt.savefig(os.path.join(output_dir, f'bar_{columna}.png'))
                plt.close()
        
        # Estadísticas para columnas de fecha/hora
        elif pd.api.types.is_datetime64_any_dtype(df[columna]):
            col_metrics.update({
                'min_fecha': df[columna].min(),
                'max_fecha': df[columna].max(),
                'rango_dias': (df[columna].max() - df[columna].min()).days
            })
        
        metricas['columnas'][columna] = col_metrics
    
    # Generar matriz de correlación para columnas numéricas
    if output_dir:
        num_cols = df.select_dtypes(include=['number']).columns
        if len(num_cols) > 1:
            plt.figure(figsize=(12, 10))
            corr = df[num_cols].corr()
            mask = np.triu(np.ones_like(corr, dtype=bool))
            cmap = sns.diverging_palette(230, 20, as_cmap=True)
            sns.heatmap(corr, mask=mask, cmap=cmap, annot=True, fmt=".2f")
            plt.title('Matriz de Correlación')
            plt.tight_layout()
            plt.savefig(os.path.join(output_dir, 'correlacion.png'))
            plt.close()
    
    # Resumen general
    print(f"=== PERFIL DE DATOS ===")
    print(f"Filas: {metricas['num_filas']}, Columnas: {metricas['num_columnas']}")
    print(f"Memoria utilizada: {metricas['memoria_uso_mb']:.2f} MB")
    print(f"Filas duplicadas: {metricas['filas_duplicadas']} ({metricas['porcentaje_duplicados']:.2f}%)")
    
    # Mostrar columnas con más valores nulos
    if nulos_por_columna.sum() > 0:
        print("\nColumnas con valores nulos:")
        for col, pct in porcentaje_nulos[porcentaje_nulos > 0].sort_values(ascending=False).items():
            print(f"- {col}: {nulos_por_columna[col]} ({pct:.2f}%)")
    
    return metricas

def generar_informe_calidad(df, output_path=None):
    """
    Genera un informe HTML de calidad de datos.
    
    Args:
        df: DataFrame de pandas a analizar
        output_path: Ruta donde guardar el informe HTML
    
    Returns:
        None
    """
    try:
        import pandas_profiling
        from pandas_profiling import ProfileReport
        
        # Crear reporte
        print("Generando informe de calidad...")
        profile = ProfileReport(df, title="Informe de Calidad de Datos", explorative=True)
        
        # Guardar reporte
        if output_path:
            profile.to_file(output_path)
            print(f"Informe guardado en: {output_path}")
        
        return profile
    except ImportError:
        print("NOTA: Para usar esta función, instale pandas-profiling con:")
        print("pip install pandas-profiling")
        print("\nAlternativamente, puede usar la función generar_perfil_datos() que no requiere dependencias adicionales.")
        return None
