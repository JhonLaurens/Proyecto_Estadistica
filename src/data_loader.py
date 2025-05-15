# Módulo data_loader (auto-creado para evitar errores de importación)
import pandas as pd
import os
import tkinter as tk
from tkinter import filedialog
import numpy as np

try:
    from IPython.display import display, Markdown, HTML
    in_notebook = True
except ImportError:
    in_notebook = False
    # Funciones de fallback para entornos no-Jupyter
    def display(content):
        if hasattr(content, "_repr_html_"):
            print("HTML contenido disponible (se vería en un notebook)")
        else:
            print(content)
            
    class Markdown:
        def __init__(self, text):
            self.text = text
        
        def _repr_markdown_(self):
            return self.text
    
    class HTML:
        def __init__(self, html):
            self.html = html
        
        def _repr_html_(self):
            return self.html

def load_data_from_file(file_path=None, config=None):
    """
    Carga datos desde un archivo CSV o Excel
    
    Args:
        file_path (str, optional): Ruta al archivo. Si es None, abre un diálogo de selección.
        config (ConfigParser, optional): Objeto de configuración. Si es None, usa valores predeterminados.
    
    Returns:
        tuple: (DataFrame, nombre_archivo)
    """
    if config is None:
        # Valores predeterminados si no se proporciona configuración
        delimiter = ';'
        encoding = 'utf-8-sig'
        decimal = ','
    else:
        # Usar valores de la configuración
        delimiter = config.get('DEFAULT', 'DefaultCSVDelimiter', fallback=';')
        encoding = config.get('DEFAULT', 'DefaultCSVEncoding', fallback='utf-8-sig')
        decimal = config.get('DEFAULT', 'DefaultCSVDecimal', fallback=',')
    
    df = pd.DataFrame()  # Inicializar df como DataFrame vacío
    nombre_archivo = "No especificado"
    
    # Si no se proporciona ruta, abrir diálogo de selección
    if file_path is None:
        print("Por favor, selecciona tu archivo de datos:")
        root = tk.Tk()
        root.withdraw()
        file_path = filedialog.askopenfilename(
            filetypes=[
                ("Archivos de datos", "*.csv *.xlsx *.xls"),
                ("CSV files", "*.csv"), 
                ("Excel files", "*.xlsx *.xls"),
                ("All files", "*.*")
            ]
        )
    
    if not file_path:
        display(Markdown("<p style='color:orange;'>No se seleccionó ningún archivo. El análisis no puede continuar sin datos.</p>"))
        return df, nombre_archivo
    
    nombre_archivo = os.path.basename(file_path)
    display(Markdown(f"**Archivo '{nombre_archivo}' seleccionado exitosamente.**"))
    
    # Determinar el tipo de archivo por su extensión
    file_ext = os.path.splitext(file_path)[1].lower()
    
    try:
        if file_ext == '.csv':
            # Intentar cargar como CSV
            try:
                df = pd.read_csv(file_path, sep=delimiter, decimal=decimal, encoding=encoding, low_memory=False)
                display(Markdown("**DataFrame cargado exitosamente desde archivo CSV.**"))
            except UnicodeDecodeError:
                display(Markdown("*Error de decodificación. Intentando con latin1...*"))
                df = pd.read_csv(file_path, sep=delimiter, decimal=decimal, encoding='latin1', low_memory=False)
                display(Markdown("**DataFrame cargado exitosamente con encoding latin1.**"))
            except Exception as e:
                # Intentar con diferentes separadores si falla
                try:
                    df = pd.read_csv(file_path, sep=',', decimal='.', encoding=encoding, low_memory=False)
                    display(Markdown("**DataFrame cargado exitosamente con separador ',' y decimal '.'**"))
                except Exception:
                    display(Markdown(f"<p style='color:red;'>Error al cargar el CSV: {str(e)}</p>"))
        
        elif file_ext in ['.xlsx', '.xls']:
            # Cargar como Excel
            try:
                df = pd.read_excel(file_path)
                display(Markdown("**DataFrame cargado exitosamente desde archivo Excel.**"))
            except Exception as e:
                display(Markdown(f"<p style='color:red;'>Error al cargar el Excel: {str(e)}</p>"))
        else:
            display(Markdown(f"<p style='color:red;'>Formato de archivo no soportado: {file_ext}</p>"))
    
    except Exception as e_gen:
        display(Markdown(f"<p style='color:red;'>Error general al cargar el archivo: {str(e_gen)}</p>"))
    
    # Verificar si se cargaron datos
    if not df.empty:
        display(Markdown("### Vista Previa de los Datos Cargados"))
        display(HTML(df.head().to_html(classes="table table-striped table-hover", max_rows=5)))
        print(f"Número total de filas: {len(df)}, Número total de columnas: {len(df.columns)}")
    else:
        display(Markdown("<p style='color:red;'>No se pudieron cargar datos desde el archivo. El DataFrame está vacío.</p>"))
    
    return df, nombre_archivo
