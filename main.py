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
import json
import sys
import time
import socket
import traceback
from datetime import datetime

# Configuración global
DATA_PATH = 'data/Base encuesta de satisfacción.csv'
EXPORT_EXCEL = 'resultados_analisis.xlsx'
EXPORT_PDF = 'graficos_analisis.pdf'
EXPORT_PNG_DIR = 'graficos/'
EXPORT_JSON_DIR = 'data/'
LOG_FILE = 'log_analisis.txt'

# Función para registrar en log
def log_mensaje(mensaje, tipo="INFO", archivo_log=LOG_FILE):
    """Registra un mensaje en el archivo de log con timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(archivo_log, 'a', encoding='utf-8') as f:
        f.write(f"[{timestamp}] [{tipo}] {mensaje}\n")
    
    # Imprimir en consola también, con colores según el tipo de mensaje
    if tipo == "ERROR":
        print(f"\033[91m[{timestamp}] [{tipo}] {mensaje}\033[0m")  # Rojo
    elif tipo == "ADVERTENCIA":
        print(f"\033[93m[{timestamp}] [{tipo}] {mensaje}\033[0m")  # Amarillo
    elif tipo == "ÉXITO":
        print(f"\033[92m[{timestamp}] [{tipo}] {mensaje}\033[0m")  # Verde
    else:
        print(f"[{timestamp}] [{tipo}] {mensaje}")

# Función para mostrar progreso
def mostrar_progreso(mensaje, completado, total):
    """Muestra una barra de progreso en la consola."""
    porcentaje = int(completado * 100 / total)
    barra_longitud = 50
    barra = "█" * int(barra_longitud * completado / total)
    espacio = " " * (barra_longitud - len(barra))
    
    # Usar carriage return para sobrescribir la línea
    sys.stdout.write(f"\r{mensaje}: |{barra}{espacio}| {porcentaje}% ({completado}/{total})")
    sys.stdout.flush()
    
    # Añadir nueva línea si está completo
    if completado == total:
        print()

# Antes de cualquier análisis, limpiar los gráficos y resultados previos
def limpiar_graficos_y_resultados():
    """Limpia archivos de resultados previos de análisis."""
    log_mensaje("Iniciando limpieza de archivos de resultados previos")
    try:
        # Borrar todos los PNG de la carpeta graficos
        eliminados = 0
        for f in glob.glob('graficos/*.png'):
            try:
                os.remove(f)
                eliminados += 1
            except Exception as e:
                log_mensaje(f"No se pudo borrar {f}: {str(e)}", "ADVERTENCIA")
        log_mensaje(f"Se eliminaron {eliminados} archivos PNG de la carpeta 'graficos/'", "INFO")
        
        # Borrar todos los JSON de la carpeta data que sean tablas/resultados
        eliminados = 0
        json_patterns = ['data/tabla_*.json', 'data/inferencia_*.json', 'data/tabla_wordcloud_*.json', 'data/estadisticas_*.json', 'data/plotly_*.json']
        for pattern in json_patterns:
            for f in glob.glob(pattern):
                try:
                    os.remove(f)
                    eliminados += 1
                except Exception as e:
                    log_mensaje(f"No se pudo borrar {f}: {str(e)}", "ADVERTENCIA")
        log_mensaje(f"Se eliminaron {eliminados} archivos JSON de la carpeta 'data/'", "INFO")
        
        # Inicializar archivo de log
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{timestamp}] [INFO] Iniciando análisis de satisfacción Coltefinanciera\n")
            
        log_mensaje("Limpieza de archivos previos completada", "ÉXITO")
    except Exception as e:
        log_mensaje(f"Error durante la limpieza de archivos: {str(e)}", "ERROR")
        traceback.print_exc()

# Llamar la función de limpieza al inicio del main
limpiar_graficos_y_resultados()

try:
    # 1. Carga y limpieza de datos
    log_mensaje("FASE 1: CARGA Y LIMPIEZA DE DATOS", "INFO")
    
    log_mensaje(f"Cargando datos desde {DATA_PATH}", "INFO")
    try:
        df = load_data(DATA_PATH)
        log_mensaje(f"Datos cargados exitosamente. {len(df)} registros encontrados", "ÉXITO")
    except Exception as e:
        log_mensaje(f"Error al cargar datos: {str(e)}", "ERROR")
        traceback.print_exc()
        sys.exit(1)
    
    log_mensaje("Limpiando y preparando datos", "INFO")
    try:
        df = clean_data(df)
        log_mensaje(f"Limpieza de datos completada. {len(df)} registros válidos después de limpieza", "ÉXITO")
    except Exception as e:
        log_mensaje(f"Error al limpiar datos: {str(e)}", "ERROR")
        traceback.print_exc()
        sys.exit(1)
    
    # 2. Análisis univariado
    log_mensaje("\nFASE 2: ANÁLISIS UNIVARIADO", "INFO")
    
    to_analyze = [
        'CIUDAD_AGENCIA', 'TIPO_EJECUTIVO', 'SEGMENTO',
        'GENERO', 'ESTRATO', 'AGENCIA_EJECUTIVO', 'EDAD',
        'PREGUNTA_1', 'PREGUNTA_2', 'PREGUNTA_3', 'PREGUNTA_4'
    ]
    
    # Filtrar variables que existen en el dataframe
    variables_existentes = [var for var in to_analyze if var in df.columns]
    if len(variables_existentes) < len(to_analyze):
        variables_faltantes = set(to_analyze) - set(variables_existentes)
        log_mensaje(f"Advertencia: No se encontraron estas variables en los datos: {', '.join(variables_faltantes)}", "ADVERTENCIA")
    
    log_mensaje(f"Realizando análisis univariado para {len(variables_existentes)} variables", "INFO")
    
    # Análisis univariado con barra de progreso
    for i, var in enumerate(variables_existentes):
        mostrar_progreso("Análisis univariado", i, len(variables_existentes))
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
            log_mensaje(f"Error al analizar {var}: {str(e)}", "ERROR")
            traceback.print_exc()
    
    mostrar_progreso("Análisis univariado", len(variables_existentes), len(variables_existentes))
    log_mensaje("Análisis univariado completado", "ÉXITO")
    
    # 3. Análisis bivariado categórica-categórica
    log_mensaje("\nFASE 3: ANÁLISIS BIVARIADO CATEGÓRICA-CATEGÓRICA", "INFO")
    
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
    
    # Filtrar análisis bivariados válidos
    analisis_validos = []
    for var1, var2 in bivariados_cat_cat:
        if var1 in df.columns and var2 in df.columns:
            analisis_validos.append((var1, var2))
        else:
            log_mensaje(f"Advertencia: No se puede realizar análisis bivariado {var1} vs {var2}. Una o ambas variables no existen", "ADVERTENCIA")
    
    log_mensaje(f"Realizando {len(analisis_validos)} análisis bivariados categórica-categórica", "INFO")
    
    # Análisis bivariado cat-cat con barra de progreso
    for i, (var1, var2) in enumerate(analisis_validos):
        mostrar_progreso("Análisis bivariado cat-cat", i, len(analisis_validos))
        try:
            bivariado_cat_cat(
                df, var1, var2, top_n=None,  # top_n=None para todo
                export_excel_path=EXPORT_EXCEL,
                export_pdf_path=EXPORT_PDF,
                export_png_dir=EXPORT_PNG_DIR,
                export_json_dir=EXPORT_JSON_DIR
            )
            plt.close('all')
            log_mensaje(f"Análisis bivariado {var1} vs {var2} completado", "INFO")
        except Exception as e:
            log_mensaje(f"Error en análisis bivariado {var1} vs {var2}: {str(e)}", "ERROR")
            # Mostrar traceback para mejor diagnóstico
            traceback.print_exc()
    
    mostrar_progreso("Análisis bivariado cat-cat", len(analisis_validos), len(analisis_validos))
    log_mensaje("Análisis bivariado categórica-categórica completado", "ÉXITO")
    
    # 4. Análisis bivariado categórica-numérica
    log_mensaje("\nFASE 4: ANÁLISIS BIVARIADO CATEGÓRICA-NUMÉRICA", "INFO")
    
    bivariados_cat_num = [
        ('CIUDAD_AGENCIA', 'PREGUNTA_1'),
        ('TIPO_EJECUTIVO', 'PREGUNTA_1'),
        ('SEGMENTO', 'PREGUNTA_1'),
        ('GENERO', 'PREGUNTA_1'),
        ('ESTRATO', 'PREGUNTA_1'),
        ('AGENCIA_EJECUTIVO', 'PREGUNTA_1')
    ]
    
    # Filtrar análisis bivariados válidos
    analisis_validos = []
    for var_cat, var_num in bivariados_cat_num:
        if var_cat in df.columns and var_num in df.columns:
            analisis_validos.append((var_cat, var_num))
        else:
            log_mensaje(f"Advertencia: No se puede realizar análisis bivariado {var_cat} vs {var_num}. Una o ambas variables no existen", "ADVERTENCIA")
    
    log_mensaje(f"Realizando {len(analisis_validos)} análisis bivariados categórica-numérica", "INFO")
    
    # Análisis bivariado cat-num con barra de progreso
    for i, (var_cat, var_num) in enumerate(analisis_validos):
        mostrar_progreso("Análisis bivariado cat-num", i, len(analisis_validos))
        try:
            bivariado_cat_num(
                df, var_cat, var_num, top_n=None,
                export_excel_path=EXPORT_EXCEL,
                export_pdf_path=EXPORT_PDF,
                export_png_dir=EXPORT_PNG_DIR,
                export_json_dir=EXPORT_JSON_DIR
            )
            plt.close('all')
            log_mensaje(f"Análisis bivariado {var_cat} vs {var_num} completado", "INFO")
        except Exception as e:
            log_mensaje(f"Error en análisis bivariado {var_cat} vs {var_num}: {str(e)}", "ERROR")
            traceback.print_exc()
    
    mostrar_progreso("Análisis bivariado cat-num", len(analisis_validos), len(analisis_validos))
    log_mensaje("Análisis bivariado categórica-numérica completado", "ÉXITO")
    
    # 5. Inferencia: comparación de satisfacción entre segmentos
    log_mensaje("\nFASE 5: INFERENCIA ESTADÍSTICA", "INFO")
    
    if 'SEGMENTO' in df.columns and 'PREGUNTA_1' in df.columns:
        log_mensaje("Realizando comparación estadística entre segmentos de clientes", "INFO")
        try:
            comparar_grupos(
                df, 'SEGMENTO', 'PREGUNTA_1', 'Personas', 'Empresas',
                export_excel_path=EXPORT_EXCEL,
                export_pdf_path=EXPORT_PDF,
                export_png_dir=EXPORT_PNG_DIR,
                export_json_dir=EXPORT_JSON_DIR
            )
            plt.close('all')
            log_mensaje("Análisis inferencial completado exitosamente", "ÉXITO")
        except Exception as e:
            log_mensaje(f"Error en análisis inferencial SEGMENTO vs PREGUNTA_1: {str(e)}", "ERROR")
            traceback.print_exc()
    else:
        log_mensaje("No se puede realizar análisis inferencial: variables SEGMENTO o PREGUNTA_1 no disponibles", "ADVERTENCIA")
    
    # 6. Análisis de texto libre en comentarios
    log_mensaje("\nFASE 6: ANÁLISIS DE TEXTO LIBRE", "INFO")
    
    try:
        log_mensaje("Realizando análisis de texto libre en comentarios", "INFO")
        analisis_texto_pregunta5(
            df,
            export_excel_path=EXPORT_EXCEL,
            export_pdf_path=EXPORT_PDF,
            export_png_dir=EXPORT_PNG_DIR,
            export_json_dir=EXPORT_JSON_DIR
        )
        plt.close('all')
        log_mensaje("Análisis de texto completado exitosamente", "ÉXITO")
    except Exception as e:
        log_mensaje(f"Error al analizar comentarios: {str(e)}", "ERROR")
        traceback.print_exc()
    
    # 7. Generar datos para visualización con Plotly
    log_mensaje("\nFASE 7: GENERACIÓN DE DATOS PARA VISUALIZACIÓN INTERACTIVA", "INFO")
    
    try:
        # Para cada pregunta, crear objeto JSON con distribución de frecuencias
        preguntas = ['PREGUNTA_1', 'PREGUNTA_2', 'PREGUNTA_3', 'PREGUNTA_4']
        preguntas_disponibles = [p for p in preguntas if p in df.columns]
        
        for i, pregunta in enumerate(preguntas_disponibles):
            mostrar_progreso("Generando JSON para preguntas", i, len(preguntas_disponibles))
            # Crear DataFrame con distribución de frecuencias
            abs_freq = df[pregunta].value_counts().sort_index()
            rel_freq = df[pregunta].value_counts(normalize=True).sort_index() * 100
            tabla = pd.DataFrame({'Frec. Absoluta': abs_freq, 'Frec. Relativa (%)': rel_freq.round(2)})
            tabla.reset_index().rename(columns={'index': pregunta}).to_json(
                os.path.join(EXPORT_JSON_DIR, f"tabla_{pregunta}.json"),
                orient='records', force_ascii=False, indent=2
            )
        
        mostrar_progreso("Generando JSON para preguntas", len(preguntas_disponibles), len(preguntas_disponibles))
        log_mensaje("JSON de distribución de frecuencias generados", "INFO")
        
        # Crear un archivo JSON consolidado para simplificar la carga en la interfaz web
        log_mensaje("Generando archivo consolidado de estadísticas", "INFO")
        datos_consolidados = {
            "informacion_general": {
                "fecha_generacion": pd.Timestamp.now().strftime("%Y-%m-%d"),
                "total_encuestas": len(df),
                "periodo_estudio": "01/01/2025 - 30/04/2025"  # Puedes calcular esto desde tus datos reales
            },
            "estadisticas_preguntas": {}
        }
        
        # Añadir estadísticas de cada pregunta
        for pregunta in preguntas_disponibles:
            datos_consolidados["estadisticas_preguntas"][pregunta] = {
                "media": float(df[pregunta].mean()),
                "mediana": float(df[pregunta].median()),
                "desviacion": float(df[pregunta].std()),
                "min": float(df[pregunta].min()),
                "max": float(df[pregunta].max()),
                "n_validos": int(df[pregunta].count()),
                "n_faltantes": int(df[pregunta].isna().sum())
            }
        
        # Guardar el archivo consolidado
        with open(os.path.join(EXPORT_JSON_DIR, "encuesta_satisfaccion.json"), 'w', encoding='utf-8') as f:
            json.dump(datos_consolidados, f, ensure_ascii=False, indent=2)
        
        log_mensaje("Archivo JSON consolidado generado exitosamente", "ÉXITO")
        
    except Exception as e:
        log_mensaje(f"Error al generar datos adicionales: {str(e)}", "ERROR")
        traceback.print_exc()
    
    # Exportar todas las figuras acumuladas al PDF
    log_mensaje("\nFASE 8: EXPORTACIÓN FINAL DE RESULTADOS", "INFO")
    try:
        log_mensaje(f"Exportando todas las figuras al PDF: {EXPORT_PDF}", "INFO")
        export_all_figures_to_pdf(EXPORT_PDF)
        log_mensaje(f"PDF generado exitosamente: {EXPORT_PDF}", "ÉXITO")
    except Exception as e:
        log_mensaje(f"Error al generar PDF: {str(e)}", "ERROR")
        traceback.print_exc()
    
    # Cerrar todas las ventanas de matplotlib automáticamente (forzar cierre)
    try:
        plt.close('all')
        
        # Método más robusto para cerrar figuras
        try:
            # Para versiones más nuevas
            import matplotlib
            if hasattr(matplotlib._pylab_helpers.Gcf, 'destroy_all_figs'):
                matplotlib._pylab_helpers.Gcf.destroy_all_figs()
            # Para versiones más antiguas
            elif hasattr(matplotlib._pylab_helpers.Gcf, 'figs'):
                for manager in list(matplotlib._pylab_helpers.Gcf.figs.values()):
                    manager.destroy()
        except Exception:
            pass  # Si falla, seguimos adelante
    except Exception as e:
        log_mensaje(f"Error al cerrar ventanas de matplotlib: {str(e)}", "ADVERTENCIA")
    
    log_mensaje("\nGENERANDO ARCHIVOS JSON PARA VISUALIZACIONES INTERACTIVAS", "INFO")
    
    # Importar y ejecutar la generación de archivos JSON de Plotly
    try:
        # Importar funciones de generate_plotly_json.py
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from generate_plotly_json import (
            convert_json_table_to_plotly,
            generate_wordcloud_plotly,
            process_inference_json,
            DATA_DIR
        )
        
        # Generar archivos JSON de Plotly
        log_mensaje("Iniciando generación de archivos JSON para Plotly", "INFO")
        
        # 1. Procesar tablas simples (gráficos de barras/pie)
        tabla_files = [f for f in os.listdir(DATA_DIR) if f.startswith("tabla_") and f.endswith(".json") 
                      and not f.startswith("tabla_wordcloud_")]
        
        for i, json_file in enumerate(tabla_files):
            mostrar_progreso("Generando visualizaciones interactivas", i, len(tabla_files))
            try:
                if "PREGUNTA" in json_file and not "_vs_" in json_file:
                    # Para preguntas usar gráfico de barras
                    convert_json_table_to_plotly(
                        json_file, 
                        chart_type="bar", 
                        title=f"Distribución de {json_file.replace('tabla_', '').replace('.json', '')}",
                        yaxis_title="Cantidad"
                    )
                elif ("SEGMENTO" in json_file or "GENERO" in json_file or "ESTRATO" in json_file) and not "_vs_" in json_file:
                    # Para segmento, género y estrato usar gráfico de pie
                    convert_json_table_to_plotly(
                        json_file, 
                        chart_type="pie", 
                        title=f"Distribución por {json_file.replace('tabla_', '').replace('.json', '')}"
                    )
                else:
                    # Para el resto usar gráfico de barras
                    convert_json_table_to_plotly(
                        json_file, 
                        chart_type="bar", 
                        title=f"Distribución de {json_file.replace('tabla_', '').replace('.json', '')}",
                        yaxis_title="Cantidad"
                    )
            except Exception as e:
                log_mensaje(f"Error al generar visualización para {json_file}: {str(e)}", "ADVERTENCIA")
                
        mostrar_progreso("Generando visualizaciones interactivas", len(tabla_files), len(tabla_files))
        
        # 2. Procesar nube de palabras
        wordcloud_files = [f for f in os.listdir(DATA_DIR) if f.startswith("tabla_wordcloud_") and f.endswith(".json")]
        log_mensaje(f"Generando {len(wordcloud_files)} nubes de palabras interactivas", "INFO")
        
        for wc_file in wordcloud_files:
            try:
                generate_wordcloud_plotly(wc_file)
                log_mensaje(f"Nube de palabras generada para {wc_file}", "INFO")
            except Exception as e:
                log_mensaje(f"Error al generar nube de palabras para {wc_file}: {str(e)}", "ADVERTENCIA")
        
        # 3. Procesar archivos de inferencia
        inference_files = [f for f in os.listdir(DATA_DIR) if f.startswith("inferencia_") and f.endswith(".json")]
        log_mensaje(f"Procesando {len(inference_files)} archivos de inferencia estadística", "INFO")
        
        for inf_file in inference_files:
            try:
                process_inference_json(inf_file)
                log_mensaje(f"Visualización de inferencia generada para {inf_file}", "INFO")
            except Exception as e:
                log_mensaje(f"Error al procesar archivo de inferencia {inf_file}: {str(e)}", "ADVERTENCIA")
        
        log_mensaje("Generación de archivos JSON para Plotly completada exitosamente", "ÉXITO")
    
    except Exception as e:
        log_mensaje(f"Error al generar los archivos JSON de Plotly: {str(e)}", "ERROR")
        traceback.print_exc()
    
        # A partir de aquí, iniciar servidor web y abrir reporte
    log_mensaje("\nINICIANDO SERVIDOR WEB Y ABRIENDO EL REPORTE EN EL NAVEGADOR", "INFO")
    
    # Iniciar el servidor web
    try:
        # Verificar si ya hay un servidor corriendo en el puerto 8000
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 8000))
        sock.close()
        
        if result != 0:  # El puerto no está en uso
            log_mensaje("Iniciando servidor web en http://localhost:8000", "INFO")
            
            # Usar el script dedicado para el servidor si existe
            if os.path.exists('start_server.py'):
                if os.name == 'nt':  # Windows
                    os.system('start /B python start_server.py')
                else:  # Linux/Mac
                    os.system('python start_server.py &')
            else:
                # Método alternativo usando http.server
                if os.name == 'nt':  # Windows
                    os.system('start /B python -m http.server 8000')
                else:  # Linux/Mac
                    os.system('python -m http.server 8000 &')
            
            # Esperar a que el servidor esté listo
            log_mensaje("Esperando a que el servidor web esté listo...", "INFO")
            for i in range(10):
                try:
                    import urllib.request
                    urllib.request.urlopen('http://localhost:8000', timeout=1)
                    log_mensaje("Servidor web iniciado correctamente", "ÉXITO")
                    break
                except:
                    log_mensaje(f"Intento {i+1}/10: Esperando a que el servidor esté listo...", "INFO")
                    time.sleep(1)
            else:
                log_mensaje("No se pudo confirmar que el servidor web esté listo, pero se intentará abrir el navegador de todos modos", "ADVERTENCIA")
        else:
            log_mensaje("Ya hay un servidor web ejecutándose en el puerto 8000", "INFO")
        
        # Abrir el reporte en el navegador web
        time.sleep(1)
        url = 'http://localhost:8000/reporte_web_coltefinanciera.html'
        log_mensaje(f"Abriendo reporte web en: {url}", "INFO")
        webbrowser.open(url)
        log_mensaje("Reporte web abierto en el navegador", "ÉXITO")
    except Exception as e:
        log_mensaje(f"Error al iniciar servidor o abrir navegador: {str(e)}", "ERROR")
        log_mensaje("Puede abrir manualmente el reporte ejecutando un servidor local", "ADVERTENCIA")
    
    # Usar el script dedicado para el servidor si existe
    if os.path.exists('start_server.py'):
        try:
            subprocess.Popen([sys.executable, 'start_server.py'])
            log_mensaje("Servidor dedicado iniciado con start_server.py", "ÉXITO")
        except Exception as e:
            log_mensaje(f"Error al iniciar el servidor dedicado: {str(e)}", "ERROR")
    
    # Resumen final
    log_mensaje("\n" + "="*80, "INFO")
    log_mensaje("ANÁLISIS DE SATISFACCIÓN COMPLETADO EXITOSAMENTE", "ÉXITO")
    log_mensaje("="*80, "INFO")
    log_mensaje("Resultados generados:", "INFO")
    log_mensaje(f"1. Archivo Excel: {EXPORT_EXCEL}", "INFO")
    log_mensaje(f"2. Archivo PDF: {EXPORT_PDF}", "INFO")
    log_mensaje(f"3. Gráficos PNG: {EXPORT_PNG_DIR}", "INFO")
    log_mensaje(f"4. Datos JSON: {EXPORT_JSON_DIR}", "INFO")
    log_mensaje(f"5. Visualización web: http://localhost:8000/reporte_web_coltefinanciera.html", "INFO")
    log_mensaje(f"6. Archivo de log: {LOG_FILE}", "INFO")
    log_mensaje("="*80, "INFO")

except Exception as e:
    # Capturar cualquier error no manejado
    log_mensaje(f"ERROR CRÍTICO NO MANEJADO: {str(e)}", "ERROR")
    log_mensaje("Detalles del error:", "ERROR")
    traceback.print_exc()
    log_mensaje("El proceso se ha detenido debido a un error crítico", "ERROR")
    sys.exit(1)
        # Final del script - Mostrar mensaje de éxito
print("\n" + "="*80)
print("PROYECTO EJECUTADO CORRECTAMENTE")
print("="*80)
print("\n🎉 ¡El análisis se ha completado con éxito!")
print("📊 Datos procesados y visualizaciones generadas")
print("📄 Reporte web abierto en el navegador")
print("🌐 Servidor web ejecutándose en http://localhost:8000")
print("\nPara detener el servidor, cierra la ventana de la consola o presiona Ctrl+C")
