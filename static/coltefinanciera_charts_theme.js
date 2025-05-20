// coltefinanciera_charts_theme.js
// Script para manejar temas de gráficos con Plotly

// Tema claro para gráficos Plotly
const lightTheme = {
    paper_bgcolor: '#f9fafb',
    plot_bgcolor: '#f9fafb',
    font: { family: 'Inter, sans-serif', color: '#333333' },
    title: { font: { family: 'Inter, sans-serif', color: '#1e40af' } },
    xaxis: { gridcolor: '#e5e7eb', zerolinecolor: '#e5e7eb', title: { font: { color: '#4b5563' } } },
    yaxis: { gridcolor: '#e5e7eb', zerolinecolor: '#e5e7eb', title: { font: { color: '#4b5563' } } },
    legend: { font: { family: 'Inter, sans-serif', color: '#333333' } },
    colorway: [
        '#3b82f6', '#60a5fa', '#93c5fd', '#1e40af', '#1d4ed8', 
        '#ec4899', '#f43f5e', '#f97316', '#84cc16', '#6366f1'
    ]
};

// Tema oscuro para gráficos Plotly
const darkTheme = {
    paper_bgcolor: '#1f2937',
    plot_bgcolor: '#1f2937',
    font: { family: 'Inter, sans-serif', color: '#e5e7eb' },
    title: { font: { family: 'Inter, sans-serif', color: '#60a5fa' } },
    xaxis: { gridcolor: '#374151', zerolinecolor: '#374151', title: { font: { color: '#9ca3af' } } },
    yaxis: { gridcolor: '#374151', zerolinecolor: '#374151', title: { font: { color: '#9ca3af' } } },
    legend: { font: { family: 'Inter, sans-serif', color: '#e5e7eb' }, bgcolor: 'rgba(31, 41, 55, 0.5)' },
    colorway: [
        '#60a5fa', '#93c5fd', '#bfdbfe', '#3b82f6', '#2563eb', 
        '#f472b6', '#fb7185', '#fb923c', '#a3e635', '#818cf8'
    ]
};

/**
 * Aplica un tema (claro u oscuro) a todos los gráficos Plotly en la página
 * y actualiza otros elementos de la interfaz para mantener la coherencia visual.
 * 
 * @param {string} theme - 'light' o 'dark' para especificar el tema a aplicar
 */
function updateChartsTheme(theme = 'light') {
    console.log(`Aplicando tema ${theme} a todos los gráficos...`);
    
    // Obtener configuración de tema adecuada
    const themeConfig = theme === 'dark' ? darkTheme : lightTheme;
    
    // Actualizar todos los gráficos Plotly
    updatePlotlyCharts(themeConfig);
    
    // Actualizar tablas y otros elementos según el tema
    updateTablasTheme(theme);
    
    // Actualizar elementos de la interfaz
    updateInterfaceElements(theme);
    
    console.log(`✅ Tema ${theme} aplicado correctamente`);
}

/**
 * Actualiza el tema de todos los gráficos Plotly en la página
 * 
 * @param {object} themeConfig - Configuración del tema a aplicar
 */
function updatePlotlyCharts(themeConfig) {
    // Buscar todos los elementos que contienen gráficos Plotly
    document.querySelectorAll('[id^="chart_"]').forEach(container => {
        try {
            // Verificar si es un contenedor válido y tiene un gráfico Plotly
            if (container && container.data && container.data[0]) {
                // Actualizar el tema del gráfico
                Plotly.relayout(container.id, {
                    paper_bgcolor: themeConfig.paper_bgcolor,
                    plot_bgcolor: themeConfig.plot_bgcolor,
                    font: themeConfig.font,
                    'title.font': themeConfig.title.font,
                    'xaxis.gridcolor': themeConfig.xaxis.gridcolor,
                    'xaxis.zerolinecolor': themeConfig.xaxis.zerolinecolor,
                    'xaxis.title.font.color': themeConfig.xaxis.title.font.color,
                    'yaxis.gridcolor': themeConfig.yaxis.gridcolor,
                    'yaxis.zerolinecolor': themeConfig.yaxis.zerolinecolor,
                    'yaxis.title.font.color': themeConfig.yaxis.title.font.color,
                    'legend.font': themeConfig.legend.font,
                    'legend.bgcolor': themeConfig.legend.bgcolor
                }).catch(err => {
                    console.warn(`Error al actualizar tema en ${container.id}:`, err);
                });
            }
        } catch (error) {
            console.warn(`Error al procesar el contenedor ${container.id}:`, error);
        }
    });
}

/**
 * Actualiza el tema de las tablas en la página
 * 
 * @param {string} theme - 'light' o 'dark'
 */
function updateTablasTheme(theme) {
    // Actualizar estilo de tablas
    document.querySelectorAll('table').forEach(table => {
        if (theme === 'dark') {
            table.classList.add('table-dark');
            
            // Actualizar colores de texto y fondo en las celdas
            table.querySelectorAll('th, td').forEach(cell => {
                cell.style.backgroundColor = '#1f2937';
                cell.style.color = '#e5e7eb';
                cell.style.borderColor = '#374151';
            });
        } else {
            table.classList.remove('table-dark');
            
            // Restaurar colores predeterminados
            table.querySelectorAll('th, td').forEach(cell => {
                cell.style.backgroundColor = '';
                cell.style.color = '';
                cell.style.borderColor = '';
            });
        }
    });
}

/**
 * Actualiza otros elementos de interfaz según el tema seleccionado
 * 
 * @param {string} theme - 'light' o 'dark'
 */
function updateInterfaceElements(theme) {
    // Actualizar tarjetas, gráficos wordcloud, filtros, etc.
    const isDark = theme === 'dark';
    
    // Actualizar fondo de tarjetas que no sean gráficos
    document.querySelectorAll('.bg-white').forEach(card => {
        if (isDark) {
            card.classList.remove('bg-white');
            card.classList.add('bg-gray-800');
        } else {
            card.classList.remove('bg-gray-800');
            card.classList.add('bg-white');
        }
    });
    
    // Actualizar bordes y sombras
    document.querySelectorAll('.shadow, .shadow-md, .shadow-lg').forEach(element => {
        if (isDark) {
            element.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.24)';
        } else {
            element.style.boxShadow = '';
        }
    });
}

/**
 * Obtiene la configuración actual del tema basada en la clase dark-mode del body
 * 
 * @returns {object} Configuración del tema actual (light o dark)
 */
function getCurrentThemeConfig() {
    return document.body.classList.contains('dark-mode') ? darkTheme : lightTheme;
}

/**
 * Obtiene la paleta de colores según el tema actual
 * 
 * @returns {array} Array de colores hexadecimales para el tema actual
 */
function getThemeColorPalette() {
    return document.body.classList.contains('dark-mode') ? darkTheme.colorway : lightTheme.colorway;
}

// Exportar funciones para uso en otros scripts
window.updateChartsTheme = updateChartsTheme;
window.getCurrentThemeConfig = getCurrentThemeConfig;
window.getThemeColorPalette = getThemeColorPalette;

console.log("✅ Script de temas para gráficos cargado correctamente");
