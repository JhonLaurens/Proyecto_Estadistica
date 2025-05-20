# analysis_bivariado.py
"""
Módulo para análisis bivariado de variables en encuestas de satisfacción.

Este módulo proporciona funciones para analizar relaciones entre pares de variables,
generando visualizaciones y estadísticas descriptivas. Soporta exportación de resultados
en múltiples formatos como Excel, PDF, PNG y JSON para visualización web con Plotly.

Autor: Equipo de Estadística Coltefinanciera
Fecha: Mayo 2025
Versión: 1.2
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
import json
import os
from src.exporter import export_table_to_excel, add_figure_for_pdf, save_plot_to_png

def bivariado_cat_cat(df, var1, var2, top_n=5, export_excel_path=None, export_pdf_path=None, export_png_dir=None, export_json_dir=None):
    """
    Realiza análisis bivariado entre dos variables categóricas y genera visualizaciones.
    
    Esta función crea tablas de contingencia y gráficos de barras para analizar
    la relación entre dos variables categóricas. También exporta los resultados
    en diversos formatos según los parámetros especificados.
    
    Args:
        df (pandas.DataFrame): DataFrame con los datos a analizar
        var1 (str): Nombre de la primera variable categórica (eje X)
        var2 (str): Nombre de la segunda variable categórica (colores/series)
        top_n (int, opcional): Número máximo de categorías a mostrar. Por defecto 5.
        export_excel_path (str, opcional): Ruta donde exportar resultados en Excel
        export_pdf_path (str, opcional): Ruta donde exportar gráficos en PDF
        export_png_dir (str, opcional): Directorio donde guardar imágenes PNG
        export_json_dir (str, opcional): Directorio donde guardar JSON para web
        
    Returns:
        pandas.DataFrame: Tabla de contingencia normalizada por filas
        
    Ejemplo:
        >>> bivariado_cat_cat(encuestas_df, 'CIUDAD_AGENCIA', 'SEGMENTO', 
                             export_json_dir='data')
    """
    # Filtrar solo las top_n categorías más frecuentes de var1
    top_vals = df[var1].value_counts().nlargest(top_n).index
    df_top = df[df[var1].isin(top_vals)]
    
    # Crear tabla de contingencia normalizada por filas
    cross_tab = pd.crosstab(df_top[var1], df_top[var2], normalize='index') * 100
    
    # Imprimir información en consola
    print(f"\n{'='*60}")
    print(f"ANÁLISIS BIVARIADO: {var1.upper()} vs {var2.upper()}")
    print(f"{'='*60}")
    print(cross_tab.round(1).to_string())
    print(f"\nResumen:")
    for idx in cross_tab.index:
        top_cat = cross_tab.loc[idx].idxmax()
        top_val = cross_tab.loc[idx].max()
        print(f"- En {idx}: {top_cat} es el más frecuente ({top_val:.1f}%)")
        
    # Crear visualización con Matplotlib
    ax = cross_tab.plot(kind='bar', stacked=False, figsize=(14, 8), colormap='Spectral')
    plt.title(f'Distribución de {var2} por {var1} (Top {top_n})', fontsize=16, fontweight='bold')
    plt.ylabel('Porcentaje dentro de ' + var1, fontsize=12)
    plt.xlabel(var1, fontsize=12)    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    fig = plt.gcf()
    
    # Exportar a diferentes formatos si se especifican rutas
    if export_pdf_path:
        add_figure_for_pdf(fig)
        
    if export_excel_path:
        export_table_to_excel(cross_tab, f'{var1}_vs_{var2}', export_excel_path)
        
    if export_png_dir:
        os.makedirs(export_png_dir, exist_ok=True)
        save_plot_to_png(fig, os.path.join(export_png_dir, f"bivariado_{var1}_vs_{var2}.png"))
        
    if export_json_dir:
        os.makedirs(export_json_dir, exist_ok=True)
        
        # Exportar tabla de datos como JSON estándar
        cross_tab.round(2).to_json(
            os.path.join(export_json_dir, f"tabla_{var1}_vs_{var2}.json"),
            force_ascii=False, indent=2
        )
        
        # Generar JSON compatible con Plotly para visualización web
        plotly_data = []
        for column in cross_tab.columns:
            plotly_data.append({
                "x": cross_tab.index.tolist(),
                "y": cross_tab[column].tolist(),
                "type": "bar",
                "name": str(column)
            })
        
        # Guardar JSON para Plotly
        with open(os.path.join(export_json_dir, f"plotly_bivariado_{var1}_vs_{var2}.json"), 'w', encoding='utf-8') as f:
            json.dump({
                "data": plotly_data,
                "layout": {
                    "title": f"Distribución de {var2} por {var1}",
                    "xaxis": {"title": var1},
                    "yaxis": {"title": "Porcentaje (%)"},
                    "barmode": "group"
                }
            }, f, ensure_ascii=False, indent=2)
    # plt.show()  # Eliminado para evitar abrir ventana al correr main.py
    plt.close(fig)


def bivariado_cat_num(df, var_cat, var_num, top_n=5, export_excel_path=None, export_pdf_path=None, export_png_dir=None, export_json_dir=None):
    """
    Realiza análisis bivariado entre una variable categórica y una numérica.
    
    Esta función genera box plots y estadísticas descriptivas para analizar
    la distribución de una variable numérica a través de las categorías de una
    variable categórica. Exporta los resultados en diversos formatos.
    
    Args:
        df (pandas.DataFrame): DataFrame con los datos a analizar
        var_cat (str): Nombre de la variable categórica (eje X)
        var_num (str): Nombre de la variable numérica (eje Y)
        top_n (int, opcional): Número máximo de categorías a mostrar. Por defecto 5.
        export_excel_path (str, opcional): Ruta donde exportar resultados en Excel
        export_pdf_path (str, opcional): Ruta donde exportar gráficos en PDF
        export_png_dir (str, opcional): Directorio donde guardar imágenes PNG
        export_json_dir (str, opcional): Directorio donde guardar JSON para web
        
    Returns:
        pandas.DataFrame: Tabla resumen con estadísticas por categoría
        
    Ejemplo:
        >>> bivariado_cat_num(encuestas_df, 'SEGMENTO', 'PREGUNTA_1', 
                             export_json_dir='data')
    """
    # Filtrar solo las top_n categorías más frecuentes de var_cat
    top_vals = df[var_cat].value_counts().nlargest(top_n).index
    df_top = df[df[var_cat].isin(top_vals)]
    
    # Imprimir información en consola
    print(f"\n{'='*60}")
    print(f"ANÁLISIS BIVARIADO: {var_cat.upper()} vs {var_num.upper()}")
    print(f"{'='*60}")
    
    # Generar boxplot con seaborn
    sns.boxplot(data=df_top, x=var_cat, y=var_num, palette="coolwarm")
    plt.title(f'{var_num} por {var_cat} (Top {top_n})', fontsize=16, fontweight='bold')
    plt.xlabel(var_cat, fontsize=12)
    plt.ylabel(var_num, fontsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    fig = plt.gcf()
    
    # Exportar a diferentes formatos
    if export_pdf_path:
        add_figure_for_pdf(fig)
        
    if export_png_dir:
        os.makedirs(export_png_dir, exist_ok=True)
        save_plot_to_png(fig, os.path.join(export_png_dir, f"bivariado_{var_cat}_vs_{var_num}.png"))
        
    # Generar estadísticas descriptivas por grupo
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
        export_table_to_excel(summary, f'{var_cat}_vs_{var_num}', export_excel_path)    # Export as Plotly-compatible JSON for web visualization
    if export_json_dir:
        os.makedirs(export_json_dir, exist_ok=True)
        
        # Standard JSON for table data
        summary.round(2).to_json(
            os.path.join(export_json_dir, f"tabla_{var_cat}_vs_{var_num}.json"),
            force_ascii=False, indent=2
        )
        
        # Calculate box plot statistics for Plotly
        boxplot_data = []
        for category in df_top[var_cat].unique():
            category_data = df_top[df_top[var_cat] == category][var_num].dropna()
            if len(category_data) > 0:
                boxplot_data.append({
                    "type": "box",
                    "y": category_data.tolist(),
                    "name": str(category),
                    "boxpoints": "suspectedoutliers"
                })
        
        # Plotly-compatible JSON for interactive web charts
        with open(os.path.join(export_json_dir, f"plotly_bivariado_{var_cat}_vs_{var_num}.json"), 'w', encoding='utf-8') as f:
            json.dump({
                "data": boxplot_data,
                "layout": {
                    "title": f"{var_num} por {var_cat}",
                    "xaxis": {"title": var_cat},
                    "yaxis": {"title": var_num},
                    "boxmode": "group"
                }
            }, f, ensure_ascii=False, indent=2)
    print(f"\nCategoría con mayor promedio: {summary['Promedio'].idxmax()} ({summary['Promedio'].max():.2f})")
    print(f"Categoría con menor promedio: {summary['Promedio'].idxmin()} ({summary['Promedio'].min():.2f})")
    # plt.show()  # Eliminado para evitar abrir ventana al correr main.py
    plt.close(fig)
