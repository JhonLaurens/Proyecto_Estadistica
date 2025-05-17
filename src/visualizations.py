# visualizations.py
# (Opcional: aquí puedes poner funciones de visualización extra, wordcloud, etc.)

from wordcloud import WordCloud, STOPWORDS
import re
import pandas as pd
import matplotlib.pyplot as plt
from collections import Counter
from src.exporter import export_table_to_excel, add_figure_for_pdf, save_plot_to_png
import os
# --- Análisis de temas/frases en comentarios usando IA (KeyBERT) ---
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer

def analisis_texto_pregunta5(df, export_excel_path=None, export_pdf_path=None, export_png_dir=None, export_json_dir=None):
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
    # Exportar TODAS las palabras para la nube y análisis completo
    if export_json_dir:
        os.makedirs(export_json_dir, exist_ok=True)
        # Exporta todas las palabras, no solo el top 20
        pd.DataFrame(word_counts.most_common(), columns=['Palabra', 'Frecuencia']).to_json(
            os.path.join(export_json_dir, 'tabla_wordcloud_pregunta5.json'),
            orient='records', force_ascii=False, indent=2
        )
    # WordCloud con paleta personalizada y SVG
    wc = WordCloud(width=800, height=400, background_color='white', stopwords=stopwords,
                   colormap='plasma', max_words=100).generate(all_text)
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
        # Guardar también como SVG para mejor calidad web
        fig.savefig(os.path.join(export_png_dir, "wordcloud_pregunta5.svg"), format='svg', bbox_inches='tight')
    plt.close(fig)

def analisis_temas_comentarios(df, export_json_dir=None, n_topics=5, n_examples=2):
    comentarios = df['PREGUNTA_5'].dropna().astype(str).tolist()
    if not comentarios:
        print("No hay comentarios para analizar.")
        return
    # Usar modelo multilingüe para embeddings
    model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    kw_model = KeyBERT(model)
    # Extraer temas (frases clave) de todos los comentarios
    temas = kw_model.extract_keywords(comentarios, keyphrase_ngram_range=(2, 4), stop_words='spanish', top_n=n_topics, use_maxsum=True, nr_candidates=20)
    # Agrupar comentarios por tema más relevante
    temas_dict = {}
    for idx, (frase, score) in enumerate(temas):
        temas_dict[frase] = {'score': float(score), 'ejemplos': []}
    # Asignar cada comentario a su tema más relevante
    for comentario in comentarios:
        tema_comentario = kw_model.extract_keywords(comentario, keyphrase_ngram_range=(2, 4), stop_words='spanish', top_n=1)
        if tema_comentario:
            tema = tema_comentario[0][0]
            if tema in temas_dict and len(temas_dict[tema]['ejemplos']) < n_examples:
                temas_dict[tema]['ejemplos'].append(comentario)
    # Exportar a JSON
    if export_json_dir:
        os.makedirs(export_json_dir, exist_ok=True)
        import json
        with open(os.path.join(export_json_dir, 'temas_comentarios_pregunta5.json'), 'w', encoding='utf-8') as f:
            json.dump(temas_dict, f, ensure_ascii=False, indent=2)
    print("\nTemas principales extraídos de comentarios:")
    for tema, info in temas_dict.items():
        print(f"- {tema} (score: {info['score']:.2f})")
        for ej in info['ejemplos']:
            print(f"  Ejemplo: {ej}")
