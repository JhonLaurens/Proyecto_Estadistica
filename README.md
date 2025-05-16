# Proyecto de Análisis de Satisfacción Coltefinanciera

Este proyecto replica el análisis profesional de tu PDF, adaptado a tu base de datos de satisfacción. Incluye estructura modular, scripts de análisis, visualización web y recomendaciones para ampliación.

## Estructura recomendada

```
Proyecto_Estadistica/
├── data/
│   └── Base encuesta de satisfacción.csv
├── graficos/
│   └── ... (gráficos PNG generados por Python)
├── static/
│   ├── coltefinanciera.css
│   └── coltefinanciera.js
├── notebooks/
│   └── analisis_exploratorio.ipynb
├── src/
│   ├── __init__.py
│   ├── data_loader.py
│   ├── data_cleaner.py
│   ├── analysis_univariado.py
│   ├── analysis_bivariado.py
│   ├── inferencia.py
│   ├── visualizations.py
│   └── exporter.py
├── main.py
├── requirements.txt
├── README.md
├── reporte_web_coltefinanciera.html
├── Informe_analisis_satisfaccion_Coltefinanciera.md
└── Trabajo aplicado elementos de probabilidad.pdf
```

- **data/**: Archivos de datos originales.
- **graficos/**: Gráficos PNG generados automáticamente para la web.
- **static/**: Archivos CSS y JS para la visualización web.
- **notebooks/**: Jupyter notebooks para exploración y reporte.
- **src/**: Código fuente modular.
- **main.py**: Script principal para ejecutar el pipeline completo.
- **reporte_web_coltefinanciera.html**: Dashboard web interactivo.
- **Informe_analisis_satisfaccion_Coltefinanciera.md**: Informe profesional en Markdown.
- **requirements.txt**: Dependencias del proyecto.
- **README.md**: Documentación y guía de uso.

---

## requirements.txt

```
pandas
numpy
matplotlib
seaborn
scipy
jupyter
openpyxl
wordcloud
```

---

## Uso rápido

1. Instala dependencias:
   ```powershell
   python -m pip install -r requirements.txt
   ```
2. Ejecuta el análisis completo y genera los gráficos/tablas:
   ```powershell
   python main.py
   ```
3. Visualiza el dashboard web:
   ```powershell
   python -m http.server 8000
   # Luego abre http://localhost:8000/reporte_web_coltefinanciera.html en tu navegador
   ```
4. O explora el notebook en `notebooks/analisis_exploratorio.ipynb`.

---

## Notas
- Los gráficos y tablas se integran automáticamente en la web usando los scripts de la carpeta `static/`.
- Puedes personalizar el CSS y JS para adaptar la visualización a tus necesidades.
- El informe en Markdown puede exportarse a PDF/Word para entregables formales.
