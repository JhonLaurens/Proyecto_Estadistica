#!/bin/bash

echo "==================================================================="
echo "EJECUTANDO ANALISIS DE SATISFACCION COLTEFINANCIERA"
echo "==================================================================="
echo ""
echo "Este script ejecutara todo el proceso de analisis:"
echo "  1. Generacion de graficos y tablas"
echo "  2. Creacion de visualizaciones interactivas con Plotly"
echo "  3. Inicio del servidor web"
echo "  4. Apertura del reporte en el navegador"
echo ""
echo "Por favor espere mientras se completa el proceso..."
echo ""

# Verifica si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 no está instalado."
    echo "Por favor instala Python desde https://www.python.org/downloads/"
    read -p "Presiona Enter para salir..."
    exit 1
fi

# Verifica e instala dependencias si es necesario
if [ ! -d "venv" ]; then
    echo "Instalando dependencias necesarias..."
    python3 -m pip install --upgrade pip
    pip3 install -r requirements.txt
    echo "Dependencias instaladas correctamente."
    echo ""
fi

# Dar permisos de ejecución al script de servidor si existe
if [ -f "start_server.py" ]; then
    chmod +x start_server.py
fi

# Ejecuta el script principal
python3 main.py

echo ""
echo "Si el reporte no se abrió automáticamente, puedes acceder a él en:"
echo "http://localhost:8000/reporte_web_coltefinanciera.html"
echo ""
echo "Para detener el servidor, presiona Ctrl+C en esta ventana"
echo ""
echo "Servidor web en ejecución. Presiona Ctrl+C para detener."

# Esperar indefinidamente para mantener el script activo
trap "echo 'Deteniendo servidor...'; kill $!" INT TERM
tail -f /dev/null
