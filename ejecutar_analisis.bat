@echo off
echo ===================================================================
echo EJECUTANDO ANALISIS DE SATISFACCION COLTEFINANCIERA
echo ===================================================================
echo.
echo Este script ejecutara todo el proceso de analisis:
echo  1. Generacion de graficos y tablas
echo  2. Creacion de visualizaciones interactivas con Plotly
echo  3. Inicio del servidor web
echo  4. Apertura del reporte en el navegador
echo.
echo Por favor espere mientras se completa el proceso...
echo.

REM Verifica si Python esta instalado
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python no esta instalado o no se encuentra en el PATH.
    echo Por favor instala Python desde https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Verifica si se requieren instalar dependencias
if not exist venv (
    echo Instalando dependencias necesarias...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    echo Dependencias instaladas correctamente.
    echo.
)

REM Ejecuta el script principal
python main.py

echo.
echo Si el reporte no se abrio automaticamente, puedes acceder a el en:
echo http://localhost:8000/reporte_web_coltefinanciera.html
echo.
echo Para detener el servidor, cierra esta ventana o presiona Ctrl+C
echo.

REM Mantener la ventana abierta para que el servidor siga funcionando
echo Servidor web en ejecucion. Presiona Ctrl+C para detener.
cmd /k
