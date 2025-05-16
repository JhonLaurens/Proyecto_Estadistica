# analysis_bivariado.py
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from src.exporter import export_table_to_excel, add_figure_for_pdf, save_plot_to_png
import os

def bivariado_cat_cat(df, var1, var2, top_n=5, export_excel_path=None, export_pdf_path=None, export_png_dir=None):
    top_vals = df[var1].value_counts().nlargest(top_n).index
    df_top = df[df[var1].isin(top_vals)]
    cross_tab = pd.crosstab(df_top[var1], df_top[var2], normalize='index') * 100
    print(f"\n{'='*60}")
    print(f"ANÁLISIS BIVARIADO: {var1.upper()} vs {var2.upper()}")
    print(f"{'='*60}")
    print(cross_tab.round(1).to_string())
    print(f"\nResumen:")
    for idx in cross_tab.index:
        top_cat = cross_tab.loc[idx].idxmax()
        top_val = cross_tab.loc[idx].max()
        print(f"- En {idx}: {top_cat} es el más frecuente ({top_val:.1f}%)")
    ax = cross_tab.plot(kind='bar', stacked=False, figsize=(14, 8), colormap='Spectral')
    plt.title(f'Distribución de {var2} por {var1} (Top {top_n})', fontsize=16, fontweight='bold')
    plt.ylabel('Porcentaje dentro de ' + var1, fontsize=12)
    plt.xlabel(var1, fontsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    fig = plt.gcf()
    if export_pdf_path:
        add_figure_for_pdf(fig)
    if export_excel_path:
        export_table_to_excel(cross_tab, f'{var1}_vs_{var2}', export_excel_path)
    if export_png_dir:
        os.makedirs(export_png_dir, exist_ok=True)
        save_plot_to_png(fig, os.path.join(export_png_dir, f"bivariado_{var1}_vs_{var2}.png"))
    plt.show()


def bivariado_cat_num(df, var_cat, var_num, top_n=5, export_excel_path=None, export_pdf_path=None, export_png_dir=None):
    top_vals = df[var_cat].value_counts().nlargest(top_n).index
    df_top = df[df[var_cat].isin(top_vals)]
    print(f"\n{'='*60}")
    print(f"ANÁLISIS BIVARIADO: {var_cat.upper()} vs {var_num.upper()}")
    print(f"{'='*60}")
    sns.boxplot(data=df_top, x=var_cat, y=var_num, palette="coolwarm")
    plt.title(f'{var_num} por {var_cat} (Top {top_n})', fontsize=16, fontweight='bold')
    plt.xlabel(var_cat, fontsize=12)
    plt.ylabel(var_num, fontsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    fig = plt.gcf()
    if export_pdf_path:
        add_figure_for_pdf(fig)
    if export_png_dir:
        os.makedirs(export_png_dir, exist_ok=True)
        save_plot_to_png(fig, os.path.join(export_png_dir, f"bivariado_{var_cat}_vs_{var_num}.png"))
    summary = df.groupby(var_cat)[var_num].agg(
        cantidad='count',
        Minimo='min',
        Q1=lambda x: x.quantile(0.25),
        Mediana='median',
        Promedio='mean',
        Q3=lambda x: x.quantile(0.75),
        Maximo='max',
        Desviacion='std'
    ).sort_values(by='Promedio', ascending=False)
    print("\nResumen estadístico por categoría:")
    print(summary.round(2).to_string())
    if export_excel_path:
        export_table_to_excel(summary, f'{var_cat}_vs_{var_num}', export_excel_path)
    print(f"\nCategoría con mayor promedio: {summary['Promedio'].idxmax()} ({summary['Promedio'].max():.2f})")
    print(f"Categoría con menor promedio: {summary['Promedio'].idxmin()} ({summary['Promedio'].min():.2f})")
    plt.show()
