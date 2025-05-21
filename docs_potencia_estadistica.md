# Análisis de Potencia Estadística y Mejoras en la Interpretación

Este documento complementa las documentaciones existentes y proporciona detalles sobre las nuevas características de análisis de potencia estadística, cálculo de tamaños de efecto e interpretación de resultados implementadas en mayo de 2025.

## 1. Análisis de Potencia Estadística

### 1.1 Fundamentos del Análisis de Potencia

El análisis de potencia estadística determina la probabilidad de que una prueba estadística detecte un efecto si este realmente existe. En otras palabras, es la probabilidad de rechazar correctamente una hipótesis nula falsa (evitar el error Tipo II).

Los componentes clave del análisis de potencia incluyen:
- Tamaño del efecto: magnitud de la diferencia o relación que se desea detectar
- Nivel de significancia (α): probabilidad de error Tipo I (rechazar erróneamente H₀)
- Tamaño muestral: número de observaciones
- Potencia (1-β): probabilidad de rechazar H₀ cuando es falsa

### 1.2 Implementación para Pruebas t y ANOVA

La función `calcular_potencia_estadistica()` proporciona:
- Cálculo de potencia dado un tamaño de efecto (d de Cohen) y tamaños muestrales
- Interpretación automática de la potencia obtenida
- Recomendaciones para tamaños muestrales necesarios
- Visualización opcional de curvas de potencia

### 1.3 Criterios de Interpretación

| Potencia    | Interpretación       | Recomendación                                           |
|-------------|----------------------|---------------------------------------------------------|
| < 0.50      | Muy baja             | Aumentar considerablemente el tamaño muestral           |
| 0.50 - 0.80 | Insuficiente         | Aumentar el tamaño muestral para alcanzar potencia 0.8  |
| > 0.80      | Adecuada             | Tamaño muestral suficiente                              |

## 2. Mejoras en el Cálculo e Interpretación de Tamaños de Efecto

### 2.1 Tamaños de Efecto para Variables Categóricas

La implementación mejorada de `calcular_chi2_contingency()` ahora incluye:
- Cálculo automático del coeficiente V de Cramer
- Interpretación según las convenciones de Cohen:
  - V < 0.1: efecto insignificante
  - 0.1 ≤ V < 0.3: efecto pequeño
  - 0.3 ≤ V < 0.5: efecto medio
  - V ≥ 0.5: efecto grande

### 2.2 Tamaños de Efecto para Comparación de Grupos

Para comparaciones entre dos grupos (t-test o Mann-Whitney U):
- d de Cohen para pruebas paramétricas
- r para pruebas no paramétricas

Para comparaciones entre más de dos grupos (ANOVA o Kruskal-Wallis):
- Eta-cuadrado (η²) para efecto global
- d de Cohen para comparaciones post-hoc por pares

### 2.3 Interpretación de Tamaños de Efecto

| Medida         | Pequeño | Medio | Grande |
|----------------|---------|-------|--------|
| d de Cohen     | 0.2     | 0.5   | 0.8    |
| r              | 0.1     | 0.3   | 0.5    |
| η²             | 0.01    | 0.06  | 0.14   |
| V de Cramer    | 0.1     | 0.3   | 0.5    |

## 3. Visualizaciones Mejoradas

### 3.1 Gráficos Combinados

Las nuevas funciones de visualización permiten combinar múltiples elementos en un único gráfico:
- Boxplots con swarmplots superpuestos para mostrar la distribución real de los datos
- Gráficos de barras con intervalos de confianza del 95%
- Anotaciones estadísticas automáticas (p-valores, tamaños de efecto)

### 3.2 Resultados en Formato JSON para Visualización Web

La exportación JSON mejorada incluye:
- Resultados de pruebas estadísticas con interpretaciones
- Información sobre tamaños de efecto
- Resultados de análisis de potencia
- Metadatos para recrear visualizaciones interactivas con Plotly

## 4. Ejemplo de Uso

### 4.1 Comparación entre Dos Grupos con Análisis Completo

```python
# Ejemplo de uso del módulo mejorado
from src.analysis_bivariado import calcular_diferencias_grupos

resultado = calcular_diferencias_grupos(
    data=df, 
    var_categorica='SEGMENTO',
    var_numerica='PREGUNTA_1',
    export_png=True,
    plot_style='enhanced'  # Usa el nuevo estilo mejorado de visualización
)

# El resultado incluye información completa
print(f"Prueba utilizada: {resultado['prueba']}")
print(f"p-valor: {resultado['p_valor']:.4f}")
print(f"Tamaño del efecto: {resultado['tamano_efecto']:.3f} ({resultado['interpretacion_efecto']})")
print(f"Potencia estadística: {resultado['potencia']:.3f} ({resultado['interpretacion_potencia']})")
```

## 5. Referencias

1. Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.
2. Fritz, C. O., Morris, P. E., & Richler, J. J. (2012). Effect size estimates: Current use, calculations, and interpretation. Journal of Experimental Psychology: General, 141(1), 2-18.
3. Lakens, D. (2013). Calculating and reporting effect sizes to facilitate cumulative science: a practical primer for t-tests and ANOVAs. Frontiers in psychology, 4, 863.
4. Faul, F., Erdfelder, E., Lang, A.-G., & Buchner, A. (2007). G*Power 3: A flexible statistical power analysis program for the social, behavioral, and biomedical sciences. Behavior Research Methods, 39, 175-191.
