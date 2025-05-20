# main.py
from src.data_loader import load_data
from src.data_cleaner import clean_data
from src.analysis_univariado import analisis_univariado
from src.analysis_bivariado import bivariado_cat_cat, bivariado_cat_num
from src.inferencia import comparar_grupos
from src.visualizations import analisis_texto_pregunta5
from src.exporter import export_all_figures_to_pdf
import shutil
import glob
import webbrowser
import os
import subprocess
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Ruta de datos
DATA_PATH = 'data/Base encuesta de satisfacción.csv'
EXPORT_EXCEL = 'resultados_analisis.xlsx'
EXPORT_PDF = 'graficos_analisis.pdf'
EXPORT_PNG_DIR = 'graficos/'
EXPORT_JSON_DIR = 'data/'

# Antes de cualquier análisis, limpiar los gráficos y resultados previos
def limpiar_graficos_y_resultados():
    # Borrar todos los PNG de la carpeta graficos
    for f in glob.glob('graficos/*.png'):
        try:
            os.remove(f)
        except Exception as e:
            print(f"[ADVERTENCIA] No se pudo borrar {f}: {e}")
    # Borrar todos los JSON de la carpeta data que sean tablas/resultados
    for f in glob.glob('data/tabla_*.json') + glob.glob('data/inferencia_*.json') + glob.glob('data/tabla_wordcloud_*.json'):
        try:
            os.remove(f)
        except Exception as e:
            print(f"[ADVERTENCIA] No se pudo borrar {f}: {e}")

# Llamar la función de limpieza al inicio del main
limpiar_graficos_y_resultados()

# 1. Carga y limpieza
df = load_data(DATA_PATH)
df = clean_data(df)

# 2. Análisis univariado (ampliado y robusto, SIEMPRE TODO, no top 5)
to_analyze = [
    'CIUDAD_AGENCIA', 'TIPO_EJECUTIVO', 'SEGMENTO',
    'GENERO', 'ESTRATO', 'AGENCIA_EJECUTIVO', 'EDAD',
    'PREGUNTA_1', 'PREGUNTA_2', 'PREGUNTA_3', 'PREGUNTA_4'
]
for var in to_analyze:
    if var in df.columns:
        try:
            analisis_univariado(
                df, var,
                export_excel_path=EXPORT_EXCEL,
                export_pdf_path=EXPORT_PDF,
                export_png_dir=EXPORT_PNG_DIR,
                export_json_dir=EXPORT_JSON_DIR
            )
            plt.close('all')  # Cerrar figura tras guardar
        except Exception as e:
            print(f"[ADVERTENCIA] No se pudo analizar {var}: {e}")

# 3. Análisis bivariado categórica-categórica (todas las combinaciones relevantes, no top 5)
bivariados_cat_cat = [
    ('CIUDAD_AGENCIA', 'TIPO_EJECUTIVO'),
    ('CIUDAD_AGENCIA', 'SEGMENTO'),
    ('TIPO_EJECUTIVO', 'SEGMENTO'),
    ('GENERO', 'CIUDAD_AGENCIA'),
    ('GENERO', 'SEGMENTO'),
    ('ESTRATO', 'SEGMENTO'),
    ('GENERO', 'TIPO_EJECUTIVO'),
    ('AGENCIA_EJECUTIVO', 'SEGMENTO')
]
for var1, var2 in bivariados_cat_cat:
    if var1 in df.columns and var2 in df.columns:
        try:
            bivariado_cat_cat(
                df, var1, var2, top_n=None,  # top_n=None para todo
                export_excel_path=EXPORT_EXCEL,
                export_pdf_path=EXPORT_PDF,
                export_png_dir=EXPORT_PNG_DIR,
                export_json_dir=EXPORT_JSON_DIR
            )
            plt.close('all')
        except Exception as e:
            print(f"[ADVERTENCIA] No se pudo analizar bivariado {var1} vs {var2}: {e}")

# 4. Análisis bivariado categórica-numérica (todas las combinaciones relevantes, no top 5)
bivariados_cat_num = [
    ('CIUDAD_AGENCIA', 'PREGUNTA_1'),
    ('TIPO_EJECUTIVO', 'PREGUNTA_1'),
    ('SEGMENTO', 'PREGUNTA_1'),
    ('GENERO', 'PREGUNTA_1'),
    ('ESTRATO', 'PREGUNTA_1'),
    ('AGENCIA_EJECUTIVO', 'PREGUNTA_1')
]
for var_cat, var_num in bivariados_cat_num:
    if var_cat in df.columns and var_num in df.columns:
        try:
            bivariado_cat_num(
                df, var_cat, var_num, top_n=None,
                export_excel_path=EXPORT_EXCEL,
                export_pdf_path=EXPORT_PDF,
                export_png_dir=EXPORT_PNG_DIR,
                export_json_dir=EXPORT_JSON_DIR
            )
            plt.close('all')
        except Exception as e:
            print(f"[ADVERTENCIA] No se pudo analizar bivariado {var_cat} vs {var_num}: {e}")

# 5. Inferencia: comparación de satisfacción entre segmentos (robusto, con gráfica normalidad y boxplot)
if 'SEGMENTO' in df.columns and 'PREGUNTA_1' in df.columns:
    try:
        comparar_grupos(
            df, 'SEGMENTO', 'PREGUNTA_1', 'Personas', 'Empresas',
            export_excel_path=EXPORT_EXCEL,
            export_pdf_path=EXPORT_PDF,
            export_png_dir=EXPORT_PNG_DIR,
            export_json_dir=EXPORT_JSON_DIR
        )
        plt.close('all')
    except Exception as e:
        print(f"[ADVERTENCIA] No se pudo realizar inferencia SEGMENTO vs PREGUNTA_1: {e}")

# 6. Análisis de texto libre en comentarios
try:
    analisis_texto_pregunta5(
        df,
        export_excel_path=EXPORT_EXCEL,
        export_pdf_path=EXPORT_PDF,
        export_png_dir=EXPORT_PNG_DIR,
        export_json_dir=EXPORT_JSON_DIR
    )
    plt.close('all')
except Exception as e:
    print(f"[ADVERTENCIA] No se pudo analizar comentarios: {e}")

# 7. Generar dato para visualización de Plotly en coltefinanciera_charts_init.js
print("\n" + "="*60)
print("GENERANDO DATOS ADICIONALES PARA VISUALIZACIÓN INTERACTIVA CON PLOTLY")
print("="*60)

# Para cada pregunta, crear objeto JSON con distribución de frecuencias
try:
    for pregunta in ['PREGUNTA_1', 'PREGUNTA_2', 'PREGUNTA_3', 'PREGUNTA_4']:
        if pregunta in df.columns:
            # Crear DataFrame con distribución de frecuencias
            abs_freq = df[pregunta].value_counts().sort_index()
            rel_freq = df[pregunta].value_counts(normalize=True).sort_index() * 100
            tabla = pd.DataFrame({'Frec. Absoluta': abs_freq, 'Frec. Relativa (%)': rel_freq.round(2)})
            tabla.reset_index().rename(columns={'index': pregunta}).to_json(
                os.path.join(EXPORT_JSON_DIR, f"tabla_{pregunta}.json"),
                orient='records', force_ascii=False, indent=2
            )
            print(f"Generado JSON para {pregunta}")
    
    # Crear un archivo JSON consolidado para simplificar la carga en la interfaz web
    import json
    datos_consolidados = {
        "informacion_general": {
            "fecha_generacion": pd.Timestamp.now().strftime("%Y-%m-%d"),
            "total_encuestas": len(df),
            "periodo_estudio": "01/01/2025 - 30/04/2025"  # Puedes calcular esto desde tus datos reales
        },
        "estadisticas_preguntas": {}
    }
    
    # Añadir estadísticas de cada pregunta
    for pregunta in ['PREGUNTA_1', 'PREGUNTA_2', 'PREGUNTA_3', 'PREGUNTA_4']:
        if pregunta in df.columns:
            datos_consolidados["estadisticas_preguntas"][pregunta] = {
                "media": float(df[pregunta].mean()),
                "mediana": float(df[pregunta].median()),
                "desviacion": float(df[pregunta].std()),
                "min": float(df[pregunta].min()),
                "max": float(df[pregunta].max())
            }
    
    # Guardar el archivo consolidado
    with open(os.path.join(EXPORT_JSON_DIR, "encuesta_satisfaccion.json"), 'w', encoding='utf-8') as f:
        json.dump(datos_consolidados, f, ensure_ascii=False, indent=2)
    
    print("Generado JSON consolidado de todos los datos")
    
except Exception as e:
    print(f"[ADVERTENCIA] Error al generar datos adicionales: {e}")

# Exportar todas las figuras acumuladas al PDF al final
export_all_figures_to_pdf(EXPORT_PDF)

# Cerrar todas las ventanas de matplotlib automáticamente (forzar cierre)
try:
    import matplotlib.pyplot as plt
    plt.close('all')
    import matplotlib
    matplotlib._pylab_helpers.Gcf.destroy_all_figs()
except Exception as e:
    print(f"[ADVERTENCIA] No se pudo cerrar todas las ventanas de matplotlib: {e}")

# Al final, abrir automáticamente el reporte web en el navegador local (servidor HTTP)
try:
    # Verificar que el archivo de inicialización de gráficos exista
    if not os.path.exists(os.path.join('static', 'coltefinanciera_charts_init.js')):
        print("[ADVERTENCIA] No se encuentra el archivo coltefinanciera_charts_init.js en la carpeta static.")
        print("Este archivo es necesario para la correcta visualización de los gráficos.")
    else:
        print("[INFO] Archivo de inicialización de gráficos encontrado correctamente.")
    
    # Iniciar un servidor HTTP si no está corriendo
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', 8000))
    sock.close()
    if result != 0:
        # No hay servidor, lo lanzo en background
        subprocess.Popen(['python', '-m', 'http.server', '8000'], cwd=os.path.dirname(__file__))
except Exception as e:
    print(f"[ADVERTENCIA] No se pudo iniciar el servidor HTTP: {e}")

import time
# Esperar un poco para que el server arranque
for _ in range(10):
    try:
        import urllib.request
        urllib.request.urlopen('http://localhost:8000/reporte_web_coltefinanciera.html', timeout=1)
        break
    except:
        time.sleep(0.5)

webbrowser.open('http://localhost:8000/reporte_web_coltefinanciera.html')
