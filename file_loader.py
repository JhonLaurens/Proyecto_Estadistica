import tkinter as tk
from tkinter import filedialog
import pandas as pd
import io
import os

def cargar_archivo_csv(ruta_archivo=None):
    """
    Carga un archivo CSV en un DataFrame.
    
    Args:
        ruta_archivo: Ruta opcional al archivo CSV. Si no se proporciona,
                     se muestra un diálogo para seleccionarlo.
    
    Returns:
        tuple: (DataFrame cargado, nombre de archivo)
    """
    # Si no se proporciona una ruta, mostrar diálogo para seleccionar archivo
    if not ruta_archivo:
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
    Obtiene la API key de forma segura.
    """
    # Imprimir información de diagnóstico
    print(f"Buscando {servicio}...")
    
    # Primero intentar obtener de variable de entorno
    api_key = os.environ.get(servicio)
    if api_key:
        print(f"- API key encontrada en variables de entorno")
        return api_key
    
    # Si no está en variable de entorno, buscar en archivo de configuración
    config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.ini')
    print(f"- Buscando en archivo: {config_path}")
    
    if os.path.exists(config_path):
        try:
            config = configparser.ConfigParser()
            config.read(config_path)
            if 'API_KEYS' in config and servicio in config['API_KEYS']:
                print(f"- API key encontrada en archivo config.ini")
                return config['API_KEYS'][servicio]
            else:
                print(f"- Sección 'API_KEYS' o clave '{servicio}' no encontrada en config.ini")
        except Exception as e:
            print(f"- Error al leer config.ini: {e}")
    else:
        print(f"- Archivo config.ini no encontrado")
    
    # Como último recurso, solicitar al usuario
    print(f"\nATENCIÓN: No se encontró la API key para {servicio}.")
    print("Por seguridad, ingrese la API key (no será guardada en el código):")
    api_key = input("> ").strip()
    
    if api_key:
        # Preguntar si desea guardar la key en un archivo de configuración
        guardar = input("¿Desea guardar esta API key en config.ini para futuros usos? (s/n): ").lower()
        if guardar == 's':
            try:
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
            except Exception as e:
                print(f"Error al guardar la API key: {e}")
    
    return api_key
