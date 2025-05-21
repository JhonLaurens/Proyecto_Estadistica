# Proyecto de Análisis de Satisfacción Coltefinanciera

Este proyecto realiza un análisis estadístico completo de la satisfacción del cliente de Coltefinanciera, generando visualizaciones interactivas y un reporte web.

## Características Principales

- Análisis estadístico descriptivo e inferencial
- Visualizaciones interactivas con Plotly
- Reporte web con interfaz moderna y responsive
- Filtros dinámicos para segmentar los datos
- Análisis de texto de comentarios abiertos
- Soporte para temas claro/oscuro

## Requisitos

- Python 3.7 o superior
- Navegador web moderno
- Conexión a internet (para CDN de algunas bibliotecas)

## Dependencias Principales

- pandas: Para manipulación y análisis de datos
- numpy: Para cálculos numéricos
- matplotlib & seaborn: Para visualizaciones estáticas
- plotly: Para gráficos interactivos
- scikit-learn: Para análisis estadístico avanzado
- wordcloud & sentence-transformers: Para análisis de texto
│   ├── analysis_univariado.py
│   ├── analysis_bivariado.py
│   ├── inferencia.py
## Cómo Ejecutar el Proyecto

### Opción 1: Ejecutar con un solo clic (Recomendado)

**En Windows:**
1. Haz doble clic en el archivo `ejecutar_analisis.bat`
2. Se abrirá una ventana de comando que ejecutará todo el proceso
3. El reporte web se abrirá automáticamente en tu navegador

**En Linux/Mac:**
1. Abre una terminal en la carpeta del proyecto
2. Ejecuta `chmod +x ejecutar_analisis.sh` para dar permisos de ejecución
3. Ejecuta `./ejecutar_analisis.sh`
4. El reporte web se abrirá automáticamente en tu navegador

### Opción 2: Ejecución manual paso a paso

1. Instala las dependencias:
   ```
   pip install -r requirements.txt
   ```

2. Ejecuta el análisis principal:
   ```
   python main.py
   ```

3. Inicia el servidor web:
   ```
   python start_server.py
   ```

4. Abre en tu navegador:
   ```
   http://localhost:8000/reporte_web_coltefinanciera.html
   ```

## Estructura del Proyecto

```
Proyecto_Estadistica/
├── data/                           # Datos de entrada y resultados en JSON
│   ├── Base encuesta de satisfacción.csv   # Datos originales
│   ├── tabla_*.json                # Tablas de frecuencia exportadas
│   └── plotly_*.json              # Visualizaciones Plotly
├── graficos/                       # Visualizaciones estáticas
├── static/                         # Archivos JS y CSS para el reporte web
├── src/                            # Módulos de Python para el análisis
│   ├── data_loader.py             # Carga de datos
│   ├── data_cleaner.py            # Limpieza de datos
│   ├── analysis_univariado.py     # Análisis univariado
│   ├── analysis_bivariado.py      # Análisis bivariado
│   ├── inferencia.py              # Pruebas estadísticas
│   ├── visualizations.py          # Visualizaciones y wordcloud
│   └── exporter.py                # Exportación a diferentes formatos
├── notebooks/                      # Notebooks de Jupyter para exploración
├── main.py                         # Script principal que ejecuta todo el análisis
├── generate_plotly_json.py        # Genera archivos JSON para Plotly
├── start_server.py                # Inicia un servidor web local
├── reporte_web_coltefinanciera.html # Página principal del reporte
├── ejecutar_analisis.bat          # Script de ejecución para Windows
└── ejecutar_analisis.sh           # Script de ejecución para Linux/Mac
```

---

## Personalización

- Para modificar el análisis, edita los archivos en la carpeta `src/`
- Para cambiar la apariencia del reporte web, edita los archivos en `static/`
- Para añadir nuevas visualizaciones, modifica `generate_plotly_json.py`

## Resolución de Problemas

- **El servidor no inicia**: Verifica que no haya otro servicio usando el puerto 8000.
- **Gráficos no se muestran**: Asegúrate de tener conexión a internet para cargar las CDN.
- **Error en la ejecución**: Verifica que todas las dependencias estén instaladas correctamente.

## Nuevas Funcionalidades Implementadas

### 1. Visualizaciones Interactivas con Plotly
- Reemplazo de imágenes estáticas por gráficos interactivos
- Incluye zoom, pan, tooltips y opciones de exportación

### 2. Tema Claro/Oscuro
- Cambio dinámico entre modo claro y oscuro
- Ajuste automático de colores en gráficos según el tema

### 3. Sistema de Filtrado Avanzado
- Filtros por segmento, ciudad, género y tipo de ejecutivo
- Actualización dinámica de todas las visualizaciones

### 4. Módulo Centralizado de Carga de Datos
- Sistema unificado para la gestión de datos JSON
- Mejora en el rendimiento y manejo de errores

### 5. Pruebas Automatizadas
- Script de verificación de funcionalidades clave
- Comprobación de carga de gráficos y cambios de tema

### 6. Ejecución en Un Solo Clic
- Scripts `ejecutar_analisis.bat` (Windows) y `ejecutar_analisis.sh` (Linux/Mac)
- Proceso completo automatizado desde análisis hasta visualización
