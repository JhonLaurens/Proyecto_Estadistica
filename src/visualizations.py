# visualizations.py
# (Opcional: aquí puedes poner funciones de visualización extra, wordcloud, etc.)

from wordcloud import WordCloud, STOPWORDS
import re
import pandas as pd
import matplotlib.pyplot as plt
from collections import Counter
from src.exporter import export_table_to_excel, add_figure_for_pdf, save_plot_to_png
import os

def analisis_texto_pregunta5(df, export_excel_path=None, export_pdf_path=None, export_png_dir=None):
    print("\n" + "="*60)
    print("ANÁLISIS DE TEXTO LIBRE: PREGUNTA_5 (Comentarios)")
    print("="*60)
    comentarios = df['PREGUNTA_5'].dropna().astype(str)
    all_text = " ".join(comentarios)
    # Limpieza básica
    words = re.findall(r'\w+', all_text.lower())
    stopwords = set(STOPWORDS)
    filtered_words = [w for w in words if w not in stopwords and len(w) > 2]
    word_counts = Counter(filtered_words)
    tabla_palabras = pd.DataFrame(word_counts.most_common(20), columns=['Palabra', 'Frecuencia'])
    print("\nTop 20 palabras más frecuentes:")
    print(tabla_palabras.to_string(index=False))
    if export_excel_path:
        export_table_to_excel(tabla_palabras, 'WordFreq_PREGUNTA_5', export_excel_path)
    # WordCloud
    wc = WordCloud(width=800, height=400, background_color='white', stopwords=stopwords, colormap='viridis').generate(all_text)
    plt.figure(figsize=(12, 6))
    plt.imshow(wc, interpolation='bilinear')
    plt.axis('off')
    plt.title('WordCloud de Comentarios (PREGUNTA_5)', fontsize=16, fontweight='bold')
    plt.tight_layout()
    fig = plt.gcf()
    if export_pdf_path:
        add_figure_for_pdf(fig)
    if export_png_dir:
        os.makedirs(export_png_dir, exist_ok=True)
        save_plot_to_png(fig, os.path.join(export_png_dir, "wordcloud_pregunta5.png"))
    plt.show()
