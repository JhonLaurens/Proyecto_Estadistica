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
