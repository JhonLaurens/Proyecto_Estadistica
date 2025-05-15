# === PROGRAMA DE ANÁLISIS DE ENCUESTAS DE SATISFACCIÓN ===
import os
import sys
from datetime import datetime

# Añadir src y utils al PYTHONPATH para importaciones directas
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, 'src'))
sys.path.append(os.path.join(current_dir, 'utils'))

try:
    from IPython.display import display, Markdown, HTML
    import pandas as pd
    pd.set_option('display.max_rows', 100)
    pd.set_option('display.max_columns', 50)
    pd.set_option('display.width', 1000)
    in_notebook_env = True
except ImportError:
    in_notebook_env = False
    def display(x): print(x)
    class Markdown:
        def __init__(self, data): self.data = data
        def __str__(self): return str(self.data)
        def __repr__(self): return str(self.data)
    class HTML:
        def __init__(self, data): self.data = data
        def __str__(self): return str(self.data)
        def __repr__(self): return str(self.data)

# Asegurar que src y utils son paquetes (tienen __init__.py)
for pkg_dir in ['src', 'utils']:
    pkg_path = os.path.join(current_dir, pkg_dir)
    init_file = os.path.join(pkg_path, '__init__.py')
    if not os.path.exists(pkg_path):
        os.makedirs(pkg_path, exist_ok=True)
    if not os.path.exists(init_file):
        with open(init_file, 'w', encoding='utf-8') as f:
            f.write("# Inicializa el paquete " + pkg_dir + "\n")

# Crear archivos de módulos vacíos si no existen (para evitar errores de importación)
for mod in ['data_processor', 'visualizer', 'ai_analyzer', 'data_loader']:
    mod_path = os.path.join(current_dir, 'src', f'{mod}.py')
    if not os.path.exists(mod_path):
        with open(mod_path, 'w', encoding='utf-8') as f:
            f.write(f"# Módulo {mod} (auto-creado para evitar errores de importación)\n")

# Importar módulos del proyecto
try:
    import config_utils
    import data_loader
    import data_processor
    import visualizer
    import ai_analyzer
except ImportError as e:
    print(f"Error importando módulos del proyecto: {e}")
    print("Asegúrate de que los archivos __init__.py existen en las carpetas 'src' y 'utils',")
    print("y que estas carpetas están en el mismo directorio que main.py o en el PYTHONPATH.")
    sys.exit(1)

def main():
    display(Markdown("# Pipeline de Análisis de Encuestas de Satisfacción"))
    # 1. Cargar configuración
    config_file_path = os.path.join(current_dir, 'config.ini')
    if not os.path.exists(config_file_path):
        display(Markdown(f"<p style='color:orange;'>Archivo 'config.ini' no encontrado en {current_dir}. Creando uno con valores predeterminados.</p>"))
        try:
            config_utils.create_default_config(config_file_path)
            display(Markdown(f"<p style='color:green;'>Archivo 'config.ini' creado. Por favor, revísalo y ajústalo si es necesario, especialmente las rutas y la API Key.</p>"))
        except Exception as e_conf_create:
            display(Markdown(f"<p style='color:red;'>Error creando 'config.ini' predeterminado: {e_conf_create}. Usando configuraciones internas.</p>"))
            config = config_utils.load_config(None)
    config = config_utils.load_config(config_file_path)
    display(Markdown(f"Configuración cargada desde: `{config_file_path}`"))

    # 2. Cargar datos
    display(Markdown("## 2. Cargando Datos"))
    data_file_path_config = config.get('DEFAULT', 'DataFile', fallback=None)
    if data_file_path_config and os.path.exists(data_file_path_config):
        data_file_path = data_file_path_config
        display(Markdown(f"Usando archivo de datos especificado en `config.ini`: `{data_file_path}`"))
    else:
        if data_file_path_config:
            display(Markdown(f"<p style='color:orange;'>Archivo de datos '{data_file_path_config}' especificado en `config.ini` no encontrado.</p>"))
        display(Markdown("Abriendo diálogo para seleccionar archivo de datos..."))
        data_file_path = config_utils.select_file(title="Selecciona el archivo de datos de la encuesta (.csv o .xlsx)")
    if not data_file_path:
        display(Markdown("<p style='color:red; font-weight:bold;'>No se seleccionó ningún archivo de datos. El análisis no puede continuar.</p>"))
        return
    df_raw, nombre_archivo = data_loader.load_data_from_file(file_path=data_file_path, config=config)
    if df_raw.empty:
        display(Markdown("<p style='color:red; font-weight:bold;'>El DataFrame está vacío después de intentar cargar los datos. El análisis no puede continuar.</p>"))
        return
    display(Markdown(f"Datos cargados del archivo: **{nombre_archivo}**"))
    display(Markdown(f"Dimensiones del DataFrame crudo: {df_raw.shape[0]} filas, {df_raw.shape[1]} columnas."))

    # 3. Procesar datos
    display(Markdown("## 3. Procesando y Limpiando Datos"))
    df_procesado = data_processor.clean_and_prepare_data(df_raw, config=config)
    if df_procesado.empty:
        display(Markdown("<p style='color:red; font-weight:bold;'>El DataFrame está vacío después del procesamiento. El análisis no puede continuar.</p>"))
        return
    display(Markdown(f"Dimensiones del DataFrame procesado: {df_procesado.shape[0]} filas, {df_procesado.shape[1]} columnas."))

    # 4. Análisis estadístico y visualizaciones
    display(Markdown("## 4. Análisis Estadístico y Visualizaciones"))
    columnas_preguntas_satisfaccion = [f'PREGUNTA_{i}' for i in range(1, 5)]
    columna_satisfaccion_general = 'SATISFACCION_GENERAL'
    columnas_segmentacion = ['ESTRATO', 'GENERO', 'CIUDAD_AGENCIA']
    columnas_para_correlacion = columnas_preguntas_satisfaccion + ['ESTRATO', 'EDAD', 'ANTIGUEDAD_CLIENTE_ANOS', columna_satisfaccion_general]
    columna_comentarios = 'PREGUNTA_5_LIMPIA'

    if config.getboolean('ANALISIS', 'CalcularEstadisticasBasicas', fallback=True) and columna_satisfaccion_general in df_procesado.columns:
        display(Markdown(f"### 4.1 Distribución de {columna_satisfaccion_general.replace('_', ' ')}"))
        visualizer.plot_satisfaction_distribution(df_procesado, column_name=columna_satisfaccion_general, config=config)
    if config.getboolean('ANALISIS', 'CalcularEstadisticasBasicas', fallback=True):
        display(Markdown("### 4.2 Calificación Promedio por Pregunta Específica"))
        visualizer.plot_mean_scores_by_question(df_procesado, columnas_preguntas_satisfaccion, config=config)
    if config.getboolean('ANALISIS', 'AnalisisPorSegmentos', fallback=True) and columna_satisfaccion_general in df_procesado.columns:
        display(Markdown("### 4.3 Análisis de Satisfacción por Segmentos"))
        for seg_col in columnas_segmentacion:
            if seg_col in df_procesado.columns:
                display(Markdown(f"#### Segmentación por: {seg_col.replace('_', ' ')}"))
                visualizer.plot_satisfaction_by_segment(df_procesado, segment_column=seg_col, target_column=columna_satisfaccion_general, config=config)
            else:
                display(Markdown(f"<p style='color:orange;'>Columna de segmentación '{seg_col}' no encontrada en los datos procesados.</p>"))
    if config.getboolean('ANALISIS', 'AnalisisCorrelacion', fallback=True):
        display(Markdown("### 4.4 Matriz de Correlación"))
        visualizer.plot_correlation_matrix(df_procesado, columnas_para_correlacion, config=config)
    word_counts_resultado = None
    if config.getboolean('ANALISIS', 'AnalisisTexto', fallback=True) and columna_comentarios in df_procesado.columns:
        display(Markdown(f"### 4.5 Análisis de Comentarios Abiertos ({columna_comentarios.replace('_', ' ')})"))
        word_counts_resultado = visualizer.plot_wordcloud_and_frequencies(df_procesado, text_column=columna_comentarios, config=config)

    # 5. Análisis con IA (opcional)
    if config.getboolean('DEFAULT', 'EnableAIAnalysis', fallback=False):
        display(Markdown("## 5. Análisis Asistido por IA"))
        data_summary_ia = ai_analyzer.prepare_data_summary_for_ia(df_procesado, nombre_archivo, word_counts_resultado, config=config)
        prompt_ia = ai_analyzer.generate_ai_prompt(data_summary_ia, nombre_archivo, len(df_procesado), config=config)
        informe_ia_md = ai_analyzer.get_ai_analysis(prompt_ia, config=config)
        display(Markdown("### 5.4 Informe Generado por IA"))
        display(Markdown(informe_ia_md))
        output_folder = config.get('DEFAULT', 'OutputFolder', fallback='output')
        if output_folder:
            os.makedirs(output_folder, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_filename = os.path.join(output_folder, f"informe_ia_{nombre_archivo.split('.')[0]}_{timestamp}.md")
            try:
                with open(report_filename, 'w', encoding='utf-8') as f:
                    f.write(f"# Informe de Análisis con IA para: {nombre_archivo}\n")
                    f.write(f"Generado el: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                    f.write(informe_ia_md)
                display(Markdown(f"<p style='color:green;'>Informe de IA guardado en: `{report_filename}`</p>"))
            except Exception as e_save:
                display(Markdown(f"<p style='color:red;'>Error al guardar el informe de IA: {e_save}</p>"))
    else:
        display(Markdown("## 5. Análisis Asistido por IA (Deshabilitado)"))
        display(Markdown("Para habilitar el análisis con IA, edita `config.ini` y establece `EnableAIAnalysis = True` y configura tu `AIApiKey`."))
    display(Markdown("---"))
    display(Markdown("## Fin del Análisis"))
    display(Markdown("Pipeline completado."))

if __name__ == '__main__': 
    main()
    # input("\nPresione ENTER para salir...") # Descomentar si se ejecuta como script y se quiere pausar al final
