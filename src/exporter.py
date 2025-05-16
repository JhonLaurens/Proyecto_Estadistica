import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import os

def export_table_to_excel(df, sheet_name, excel_path):
    """Exporta un DataFrame a una hoja de Excel, reemplazando si ya existe."""
    # Si el archivo existe, usa append y if_sheet_exists=replace; si no, crea nuevo
    if os.path.exists(excel_path):
        with pd.ExcelWriter(excel_path, mode='a', if_sheet_exists='replace') as writer:
            df.to_excel(writer, sheet_name=sheet_name)
    else:
        with pd.ExcelWriter(excel_path, mode='w') as writer:
            df.to_excel(writer, sheet_name=sheet_name)

# NUEVO: Manejo de figuras para PDF
_figures_to_export = []

def add_figure_for_pdf(fig):
    """Agrega una figura a la lista para exportar al PDF al final."""
    _figures_to_export.append(fig)

def export_all_figures_to_pdf(pdf_path):
    """Guarda todas las figuras acumuladas en un solo PDF."""
    if not _figures_to_export:
        print("No hay figuras para exportar al PDF.")
        return
    with PdfPages(pdf_path) as pdf:
        for fig in _figures_to_export:
            pdf.savefig(fig)
    _figures_to_export.clear()

def save_plot_to_png(fig, path):
    fig.savefig(path, bbox_inches='tight')
