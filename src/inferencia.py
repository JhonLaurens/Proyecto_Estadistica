# inferencia.py
import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
from src.exporter import export_table_to_excel, add_figure_for_pdf, save_plot_to_png
import os

def comparar_grupos(df, var_grupo, var_num, grupo1, grupo2, export_excel_path=None, export_pdf_path=None, export_png_dir=None, export_json_dir=None):
    """
    Compara dos grupos para una variable numérica, exporta resultados a JSON y gráficos.
    """
    data1 = df[df[var_grupo] == grupo1][var_num].dropna()
    data2 = df[df[var_grupo] == grupo2][var_num].dropna()
    if len(data1) == 0 or len(data2) == 0:
        print(f"No hay datos suficientes para comparar {grupo1} y {grupo2}.")
        return
    # Gráfico de densidad
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
    plt.close(fig)
    # Pruebas estadísticas
    sh1 = stats.shapiro(data1)
    sh2 = stats.shapiro(data2)
    lev = stats.levene(data1, data2)
    if sh1.pvalue > 0.05 and sh2.pvalue > 0.05:
        ttest = stats.ttest_ind(data1, data2, equal_var=lev.pvalue > 0.05)
        test_name = 't-test'
        pval = ttest.pvalue
        stat = ttest.statistic
    else:
        mwu = stats.mannwhitneyu(data1, data2)
        test_name = 'Mann-Whitney U'
        pval = mwu.pvalue
        stat = mwu.statistic
    # Intervalos de confianza
    ci1 = stats.t.interval(0.95, len(data1)-1, loc=np.mean(data1), scale=stats.sem(data1)) if len(data1) > 1 else (np.nan, np.nan)
    ci2 = stats.t.interval(0.95, len(data2)-1, loc=np.mean(data2), scale=stats.sem(data2)) if len(data2) > 1 else (np.nan, np.nan)
    # Resumen para exportar
    result = {
        'grupo1': grupo1,
        'grupo2': grupo2,
        'mediana1': float(np.median(data1)),
        'media1': float(np.mean(data1)),
        'ic_media1': [float(ci1[0]), float(ci1[1])],
        'mediana2': float(np.median(data2)),
        'media2': float(np.mean(data2)),
        'ic_media2': [float(ci2[0]), float(ci2[1])],
        'test': test_name,
        'estadistico': float(stat),
        'pvalor': float(pval),
        'n1': int(len(data1)),
        'n2': int(len(data2)),
        'shapiro_p1': float(sh1.pvalue),
        'shapiro_p2': float(sh2.pvalue),
        'levene_p': float(lev.pvalue)
    }
    if export_json_dir:
        os.makedirs(export_json_dir, exist_ok=True)
        import json
        with open(os.path.join(export_json_dir, f'inferencia_{var_grupo}_{grupo1}_vs_{grupo2}.json'), 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
    # Exportar resumen a Excel si se requiere
    resumen = pd.DataFrame({
        grupo1: [np.median(data1), np.mean(data1)],
        grupo2: [np.median(data2), np.mean(data2)]
    }, index=['Mediana', 'Promedio'])
    if export_excel_path:
        export_table_to_excel(resumen, f'{grupo1}_vs_{grupo2}_inferencia', export_excel_path)
