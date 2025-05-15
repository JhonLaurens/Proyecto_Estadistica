import configparser
import os
import tkinter as tk
from tkinter import filedialog

def load_config(config_path='config.ini'):
    """Carga la configuración desde el archivo config.ini"""
    config = configparser.ConfigParser()
    
    # Si no existe el archivo de configuración, usar valores predeterminados
    if not os.path.exists(config_path):
        print(f"Archivo de configuración {config_path} no encontrado. Usando valores predeterminados.")
        config['DEFAULT'] = {
            'DataFolder': '',
            'OutputFolder': '',
            'DefaultCSVDelimiter': ';',
            'DefaultCSVEncoding': 'utf-8-sig',
            'DefaultCSVDecimal': ',',
            'EnableAIAnalysis': 'False',
            'AIModel': 'gpt-3.5-turbo',
            'AIApiKey': ''
        }
        config['VISUALIZACION'] = {
            'ColorPalette': 'pastel',
            'FigureSizeWidth': '10',
            'FigureSizeHeight': '6',
            'DefaultDPI': '100'
        }
        config['ANALISIS'] = {
            'CalcularEstadisticasBasicas': 'True',
            'AnalisisCorrelacion': 'True',
            'AnalisisPorSegmentos': 'True',
            'AnalisisTexto': 'True'
        }
    else:
        config.read(config_path)
    
    return config

def select_file(title="Seleccionar archivo", filetypes=(("CSV files", "*.csv"), ("Excel files", "*.xlsx"), ("All files", "*.*"))):
    """Abre un diálogo para seleccionar un archivo"""
    root = tk.Tk()
    root.withdraw()  # Ocultar la ventana principal
    file_path = filedialog.askopenfilename(title=title, filetypes=filetypes)
    return file_path

def select_folder(title="Seleccionar carpeta"):
    """Abre un diálogo para seleccionar una carpeta"""
    root = tk.Tk()
    root.withdraw()  # Ocultar la ventana principal
    folder_path = filedialog.askdirectory(title=title)
    return folder_path

def create_default_config(config_path='config.ini'):
    """Crea un archivo de configuración con valores predeterminados"""
    config = configparser.ConfigParser()
    
    config['DEFAULT'] = {
        'DataFolder': '',
        'OutputFolder': '',
        'DefaultCSVDelimiter': ';',
        'DefaultCSVEncoding': 'utf-8-sig',
        'DefaultCSVDecimal': ',',
        'EnableAIAnalysis': 'False',
        'AIModel': 'gpt-3.5-turbo',
        'AIApiKey': ''
    }
    
    config['VISUALIZACION'] = {
        'ColorPalette': 'pastel',
        'FigureSizeWidth': '10',
        'FigureSizeHeight': '6',
        'DefaultDPI': '100'
    }
    
    config['ANALISIS'] = {
        'CalcularEstadisticasBasicas': 'True',
        'AnalisisCorrelacion': 'True',
        'AnalisisPorSegmentos': 'True',
        'AnalisisTexto': 'True'
    }
    
    # Crear carpeta si no existe
    os.makedirs(os.path.dirname(os.path.abspath(config_path)), exist_ok=True)
    
    # Guardar la configuración
    with open(config_path, 'w') as configfile:
        config.write(configfile)
    
    print(f"Archivo de configuración creado en {config_path}")
