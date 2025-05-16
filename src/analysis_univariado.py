# analysis_univariado.py
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from src.exporter import export_table_to_excel, add_figure_for_pdf, save_plot_to_png
import os

def analisis_univariado(df, var_categorica, export_excel_path=None, export_pdf_path=None, export_png_dir=None):
    abs_freq = df[var_categorica].value_counts()
    rel_freq = df[var_categorica].value_counts(normalize=True) * 100
    tabla = pd.DataFrame({'Frec. Absoluta': abs_freq, 'Frec. Relativa (%)': rel_freq.round(2)})
    print(f"\n{'='*60}")
    print(f"ANÁLISIS UNIVARIADO DE: {var_categorica.upper()}")
    print(f"{'='*60}")
    print(tabla.to_string())
    print(f"\nResumen:")
    print(f"- Categoría más frecuente: {abs_freq.idxmax()} ({rel_freq.max():.2f}%)")
    print(f"- Categoría menos frecuente: {abs_freq.idxmin()} ({rel_freq.min():.2f}%)")
    print(f"- Total de categorías: {len(abs_freq)}")
    plt.figure(figsize=(10, 6))
    bars = sns.barplot(x=rel_freq.index, y=rel_freq.values, hue=rel_freq.index, palette="viridis", legend=False)
    plt.title(f'Distribución Relativa de {var_categorica}', fontsize=16, fontweight='bold')
    plt.ylabel('Frecuencia Relativa (%)', fontsize=12)
    plt.xlabel(var_categorica, fontsize=12)
    plt.xticks(rotation=45, ha='right')
    for i, bar in enumerate(bars.patches):
        plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5, f'{bar.get_height():.1f}%',
                 ha='center', va='bottom', fontsize=10, color='black', fontweight='bold')
    plt.tight_layout()
    fig = plt.gcf()
    if export_pdf_path:
        add_figure_for_pdf(fig)
    if export_excel_path:
        export_table_to_excel(tabla, var_categorica, export_excel_path)
    if export_png_dir:
        os.makedirs(export_png_dir, exist_ok=True)
        save_plot_to_png(fig, os.path.join(export_png_dir, f"univariado_{var_categorica}.png"))
    plt.show()
