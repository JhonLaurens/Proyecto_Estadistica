import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
import os

def configurar_estilo_visualizacion():
    """Configura el estilo de visualización para gráficos consistentes."""
    sns.set(style="whitegrid")
    plt.rcParams['figure.figsize'] = (12, 8)
    plt.rcParams['font.size'] = 12
    plt.rcParams['axes.labelsize'] = 14
    plt.rcParams['axes.titlesize'] = 16
    plt.rcParams['xtick.labelsize'] = 12
    plt.rcParams['ytick.labelsize'] = 12

def grafico_distribucion(df, columnas=None, n_cols=3, carpeta_destino=None, formato='png', 
                         bins=20, kde=True):
    """
    Genera gráficos de distribución para variables numéricas.
    
    Args:
        df: DataFrame de pandas
        columnas: Lista de columnas a graficar (None = todas numéricas)
        n_cols: Número de columnas en el grid de gráficos
        carpeta_destino: Carpeta donde guardar los gráficos (None = no guardar)
        formato: Formato de los archivos ('png', 'jpg', 'svg', 'pdf')
        bins: Número de bins para histogramas
        kde: Si se muestra la estimación de densidad kernel
    
    Returns:
        Lista de figuras creadas
    """
    configurar_estilo_visualizacion()
    
    # Si no se especifican columnas, usar todas las numéricas
    if columnas is None:
        columnas = df.select_dtypes(include=[np.number]).columns
    
    # Verificar que las columnas existan y sean numéricas
    columnas = [col for col in columnas if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
    
    if not columnas:
        print("No se encontraron columnas numéricas para graficar")
        return []
    
    # Calcular el número de filas necesarias
    n_rows = int(np.ceil(len(columnas) / n_cols))
    
    # Crear la figura
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(n_cols*5, n_rows*4))
    
    # Aplanar el array de axes para facilitar la iteración
    if n_rows > 1 or n_cols > 1:
        axes = axes.flatten()
    else:
        axes = [axes]
    
    figuras = []
    
    # Crear histogramas
    for i, columna in enumerate(columnas):
        if i < len(axes):
            sns.histplot(df[columna].dropna(), ax=axes[i], bins=bins, kde=kde)
            axes[i].set_title(f'Distribución de {columna}')
            axes[i].set_xlabel(columna)
            axes[i].set_ylabel('Frecuencia')
    
    # Ocultar los axes sin usar
    for i in range(len(columnas), len(axes)):
        axes[i].set_visible(False)
    
    plt.tight_layout()
    figuras.append(fig)
    
    # Guardar gráfico si se especifica una carpeta
    if carpeta_destino:
        os.makedirs(carpeta_destino, exist_ok=True)
        plt.savefig(os.path.join(carpeta_destino, f"distribucion_variables.{formato}"))
    
    return figuras

def grafico_correlacion(df, columnas=None, metodo='pearson', carpeta_destino=None, formato='png'):
    """
    Genera un mapa de calor de correlación para variables numéricas.
    
    Args:
        df: DataFrame de pandas
        columnas: Lista de columnas a incluir (None = todas numéricas)
        metodo: Método de correlación ('pearson', 'kendall', 'spearman')
        carpeta_destino: Carpeta donde guardar el gráfico (None = no guardar)
        formato: Formato del archivo ('png', 'jpg', 'svg', 'pdf')
    
    Returns:
        Figura creada
    """
    configurar_estilo_visualizacion()
    
    # Si no se especifican columnas, usar todas las numéricas
    if columnas is None:
        columnas = df.select_dtypes(include=[np.number]).columns
    
    # Verificar que las columnas existan
    columnas = [col for col in columnas if col in df.columns]
    
    if len(columnas) < 2:
        print("Se necesitan al menos 2 columnas para un mapa de correlación")
        return None
    
    # Calcular la matriz de correlación
    corr = df[columnas].corr(method=metodo)
    
    # Crear el gráfico
    plt.figure(figsize=(12, 10))
    mask = np.triu(np.ones_like(corr, dtype=bool))  # Máscara para el triángulo superior
    cmap = sns.diverging_palette(230, 20, as_cmap=True)
    
    # Dibujar el mapa de calor
    sns.heatmap(corr, mask=mask, cmap=cmap, vmax=1, vmin=-1, center=0,
                annot=True, fmt=".2f", square=True, linewidths=.5)
    
    plt.title(f'Matriz de correlación ({metodo})', fontsize=16)
    plt.tight_layout()
    
    # Guardar gráfico si se especifica una carpeta
    if carpeta_destino:
        os.makedirs(carpeta_destino, exist_ok=True)
        plt.savefig(os.path.join(carpeta_destino, f"correlacion_{metodo}.{formato}"))
    
    return plt.gcf()

def grafico_categorico(df, columna, tipo='count', carpeta_destino=None, formato='png', 
                      top_n=None, orden=None):
    """
    Genera gráficos para variables categóricas.
    
    Args:
        df: DataFrame de pandas
        columna: Columna categórica a graficar
        tipo: Tipo de gráfico ('count', 'percent', 'bar', 'pie')
        carpeta_destino: Carpeta donde guardar el gráfico (None = no guardar)
        formato: Formato del archivo ('png', 'jpg', 'svg', 'pdf')
        top_n: Mostrar solo las top_n categorías más frecuentes
        orden: Lista con orden específico de categorías
    
    Returns:
        Figura creada
    """
    configurar_estilo_visualizacion()
    
    if columna not in df.columns:
        print(f"La columna '{columna}' no existe en el DataFrame")
        return None
    
    # Preparar los datos
    if tipo in ['count', 'percent', 'bar']:
        # Calcular conteos
        conteo = df[columna].value_counts()
        
        # Limitar a top_n si se especifica
        if top_n is not None:
            conteo = conteo.nlargest(top_n)
        
        # Usar orden específico si se proporciona
        if orden is not None:
            conteo = conteo.reindex(orden)
        
        # Convertir a porcentaje si es necesario
        if tipo == 'percent':
            conteo = conteo / conteo.sum() * 100
    
    # Crear el gráfico
    plt.figure(figsize=(12, 8))
    
    if tipo == 'pie':
        # Gráfico de pastel
        conteo = df[columna].value_counts()
        if top_n is not None:
            otros = conteo[top_n:].sum()
            conteo = conteo.nlargest(top_n)
            if otros > 0:
                conteo['Otros'] = otros
        
        plt.pie(conteo, labels=conteo.index, autopct='%1.1f%%', startangle=90)
        plt.axis('equal')
        plt.title(f'Distribución de {columna}')
    
    else:
        # Gráficos de barras
        if tipo == 'count':
            ylabel = 'Frecuencia'
        elif tipo == 'percent':
            ylabel = 'Porcentaje (%)'
        else:
            ylabel = 'Valor'
        
        sns.barplot(x=conteo.index, y=conteo.values)
        plt.title(f'Distribución de {columna}')
        plt.xlabel(columna)
        plt.ylabel(ylabel)
        plt.xticks(rotation=45, ha='right')
    
    plt.tight_layout()
    
    # Guardar gráfico si se especifica una carpeta
    if carpeta_destino:
        os.makedirs(carpeta_destino, exist_ok=True)
        plt.savefig(os.path.join(carpeta_destino, f"{columna}_{tipo}.{formato}"))
    
    return plt.gcf()

def grafico_dispersion(df, x, y, hue=None, size=None, carpeta_destino=None, formato='png'):
    """
    Genera un gráfico de dispersión entre dos variables.
    
    Args:
        df: DataFrame de pandas
        x: Columna para el eje X
        y: Columna para el eje Y
        hue: Columna para color (opcional)
        size: Columna para tamaño de puntos (opcional)
        carpeta_destino: Carpeta donde guardar el gráfico (None = no guardar)
        formato: Formato del archivo ('png', 'jpg', 'svg', 'pdf')
    
    Returns:
        Figura creada
    """
    configurar_estilo_visualizacion()
    
    if x not in df.columns or y not in df.columns:
        print(f"Una de las columnas especificadas no existe en el DataFrame")
        return None
    
    if hue and hue not in df.columns:
        print(f"La columna '{hue}' para hue no existe en el DataFrame")
        hue = None
    
    if size and size not in df.columns:
        print(f"La columna '{size}' para size no existe en el DataFrame")
        size = None
    
    # Crear el gráfico
    plt.figure(figsize=(12, 8))
    
    scatter_kws = {}
    if size:
        # Normalizar tamaños para que sean visibles
        size_values = df[size]
        min_size, max_size = 20, 200
        norm_size = ((size_values - size_values.min()) / 
                    (size_values.max() - size_values.min())) * (max_size - min_size) + min_size
        scatter_kws['s'] = norm_size
    
    # Crear el scatter plot
    sns.scatterplot(data=df, x=x, y=y, hue=hue, **scatter_kws)
    
    plt.title(f'Relación entre {x} y {y}')
    plt.xlabel(x)
    plt.ylabel(y)
    
    if hue:
        plt.legend(title=hue, bbox_to_anchor=(1.05, 1), loc='upper left')
    
    plt.tight_layout()
    
    # Guardar gráfico si se especifica una carpeta
    if carpeta_destino:
        os.makedirs(carpeta_destino, exist_ok=True)
        plt.savefig(os.path.join(carpeta_destino, f"dispersion_{x}_{y}.{formato}"))
    
    return plt.gcf()

def generar_graficos(df, carpeta_destino='../reports/figures', formato='png'):
    """
    Genera un conjunto estándar de gráficos para el análisis exploratorio.
    
    Args:
        df: DataFrame de pandas
        carpeta_destino: Carpeta donde guardar los gráficos
        formato: Formato de los archivos ('png', 'jpg', 'svg', 'pdf')
    
    Returns:
        None
    """
    print("Generando gráficos de distribución...")
    grafico_distribucion(df, carpeta_destino=carpeta_destino, formato=formato)
    
    print("Generando matriz de correlación...")
    grafico_correlacion(df, carpeta_destino=carpeta_destino, formato=formato)
    
    # Generar gráficos para cada columna categórica
    categoricas = df.select_dtypes(include=['category', 'object']).columns
    for col in categoricas:
        print(f"Generando gráfico para variable categórica: {col}")
        grafico_categorico(df, col, carpeta_destino=carpeta_destino, formato=formato)
    
    print(f"Todos los gráficos han sido guardados en {carpeta_destino}")
