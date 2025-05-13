# Proyecto de Análisis de Datos

## Guía rápida para ejecutar el proyecto

1. **Abre una terminal en la carpeta del proyecto.**
2. **(Opcional) Crea y activa un entorno virtual:**
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/Mac:
   source .venv/bin/activate
   ```
3. **Instala las dependencias:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Asegúrate de que el archivo de datos esté en `data/raw/`.**
5. **Ejecuta el notebook principal:**
   ```bash
   jupyter notebook notebooks/01_exploracion_inicial.ipynb
   ```
   o abre JupyterLab:
   ```bash
   jupyter lab
   ```
6. **(Opcional) Ejecuta el pipeline de limpieza:**
   ```bash
   python scripts/run_pipeline.py
   ```
7. **Consulta los resultados y reportes en la carpeta `reports/`.**

---

# Proyecto de Análisis de Datos

## Cómo ejecutar el proyecto

1. **Crea un entorno virtual (opcional pero recomendado):**
   ```bash
   python -m venv .venv
   # Activa el entorno:
   # En Windows:
   .venv\Scripts\activate
   # En Linux/Mac:
   source .venv/bin/activate
   ```

2. **Instala las dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Ubica tus datos en la carpeta `data/raw/`.**
   - Ejemplo: `data/raw/Base encuesta de satisfacción.csv`

4. **Ejecuta los notebooks para análisis interactivo:**
   ```bash
   jupyter notebook notebooks/01_exploracion_inicial.ipynb
   ```
   o abre JupyterLab:
   ```bash
   jupyter lab
   ```

5. **(Opcional) Ejecuta el pipeline de limpieza desde scripts:**
   ```bash
   python scripts/run_pipeline.py
   ```

6. **Consulta los resultados en la carpeta `reports/`.**

# Proyecto de Análisis de Datos

Estructura basada en buenas prácticas para proyectos de análisis de datos en Python.

## Estructura de carpetas

- **data/raw/**: Datos originales (no modificar).
- **data/interim/**: Datos intermedios (limpieza, transformación).
- **data/processed/**: Datos finales listos para análisis/modelado.
- **notebooks/**: Notebooks para exploración y análisis.
- **src/**: Código fuente reutilizable (funciones, módulos).
- **scripts/**: Scripts ejecutables para pipelines.
- **reports/**: Resultados, figuras y reportes generados.
- **tests/**: Pruebas unitarias.
- **config/**: Archivos de configuración.
- **.vscode/**: Configuración de VS Code.

## Uso rápido

1. Coloca tus datos en `data/raw/`.
2. Ejecuta los scripts de limpieza o usa los notebooks.
3. Consulta los resultados en `reports/`.

## Requisitos

- Python 3.8+
- Ver `requirements.txt` o `environment.yml` para dependencias.

## Créditos

Estructura inspirada en proyectos de ciencia de datos reproducibles.
