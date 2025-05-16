# inferencia.py
import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
from src.exporter import export_table_to_excel, add_figure_for_pdf, save_plot_to_png
import os

def comparar_grupos(df, var_grupo, var_num, grupo1, grupo2, export_excel_path=None, export_pdf_path=None, export_png_dir=None):
    data1 = df[df[var_grupo] == grupo1][var_num].dropna()
    data2 = df[df[var_grupo] == grupo2][var_num].dropna()
    print(f"\n{'='*60}")
    print(f"INFERENCIA: Comparación de {var_num.upper()} entre {grupo1} y {grupo2}")
    print(f"{'='*60}")
    print(f"Tamaño muestra {grupo1}: {len(data1)} | {grupo2}: {len(data2)}")
    plt.figure(figsize=(10,6))
    sns.kdeplot(data1, label=grupo1, fill=True, alpha=.5)
    sns.kdeplot(data2, label=grupo2, fill=True, alpha=.5)
    plt.title(f'Densidad de {var_num} por grupo', fontsize=15, fontweight='bold')
    plt.xlabel(var_num)
    plt.ylabel('Densidad')
    plt.legend()
    plt.tight_layout()
    fig = plt.gcf()
    if export_pdf_path:
        add_figure_for_pdf(fig)
    if export_png_dir:
        os.makedirs(export_png_dir, exist_ok=True)
        save_plot_to_png(fig, os.path.join(export_png_dir, f"inferencia_{var_grupo}_{grupo1}_vs_{grupo2}.png"))
    plt.show()
    # Normalidad
    sh1 = stats.shapiro(data1)
    sh2 = stats.shapiro(data2)
    print(f"Shapiro-Wilk p-valor {grupo1}: {sh1.pvalue:.3f} | {grupo2}: {sh2.pvalue:.3f}")
    # Varianzas
    lev = stats.levene(data1, data2)
    print(f"Levene p-valor: {lev.pvalue:.3f}")
    # Prueba de medias
    if sh1.pvalue > 0.05 and sh2.pvalue > 0.05:
        ttest = stats.ttest_ind(data1, data2, equal_var=lev.pvalue > 0.05)
        print(f"t-test p-valor: {ttest.pvalue:.3f}")
        if ttest.pvalue < 0.05:
            print(f"→ Diferencia significativa de medias entre {grupo1} y {grupo2} (p < 0.05)")
        else:
            print(f"→ No hay diferencia significativa de medias (p >= 0.05)")
    else:
        mwu = stats.mannwhitneyu(data1, data2)
        print(f"Mann-Whitney U p-valor: {mwu.pvalue:.3f}")
        if mwu.pvalue < 0.05:
            print(f"→ Diferencia significativa de distribuciones entre {grupo1} y {grupo2} (p < 0.05)")
        else:
            print(f"→ No hay diferencia significativa de distribuciones (p >= 0.05)")
    resumen = pd.DataFrame({
        grupo1: [np.median(data1), np.mean(data1)],
        grupo2: [np.median(data2), np.mean(data2)]
    }, index=['Mediana', 'Promedio'])
    print(f"\nResumen de estadísticos centrales:")
    print(resumen.round(2).to_string())
    if export_excel_path:
        export_table_to_excel(resumen, f'{grupo1}_vs_{grupo2}_inferencia', export_excel_path)
