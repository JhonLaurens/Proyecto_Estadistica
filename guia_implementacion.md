# Guía de Implementación: Mejoras Estadísticas Mayo 2025

Esta guía proporciona instrucciones detalladas sobre cómo utilizar las nuevas características de análisis estadístico y visualización implementadas en mayo de 2025 para el proyecto "Análisis de Satisfacción Coltefinanciera".

## Contenido

1. [Introducción](#1-introducción)
2. [Análisis de Potencia Estadística](#2-análisis-de-potencia-estadística)
3. [Validación de Supuestos Estadísticos](#3-validación-de-supuestos-estadísticos)
4. [Cálculo e Interpretación de Tamaños de Efecto](#4-cálculo-e-interpretación-de-tamaños-de-efecto)
5. [Visualizaciones Mejoradas](#5-visualizaciones-mejoradas)
6. [Casos Prácticos](#6-casos-prácticos)
7. [Resolución de Problemas](#7-resolución-de-problemas)

## 1. Introducción

Las mejoras implementadas en mayo de 2025 fortalecen el rigor estadístico del análisis de encuestas, añadiendo:

- Análisis de potencia estadística
- Validación automática de supuestos
- Cálculo de tamaños de efecto
- Mejoras en visualizaciones
- Manejo avanzado de errores y casos extremos

Esta guía te ayudará a aprovechar estas nuevas características.

## 2. Análisis de Potencia Estadística

El análisis de potencia te permite determinar si tu muestra es suficiente para detectar efectos estadísticamente significativos.

### 2.1 Uso Básico

```python
from src.analysis_bivariado import calcular_potencia_estadistica

# Calcular potencia dado un tamaño de efecto y tamaños muestrales
resultado = calcular_potencia_estadistica(
    d_cohen=0.5,  # Tamaño del efecto (d de Cohen)
    n1=30,        # Tamaño del grupo 1
    n2=30         # Tamaño del grupo 2
)

print(f"Potencia: {resultado['potencia']}")
print(f"Interpretación: {resultado['interpretacion']}")
print(f"Recomendación: {resultado['recomendacion']}")
```

### 2.2 Interpretación de Resultados

Los resultados del análisis de potencia incluyen:

- **Potencia calculada**: Probabilidad de detectar un efecto si existe (valor entre 0-1)
- **Interpretación**: Calificación cualitativa de la potencia (muy baja, baja, moderada, adecuada)
- **Recomendación**: Sugerencia sobre si aumentar el tamaño de la muestra
- **Tamaño muestral necesario**: Cantidad de observaciones recomendadas por grupo

### 2.3 Integración con Análisis Existentes

Las funciones de análisis bivariado ahora incluyen automáticamente análisis de potencia:

```python
from src.analysis_bivariado import calcular_diferencias_grupos

# El análisis de potencia se incluye automáticamente
resultado = calcular_diferencias_grupos(df, 'SEGMENTO', 'PREGUNTA_1')

# Acceder al análisis de potencia
if 'analisis_potencia' in resultado:
    potencia_info = resultado['analisis_potencia']
    print(f"Potencia: {potencia_info['potencia']}")
    print(f"Recomendación: {potencia_info['recomendacion']}")
```

## 3. Validación de Supuestos Estadísticos

Las pruebas estadísticas requieren que se cumplan ciertos supuestos. Las nuevas funciones verifican estos supuestos automáticamente.

### 3.1 Verificación de Normalidad

```python
from src.analysis_bivariado import verificar_normalidad

# Verificar si una variable tiene distribución normal
resultado = verificar_normalidad(
    data=df,
    columna='EDAD',
    alpha=0.05,  # Nivel de significancia
    plot=True    # Generar QQ-plot
)

print(f"Estadístico Shapiro-Wilk: {resultado['estadistico']}")
print(f"p-valor: {resultado['p_valor']}")
print(f"Conclusión: {resultado['conclusion']}")

# Si plot=True, puedes acceder a la figura
if 'figura' in resultado:
    resultado['figura'].savefig('normalidad_edad.png')
```

### 3.2 Verificación de Homogeneidad de Varianzas

```python
from src.analysis_bivariado import verificar_homogeneidad_varianzas

# Verificar si las varianzas son homogéneas entre grupos
resultado = verificar_homogeneidad_varianzas(
    data=df,
    variable_grupo='SEGMENTO',
    variable_numerica='PREGUNTA_1'
)

print(f"Prueba de Levene - Estadístico: {resultado['estadistico']}")
print(f"p-valor: {resultado['p_valor']}")
print(f"Conclusión: {resultado['conclusion']}")
```

### 3.3 Selección Automática de Pruebas

Las funciones ahora seleccionan automáticamente la prueba estadística adecuada según:

- Tipo de variables (categórica/numérica)
- Cumplimiento de supuestos (normalidad, homogeneidad)
- Tamaño de la muestra

Por ejemplo, `calcular_chi2_contingency` ahora elige automáticamente entre Chi-cuadrado y la prueba exacta de Fisher:

```python
from src.analysis_bivariado import calcular_chi2_contingency

resultado = calcular_chi2_contingency(df, 'SEGMENTO', 'CANAL')
print(f"Prueba utilizada: {resultado['prueba_usada']}")
```

## 4. Cálculo e Interpretación de Tamaños de Efecto

Los tamaños de efecto complementan los p-valores, indicando la magnitud práctica de las diferencias o asociaciones.

### 4.1 Tamaños de Efecto por Tipo de Prueba

Ahora se calculan automáticamente los tamaños de efecto adecuados:

- **Pruebas t / Mann-Whitney**: d de Cohen / r de Rosenthal
- **ANOVA / Kruskal-Wallis**: Eta cuadrado / Epsilon cuadrado
- **Chi-cuadrado / Fisher**: V de Cramer / Coeficiente de contingencia

```python
from src.analysis_bivariado import calcular_diferencias_grupos

# Para comparación de dos grupos
resultado = calcular_diferencias_grupos(df, 'SEGMENTO', 'EDAD')

if 'tamaño_efecto_d' in resultado:
    # Para prueba t
    print(f"d de Cohen: {resultado['tamaño_efecto_d']}")
    print(f"Interpretación: {resultado['interpretacion_efecto']}")
elif 'tamaño_efecto_r' in resultado:
    # Para Mann-Whitney
    print(f"r de Rosenthal: {resultado['tamaño_efecto_r']}")
    print(f"Interpretación: {resultado['interpretacion_efecto']}")
```

### 4.2 Interpretación de Tamaños de Efecto

Las funciones proporcionan automáticamente interpretaciones cualitativas:

- **d de Cohen**: >0.2 (pequeño), >0.5 (moderado), >0.8 (grande)
- **V de Cramer**: >0.1 (pequeño), >0.3 (moderado), >0.5 (grande)
- **Eta cuadrado**: >0.01 (pequeño), >0.06 (moderado), >0.14 (grande)

## 5. Visualizaciones Mejoradas

### 5.1 Configuración de Visualizaciones Responsivas

```python
from src.visualizations import configurar_figura_responsiva
import matplotlib.pyplot as plt

# Crear una figura
fig, ax = plt.subplots(figsize=(8, 5))
# ... código para generar el gráfico ...

# Configurar para diferentes formatos
fig = configurar_figura_responsiva(fig, format_target="web")
# Opciones: "web", "mobile", "pdf"
```

### 5.2 Paletas de Colores Accesibles

```python
from src.visualizations import generar_paleta_colores

# Generar paleta corporativa accesible
colores = generar_paleta_colores(
    n_colores=6,               # Número de colores necesarios
    tipo_paleta="corporativa", # Opciones: "corporativa", "secuencial", "divergente"
    accesible=True             # Optimizado para accesibilidad
)

# Usar en gráficos
plt.figure(figsize=(8, 5))
plt.bar(categorias, valores, color=colores)
```

### 5.3 Gráficos con Intervalos de Confianza

```python
from src.visualizations import graficar_barras_con_ic

graficar_barras_con_ic(
    data=df,                    # DataFrame
    variable_grupo='SEGMENTO',  # Variable categórica
    variable_valor='PREGUNTA_1',# Variable numérica
    titulo='Satisfacción por Segmento',
    nivel_confianza=0.95        # Nivel de confianza para los ICs
)
```

### 5.4 Conversión a Visualizaciones Interactivas

```python
from src.visualizations import convertir_a_plotly
import matplotlib.pyplot as plt

# Crear figura en matplotlib
fig, ax = plt.subplots(figsize=(8, 5))
# ... código para generar el gráfico ...

# Convertir a Plotly para interactividad web
fig_plotly = convertir_a_plotly(fig, tipo_grafico="barras")

# Guardar como HTML interactivo
fig_plotly.write_html("grafico_interactivo.html")
```

## 6. Casos Prácticos

### 6.1 Análisis Completo con Nuevas Características

```python
import pandas as pd
import matplotlib.pyplot as plt
from src.data_loader import load_data
from src.data_cleaner import clean_data
from src.analysis_bivariado import (
    bivariado_cat_cat, 
    bivariado_cat_num,
    calcular_diferencias_grupos
)

# 1. Cargar y limpiar datos
df = load_data('Base encuesta de satisfacción.csv')
df = clean_data(df)

# 2. Análisis bivariado categórica-categórica con prueba automática
bivariado_cat_cat(
    df, 
    'SEGMENTO', 
    'CANAL', 
    title='Relación entre Segmento y Canal Preferido',
    export_png_dir='graficos'
)

# 3. Análisis bivariado categórica-numérica con validación de supuestos
bivariado_cat_num(
    df, 
    'SEGMENTO', 
    'PREGUNTA_1', 
    title='Satisfacción por Segmento',
    export_png_dir='graficos',
    incluir_estadisticas=True  # Incluye pruebas estadísticas
)

# 4. Análisis específico con cálculo de potencia
resultados = calcular_diferencias_grupos(
    df, 
    'SEGMENTO', 
    'PREGUNTA_1',
    alpha=0.05,
    calcular_potencia=True
)

# Imprimir resultados detallados
print(f"Prueba utilizada: {resultados['prueba']}")
print(f"p-valor: {resultados['p_valor']:.4f}")
print(f"Diferencia significativa: {resultados['diferencia_significativa']}")

if 'tamaño_efecto_d' in resultados:
    print(f"Tamaño del efecto (d de Cohen): {resultados['tamaño_efecto_d']:.2f}")
    print(f"Interpretación: {resultados['interpretacion_efecto']}")

if 'analisis_potencia' in resultados:
    print(f"Potencia estadística: {resultados['analisis_potencia']['potencia']:.2f}")
    print(f"Interpretación: {resultados['analisis_potencia']['interpretacion']}")
    print(f"Recomendación: {resultados['analisis_potencia']['recomendacion']}")

# Cerrar todas las figuras
plt.close('all')
```

### 6.2 Manejo de Casos Especiales

```python
# Ejemplo con datos faltantes
df_con_na = df.copy()
df_con_na.loc[df_con_na.index[0:10], 'PREGUNTA_1'] = None

# Las funciones manejan automáticamente los datos faltantes
resultados = calcular_diferencias_grupos(df_con_na, 'SEGMENTO', 'PREGUNTA_1')

# Manejo de muestra pequeña (selección automática de Fisher)
df_pequeno = df.head(15)
resultados = bivariado_cat_cat(df_pequeno, 'SEGMENTO', 'CANAL')
```

## 7. Resolución de Problemas

### 7.1 Problemas Comunes y Soluciones

| Problema | Posible Causa | Solución |
|----------|---------------|----------|
| Error "No se pudo realizar prueba estadística" | Datos insuficientes o todos los valores son iguales | Verificar tamaño de muestra y variabilidad |
| Advertencia sobre baja potencia estadística | Tamaño muestral insuficiente para detectar el efecto | Aumentar tamaño de muestra según recomendación |
| Intervalos de confianza muy amplios | Alta variabilidad o muestra pequeña | Aumentar tamaño muestral o agrupar categorías |
| Error al generar visualizaciones | Incompatibilidad de versiones | Verificar instalación de matplotlib ≥ 3.5.0 y seaborn ≥ 0.12.0 |

### 7.2 Compatibilidad con Versiones Anteriores

Las nuevas funciones son compatibles con scripts existentes, pero para aprovechar todas las mejoras, se recomienda:

1. Actualizar las llamadas a funciones para incluir los nuevos parámetros 
2. Revisar los valores de retorno, que ahora incluyen información adicional
3. Utilizar `calcular_potencia_estadistica()` antes de realizar análisis con muestras pequeñas

---

Para más información, consulta los siguientes documentos:
- [Documentación de Potencia Estadística](docs_potencia_estadistica.md)
- [Documentación de Visualizaciones Optimizadas](docs_visualizaciones_optimizadas.md)
- [Metodologías Estadísticas](docs_metodologias_estadisticas.md)

*Guía preparada por el Equipo de Estadística Coltefinanciera - Mayo 2025*
