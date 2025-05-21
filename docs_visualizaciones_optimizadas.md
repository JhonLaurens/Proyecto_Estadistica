# Optimizaciones de Visualización y Renderizado Web

Este documento técnico describe las mejoras implementadas en el sistema de visualización del proyecto "Análisis de Satisfacción Coltefinanciera" para optimizar el renderizado responsivo de gráficos tanto en informes PDF como en aplicaciones web.

## Resumen Ejecutivo

Las optimizaciones de visualización implementadas en Mayo 2025 abarcan mejoras en los siguientes aspectos:

1. **Renderizado responsivo de gráficos** para adaptación a diferentes tamaños de pantalla
2. **Optimización de paletas de colores** para accesibilidad visual  
3. **Mejora en la exportación a formatos web interactivos** con Plotly
4. **Visualizaciones estadísticas avanzadas** con incorporación de intervalos de confianza

## 1. Renderizado Responsivo de Gráficos

### 1.1 Adaptación a Diferentes Dispositivos

Se implementó un sistema de renderizado adaptativo que:

- Optimiza el tamaño de fuentes y elementos gráficos según la resolución objetivo
- Reorganiza leyendas y elementos textuales para aprovechar el espacio disponible
- Aplica reglas de escalado inteligente para preservar la legibilidad

### 1.2 Implementación Técnica

```python
def configurar_figura_responsiva(fig, format_target="web"):
    """
    Configura una figura de matplotlib para visualización responsiva.
    
    Parameters
    ----------
    fig : matplotlib.figure.Figure
        La figura a configurar
    format_target : str
        El formato objetivo ('web', 'pdf', 'mobile')
    
    Returns
    -------
    matplotlib.figure.Figure
        La figura configurada
    """
    if format_target == "web":
        # Configuración para web
        fig.set_dpi(100)
        plt.rcParams.update({
            'font.size': 12,
            'axes.titlesize': 14,
            'axes.labelsize': 12,
            'xtick.labelsize': 10,
            'ytick.labelsize': 10,
            'legend.fontsize': 10
        })
    elif format_target == "mobile":
        # Configuración para móviles
        fig.set_dpi(120)
        plt.rcParams.update({
            'font.size': 10,
            'axes.titlesize': 12,
            'axes.labelsize': 10,
            'xtick.labelsize': 8,
            'ytick.labelsize': 8,
            'legend.fontsize': 8
        })
    else:  # PDF u otros
        # Configuración para PDF
        fig.set_dpi(300)
        plt.rcParams.update({
            'font.size': 11,
            'axes.titlesize': 13,
            'axes.labelsize': 11,
            'xtick.labelsize': 9,
            'ytick.labelsize': 9,
            'legend.fontsize': 9
        })
    
    return fig
```

## 2. Optimización de Paletas de Colores

### 2.1 Accesibilidad Visual

Se implementaron paletas de colores optimizadas para:

- Personas con deficiencias visuales de color (deuteranopía, protanopía, tritanopía)
- Alto contraste para mejor legibilidad
- Consistencia visual con la identidad corporativa de Coltefinanciera

### 2.2 Implementación de Paletas Personalizadas

```python
def generar_paleta_colores(n_colores=8, tipo_paleta="corporativa", accesible=True):
    """
    Genera una paleta de colores adaptada a las necesidades del proyecto.
    
    Parameters
    ----------
    n_colores : int
        Número de colores necesarios
    tipo_paleta : str
        Tipo de paleta: 'corporativa', 'secuencial', 'divergente'
    accesible : bool
        Si debe optimizarse para accesibilidad visual
    
    Returns
    -------
    list
        Lista de colores en formato hexadecimal
    """
    if tipo_paleta == "corporativa":
        # Paleta corporativa Coltefinanciera
        colores_base = ['#003B5C', '#0072CE', '#64A70B', '#FFC72C', '#EF3E42', 
                         '#A2AAAD', '#707372', '#46166B']
        if accesible:
            # Versión optimizada para accesibilidad
            colores_base = ['#003B5C', '#0091EA', '#76B947', '#FFD54F', '#FF6659', 
                            '#BDBDBD', '#757575', '#6A1B9A']
    elif tipo_paleta == "secuencial":
        # Paletas secuenciales desde ColorBrewer
        if accesible:
            colores_base = sns.color_palette("crest", n_colors=n_colores).as_hex()
        else:
            colores_base = sns.color_palette("Blues", n_colors=n_colores).as_hex()
    else:  # divergente
        if accesible:
            colores_base = sns.color_palette("vlag", n_colors=n_colores).as_hex()
        else:
            colores_base = sns.color_palette("RdBu_r", n_colors=n_colores).as_hex()
    
    # Asegurarse de que hay suficientes colores
    if len(colores_base) < n_colores:
        colores_base = colores_base + colores_base  # Duplicar paleta si es necesario
    
    return colores_base[:n_colores]
```

## 3. Visualizaciones Estadísticas con Intervalos de Confianza

### 3.1 Implementación de Barras de Error y Bandas de Confianza

Las visualizaciones estadísticas ahora incluyen:

- Intervalos de confianza para medias y proporciones
- Bandas de error para visualizar la incertidumbre estadística
- Visualización explícita del tamaño muestral

### 3.2 Función para Cálculo y Visualización de Intervalos de Confianza

```python
def calcular_intervalo_confianza(datos, tipo="media", nivel_confianza=0.95):
    """
    Calcula intervalos de confianza para diferentes estadísticos.
    
    Parameters
    ----------
    datos : array-like
        Datos para calcular el intervalo
    tipo : str
        Tipo de estadístico: 'media', 'proporcion' o 'mediana'
    nivel_confianza : float
        Nivel de confianza (0-1)
    
    Returns
    -------
    tuple
        (valor_central, límite_inferior, límite_superior)
    """
    import numpy as np
    from scipy import stats
    
    datos = np.array(datos)
    datos = datos[~np.isnan(datos)]
    
    if len(datos) == 0:
        return np.nan, np.nan, np.nan
    
    alpha = 1 - nivel_confianza
    
    if tipo == "media":
        # Intervalo de confianza para la media
        media = np.mean(datos)
        se = stats.sem(datos)
        h = se * stats.t.ppf((1 + nivel_confianza) / 2, len(datos)-1)
        return media, media - h, media + h
    
    elif tipo == "proporcion":
        # Intervalo de confianza para una proporción
        p = np.mean(datos)
        n = len(datos)
        z = stats.norm.ppf((1 + nivel_confianza) / 2)
        
        # Método de Wilson
        denom = 1 + z**2/n
        centro = (p + z**2/(2*n))/denom
        error = z/denom * np.sqrt(p*(1-p)/n + z**2/(4*n**2))
        
        return p, centro - error, centro + error
    
    elif tipo == "mediana":
        # Intervalo de confianza para la mediana
        mediana = np.median(datos)
        n = len(datos)
        
        # Método basado en rangos
        j = int(n/2 - 1.96*np.sqrt(n)/2)
        k = int(n/2 + 1 + 1.96*np.sqrt(n)/2)
        
        if j < 0:
            j = 0
        if k >= n:
            k = n - 1
            
        datos_ordenados = np.sort(datos)
        lim_inf = datos_ordenados[j]
        lim_sup = datos_ordenados[k]
        
        return mediana, lim_inf, lim_sup
    
    else:
        raise ValueError(f"Tipo de intervalo no reconocido: {tipo}")
```

## 4. Optimización para Web con Plotly

### 4.1 Conversión de Visualizaciones Estáticas a Interactivas

Se implementó un sistema de conversión automática de gráficos matplotlib a versiones interactivas en Plotly, optimizadas para web.

### 4.2 Implementación de Conversión a Plotly

```python
def convertir_a_plotly(fig_matplotlib, tipo_grafico="barras"):
    """
    Convierte una figura de matplotlib a una figura interactiva de Plotly.
    
    Parameters
    ----------
    fig_matplotlib : matplotlib.figure.Figure
        Figura de matplotlib a convertir
    tipo_grafico : str
        Tipo de gráfico para optimizar la conversión: 'barras', 'lineas', 
        'dispersion', 'boxplot'
    
    Returns
    -------
    plotly.graph_objects.Figure
        Figura interactiva de Plotly
    """
    import plotly.graph_objects as go
    import plotly.io as pio
    
    # Configurar tema por defecto
    pio.templates.default = "plotly_white"
    
    # Extraer datos de la figura matplotlib
    ax = fig_matplotlib.axes[0]
    
    if tipo_grafico == "barras":
        # Extraer datos de un gráfico de barras
        plotly_fig = go.Figure()
        
        for i, patch in enumerate(ax.patches):
            height = patch.get_height()
            width = patch.get_width()
            x = patch.get_x()
            y = patch.get_y()
            
            # Determinar si es horizontal o vertical
            if height > width:  # Barras verticales
                plotly_fig.add_trace(go.Bar(
                    x=[x + width/2],
                    y=[height],
                    width=width,
                    marker_color=patch.get_facecolor(),
                    showlegend=False
                ))
            else:  # Barras horizontales
                plotly_fig.add_trace(go.Bar(
                    y=[y + height/2],
                    x=[width],
                    orientation='h',
                    marker_color=patch.get_facecolor(),
                    showlegend=False
                ))
                
        # Añadir títulos y etiquetas
        plotly_fig.update_layout(
            title=ax.get_title(),
            xaxis_title=ax.get_xlabel(),
            yaxis_title=ax.get_ylabel(),
            template="plotly_white",
            margin=dict(l=50, r=50, t=80, b=50),
        )
    
    elif tipo_grafico == "boxplot":
        # Conversión de boxplot
        # [código específico para boxplot]
        pass
    
    # Configuración común para todos los tipos de gráficos
    plotly_fig.update_layout(
        font=dict(family="Arial, sans-serif", size=12),
        hoverlabel=dict(font_size=12, font_family="Arial, sans-serif"),
        template="plotly_white",
        plot_bgcolor='rgba(0,0,0,0)',
        margin=dict(l=50, r=50, t=80, b=50)
    )
    
    return plotly_fig
```

## 5. Recomendaciones para Implementación

Para garantizar visualizaciones óptimas en todos los formatos:

1. Utilizar siempre la función `configurar_figura_responsiva()` al crear nuevos gráficos
2. Validar la accesibilidad de las visualizaciones con herramientas como Colorblindly
3. Priorizar la representación de la incertidumbre estadística en todos los gráficos
4. Para entornos web, convertir los gráficos a formato interactivo Plotly
5. Mantener coherencia en el estilo visual entre formatos estáticos e interactivos

## 6. Recursos Adicionales

- [Galería de visualizaciones interactivas](https://plotly.com/python/)
- [Guía de accesibilidad para visualizaciones](https://www.w3.org/WAI/tutorials/)
- [Calculadora de tamaños de efecto y potencia](https://www.statmethods.net/stats/power.html)

## 7. Próximas Mejoras Planificadas

- Implementación de temas de visualización personalizados según el perfil del usuario
- Mejora en la generación de informes automáticos con templates dinámicos
- Desarrollo de un panel de control interactivo para explorar resultados
- Integración con herramientas de inteligencia artificial para detección automática de patrones

---

*Documentación preparada por el Equipo de Estadística Coltefinanciera - Mayo 2025*
