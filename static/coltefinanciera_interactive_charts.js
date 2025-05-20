// coltefinanciera_interactive_charts.js
// Script para crear visualizaciones interactivas y animadas con Plotly.js

// --- Configuración global para animaciones ---
const animationConfig = {
    frame: { duration: 800, redraw: true },
    transition: { duration: 500, easing: 'cubic-in-out' }
};

// --- Paleta de colores personalizada para Coltefinanciera ---
const colorsColte = [
    '#3b82f6', '#60a5fa', '#93c5fd', '#1e40af', '#1d4ed8', 
    '#3b82f6', '#ec4899', '#f43f5e', '#f97316', '#84cc16'
];

// Función para crear un gráfico de barras animado
function createAnimatedBarChart(divId, data, title, xLabel, yLabel) {
    // Preparar los datos
    const trace = {
        x: data.labels,
        y: Array(data.labels.length).fill(0), // Iniciar con ceros para animar
        type: 'bar',
        marker: {
            color: colorsColte,
            opacity: 0.8,
            line: {
                color: 'white',
                width: 1.5
            }
        },
        text: data.values.map(v => `${v}${data.isPercentage ? '%' : ''}`),
        textposition: 'auto',
        hovertemplate: '<b>%{x}</b><br>%{y}' + (data.isPercentage ? '%' : '') + '<extra></extra>'
    };

    const layout = {
        title: {
            text: title,
            font: {
                family: 'Inter, sans-serif',
                size: 18
            }
        },
        xaxis: { 
            title: xLabel,
            tickangle: -45,
            tickfont: {
                family: 'Inter, sans-serif',
                size: 12
            }
        },
        yaxis: { 
            title: yLabel,
            tickfont: {
                family: 'Inter, sans-serif',
                size: 12
            }
        },
        margin: { t: 60, b: 120, l: 60, r: 30 },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#f9fafb',
        height: 400,
        bargap: 0.3,
        bargroupgap: 0.1,
        hovermode: 'closest',
        hoverlabel: {
            bgcolor: '#FFF',
            bordercolor: '#3b82f6',
            font: {
                family: 'Inter, sans-serif',
                size: 14
            }
        },
        annotations: []
    };

    // Añadir anotaciones para valores destacados
    if (data.values.length > 0) {
        const maxValue = Math.max(...data.values);
        const maxIndex = data.values.indexOf(maxValue);
        
        layout.annotations.push({
            x: data.labels[maxIndex],
            y: maxValue,
            text: 'Valor máximo',
            showarrow: true,
            arrowhead: 2,
            arrowsize: 1,
            arrowcolor: '#3b82f6',
            ax: 0,
            ay: -40,
            font: {
                size: 12,
                color: '#3b82f6'
            }
        });
    }

    // Configuración responsive
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        toImageButtonOptions: {
            format: 'png',
            filename: `grafico_${divId}`,
            height: 500,
            width: 700,
            scale: 2
        }
    };

    // Crear el gráfico inicial con valores en cero
    Plotly.newPlot(divId, [trace], layout, config);

    // Animar hacia los valores reales
    setTimeout(() => {
        Plotly.animate(divId, {
            data: [{ y: data.values }]
        }, animationConfig);
    }, 300);

    // Añadir interactividad al hacer clic en las barras
    document.getElementById(divId).on('plotly_click', function(data) {
        const clickedData = data.points[0];
        const category = clickedData.x;
        const value = clickedData.y;
        
        // Mostrar un mensaje informativo sobre el elemento seleccionado
        alert(`Categoría: ${category}\nValor: ${value}${data.isPercentage ? '%' : ''}`);
        
        // Aquí se podrían añadir más acciones como filtrar datos, actualizar otros gráficos, etc.
    });
}

// Función para crear un gráfico circular animado y con acciones
function createAnimatedPieChart(divId, data, title) {
    // Preparar los datos
    const trace = {
        labels: data.labels,
        values: data.values,
        type: 'pie',
        textinfo: 'label+percent',
        hoverinfo: 'label+percent+value',
        insidetextfont: { size: 12, color: '#FFFFFF' },
        outsidetextfont: { size: 12, family: 'Inter, sans-serif' },
        textposition: 'inside',
        marker: {
            colors: colorsColte,
            line: {
                color: 'white',
                width: 2
            }
        },
        pull: Array(data.labels.length).fill(0), // Para animar "pull" de segmentos
        rotation: 90
    };

    const layout = {
        title: {
            text: title,
            font: {
                family: 'Inter, sans-serif',
                size: 18
            }
        },
        height: 400,
        margin: { t: 60, b: 60, l: 60, r: 60 },
        paper_bgcolor: '#f9fafb',
        showlegend: true,
        legend: {
            font: {
                family: 'Inter, sans-serif',
                size: 12
            },
            orientation: 'h',
            xanchor: 'center',
            x: 0.5,
            y: -0.15
        },
        annotations: [{
            text: 'Haz clic en una categoría para más detalles',
            showarrow: false,
            x: 0.5,
            y: 1.15,
            xref: 'paper',
            yref: 'paper',
            font: {
                size: 12,
                color: '#718096'
            }
        }]
    };

    // Configuración responsive e interactiva
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        toImageButtonOptions: {
            format: 'png',
            filename: `grafico_${divId}`,
            height: 500,
            width: 700,
            scale: 2
        }
    };

    // Crear el gráfico
    Plotly.newPlot(divId, [trace], layout, config);

    // Añadir interactividad al hacer clic en los segmentos
    document.getElementById(divId).on('plotly_click', function(data) {
        const clickedPoint = data.points[0];
        const segment = clickedPoint.label;
        const value = clickedPoint.value;
        const percent = clickedPoint.percent;
        
        // Crear un nuevo arreglo de "pull" para destacar el segmento seleccionado
        const newPull = Array(trace.labels.length).fill(0);
        newPull[clickedPoint.pointNumber] = 0.1; // Destacar el segmento seleccionado
        
        // Actualizar con animación
        Plotly.animate(divId, {
            data: [{ pull: newPull }]
        }, animationConfig);
        
        // Actualizar título con información del segmento
        Plotly.relayout(divId, {
            'annotations[0].text': `${segment}: ${value} (${(percent * 100).toFixed(1)}%)`,
            'annotations[0].font.color': colorsColte[clickedPoint.pointNumber % colorsColte.length]
        });
        
        // Aquí se pueden agregar acciones adicionales como actualizar otros gráficos o tablas
    });
}

// Función para crear un boxplot interactivo con información estadística
function createInteractiveBoxPlot(divId, data, title, yLabel) {
    const traces = [];
    
    // Colores para cada grupo
    let colorIndex = 0;
    
    for (const key in data) {
        traces.push({
            y: data[key],
            type: 'box',
            name: key,
            boxpoints: 'outliers',
            jitter: 0.3,
            pointpos: 0,
            marker: {
                color: colorsColte[colorIndex % colorsColte.length],
                size: 6,
                opacity: 0.7
            },
            line: {
                width: 2
            },
            boxmean: true, // Mostrar la media
            hoverinfo: 'y+name',
            hovertemplate: 
                '<b>%{y}</b><br>' +
                '<extra></extra>'
        });
        colorIndex++;
    }

    const layout = {
        title: {
            text: title,
            font: {
                family: 'Inter, sans-serif',
                size: 18
            }
        },
        yaxis: {
            title: yLabel,
            zeroline: false,
            tickfont: {
                family: 'Inter, sans-serif',
                size: 12
            }
        },
        margin: { t: 60, b: 80, l: 60, r: 30 },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#f9fafb',
        height: 400,
        boxgap: 0.3,
        boxgroupgap: 0.2,
        showlegend: true,
        legend: {
            font: {
                family: 'Inter, sans-serif',
                size: 12
            },
            x: 0.02,
            y: 0.98
        },
        annotations: [{
            text: 'Haz clic en una categoría para ver detalles estadísticos',
            showarrow: false,
            x: 0.5,
            y: 1.12,
            xref: 'paper',
            yref: 'paper',
            font: {
                size: 12,
                color: '#718096'
            }
        }]
    };

    // Configuración responsive e interactiva
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        toImageButtonOptions: {
            format: 'png',
            filename: `boxplot_${divId}`,
            height: 500,
            width: 700,
            scale: 2
        }
    };

    // Crear el gráfico
    Plotly.newPlot(divId, traces, layout, config);
    
    // Añadir interactividad
    document.getElementById(divId).on('plotly_click', function(data) {
        const clickedPoint = data.points[0];
        const category = clickedPoint.data.name;
        
        // Calcular estadísticas para mostrar
        const valuesForCategory = data[category];
        
        // Si no hay datos, no hacer nada
        if (!valuesForCategory || !valuesForCategory.length) return;
        
        const min = Math.min(...valuesForCategory);
        const max = Math.max(...valuesForCategory);
        const sum = valuesForCategory.reduce((a, b) => a + b, 0);
        const mean = sum / valuesForCategory.length;
        const sortedValues = [...valuesForCategory].sort((a, b) => a - b);
        const median = sortedValues.length % 2 === 0 ?
            (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2 :
            sortedValues[Math.floor(sortedValues.length / 2)];
        
        // Actualizar el título con información estadística
        Plotly.relayout(divId, {
            'annotations[0].text': `${category}: Media=${mean.toFixed(2)}, Mediana=${median.toFixed(2)}, Min=${min}, Max=${max}, n=${valuesForCategory.length}`,
            'annotations[0].font.color': colorsColte[traces.findIndex(t => t.name === category) % colorsColte.length]
        });
    });
}

// Función para crear un mapa de calor interactivo para tablas de contingencia
function createInteractiveHeatmap(divId, data, title) {
    // Extraer datos de la tabla de contingencia
    const xLabels = data.columnNames;
    const yLabels = data.rowNames;
    const zValues = data.values;
    
    // Traza del mapa de calor
    const trace = {
        type: 'heatmap',
        z: zValues,
        x: xLabels,
        y: yLabels,
        colorscale: 'Blues',
        hoverongaps: false,
        showscale: true,
        text: zValues.map(row => row.map(value => `${value}`)),
        hovertemplate: 
            '<b>%{y} - %{x}</b><br>' +
            'Valor: %{z}<br>' +
            '<extra></extra>',
        colorbar: {
            title: 'Frecuencia',
            titlefont: {
                family: 'Inter, sans-serif',
                size: 14
            },
            tickfont: {
                family: 'Inter, sans-serif',
                size: 12
            }
        }
    };

    const layout = {
        title: {
            text: title,
            font: {
                family: 'Inter, sans-serif',
                size: 18
            }
        },
        xaxis: {
            title: 'Categorías',
            tickangle: -45,
            tickfont: {
                family: 'Inter, sans-serif',
                size: 12
            }
        },
        yaxis: {
            title: 'Categorías',
            tickfont: {
                family: 'Inter, sans-serif',
                size: 12
            }
        },
        margin: { t: 60, b: 120, l: 100, r: 60 },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#f9fafb',
        height: 450,
        annotations: []
    };
    
    // Añadir anotaciones con el valor en cada celda
    for (let i = 0; i < yLabels.length; i++) {
        for (let j = 0; j < xLabels.length; j++) {
            const currentValue = zValues[i][j];
            if (currentValue > 0) {  // Solo mostrar valores mayores que cero
                layout.annotations.push({
                    xref: 'x',
                    yref: 'y',
                    x: xLabels[j],
                    y: yLabels[i],
                    text: currentValue.toString(),
                    showarrow: false,
                    font: {
                        family: 'Inter, sans-serif',
                        size: 12,
                        color: currentValue > (Math.max(...zValues.flat()) / 2) ? 'white' : 'black'
                    }
                });
            }
        }
    }

    // Configuración responsive e interactiva
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        toImageButtonOptions: {
            format: 'png',
            filename: `heatmap_${divId}`,
            height: 500,
            width: 700,
            scale: 2
        }
    };

    // Crear el gráfico
    Plotly.newPlot(divId, [trace], layout, config);
    
    // Interactividad al hacer clic en celdas
    document.getElementById(divId).on('plotly_click', function(data) {
        const clickedPoint = data.points[0];
        const category1 = clickedPoint.y;
        const category2 = clickedPoint.x;
        const value = clickedPoint.z;
        
        // Actualizar el título con información sobre la celda seleccionada
        Plotly.relayout(divId, {
            'title.text': `${title} - Seleccionado: ${category1} y ${category2}: ${value}`
        });
        
        // Aquí se podrían agregar acciones adicionales como actualizar otros gráficos o mostrar más información
    });
}

// Función para crear una nube de palabras interactiva
function createWordCloudVisualization(divId, data) {
    const options = {
        list: data.map(item => [item.word, item.size]),
        gridSize: 16,
        weightFactor: 10,
        fontFamily: 'Inter, sans-serif',
        color: function(word, weight) {
            return weight > 10 ? '#1d4ed8' : 
                  weight > 5 ? '#3b82f6' : 
                  weight > 2 ? '#60a5fa' : '#93c5fd';
        },
        hover: function(item, dimension) {
            const text = document.getElementById(`${divId}_text`);
            if (text) {
                text.innerHTML = `Palabra: <strong>${item[0]}</strong>, Frecuencia: <strong>${item[1]}</strong>`;
            }
        },
        click: function(item) {
            alert(`Palabra: ${item[0]}\nFrecuencia: ${item[1]}`);
        },
        rotateRatio: 0.5,
        backgroundColor: '#f9fafb'
    };
    
    // Asegurarse de que el contenedor exista y esté vacío
    const container = document.getElementById(divId);
    if (container) {
        container.innerHTML = '';
        
        // Añadir un elemento para mostrar información al pasar el ratón
        const infoText = document.createElement('div');
        infoText.id = `${divId}_text`;
        infoText.className = 'text-sm text-gray-600 mt-2 mb-2';
        infoText.innerHTML = 'Pasa el ratón sobre una palabra para ver su frecuencia';
        container.parentNode.insertBefore(infoText, container.nextSibling);
        
        // Crear la nube de palabras
        WordCloud(container, options);
    }
}

// Función para inicializar todos los gráficos interactivos
function initInteractiveCharts() {
    // Cargar datos del JSON para Segmento
    fetch('data/tabla_SEGMENTO.json')
        .then(response => response.json())
        .then(jsonData => {
            const data = {
                labels: jsonData.map(item => item.SEGMENTO),
                values: jsonData.map(item => item["Frec. Relativa (%)"]),
                isPercentage: true
            };
            createAnimatedPieChart('chart_segmento_interactivo', data, 'Distribución por Segmento');
        })
        .catch(error => console.error('Error cargando datos de segmento:', error));
    
    // Cargar datos del JSON para Ciudad
    fetch('data/tabla_CIUDAD_AGENCIA.json')
        .then(response => response.json())
        .then(jsonData => {
            const data = {
                labels: jsonData.map(item => item.CIUDAD_AGENCIA),
                values: jsonData.map(item => item["Frec. Relativa (%)"]),
                isPercentage: true
            };
            createAnimatedBarChart('chart_ciudad_interactivo', data, 'Distribución por Ciudad de Agencia', 'Ciudad', 'Porcentaje');
        })
        .catch(error => console.error('Error cargando datos de ciudad:', error));
    
    // Cargar datos para Género
    fetch('data/tabla_GENERO.json')
        .then(response => response.json())
        .then(jsonData => {
            const data = {
                labels: jsonData.map(item => item.GENERO),
                values: jsonData.map(item => item["Frec. Relativa (%)"]),
                isPercentage: true
            };
            createAnimatedPieChart('chart_genero_interactivo', data, 'Distribución por Género');
        })
        .catch(error => console.error('Error cargando datos de género:', error));
    
    // Cargar datos para PREGUNTA_1
    fetch('data/tabla_PREGUNTA_1.json')
        .then(response => response.json())
        .then(jsonData => {
            const data = {
                labels: jsonData.map(item => item.PREGUNTA_1.toString()),
                values: jsonData.map(item => item["Frec. Relativa (%)"]),
                isPercentage: true
            };
            createAnimatedBarChart('chart_pregunta1_interactivo', data, 'Distribución de Calificaciones - PREGUNTA_1', 'Calificación', 'Porcentaje');
        })
        .catch(error => console.error('Error cargando datos de PREGUNTA_1:', error));
    
    // Simular datos para BoxPlot de satisfacción por segmento
    const boxplotData = {
        'Personas': [4, 5, 4, 5, 3, 4, 5, 4, 5, 4, 3, 5, 5, 4, 5, 4, 5, 5, 4, 3],
        'Empresas': [3, 4, 3, 5, 4, 3, 4, 4, 3, 4, 3, 4, 5, 2, 3, 4, 3, 4, 3, 4]
    };
    createInteractiveBoxPlot('chart_satisfaccion_segmento_boxplot', boxplotData, 'Satisfacción por Segmento', 'Calificación');
    
    // Cargar datos para Ciudad vs Satisfacción
    // Simulamos datos de ejemplo
    const cityData = {
        labels: ['Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga'],
        values: [4.6, 4.5, 4.3, 4.7, 4.4],
        isPercentage: false
    };
    createAnimatedBarChart('chart_satisfaccion_ciudad_interactivo', cityData, 'Satisfacción Promedio por Ciudad', 'Ciudad', 'Calificación Promedio');
    
    // Crear un heatmap para tabla de contingencia
    const heatmapData = {
        rowNames: ['Masculino', 'Femenino'],
        columnNames: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga'],
        values: [
            [280, 150, 45, 35, 60],
            [271, 154, 40, 25, 5]
        ]
    };
    createInteractiveHeatmap('chart_contingencia_heatmap', heatmapData, 'Relación Género y Ciudad de Agencia');
    
    // Cargar datos para la nube de palabras
    fetch('data/tabla_wordcloud_pregunta5.json')
        .then(response => response.json())
        .then(jsonData => {
            createWordCloudVisualization('wordcloud_comentarios_placeholder', jsonData);
        })
        .catch(error => {
            console.error('Error cargando datos para nube de palabras:', error);
            // Datos de ejemplo en caso de error
            const exampleData = [
                {word: "servicio", size: 15},
                {word: "excelente", size: 12},
                {word: "atención", size: 10},
                {word: "rapidez", size: 8},
                {word: "crédito", size: 7},
                {word: "préstamo", size: 6},
                {word: "gerente", size: 5},
                {word: "cuenta", size: 5},
                {word: "tiempo", size: 4},
                {word: "mejora", size: 3}
            ];
            createWordCloudVisualization('wordcloud_comentarios_placeholder', exampleData);
        });
}

// Exportar funciones
window.createAnimatedBarChart = createAnimatedBarChart;
window.createAnimatedPieChart = createAnimatedPieChart;
window.createInteractiveBoxPlot = createInteractiveBoxPlot;
window.createInteractiveHeatmap = createInteractiveHeatmap;
window.createWordCloudVisualization = createWordCloudVisualization;
window.initInteractiveCharts = initInteractiveCharts;

// Inicializar cuando el DOM está listo
document.addEventListener('DOMContentLoaded', initInteractiveCharts);
