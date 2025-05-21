# Metodologías Estadísticas Implementadas en el Proyecto de Análisis de Satisfacción

Este documento detalla las metodologías estadísticas implementadas en el sistema de análisis de satisfacción, con énfasis en los procedimientos de validación estadística, pruebas de hipótesis y cálculo de tamaños de efecto.

## 1. Validación de Supuestos Estadísticos

### 1.1 Prueba de Normalidad (Shapiro-Wilk)

La prueba de Shapiro-Wilk se utiliza para verificar si una muestra proviene de una población con distribución normal. Esta implementación:

- Calcula el estadístico W de Shapiro-Wilk y su p-valor asociado
- Interpreta automáticamente el resultado según el nivel de significancia (α)
- Proporciona recomendaciones sobre el uso de pruebas paramétricas o no paramétricas

**Implementación en el código:**
```python
def verificar_normalidad(data, columna, alpha=0.05, plot=False):
    # Eliminar valores faltantes
    datos = data[columna].dropna()
    
    # Comprobar que hay suficientes observaciones
    if len(datos) < 3:
        return {
            "es_normal": False,
            "interpretacion": "Insuficientes observaciones para realizar la prueba de normalidad",
            "mensaje": "Se recomienda usar pruebas no paramétricas debido a la cantidad limitada de datos"
        }
    
    # Realizar prueba de Shapiro-Wilk
    estadistico, p_valor = shapiro(datos)
    
    # Interpretar resultado
    es_normal = p_valor > alpha
    
    resultado = {
        "estadistico": estadistico,
        "p_valor": p_valor,
        "es_normal": es_normal,
        "interpretacion": f"Los datos {'siguen' if es_normal else 'no siguen'} una distribución normal (p={p_valor:.4f})",
        "mensaje": f"{'Se pueden utilizar pruebas paramétricas' if es_normal else 'Se recomienda usar pruebas no paramétricas'}"
    }
    
    # Generar QQ-plot si se solicita
    if plot:
        # Código para generar gráficos QQ-plot
        ...
    
    return resultado
```

### 1.2 Homogeneidad de Varianzas (Prueba de Levene)

La prueba de Levene se utiliza para verificar la homogeneidad de varianzas entre dos o más grupos, un supuesto importante para pruebas como ANOVA y t-Student.

- Calcula el estadístico de Levene y su p-valor asociado
- Determina si las varianzas son homogéneas o heterogéneas
- Influye en la selección de pruebas con o sin corrección para varianzas desiguales

## 2. Pruebas Estadísticas para Análisis Bivariado

### 2.1 Variables Categóricas (Tablas de Contingencia)

#### Prueba Chi-cuadrado de Independencia

Esta prueba determina si existe una relación estadísticamente significativa entre dos variables categóricas.

**Implementación:**
```python
def calcular_chi2_contingency(df, var1, var2, alpha=0.05):
    # Crear tabla de contingencia
    tabla = pd.crosstab(df[var1], df[var2])
    
    # Verificar requisitos mínimos para chi-cuadrado
    frecuencias_esperadas = chi2_contingency(tabla)[3]
    requisito_cumplido = (frecuencias_esperadas >= 5).all()
    
    # Realizar prueba chi-cuadrado
    chi2, p_valor, dof, expected = chi2_contingency(tabla)
    
    # Interpretar resultados
    independientes = p_valor > alpha
    
    # Calcular V de Cramer (tamaño del efecto)
    n = tabla.sum().sum()
    v_cramer = np.sqrt(chi2 / (n * min(tabla.shape[0]-1, tabla.shape[1]-1)))
    
    # Interpretar tamaño del efecto
    if v_cramer < 0.1:
        interpretacion_efecto = "efecto muy pequeño"
    elif v_cramer < 0.3:
        interpretacion_efecto = "efecto pequeño"
    elif v_cramer < 0.5:
        interpretacion_efecto = "efecto moderado"
    else:
        interpretacion_efecto = "efecto grande"
    
    return {
        "estadistico_chi2": chi2,
        "p_valor": p_valor,
        "grados_libertad": dof,
        "requisito_frecuencias_cumplido": requisito_cumplido,
        "interpretacion": f"Las variables {'son independientes' if independientes else 'están relacionadas'} (p={p_valor:.4f})",
        "v_cramer": v_cramer,
        "interpretacion_efecto": f"Tamaño del efecto: V de Cramer = {v_cramer:.3f}, {interpretacion_efecto}"
    }
```

#### Tamaño del Efecto: V de Cramer

La V de Cramer es una medida de asociación entre variables categóricas basada en el estadístico Chi-cuadrado, normalizada para estar en el rango [0, 1]:

- V = √(χ² / (n * min(r-1, c-1)))
  - χ² = estadístico Chi-cuadrado
  - n = tamaño total de la muestra
  - r, c = número de filas y columnas

Interpretación:
- < 0.1: Efecto muy pequeño o insignificante
- 0.1 - 0.3: Efecto pequeño
- 0.3 - 0.5: Efecto moderado
- > 0.5: Efecto grande

### 2.2 Variable Categórica vs. Variable Numérica

#### Selección Automática de Pruebas Estadísticas

El sistema selecciona automáticamente la prueba estadística adecuada basándose en:
1. Normalidad de los datos
2. Homogeneidad de varianzas
3. Número de grupos a comparar

**Pruebas para Dos Grupos:**

| Normalidad | Homogeneidad de Varianzas | Prueba Seleccionada | Tamaño del Efecto |
|------------|---------------------------|---------------------|-------------------|
| Normal     | Homogéneas                | t de Student        | d de Cohen        |
| Normal     | Heterogéneas              | t de Welch          | d de Cohen        |
| No Normal  | (No aplica)               | U de Mann-Whitney   | r                 |

**Pruebas para Tres o Más Grupos:**

| Normalidad | Homogeneidad de Varianzas | Prueba Seleccionada | Tamaño del Efecto |
|------------|---------------------------|---------------------|-------------------|
| Normal     | Homogéneas                | ANOVA               | Eta cuadrado      |
| No Normal o Heterogéneas | (No aplica) | Kruskal-Wallis      | Eta cuadrado      |

#### Tamaños de Efecto Implementados

1. **d de Cohen**  
   Medida estandarizada de la diferencia entre dos medias.
   
   ```
   d = |μ1 - μ2| / s_pooled
   ```
   
   donde s_pooled es la desviación estándar combinada:
   
   ```
   s_pooled = √(((n1-1)*s1² + (n2-1)*s2²) / (n1+n2-2))
   ```
   
   Interpretación:
   - d < 0.2: Efecto insignificante
   - 0.2 ≤ d < 0.5: Efecto pequeño
   - 0.5 ≤ d < 0.8: Efecto moderado
   - d ≥ 0.8: Efecto grande

2. **r (para Mann-Whitney U)**  
   Tamaño del efecto para pruebas no paramétricas de dos grupos:
   
   ```
   r = |Z| / √N
   ```
   
   donde Z es el Z-score derivado del p-valor y N es el tamaño total de la muestra.
   
   Interpretación:
   - r < 0.1: Efecto insignificante
   - 0.1 ≤ r < 0.3: Efecto pequeño
   - 0.3 ≤ r < 0.5: Efecto moderado
   - r ≥ 0.5: Efecto grande

3. **Eta cuadrado (η²)**  
   Proporción de la varianza total atribuible a la variable categórica (factor).
   
   Para ANOVA:
   ```
   η² = SSbetween / SStotal
   ```
   
   Para Kruskal-Wallis (aproximación):
   ```
   η² = (H - k + 1) / (n - k)
   ```
   
   donde H es el estadístico de Kruskal-Wallis, k es el número de grupos, y n es el tamaño total de la muestra.
   
   Interpretación:
   - η² < 0.01: Efecto insignificante
   - 0.01 ≤ η² < 0.06: Efecto pequeño
   - 0.06 ≤ η² < 0.14: Efecto moderado
   - η² ≥ 0.14: Efecto grande

## 3. Análisis Post-hoc

Para comparaciones de más de dos grupos donde se encuentra una diferencia significativa con ANOVA, se implementa el método de Tukey HSD (Honestly Significant Difference) para realizar comparaciones múltiples por pares con control del error de tipo I.

```python
# Ejemplo de implementación para análisis post-hoc
tukey = pairwise_tukeyhsd(df_posthoc['valor'], df_posthoc['grupo'], alpha=alpha)
```

## 4. Presentación de Resultados Estadísticos

Los resultados estadísticos se presentan en múltiples formatos:

1. **Salida en Consola**: Texto detallado con interpretaciones.
2. **Anotaciones en Gráficos**: Información estadística clave en visualizaciones.
3. **Exportación JSON**: Datos detallados para análisis posterior y visualización web.
4. **Tablas Excel**: Resúmenes estadísticos en formato tabular.

## 5. Referencias Bibliográficas

Las implementaciones estadísticas se basan en las siguientes referencias:

1. Cohen, J. (1988). *Statistical power analysis for the behavioral sciences*. Lawrence Erlbaum Associates.
2. Field, A. (2013). *Discovering statistics using IBM SPSS Statistics* (4th ed.). Sage.
3. Wasserman, L. (2004). *All of Statistics: A Concise Course in Statistical Inference*. Springer.
4. Sullivan, G. M., & Feinn, R. (2012). Using Effect Size—or Why the P Value Is Not Enough. *Journal of Graduate Medical Education*, 4(3), 279–282.
5. Tomczak, M., & Tomczak, E. (2014). The need to report effect size estimates revisited. *Trends in Sport Sciences*, 21(1), 19-25.
