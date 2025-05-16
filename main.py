# main.py
from src.data_loader import load_data
from src.data_cleaner import clean_data
from src.analysis_univariado import analisis_univariado
from src.analysis_bivariado import bivariado_cat_cat, bivariado_cat_num
from src.inferencia import comparar_grupos
from src.visualizations import analisis_texto_pregunta5
from src.exporter import export_all_figures_to_pdf

# Ruta de datos
DATA_PATH = 'data/Base encuesta de satisfacción.csv'
EXPORT_EXCEL = 'resultados_analisis.xlsx'
EXPORT_PDF = 'graficos_analisis.pdf'
EXPORT_PNG_DIR = 'graficos/'

# 1. Carga y limpieza
df = load_data(DATA_PATH)
df = clean_data(df)

# 2. Análisis univariado (ampliado y robusto)
to_analyze = [
    'CIUDAD_AGENCIA', 'TIPO_EJECUTIVO', 'SEGMENTO',
    'GENERO', 'ESTRATO',
    'PREGUNTA_1', 'PREGUNTA_2', 'PREGUNTA_3', 'PREGUNTA_4'
]
if 'EDAD' in df.columns:
    to_analyze.append('EDAD')
for var in to_analyze:
    try:
        analisis_univariado(df, var, export_excel_path=EXPORT_EXCEL, export_pdf_path=EXPORT_PDF, export_png_dir=EXPORT_PNG_DIR)
    except Exception as e:
        print(f"[ADVERTENCIA] No se pudo analizar {var}: {e}")

# 3. Análisis bivariado categórica-categórica (todas las combinaciones relevantes)
bivariados_cat_cat = [
    ('CIUDAD_AGENCIA', 'TIPO_EJECUTIVO'),
    ('CIUDAD_AGENCIA', 'SEGMENTO'),
    ('TIPO_EJECUTIVO', 'SEGMENTO'),
    ('GENERO', 'CIUDAD_AGENCIA'),
    ('GENERO', 'SEGMENTO'),
    ('ESTRATO', 'SEGMENTO')
]
for var1, var2 in bivariados_cat_cat:
    if var1 in df.columns and var2 in df.columns:
        try:
            bivariado_cat_cat(df, var1, var2, export_excel_path=EXPORT_EXCEL, export_pdf_path=EXPORT_PDF, export_png_dir=EXPORT_PNG_DIR)
        except Exception as e:
            print(f"[ADVERTENCIA] No se pudo analizar bivariado {var1} vs {var2}: {e}")

# 4. Análisis bivariado categórica-numérica (todas las combinaciones relevantes)
bivariados_cat_num = [
    ('CIUDAD_AGENCIA', 'PREGUNTA_1'),
    ('TIPO_EJECUTIVO', 'PREGUNTA_1'),
    ('SEGMENTO', 'PREGUNTA_1'),
    ('GENERO', 'PREGUNTA_1'),
    ('ESTRATO', 'PREGUNTA_1')
]
for var_cat, var_num in bivariados_cat_num:
    if var_cat in df.columns and var_num in df.columns:
        try:
            bivariado_cat_num(df, var_cat, var_num, export_excel_path=EXPORT_EXCEL, export_pdf_path=EXPORT_PDF, export_png_dir=EXPORT_PNG_DIR)
        except Exception as e:
            print(f"[ADVERTENCIA] No se pudo analizar bivariado {var_cat} vs {var_num}: {e}")

# 5. Inferencia: comparación de satisfacción entre segmentos (robusto)
if 'SEGMENTO' in df.columns and 'PREGUNTA_1' in df.columns:
    try:
        comparar_grupos(df, 'SEGMENTO', 'PREGUNTA_1', 'Personas', 'Empresas', export_excel_path=EXPORT_EXCEL, export_pdf_path=EXPORT_PDF, export_png_dir=EXPORT_PNG_DIR)
    except Exception as e:
        print(f"[ADVERTENCIA] No se pudo realizar inferencia SEGMENTO vs PREGUNTA_1: {e}")

# 6. Análisis de texto libre en comentarios
try:
    analisis_texto_pregunta5(df, export_excel_path=EXPORT_EXCEL, export_pdf_path=EXPORT_PDF, export_png_dir=EXPORT_PNG_DIR)
except Exception as e:
    print(f"[ADVERTENCIA] No se pudo analizar comentarios: {e}")

# Exportar todas las figuras acumuladas al PDF al final
export_all_figures_to_pdf(EXPORT_PDF)
