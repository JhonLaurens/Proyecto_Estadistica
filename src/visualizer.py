# Módulo visualizer (auto-creado para evitar errores de importación)

from collections import Counter
import matplotlib.pyplot as plt
import seaborn as sns

def plot_mean_scores_by_question(df, columnas_preguntas, config=None):
    """
    Genera una gráfica de barras con la calificación promedio por cada pregunta de satisfacción.
    Args:
        df (pd.DataFrame): DataFrame procesado.
        columnas_preguntas (list): Lista de nombres de columnas de preguntas.
        config: Configuración opcional para visualización.
    """
    # Calcular la media por pregunta
    medias = df[columnas_preguntas].mean()
    # Configuración de visualización
    palette = None
    figsize = (10, 6)
    dpi = 100
    if config is not None:
        palette = config.get('VISUALIZACION', 'ColorPalette', fallback='pastel')
        try:
            figsize = (
                int(config.get('VISUALIZACION', 'FigureSizeWidth', fallback='10')),
                int(config.get('VISUALIZACION', 'FigureSizeHeight', fallback='6'))
            )
            dpi = int(config.get('VISUALIZACION', 'DefaultDPI', fallback='100'))
        except Exception:
            pass

    plt.figure(figsize=figsize, dpi=dpi)
    sns.barplot(x=medias.index, y=medias.values, palette=palette)
    plt.title("Calificación promedio por pregunta de satisfacción")
    plt.xlabel("Pregunta")
    plt.ylabel("Promedio")
    plt.ylim(0, 5)
    plt.tight_layout()

    # Mostrar o guardar según config
    if config is not None and config.get('VISUALIZACION', 'GuardarGraficos', fallback='False').lower() == 'true':
        output_folder = config.get('DEFAULT', 'OutputFolder', fallback='output')
        import os
        os.makedirs(output_folder, exist_ok=True)
        plt.savefig(os.path.join(output_folder, "calificacion_promedio_pregunta.png"))
    else:
        plt.show()
    plt.close()

def plot_correlation_matrix(df, columnas_numericas, config=None):
    """
    Genera y muestra una matriz de correlación para las columnas numéricas del DataFrame.

    Parámetros:
    - df: DataFrame con los datos.
    - columnas_numericas: Lista de columnas a incluir en la matriz.
    - config: Configuración opcional.
    """
    # Filtrar solo columnas numéricas presentes en el DataFrame
    columnas_validas = [col for col in columnas_numericas if col in df.columns and df[col].dtype in ['float64', 'int64']]
    if not columnas_validas:
        print("No hay columnas numéricas válidas para la matriz de correlación.")
        return

    corr = df[columnas_validas].corr()

    figsize = (10, 8)
    dpi = 100
    if config is not None:
        try:
            figsize = (
                int(config.get('VISUALIZACION', 'FigureSizeWidth', fallback='10')),
                int(config.get('VISUALIZACION', 'FigureSizeHeight', fallback='8'))
            )
            dpi = int(config.get('VISUALIZACION', 'DefaultDPI', fallback='100'))
        except Exception:
            pass

    plt.figure(figsize=figsize, dpi=dpi)
    sns.heatmap(corr, annot=True, cmap="coolwarm", fmt=".2f", square=True, linewidths=0.5)
    plt.title("Matriz de Correlación")
    plt.tight_layout()

    # Guardar o mostrar según config
    if config is not None and config.get('VISUALIZACION', 'GuardarGraficos', fallback='False').lower() == 'true':
        output_folder = config.get('DEFAULT', 'OutputFolder', fallback='output')
        import os
        os.makedirs(output_folder, exist_ok=True)
        plt.savefig(os.path.join(output_folder, "matriz_correlacion.png"))
        print(f"Matriz de correlación guardada en: {os.path.join(output_folder, 'matriz_correlacion.png')}")
    else:
        plt.show()
    plt.close()

def plot_wordcloud_and_frequencies(df, text_column, config=None):
    """
    Genera un wordcloud y un gráfico de frecuencias de palabras para una columna de texto.
    Args:
        df (pd.DataFrame): DataFrame procesado.
        text_column (str): Nombre de la columna de texto.
        config: Configuración opcional.
    Returns:
        dict: Conteo de palabras más frecuentes.
    """
    # Importar aquí para evitar error si no está instalado
    try:
        from wordcloud import WordCloud, STOPWORDS
    except ImportError:
        print("wordcloud no está instalado. Instala con: pip install wordcloud")
        return {}

    # Unir todos los textos
    textos = df[text_column].dropna().astype(str).str.lower().tolist()
    texto_unido = " ".join(textos)
    # Si no hay texto, salir sin error
    if not texto_unido.strip():
        print("No hay comentarios para generar word cloud.")
        return {}

    # Palabras vacías (stopwords)
    stopwords = set(STOPWORDS)
    stopwords.update([
        "ninguna", "ninguno", "buena", "no", "todo", "bien", "gracias", "ok", "ningunas", "ninguno.", "ninguna.", "ninguno,", "ninguna,", "no.", "no,", "bueno", "excelente"
    ])

    # Generar wordcloud
    try:
        # Intentar generar nube de palabras; puede fallar si no hay frecuencias
        wordcloud = WordCloud(
            width=800,
            height=400,
            background_color='white',
            stopwords=stopwords,
            collocations=False
        ).generate(texto_unido)
    except ValueError:
        print("No hay palabras con las que generar el word cloud.")
        return {}

    # Mostrar wordcloud
    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.title("Nube de Palabras de Comentarios Abiertos")
    plt.tight_layout()
    if config is not None and config.get('VISUALIZACION', 'GuardarGraficos', fallback='False').lower() == 'true':
        output_folder = config.get('DEFAULT', 'OutputFolder', fallback='output')
        import os
        os.makedirs(output_folder, exist_ok=True)
        plt.savefig(os.path.join(output_folder, "wordcloud_comentarios.png"))
    else:
        plt.show()
    plt.close()

    # Conteo de palabras más frecuentes (sin stopwords)
    palabras = [w for w in texto_unido.split() if w not in stopwords and len(w) > 2]
    conteo = Counter(palabras)
    palabras_comunes = conteo.most_common(15)

    # Gráfico de barras de palabras más frecuentes
    if palabras_comunes:
        palabras_, freqs = zip(*palabras_comunes)
        plt.figure(figsize=(10, 5))
        sns.barplot(x=list(freqs), y=list(palabras_), palette="pastel")
        plt.title("Palabras más frecuentes en comentarios abiertos")
        plt.xlabel("Frecuencia")
        plt.ylabel("Palabra")
        plt.tight_layout()
        if config is not None and config.get('VISUALIZACION', 'GuardarGraficos', fallback='False').lower() == 'true':
            output_folder = config.get('DEFAULT', 'OutputFolder', fallback='output')
            import os
            os.makedirs(output_folder, exist_ok=True)
            plt.savefig(os.path.join(output_folder, "frecuencias_palabras_comentarios.png"))
        else:
            plt.show()
        plt.close()

    return dict(palabras_comunes)

__all__ = [
    "plot_mean_scores_by_question",
    "plot_correlation_matrix",
    "plot_wordcloud_and_frequencies"
]
