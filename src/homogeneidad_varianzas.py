def verificar_homogeneidad_varianzas(data, variable_grupo, variable_numerica, alpha=0.05):
    """
    Verifica la homogeneidad de varianzas entre grupos usando la prueba de Levene.
    
    Parameters
    ----------
    data : pandas.DataFrame
        DataFrame que contiene los datos
    variable_grupo : str
        Nombre de la columna categórica que define los grupos
    variable_numerica : str
        Nombre de la columna numérica para verificar homogeneidad
    alpha : float, optional
        Nivel de significancia, por defecto 0.05
    
    Returns
    -------
    dict
        Resultados de la prueba incluyendo estadístico, p-valor y conclusión
    """
    # Eliminar filas con valores faltantes
    datos_limpios = data[[variable_grupo, variable_numerica]].dropna()
    
    # Verificar si hay suficientes grupos y datos
    grupos = datos_limpios[variable_grupo].unique()
    if len(grupos) < 2:
        return {
            "homogeneidad_varianzas": False,
            "estadistico": None,
            "p_valor": None,
            "conclusion": "Insuficientes grupos para realizar la prueba de homogeneidad",
            "mensaje": "Se necesitan al menos dos grupos diferentes para la prueba"
        }
    
    # Crear lista de datos por grupo
    listas_por_grupo = []
    for grupo in grupos:
        datos_grupo = datos_limpios[datos_limpios[variable_grupo] == grupo][variable_numerica].values
        if len(datos_grupo) > 1:  # Necesitamos al menos 2 observaciones por grupo
            listas_por_grupo.append(datos_grupo)
    
    # Verificar si hay suficientes datos en cada grupo
    if len(listas_por_grupo) < 2 or any(len(lista) < 2 for lista in listas_por_grupo):
        return {
            "homogeneidad_varianzas": False,
            "estadistico": None,
            "p_valor": None,
            "conclusion": "Algunos grupos tienen insuficientes observaciones",
            "mensaje": "Se necesitan al menos 2 observaciones por grupo para la prueba de Levene"
        }
    
    # Realizar prueba de Levene
    try:
        from scipy import stats
        estadistico, p_valor = stats.levene(*listas_por_grupo)
        
        # Interpretar resultado
        if p_valor < alpha:
            conclusion = "Las varianzas son heterogéneas (p={:.4f} < {:.4f})".format(p_valor, alpha)
            homogeneidad = False
        else:
            conclusion = "Las varianzas son homogéneas (p={:.4f} >= {:.4f})".format(p_valor, alpha)
            homogeneidad = True
        
        return {
            "homogeneidad_varianzas": homogeneidad,
            "estadistico": estadistico,
            "p_valor": p_valor,
            "conclusion": conclusion
        }
        
    except Exception as e:
        return {
            "homogeneidad_varianzas": False,
            "estadistico": None,
            "p_valor": None,
            "conclusion": "Error al realizar la prueba de homogeneidad: " + str(e),
            "mensaje": "Se recomienda inspeccionar visualmente la dispersión de los datos por grupo"
        }
