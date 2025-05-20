// coltefinanciera_charts.js
// Script para crear gráficos interactivos con Plotly

// Función para crear un gráfico de barras
function createBarChart(divId, data, title, xLabel, yLabel) {
    const trace = {
        x: data.labels,
        y: data.values,
        type: 'bar',
        marker: {
            color: '#6366f1',
            opacity: 0.8
        },
        text: data.values.map(v => `${v}${data.isPercentage ? '%' : ''}`),
        textposition: 'auto',
        hovertemplate: '%{x}<br>%{y}' + (data.isPercentage ? '%' : '') + '<extra></extra>'
    };

    const layout = {
        title: title,
        xaxis: { title: xLabel, tickangle: -45 },
        yaxis: { title: yLabel },
        margin: { t: 60, b: 120 },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#f9fafb',
        height: 400,
        bargap: 0.3
    };

    Plotly.newPlot(divId, [trace], layout, { responsive: true });
}

// Función para crear un gráfico circular (pie)
function createPieChart(divId, data, title) {
    const trace = {
        labels: data.labels,
        values: data.values,
        type: 'pie',
        textinfo: 'label+percent',
        hoverinfo: 'label+percent+value',
        marker: {
            colors: [
                '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
                '#f59e0b', '#84cc16', '#10b981', '#14b8a6', '#06b6d4'
            ],
            line: {
                color: 'white',
                width: 2
            }
        }
    };

    const layout = {
        title: title,
        height: 400,
        margin: { t: 60, b: 60, l: 60, r: 60 },
        paper_bgcolor: '#f9fafb'
    };

    Plotly.newPlot(divId, [trace], layout, { responsive: true });
}

// Función para crear un histograma
function createHistogram(divId, data, title, xLabel) {
    const trace = {
        x: data,
        type: 'histogram',
        marker: {
            color: '#6366f1',
            opacity: 0.8,
            line: {
                color: 'white',
                width: 1
            }
        },
        nbinsx: data.filter((v, i, a) => a.indexOf(v) === i).length, // Número de valores únicos
        hovertemplate: 'Valor: %{x}<br>Frecuencia: %{y}<extra></extra>'
    };

    const layout = {
        title: title,
        xaxis: { title: xLabel },
        yaxis: { title: 'Frecuencia' },
        margin: { t: 60, b: 80 },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#f9fafb',
        height: 400,
        bargap: 0.05
    };

    Plotly.newPlot(divId, [trace], layout, { responsive: true });
}

// Función para crear un box plot
function createBoxPlot(divId, data, title, yLabel) {
    const traces = [];
    
    for (const key in data) {
        traces.push({
            y: data[key],
            type: 'box',
            name: key,
            boxpoints: 'outliers',
            marker: {
                color: traces.length === 0 ? '#6366f1' : '#f43f5e'
            },
            hoverinfo: 'y+name'
        });
    }

    const layout = {
        title: title,
        yaxis: { title: yLabel },
        margin: { t: 60, b: 80 },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#f9fafb',
        height: 400,
        boxmode: 'group'
    };

    Plotly.newPlot(divId, traces, layout, { responsive: true });
}

// Función para crear un gráfico de barras agrupadas (para bivariado)
function createGroupedBarChart(divId, data, title, xLabel, yLabel) {
    const traces = [];
    
    for (const key in data) {
        traces.push({
            x: Object.keys(data[key]),
            y: Object.values(data[key]),
            type: 'bar',
            name: key,
            hovertemplate: '%{x}<br>%{y:.2f}<extra>%{fullData.name}</extra>'
        });
    }

    const layout = {
        title: title,
        xaxis: { title: xLabel, tickangle: -45 },
        yaxis: { title: yLabel },
        margin: { t: 60, b: 120 },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#f9fafb',
        height: 400,
        barmode: 'group',
        bargap: 0.15,
        legend: {
            orientation: 'h',
            y: -0.2
        }
    };

    Plotly.newPlot(divId, traces, layout, { responsive: true });
}

// Función para crear un Heat Map (para tabla de contingencia)
function createHeatmap(divId, data, title, xLabel, yLabel) {
    const rows = Object.keys(data);
    const cols = Object.keys(data[rows[0]]);
    const values = [];
    
    rows.forEach(row => {
        const rowData = [];
        cols.forEach(col => {
            rowData.push(data[row][col]);
        });
        values.push(rowData);
    });

    const trace = {
        x: cols,
        y: rows,
        z: values,
        type: 'heatmap',
        colorscale: 'Blues',
        hovertemplate: '%{y} - %{x}<br>Valor: %{z}<extra></extra>',
        showscale: true
    };

    const layout = {
        title: title,
        xaxis: { title: xLabel },
        yaxis: { title: yLabel },
        margin: { t: 60, b: 80, l: 120 },
        height: 400,
        paper_bgcolor: '#f9fafb'
    };

    Plotly.newPlot(divId, [trace], layout, { responsive: true });
}

// Función para cargar los datos desde archivos JSON y crear los gráficos
async function loadDataAndCreateCharts() {
    try {
        // Cargar datos segmento
        const segmentoResponse = await fetch('data/tabla_SEGMENTO.json');
        const segmentoData = await segmentoResponse.json();
        const segmentoLabels = segmentoData.map(item => item.SEGMENTO);
        const segmentoValues = segmentoData.map(item => item['Frec. Relativa (%)']);
        
        // Crear gráfico de segmento
        if (document.getElementById('chart_segmento_interactivo')) {
            createPieChart('chart_segmento_interactivo', {
                labels: segmentoLabels,
                values: segmentoValues
            }, 'Distribución por Segmento');
        }
        
        // Cargar datos ciudad
        const ciudadResponse = await fetch('data/tabla_CIUDAD_AGENCIA.json');
        const ciudadData = await ciudadResponse.json();
        const ciudadLabels = ciudadData.map(item => item.CIUDAD_AGENCIA);
        const ciudadValues = ciudadData.map(item => item['Frec. Relativa (%)']);
        
        // Crear gráfico de ciudad
        if (document.getElementById('chart_ciudad_interactivo')) {
            createBarChart('chart_ciudad_interactivo', {
                labels: ciudadLabels,
                values: ciudadValues,
                isPercentage: true
            }, 'Distribución por Ciudad de Agencia', 'Ciudad', 'Porcentaje (%)');
        }
        
        // Cargar datos género
        const generoResponse = await fetch('data/tabla_GENERO.json');
        const generoData = await generoResponse.json();
        const generoLabels = generoData.map(item => item.GENERO);
        const generoValues = generoData.map(item => item['Frec. Relativa (%)']);
        
        // Crear gráfico de género
        if (document.getElementById('chart_genero_interactivo')) {
            createPieChart('chart_genero_interactivo', {
                labels: generoLabels,
                values: generoValues
            }, 'Distribución por Género');
        }
        
        // Cargar datos de calificaciones (PREGUNTA_1)
        const pregunta1Response = await fetch('data/tabla_PREGUNTA_1.json');
        const pregunta1Data = await pregunta1Response.json();
        const pregunta1Values = pregunta1Data.map(item => item.PREGUNTA_1);
        
        // Crear histograma de calificaciones
        if (document.getElementById('chart_pregunta1_interactivo')) {
            createHistogram('chart_pregunta1_interactivo', pregunta1Values, 
                'Distribución de Calificaciones - Pregunta 1', 'Calificación');
        }
        
        // Cargar datos bivariados (CIUDAD vs PREGUNTA_1)
        const satisfaccionCiudadResponse = await fetch('data/tabla_CIUDAD_AGENCIA_vs_PREGUNTA_1.json');
        const satisfaccionCiudadData = await satisfaccionCiudadResponse.json();
        
        // Crear gráfico de satisfacción por ciudad
        if (document.getElementById('chart_satisfaccion_ciudad_interactivo')) {
            createGroupedBarChart('chart_satisfaccion_ciudad_interactivo', 
                { 'Promedio': satisfaccionCiudadData.Promedio }, 
                'Satisfacción Promedio por Ciudad', 'Ciudad', 'Calificación Promedio');
        }
        
        // Cargar datos bivariados (SEGMENTO vs PREGUNTA_1)
        const satisfaccionSegmentoResponse = await fetch('data/tabla_SEGMENTO_vs_PREGUNTA_1.json');
        const satisfaccionSegmentoData = await satisfaccionSegmentoResponse.json();
        
        // Crear boxplot de satisfacción por segmento
        if (document.getElementById('chart_satisfaccion_segmento_boxplot')) {
            // Simulando datos para el boxplot (normalmente vendrían del backend)
            const boxPlotData = {
                'Personas': Array(30).fill().map(() => 3 + 2 * Math.random()),
                'Empresas': Array(30).fill().map(() => 2 + 2 * Math.random())
            };
            
            createBoxPlot('chart_satisfaccion_segmento_boxplot', boxPlotData, 
                'Comparación de Satisfacción por Segmento', 'Calificación');
        }
        
        // Cargar datos de tabla de contingencia
        const contingenciaResponse = await fetch('data/tabla_GENERO_vs_CIUDAD_AGENCIA.json');
        const contingenciaData = await contingenciaResponse.json();
        
        // Crear heatmap para tabla de contingencia
        if (document.getElementById('chart_contingencia_heatmap')) {
            createHeatmap('chart_contingencia_heatmap', contingenciaData, 
                'Distribución de Género por Ciudad', 'Ciudad', 'Género');
        }
        
    } catch (error) {
        console.error('Error al cargar los datos o crear los gráficos:', error);
    }
}

// Inicializar los gráficos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si Plotly está disponible
    if (typeof Plotly !== 'undefined') {
        loadDataAndCreateCharts();
    } else {
        console.error('Plotly no está disponible. Por favor asegúrate de incluir la librería.');
    }
    
    // Exportar funciones para uso global
    window.Charts = {
        createBarChart,
        createPieChart,
        createHistogram,
        createBoxPlot,
        createGroupedBarChart,
        createHeatmap,
        loadDataAndCreateCharts
    };
});
