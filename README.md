# Proyecto de Análisis de Satisfacción Coltefinanciera

Este proyecto realiza un análisis estadístico completo de la satisfacción del cliente de Coltefinanciera, generando visualizaciones interactivas y un reporte web.

## Características Principales

- Análisis estadístico descriptivo e inferencial con validación robusta
- Verificación automática de supuestos estadísticos y selección óptima de pruebas
- Cálculo e interpretación de tamaños de efecto para análisis de significancia práctica
- Visualizaciones interactivas con Plotly
- Reporte web con interfaz moderna y responsive
- Filtros dinámicos para segmentar los datos
- Análisis de texto de comentarios abiertos
- Soporte para temas claro/oscuro

## Mejoras Recientes (Mayo 2025)

- **Análisis de Potencia Estadística**: Cálculos automáticos e interpretaciones para mejorar la confiabilidad
- **Validación Estadística Avanzada**: Comprobación robusta de supuestos para normalidad y homogeneidad
- **Mejora de Visualizaciones**: Gráficos combinados con intervalos de confianza y anotaciones estadísticas
- **Métodos Estadísticos Alternativos**: Selección inteligente entre Chi-cuadrado y Fisher para datos categóricos
- **Cálculos de Tamaño de Efecto**: Implementación de d de Cohen, V de Cramer, r, eta-cuadrado y otros
- **Optimizaciones de Visualización Web**: Mejoras para visualización responsiva en diferentes dispositivos
- **Pruebas Exhaustivas**: Conjunto completo de pruebas para validar la robustez de las mejoras

### Documentación Completa

Para utilizar estas mejoras y entender su implementación, consulte:

- `README_mejoras_mayo_2025.md`: Resumen ejecutivo de todas las implementaciones
- `guia_implementacion.md`: Guía paso a paso para implementar las nuevas funcionalidades
- `docs_potencia_estadistica.md`: Guía detallada sobre interpretación de potencia y tamaños de efecto
- `docs_visualizaciones_optimizadas.md`: Documentación técnica sobre las mejoras de visualización
- `docs_metodologias_estadisticas.md`: Fundamentos metodológicos de los análisis implementados

### Pruebas y Validación

- `test_mejoras.py`: Pruebas básicas para validar las mejoras implementadas
- `test_mejoras_completo.py`: Pruebas exhaustivas con datos reales y casos extremos

## Requisitos

- Python 3.8 o superior
- Navegador web moderno
- Conexión a internet (para CDN de algunas bibliotecas)

## Dependencias Principales

- pandas: Para manipulación y análisis de datos
- numpy: Para cálculos numéricos
- matplotlib & seaborn: Para visualizaciones estáticas
- scipy & statsmodels: Para análisis estadístico y pruebas de hipótesis
- plotly: Para gráficos interactivos
- scikit-learn: Para análisis estadístico avanzado
- wordcloud & sentence-transformers: Para análisis de texto

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
│   ├── analysis_bivariado.py      # Análisis bivariado con validación estadística
│   ├── inferencia.py              # Pruebas estadísticas
│   ├── visualizations.py          # Visualizaciones y wordcloud
│   └── exporter.py                # Exportación a diferentes formatos
├── docs_metodologias_estadisticas.md  # Documentación técnica de metodologías estadísticas
├── docs_mejoras_mayo_2025.md      # Documentación de mejoras implementadas
├── notebooks/                      # Notebooks de Jupyter para exploración
├── main.py                         # Script principal que ejecuta todo el análisis
├── generate_plotly_json.py        # Genera archivos JSON para Plotly
├── start_server.py                # Inicia un servidor web local
├── reporte_web_coltefinanciera.html # Página principal del reporte
├── ejecutar_analisis.bat          # Script de ejecución para Windows
└── ejecutar_analisis.sh           # Script de ejecución para Linux/Mac
```

## Metodología Estadística Implementada

Este proyecto implementa una robusta metodología estadística que incluye:

1. **Validación de supuestos estadísticos**
   - Prueba de normalidad (Shapiro-Wilk)
   - Homogeneidad de varianzas (Levene)
   - Verificación de tamaños muestrales adecuados

2. **Pruebas estadísticas para análisis bivariado**
   - Chi-cuadrado para variables categóricas con cálculo de V de Cramer
   - Selección automática entre t-Student, t-Welch, Mann-Whitney U, ANOVA y Kruskal-Wallis
   - Análisis post-hoc (Tukey HSD) para comparaciones múltiples

3. **Cálculo de tamaños de efecto**
   - d de Cohen para diferencias entre medias
   - r para pruebas no paramétricas
   - V de Cramer para asociación entre categóricas
   - Eta cuadrado para ANOVA y variantes

Para detalles completos sobre la metodología estadística, consulte el archivo `docs_metodologias_estadisticas.md`.

## Personalización

- Para modificar el análisis, edita los archivos en la carpeta `src/`
- Para cambiar la apariencia del reporte web, edita los archivos en `static/`
- Para añadir nuevas visualizaciones, modifica `generate_plotly_json.py`

## Resolución de Problemas

- **El servidor no inicia**: Verifica que no haya otro servicio usando el puerto 8000.
- **Gráficos no se muestran**: Asegúrate de tener conexión a internet para cargar las CDN.
- **Error en la ejecución**: Verifica que todas las dependencias estén instaladas correctamente.
- **Error en módulos estadísticos**: Ejecuta `pip install -r requirements.txt` para asegurar que todas las librerías necesarias estén instaladas.

## Mejoras Recientes (Mayo 2025)

### 1. Validación Estadística Mejorada
- Verificación automática de supuestos estadísticos
- Selección inteligente de pruebas según los datos
- Cálculo e interpretación de tamaños de efecto

### 2. Mejoras en Pruebas Estadísticas
- Análisis bivariado robusto con pruebas adecuadas
- Visualizaciones enriquecidas con anotaciones estadísticas
- Exportación de resultados estadísticos detallados

### 3. Sistema de Logging y Manejo de Errores
- Registro detallado de operaciones con mensajes categorizados
- Manejo robusto de excepciones con información diagnóstica
- Continuación del análisis ante fallos parciales

Para detalles completos sobre las mejoras implementadas, consulte el archivo `docs_mejoras_mayo_2025.md`.

---

## Autoría y Licencia

Desarrollado por el Equipo de Estadística de Coltefinanciera
Versión: 1.3 - Mayo 2025
Este proyecto es propiedad de Coltefinanciera y está protegido por derechos de autor.

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
