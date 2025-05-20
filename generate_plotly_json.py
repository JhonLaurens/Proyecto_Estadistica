# generate_plotly_json.py
# Script para generar archivos JSON compatibles con Plotly a partir
# de los datos existentes en el directorio data/

import os
import json
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np

# Configuración de rutas
DATA_DIR = 'data'
OUTPUT_DIR = 'data'
PLOTLY_PREFIX = 'plotly_'

# Asegurar que el directorio de salida existe
os.makedirs(OUTPUT_DIR, exist_ok=True)

def save_plotly_json(fig, filename):
    """Guarda una figura de Plotly como JSON"""
    filepath = os.path.join(OUTPUT_DIR, f"{PLOTLY_PREFIX}{filename}")
    
    # Convertir la figura a JSON
    fig_json = fig.to_json()
    
    # Guardar el JSON en un archivo
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fig_json)
    
    print(f"✅ Guardado: {filepath}")

def convert_json_table_to_plotly(json_filename, chart_type="bar", title="", xaxis_title="", yaxis_title=""):
    """Convierte una tabla JSON a un gráfico de Plotly"""
    try:
        # Cargar datos JSON
        json_path = os.path.join(DATA_DIR, json_filename)
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Convertir a DataFrame
        df = pd.DataFrame(data)
        
        # Determinar las columnas
        if len(df.columns) >= 2:
            x_col = df.columns[0]
            y_col = df.columns[1]
        else:
            raise ValueError(f"El archivo {json_filename} no tiene suficientes columnas")
        
        # Crear la figura de Plotly según el tipo solicitado
        if chart_type == "bar":
            fig = px.bar(
                df, 
                x=x_col, 
                y=y_col, 
                title=title or f"Gráfico de barras - {json_filename}",
                labels={x_col: xaxis_title or x_col, y_col: yaxis_title or y_col}
            )
        elif chart_type == "pie":
            fig = px.pie(
                df, 
                names=x_col, 
                values=y_col, 
                title=title or f"Gráfico circular - {json_filename}"
            )
        elif chart_type == "scatter":
            fig = px.scatter(
                df, 
                x=x_col, 
                y=y_col, 
                title=title or f"Gráfico de dispersión - {json_filename}",
                labels={x_col: xaxis_title or x_col, y_col: yaxis_title or y_col}
            )
        else:
            raise ValueError(f"Tipo de gráfico no soportado: {chart_type}")
        
        # Configurar tema y layout
        fig.update_layout(
            template="plotly_white",
            margin=dict(l=50, r=50, t=80, b=50),
        )
        
        # Guardar como JSON para Plotly
        output_filename = os.path.splitext(json_filename)[0] + '.json'
        save_plotly_json(fig, output_filename)
        
        return True
    
    except Exception as e:
        print(f"❌ Error al procesar {json_filename}: {str(e)}")
        return False

def generate_wordcloud_plotly(json_filename):
    """Genera un gráfico de barras horizontal para palabras clave"""
    try:
        # Cargar datos JSON
        json_path = os.path.join(DATA_DIR, json_filename)
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Convertir a DataFrame
        df = pd.DataFrame(data)
        
        # Limitar a las 30 palabras más frecuentes
        df = df.head(30)
        
        # Ordenar por frecuencia (de mayor a menor)
        df = df.sort_values(by=df.columns[1], ascending=True)
        
        # Crear gráfico de barras horizontal
        fig = px.bar(
            df, 
            y=df.columns[0], 
            x=df.columns[1], 
            orientation='h',
            title="Palabras más frecuentes en comentarios",
            labels={df.columns[0]: "Palabra", df.columns[1]: "Frecuencia"}
        )
        
        fig.update_layout(
            template="plotly_white",
            margin=dict(l=50, r=50, t=80, b=50),
            yaxis={'categoryorder':'total ascending'},
            autosize=True,
            height=800  # Hacer más alto para mostrar todas las palabras
        )
        
        # Guardar como JSON para Plotly
        output_filename = "wordcloud.json"
        save_plotly_json(fig, output_filename)
        
        return True
    
    except Exception as e:
        print(f"❌ Error al procesar la nube de palabras {json_filename}: {str(e)}")
        return False

def process_inference_json(json_filename):
    """Procesa un archivo JSON de inferencia y crea gráficos de Plotly"""
    try:
        # Cargar datos JSON
        json_path = os.path.join(DATA_DIR, json_filename)
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extraer resultados
        resultados = data.get("resultados", {})
        
        # 1. Crear gráfico de barras para medias por grupo
        if "medias_por_grupo" in resultados:
            medias = resultados["medias_por_grupo"]
            df_medias = pd.DataFrame({
                "Grupo": list(medias.keys()),
                "Media": list(medias.values())
            })
            
            fig_means = px.bar(
                df_medias,
                x="Grupo",
                y="Media",
                title=f"Comparación de medias - {data.get('titulo', '')}",
                color="Grupo"
            )
            
            fig_means.update_layout(
                template="plotly_white",
                margin=dict(l=50, r=50, t=80, b=50)
            )
            
            # Añadir valor p
            if "p_value" in resultados:
                p_value = resultados["p_value"]
                p_text = f"Valor p: {p_value:.4f}"
                sig_text = "Diferencia significativa" if p_value < 0.05 else "No hay diferencia significativa"
                
                fig_means.add_annotation(
                    text=f"{p_text}<br>{sig_text}",
                    x=0.5,
                    y=1.05,
                    xref="paper",
                    yref="paper",
                    showarrow=False,
                    font=dict(size=12)
                )
            
            save_plotly_json(fig_means, f"inferencia_means_{os.path.splitext(json_filename)[0]}.json")
        
        # 2. Crear boxplot para distribución por grupo
        if "datos_por_grupo" in resultados:
            datos_grupos = resultados["datos_por_grupo"]
            df_box = pd.DataFrame()
            
            for grupo, valores in datos_grupos.items():
                df_temp = pd.DataFrame({
                    "Grupo": [grupo] * len(valores),
                    "Valor": valores
                })
                df_box = pd.concat([df_box, df_temp])
            
            fig_box = px.box(
                df_box,
                x="Grupo",
                y="Valor",
                title=f"Distribución por grupo - {data.get('titulo', '')}",
                color="Grupo"
            )
            
            fig_box.update_layout(
                template="plotly_white",
                margin=dict(l=50, r=50, t=80, b=50)
            )
            
            save_plotly_json(fig_box, f"inferencia_box_{os.path.splitext(json_filename)[0]}.json")
        
        return True
    
    except Exception as e:
        print(f"❌ Error al procesar inferencia {json_filename}: {str(e)}")
        return False

def main():
    """Función principal para generar todos los archivos JSON de Plotly"""
    print("🚀 Iniciando generación de archivos JSON para Plotly...")
    
    # 1. Procesar tablas simples (gráficos de barras)
    tabla_files = [f for f in os.listdir(DATA_DIR) if f.startswith("tabla_") and f.endswith(".json")]
    
    for json_file in tabla_files:
        if "PREGUNTA" in json_file:
            # Para preguntas usar gráfico de barras
            convert_json_table_to_plotly(
                json_file, 
                chart_type="bar", 
                title=f"Distribución de {json_file.replace('tabla_', '').replace('.json', '')}",
                yaxis_title="Cantidad"
            )
        elif "SEGMENTO" in json_file:
            # Para segmento usar gráfico de pie
            convert_json_table_to_plotly(
                json_file, 
                chart_type="pie", 
                title=f"Distribución por {json_file.replace('tabla_', '').replace('.json', '')}"
            )
        elif "GENERO" in json_file or "ESTRATO" in json_file:
            # Para género y estrato usar gráfico de pie
            convert_json_table_to_plotly(
                json_file, 
                chart_type="pie", 
                title=f"Distribución por {json_file.replace('tabla_', '').replace('.json', '')}"
            )
        else:
            # Para el resto usar gráfico de barras
            convert_json_table_to_plotly(
                json_file, 
                chart_type="bar", 
                title=f"Distribución de {json_file.replace('tabla_', '').replace('.json', '')}",
                yaxis_title="Cantidad"
            )
    
    # 2. Procesar nube de palabras
    wordcloud_files = [f for f in os.listdir(DATA_DIR) if f.startswith("tabla_wordcloud_") and f.endswith(".json")]
    for wc_file in wordcloud_files:
        generate_wordcloud_plotly(wc_file)
    
    # 3. Procesar archivos de inferencia
    inference_files = [f for f in os.listdir(DATA_DIR) if f.startswith("inferencia_") and f.endswith(".json")]
    for inf_file in inference_files:
        process_inference_json(inf_file)
    
    print("✅ Proceso completado!")

if __name__ == "__main__":
    main()
