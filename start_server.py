import http.server
import socketserver
import os
import sys
import socket
import time

PORT = 8000

def check_port_in_use(port):
    """Verifica si el puerto especificado está en uso"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def start_server(port=PORT):
    """Inicia el servidor HTTP en el puerto especificado"""
    if check_port_in_use(port):
        print(f"⚠️ El puerto {port} ya está en uso. El servidor puede estar ya ejecutándose.")
        return False
    
    try:
        Handler = http.server.SimpleHTTPRequestHandler
        httpd = socketserver.TCPServer(("", port), Handler)
        
        print(f"✅ Servidor iniciado en http://localhost:{port}")
        print("🌐 Para detener el servidor, presiona Ctrl+C")
        
        # Cambiar al directorio del script para servir archivos desde ahí
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Iniciar el servidor
        httpd.serve_forever()
        return True
    except KeyboardInterrupt:
        print("\n⚙️ Servidor detenido manualmente.")
        return False
    except Exception as e:
        print(f"❌ Error al iniciar el servidor: {e}")
        return False

if __name__ == "__main__":
    try:
        print("🚀 Iniciando servidor web para el reporte de Coltefinanciera...")
        start_server()
    except KeyboardInterrupt:
        print("\n⚙️ Servidor detenido.")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
