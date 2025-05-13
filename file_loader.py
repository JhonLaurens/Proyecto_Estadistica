import tkinter as tk
from tkinter import filedialog
import pandas as pd
import io
import os

def cargar_archivo_csv():
    """
    Muestra un diálogo para seleccionar un archivo CSV y lo carga en un DataFrame.
    Reemplaza la funcionalidad de files.upload() de Google Colab.
    
    Returns:
        tuple: (DataFrame cargado, nombre de archivo)
    """
    root = tk.Tk()
    root.withdraw()  # Ocultar la ventana principal
    
    print("Seleccione un archivo CSV para cargar:")
    ruta_archivo = filedialog.askopenfilename(
        title="Seleccionar archivo CSV",
        filetypes=[("Archivos CSV", "*.csv"), ("Todos los archivos", "*.*")]
    )
    
    if not ruta_archivo:
        print("No se seleccionó ningún archivo.")
        return pd.DataFrame(), "No especificado"
    
    nombre_archivo = os.path.basename(ruta_archivo)
    print(f"Archivo seleccionado: {nombre_archivo}")
    
    try:
        # Intentar cargar con utf-8-sig
        df = pd.read_csv(ruta_archivo, sep=';', decimal=',', encoding='utf-8-sig', low_memory=False)
        print(f"DataFrame cargado exitosamente desde {nombre_archivo}")
    except UnicodeDecodeError:
        # Si falla, intentar con latin1
        print("Error de decodificación con utf-8-sig. Intentando con latin1...")
        try:
            df = pd.read_csv(ruta_archivo, sep=';', decimal=',', encoding='latin1', low_memory=False)
            print(f"DataFrame cargado exitosamente con encoding latin1 desde {nombre_archivo}")
        except Exception as e:
            print(f"Error al cargar el CSV con latin1: {e}")
            return pd.DataFrame(), nombre_archivo
    except Exception as e:
        print(f"Error general al cargar el CSV: {e}")
        return pd.DataFrame(), nombre_archivo
        
    return df, nombre_archivo

def cargar_api_key(servicio="OPENAI_API_KEY"):
    """
    Obtiene la API key de forma segura, priorizando:
    1. Variable de entorno
    2. Archivo de configuración
    3. Entrada manual (solo si es necesario)
    
    Args:
        servicio: Nombre del servicio/variable de entorno
    
    Returns:
        str: API key cargada
    """
    # Primero intentar obtener de variable de entorno
    api_key = os.environ.get(servicio)
    
    # Si no está en variable de entorno, buscar en archivo de configuración
    if not api_key:
        config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.ini')
        if os.path.exists(config_path):
            import configparser
            config = configparser.ConfigParser()
            config.read(config_path)
            try:
                api_key = config['API_KEYS'][servicio]
            except (KeyError, configparser.NoSectionError):
                pass
    
    # Como último recurso, solicitar al usuario (solo para desarrollo)
    if not api_key:
        print(f"\nATENCIÓN: No se encontró la API key para {servicio}.")
        print("Por seguridad, ingrese la API key (no será guardada en el código):")
        api_key = input("> ").strip()
        
        # Preguntar si desea guardar la key en un archivo de configuración
        guardar = input("¿Desea guardar esta API key en un archivo de configuración local? (s/n): ").lower()
        if guardar == 's':
            import configparser
            config = configparser.ConfigParser()
            
            # Si el archivo existe, leerlo primero
            if os.path.exists(config_path):
                config.read(config_path)
            
            # Asegurarse de que la sección existe
            if 'API_KEYS' not in config:
                config['API_KEYS'] = {}
            
            # Guardar la API key
            config['API_KEYS'][servicio] = api_key
            
            with open(config_path, 'w') as f:
                config.write(f)
            print(f"API key guardada en {config_path}")
            print("IMPORTANTE: Añada config.ini a su archivo .gitignore para evitar compartir sus claves.")
            
            # Crear .gitignore si no existe
            gitignore_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.gitignore')
            if not os.path.exists(gitignore_path):
                with open(gitignore_path, 'w') as f:
                    f.write("config.ini\n")
            else:
                with open(gitignore_path, 'r') as f:
                    content = f.read()
                if 'config.ini' not in content:
                    with open(gitignore_path, 'a') as f:
                        f.write("\nconfig.ini\n")
    
    return api_key
