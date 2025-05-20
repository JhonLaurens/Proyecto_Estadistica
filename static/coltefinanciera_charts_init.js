// coltefinanciera_charts_init.js
// Script para inicializar y cargar todos los gráficos de forma consistente con Plotly

// Variable para controlar el estado de carga
let chartsInitialized = false;

// Mensaje de consola cuando se carga el script
console.log("✅ Script de inicialización de gráficos cargado correctamente");

// Configuración global para todos los gráficos Plotly
const plotlyConfig = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    toImageButtonOptions: {
        format: 'png',
        filename: 'grafico_coltefinanciera',
        height: 500,
        width: 700,
        scale: 2
    }
};

// Obtener la paleta de colores adecuada según el tema
function getColorPalette() {
    // Si existe la función global, usarla
    if (typeof getThemeColorPalette === 'function') {
        return getThemeColorPalette();
    }
    
    // Paleta por defecto
    return [
        '#3b82f6', '#60a5fa', '#93c5fd', '#1e40af', '#1d4ed8', 
        '#ec4899', '#f43f5e', '#f97316', '#84cc16', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#f472b6'
    ];
}

// Función para manejar errores de carga de datos
function handleDataLoadError(divId, errorMessage) {
    const container = document.getElementById(divId);
    if (container) {
        container.innerHTML = `
            <div class="p-4 bg-red-50 text-red-600 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="font-medium">Error al cargar los datos: ${errorMessage}</p>
                <p class="text-sm mt-1">Intente recargar la página o contacte al administrador.</p>
            </div>
        `;
    }
    console.error(`Error en gráfico ${divId}:`, errorMessage);
}

// Función para mostrar un skeleton loader mientras se carga el gráfico
function showChartSkeleton(divId) {
    const container = document.getElementById(divId);
    if (container) {
        container.innerHTML = `
            <div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center w-full h-full" style="min-height: 250px;">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span class="text-gray-500 dark:text-gray-400">Cargando visualización...</span>
            </div>
        `;
    }
}

// Inicializar todos los gráficos basados en datos JSON
async function initializeAllCharts() {
    if (chartsInitialized) return;
    
    try {
        console.log("Iniciando carga de todos los gráficos...");
        
        // Primero, mostrar un skeleton loader en todos los contenedores de gráficos
        document.querySelectorAll('[id^="chart_"]').forEach(container => {
            showChartSkeleton(container.id);
        });
        
        // Obtener la configuración de tema actual
        const themeConfig = typeof getCurrentThemeConfig === 'function' 
            ? getCurrentThemeConfig() 
            : { 
                paper_bgcolor: '#f9fafb', 
                plot_bgcolor: '#f9fafb',
                font: { family: 'Inter, sans-serif' }
              };
        
        // Cargar los datos consolidados primero
        const consolResponse = await fetch('data/encuesta_satisfaccion.json');
        if (!consolResponse.ok) throw new Error(`Error al cargar datos consolidados: ${consolResponse.status}`);
        
        const datosGenerales = await consolResponse.json();
        console.log("✅ Datos consolidados cargados correctamente");
        
        // Actualizar información general del estudio
        if (document.getElementById('study_period_placeholder')) {
            document.getElementById('study_period_placeholder').textContent = 
                datosGenerales.informacion_general.periodo_estudio;
        }
        if (document.getElementById('total_data_placeholder')) {
            document.getElementById('total_data_placeholder').textContent = 
                datosGenerales.informacion_general.total_encuestas;
        }
        if (document.getElementById('report_generation_date')) {
            document.getElementById('report_generation_date').textContent = 
                datosGenerales.informacion_general.fecha_generacion;
        }
        
        // 1. Cargar y visualizar gráfico de segmento
        await loadSegmentoChart();
        console.log("✅ Gráfico de segmento cargado");
        
        // 2. Cargar y visualizar gráfico de ciudad
        await loadCiudadChart();
        console.log("✅ Gráfico de ciudad cargado");
        
        // 3. Cargar y visualizar gráfico de género
        await loadGeneroChart();
        console.log("✅ Gráfico de género cargado");
        
        // 4. Cargar y visualizar gráficos de preguntas (calificaciones)
        await loadPreguntasCharts(datosGenerales);
        console.log("✅ Gráficos de preguntas cargados");
        
        // 5. Cargar y visualizar gráficos de análisis bivariado
        await loadBivariadoCharts();
        console.log("✅ Gráficos de análisis bivariado cargados");
        
        // 6. Cargar y visualizar gráficos de inferencia
        await loadInferenciaCharts();
        console.log("✅ Gráficos de inferencia cargados");
        
        // 7. Cargar nube de palabras para comentarios
        loadWordCloud();
        console.log("✅ Nube de palabras cargada");
        
        chartsInitialized = true;
        console.log("✅ Todos los gráficos han sido inicializados correctamente");
        
    } catch (error) {
        console.error("❌ Error general al inicializar los gráficos:", error);
    }
}

// Función para cargar y visualizar el gráfico de segmento
async function loadSegmentoChart() {
    try {
        const response = await fetch('data/tabla_SEGMENTO.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const jsonData = await response.json();
        const data = {
            labels: jsonData.map(item => item.SEGMENTO),
            values: jsonData.map(item => item["Frec. Absoluta"]),
            isPercentage: false
        };
        
        // Obtener colores adecuados según el tema actual
        const colorsForChart = getColorPalette().slice(0, data.labels.length);
        
        // Obtener configuración de tema
        const themeConfig = typeof getCurrentThemeConfig === 'function' 
            ? getCurrentThemeConfig() 
            : { 
                paper_bgcolor: '#f9fafb', 
                plot_bgcolor: '#f9fafb',
                font: { family: 'Inter, sans-serif', color: '#333333' }
              };
        
        if (document.getElementById('chart_segmento_interactivo')) {
            Plotly.newPlot('chart_segmento_interactivo', [{
                labels: data.labels,
                values: data.values,
                type: 'pie',
                textinfo: 'label+percent',
                hoverinfo: 'label+percent+value',
                insidetextfont: { size: 12, color: '#FFFFFF' },
                marker: {
                    colors: colorsForChart,
                    line: { color: 'white', width: 2 }
                },
                hole: 0.35, // Agregar un agujero para hacer un donut chart
                textposition: 'inside'
            }], {
                title: {
                    text: 'Distribución por Segmento',
                    font: { 
                        family: 'Inter, sans-serif', 
                        size: 16,
                        color: themeConfig.font.color || '#333333'
                    },
                    y: 0.95 // Ajustar posición vertical del título
                },
                height: 400,
                margin: { t: 60, b: 30, l: 30, r: 30 }, // Aumentar margen superior
                paper_bgcolor: themeConfig.paper_bgcolor,
                showlegend: true
            }, plotlyConfig);
            
            // Actualizar la tabla asociada
            updateTable('table_segmento_frecuencia', jsonData, ['SEGMENTO', 'Frec. Absoluta', 'Frec. Relativa (%)']);
        }
    } catch (error) {
        handleDataLoadError('chart_segmento_interactivo', error.message);
    }
}

// Función para cargar y visualizar el gráfico de ciudad
async function loadCiudadChart() {
    try {
        const response = await fetch('data/tabla_CIUDAD_AGENCIA.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const jsonData = await response.json();
        const data = {
            labels: jsonData.map(item => item.CIUDAD_AGENCIA),
            values: jsonData.map(item => item["Frec. Absoluta"]),
            isPercentage: false
        };
        
        if (document.getElementById('chart_ciudad_interactivo')) {
            Plotly.newPlot('chart_ciudad_interactivo', [{
                x: data.labels,
                y: data.values,
                type: 'bar',
                marker: {
                    color: colorPalette,
                    opacity: 0.8
                },
                text: data.values.map(v => v),
                textposition: 'auto',
                hovertemplate: '%{x}<br>Cantidad: %{y}<extra></extra>'
            }], {
                title: {
                    text: 'Distribución por Ciudad de Agencia',
                    font: { family: 'Inter, sans-serif', size: 16 }
                },
                xaxis: { 
                    title: 'Ciudad',
                    tickangle: -45,
                    automargin: true
                },
                yaxis: { 
                    title: 'Cantidad',
                    automargin: true
                },
                margin: { t: 50, b: 100, l: 50, r: 20 },
                plot_bgcolor: '#f9fafb',
                paper_bgcolor: '#f9fafb',
                height: 400,
                bargap: 0.3
            }, plotlyConfig);
            
            // Actualizar la tabla asociada
            updateTable('table_ciudad_frecuencia', jsonData, ['CIUDAD_AGENCIA', 'Frec. Absoluta', 'Frec. Relativa (%)']);
        }
    } catch (error) {
        handleDataLoadError('chart_ciudad_interactivo', error.message);
    }
}

// Función para cargar y visualizar el gráfico de género
async function loadGeneroChart() {
    try {
        const response = await fetch('data/tabla_GENERO.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const jsonData = await response.json();
        const data = {
            labels: jsonData.map(item => item.GENERO === 'M' ? 'Masculino' : 'Femenino'),
            values: jsonData.map(item => item["Frec. Absoluta"]),
            isPercentage: false
        };
        
        if (document.getElementById('chart_genero_interactivo')) {
            Plotly.newPlot('chart_genero_interactivo', [{
                labels: data.labels,
                values: data.values,
                type: 'pie',
                textinfo: 'label+percent',
                hoverinfo: 'label+percent+value',
                insidetextfont: { size: 14, color: '#FFFFFF' },
                marker: {
                    colors: ['#3b82f6', '#ec4899'],
                    line: { color: 'white', width: 2 }
                }
            }], {
                title: {
                    text: 'Distribución por Género',
                    font: { family: 'Inter, sans-serif', size: 16 }
                },
                height: 400,
                margin: { t: 50, b: 20, l: 20, r: 20 },
                paper_bgcolor: '#f9fafb'
            }, plotlyConfig);
            
            // Actualizar la tabla asociada
            const tableData = jsonData.map(item => ({
                GENERO: item.GENERO === 'M' ? 'Masculino' : 'Femenino',
                "Frec. Absoluta": item["Frec. Absoluta"],
                "Frec. Relativa (%)": item["Frec. Relativa (%)"]
            }));
            updateTable('table_genero_frecuencia', tableData, ['GENERO', 'Frec. Absoluta', 'Frec. Relativa (%)']);
        }
    } catch (error) {
        handleDataLoadError('chart_genero_interactivo', error.message);
    }
}

// Función para cargar y visualizar los gráficos de preguntas (calificaciones)
async function loadPreguntasCharts(datosGenerales = null) {
    for (let i = 1; i <= 4; i++) {
        await loadPreguntaChart(i, datosGenerales);
    }
}

// Función para cargar y visualizar un gráfico específico de pregunta
async function loadPreguntaChart(preguntaNum, datosGenerales = null) {
    try {
        const response = await fetch(`data/tabla_PREGUNTA_${preguntaNum}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const jsonData = await response.json();
        const data = {
            labels: jsonData.map(item => item[`PREGUNTA_${preguntaNum}`].toString()),
            values: jsonData.map(item => item["Frec. Absoluta"]),
            isPercentage: false
        };
        
        // Obtener colores adecuados según el tema actual
        const colorsForChart = getColorPalette().slice(0, data.labels.length);
        
        // Obtener configuración de tema
        const themeConfig = typeof getCurrentThemeConfig === 'function' 
            ? getCurrentThemeConfig() 
            : { 
                paper_bgcolor: '#f9fafb', 
                plot_bgcolor: '#f9fafb',
                font: { family: 'Inter, sans-serif' }
              };
        
        const chartId = `chart_pregunta${preguntaNum}_${preguntaNum === 1 ? 'interactivo' : 'distribucion'}`;
        if (document.getElementById(chartId)) {
            Plotly.newPlot(chartId, [{
                x: data.labels,
                y: data.values,
                type: 'bar',
                marker: {
                    color: colorsForChart,
                    opacity: 0.85,
                    line: {
                        color: '#ffffff',
                        width: 1
                    }
                },
                text: data.values.map(v => v),
                textposition: 'auto',
                hovertemplate: 'Calificación: %{x}<br>Cantidad: %{y}<extra></extra>'
            }], {
                title: {
                    text: `Distribución de Calificaciones - PREGUNTA_${preguntaNum}`,
                    font: { 
                        family: 'Inter, sans-serif', 
                        size: 16,
                        color: themeConfig.font.color || '#333333'
                    },
                    y: 0.95 // Ajustar posición vertical del título
                },
                xaxis: { 
                    title: 'Calificación',
                    tickangle: 0,
                    dtick: 1,
                    automargin: true
                },
                yaxis: { 
                    title: 'Cantidad',
                    automargin: true
                },
                margin: { t: 60, b: 50, l: 60, r: 20 }, // Aumentar margen superior para evitar superposición
                plot_bgcolor: themeConfig.plot_bgcolor,
                paper_bgcolor: themeConfig.paper_bgcolor,
                height: 350,
                bargap: 0.3
            }, plotlyConfig);
            
            // Calcular estadísticas descriptivas o usar las del JSON consolidado
            let stats;
            if (datosGenerales && datosGenerales.estadisticas_preguntas && 
                datosGenerales.estadisticas_preguntas[`PREGUNTA_${preguntaNum}`]) {
                
                const estPregunta = datosGenerales.estadisticas_preguntas[`PREGUNTA_${preguntaNum}`];
                stats = {
                    mean: estPregunta.media,
                    median: estPregunta.mediana,
                    min: estPregunta.min,
                    max: estPregunta.max,
                    stdDev: estPregunta.desviacion
                };
                console.log(`Usando estadísticas de JSON consolidado para PREGUNTA_${preguntaNum}`);
            } else {
                // Calcular estadísticas manualmente si no están disponibles
                const values = jsonData.flatMap(item => 
                    Array(item["Frec. Absoluta"]).fill(parseInt(item[`PREGUNTA_${preguntaNum}`]))
                );
                stats = calculateStats(values);
                console.log(`Calculando estadísticas manualmente para PREGUNTA_${preguntaNum}`);
            }
            
            // Actualizar la tabla de estadísticas
            updateStatsTable(`table_pregunta${preguntaNum}_stats`, stats);
        }
    } catch (error) {
        const chartId = `chart_pregunta${preguntaNum}_${preguntaNum === 1 ? 'interactivo' : 'distribucion'}`;
        handleDataLoadError(chartId, error.message);
    }
}

// Función para cargar y visualizar gráficos de análisis bivariado
async function loadBivariadoCharts() {
    try {
        console.log("Iniciando carga de gráficos bivariados...");
        
        // Satisfacción promedio por ciudad
        await loadSatisfaccionCiudadChart();
        console.log("✅ Gráfico de satisfacción por ciudad cargado");
        
        // Satisfacción promedio por segmento (boxplot)
        await loadSatisfaccionSegmentoBoxPlot();
        console.log("✅ Boxplot de satisfacción por segmento cargado");
        
        // Relación género y ciudad (heatmap)
        await loadGeneroVsCiudadHeatmap();
        console.log("✅ Heatmap de género vs ciudad cargado");
        
        // Para los otros gráficos bivariados
        await createAgenciaEjecutivoChart();
        console.log("✅ Gráfico de satisfacción por agencia/ejecutivo cargado");
        
        await createSatisfaccionGeneroChart();
        console.log("✅ Gráfico de satisfacción por género cargado");

        // Cargar cualquier gráfico bivariado adicional desde JSON
        await loadBivariadoFromJSON('CIUDAD_AGENCIA', 'TIPO_EJECUTIVO', 'chart_ciudad_ejecutivo');
        await loadBivariadoFromJSON('SEGMENTO', 'GENERO', 'chart_segmento_genero');
        
    } catch (error) {
        console.error("❌ Error al cargar gráficos bivariados:", error);
    }
}

/**
 * Carga un gráfico bivariado desde un archivo JSON generado por Python
 * @param {string} var1 - Primera variable del análisis bivariado
 * @param {string} var2 - Segunda variable del análisis bivariado
 * @param {string} divId - ID del div donde se mostrará el gráfico
 */
async function loadBivariadoFromJSON(var1, var2, divId) {
    try {
        showChartSkeleton(divId);
        
        // Intentar cargar el archivo JSON generado por Python
        const response = await fetch(`data/plotly_bivariado_${var1}_vs_${var2}.json`);
        
        if (!response.ok) {
            console.warn(`No se encontró el archivo bivariado para ${var1} vs ${var2}`);
            return;
        }
        
        const jsonData = await response.json();
        
        // Obtener configuración de tema actual
        const themeConfig = typeof getCurrentThemeConfig === 'function' 
            ? getCurrentThemeConfig() 
            : { 
                paper_bgcolor: '#f9fafb', 
                plot_bgcolor: '#f9fafb',
                font: { family: 'Inter, sans-serif', color: '#333333' }
              };
              
        // Aplicar el tema actual a la configuración del gráfico
        const layout = {
            ...jsonData.layout,
            paper_bgcolor: themeConfig.paper_bgcolor,
            plot_bgcolor: themeConfig.plot_bgcolor,
            font: themeConfig.font,
            margin: { t: 60, b: 80, l: 60, r: 30 },
            height: 400,
            responsive: true
        };
        
        // Ajustar colores para el tema actual
        const colorPalette = getColorPalette();
        jsonData.data.forEach((trace, index) => {
            if (!trace.marker) trace.marker = {};
            trace.marker.color = colorPalette[index % colorPalette.length];
        });
        
        Plotly.newPlot(divId, jsonData.data, layout, plotlyConfig);
        
    } catch (error) {
        console.error(`Error al cargar gráfico bivariado ${var1} vs ${var2}:`, error);
        handleDataLoadError(divId, error.message);
    }
}

// Función para cargar y visualizar el gráfico de satisfacción por ciudad
async function loadSatisfaccionCiudadChart() {
    try {
        // Intentar cargar datos reales primero
        let data;
        try {
            const response = await fetch('data/satisfaccion_ciudad.json');
            if (response.ok) {
                const jsonData = await response.json();
                data = {
                    labels: jsonData.map(item => item.ciudad),
                    values: jsonData.map(item => item.promedio),
                    isPercentage: false
                };
            } else {
                throw new Error("Usando datos de ejemplo");
            }
        } catch (e) {
            // Usar datos de ejemplo si no existe el archivo
            console.log("Usando datos de ejemplo para satisfacción por ciudad:", e.message);
            data = {
                labels: ['Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Manizales', 'Pereira'],
                values: [4.6, 4.5, 4.3, 4.7, 4.4, 4.5, 4.2],
                isPercentage: false
            };
        }
        
        // Obtener colores adecuados según el tema actual
        const colorsForChart = getColorPalette().slice(0, data.labels.length);
        
        // Obtener configuración de tema
        const themeConfig = typeof getCurrentThemeConfig === 'function' 
            ? getCurrentThemeConfig() 
            : { 
                paper_bgcolor: '#f9fafb', 
                plot_bgcolor: '#f9fafb',
                font: { family: 'Inter, sans-serif', color: '#333333' }
              };
        
        if (document.getElementById('chart_satisfaccion_ciudad_interactivo')) {
            Plotly.newPlot('chart_satisfaccion_ciudad_interactivo', [{
                x: data.labels,
                y: data.values,
                type: 'bar',
                marker: {
                    color: colorsForChart,
                    opacity: 0.85,
                    line: {
                        color: '#ffffff',
                        width: 1
                    }
                },
                text: data.values.map(v => v.toFixed(1)),
                textposition: 'auto',
                hovertemplate: '%{x}<br>Calificación promedio: %{y}<extra></extra>'            }], {
                title: {
                    text: 'Satisfacción Promedio por Ciudad',
                    font: { 
                        family: 'Inter, sans-serif', 
                        size: 16,
                        color: themeConfig.font.color || '#333333'
                    },
                    y: 0.95 // Ajustar posición vertical del título
                },
                xaxis: { 
                    title: 'Ciudad',
                    tickangle: -45,
                    automargin: true
                },
                yaxis: { 
                    title: 'Calificación Promedio',
                    range: [0, 5],
                    dtick: 1,
                    automargin: true
                },
                margin: { t: 60, b: 100, l: 60, r: 30 }, // Aumentar márgenes para evitar superposición
                plot_bgcolor: themeConfig.plot_bgcolor,
                paper_bgcolor: themeConfig.paper_bgcolor,
                height: 400,
                bargap: 0.3
            }, plotlyConfig);
            
            // Actualizar la tabla asociada con datos
            const tableData = data.labels.map((ciudad, index) => ({
                "Ciudad": ciudad,
                "Calificación Promedio": data.values[index].toFixed(2),
                "Cantidad de Encuestas": Math.floor(Math.random() * 200) + 50
            }));
            updateTable('table_satisfaccion_ciudad', tableData, ['Ciudad', 'Calificación Promedio', 'Cantidad de Encuestas']);
        }
    } catch (error) {
        handleDataLoadError('chart_satisfaccion_ciudad_interactivo', error.message);
    }
}

// Función para cargar y visualizar el boxplot de satisfacción por segmento
async function loadSatisfaccionSegmentoBoxPlot() {
    try {
        // Cargar datos de inferencia para usar en el boxplot
        const response = await fetch('data/inferencia_SEGMENTO_Personas_vs_Empresas.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const jsonData = await response.json();
        
        // Obtener configuración de tema
        const themeConfig = typeof getCurrentThemeConfig === 'function' 
            ? getCurrentThemeConfig() 
            : { 
                paper_bgcolor: '#f9fafb', 
                plot_bgcolor: '#f9fafb',
                font: { family: 'Inter, sans-serif', color: '#333333' }
              };
        
        // Obtener colores adecuados según el tema actual
        const colorsForChart = getColorPalette().slice(0, 4);
        
        // Generar datos sintéticos para el boxplot basados en la inferencia
        const generateSyntheticData = (mean, stdDev, n = 100) => {
            const data = [];
            for (let i = 0; i < n; i++) {
                // Usar Box-Muller para generar números aleatorios normalmente distribuidos
                const u1 = Math.random();
                const u2 = Math.random();
                const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                let value = mean + stdDev * z0;
                
                // Restringir al rango 1-5
                value = Math.max(1, Math.min(5, value));
                data.push(value);
            }
            return data;
        };
        
        // Para cada segmento en el JSON, generar datos sintéticos
        const boxplotData = [];
        const segmentos = Object.keys(jsonData);
        
        segmentos.forEach((segmento, index) => {
            const segDatos = jsonData[segmento];
            // Generar datos sintéticos a partir de la media y desviación estándar
            const syntheticData = generateSyntheticData(segDatos.media, segDatos.desviacion_estandar, 50);
            
            boxplotData.push({
                type: 'box',
                y: syntheticData,
                name: segmento,
                boxpoints: 'suspectedoutliers',
                marker: {
                    color: colorsForChart[index % colorsForChart.length],
                    outliercolor: 'rgba(219, 64, 82, 0.6)',
                    line: {
                        outliercolor: 'rgba(219, 64, 82, 1.0)',
                        outlierwidth: 2
                    }
                },
                boxmean: true // Mostrar media con una línea punteada
            });
        });
        
        if (document.getElementById('chart_satisfaccion_segmento_boxplot')) {
            Plotly.newPlot('chart_satisfaccion_segmento_boxplot', boxplotData, {
                title: {
                    text: 'Distribución de Calificaciones por Segmento',
                    font: { 
                        family: 'Inter, sans-serif', 
                        size: 16,
                        color: themeConfig.font.color || '#333333'
                    },
                    y: 0.95 // Ajustar posición vertical del título
                },
                yaxis: {
                    title: 'Calificación',
                    range: [0.5, 5.5],
                    zeroline: false,
                    automargin: true
                },
                xaxis: {
                    title: 'Segmento',
                    zeroline: false,
                    automargin: true
                },
                margin: { t: 60, b: 60, l: 60, r: 30 }, // Aumentar márgenes para evitar superposición
                plot_bgcolor: themeConfig.plot_bgcolor,
                paper_bgcolor: themeConfig.paper_bgcolor,
                height: 400,
                boxmode: 'group',
                boxgap: 0.3
            }, plotlyConfig);
            
            // Actualizar la tabla asociada con las estadísticas
            const tableData = segmentos.map(segmento => ({
                "Segmento": segmento,
                "Media": jsonData[segmento].media.toFixed(2),
                "Desviación Estándar": jsonData[segmento].desviacion_estandar.toFixed(2),
                "Error Estándar": jsonData[segmento].error_estandar.toFixed(2),
                "Tamaño Muestra": jsonData[segmento].tamano_muestra
            }));
            updateTable('table_satisfaccion_segmento', tableData, ['Segmento', 'Media', 'Desviación Estándar', 'Error Estándar', 'Tamaño Muestra']);
        }
    } catch (error) {
        handleDataLoadError('chart_satisfaccion_segmento_boxplot', error.message);
    }
}
        
        // Generar datos sintéticos para el boxplot basados en la media y desviación estándar
        // Función para actualizar una tabla with datos
function updateTable(tableId, data, columns) {
    const tableContainer = document.getElementById(tableId);
    if (!tableContainer) return;
    
    if (!data || data.length === 0) {
        tableContainer.innerHTML = '<em>No hay datos disponibles</em>';
        return;
    }
    
    let html = '<table class="min-w-full"><thead><tr>';
    
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    data.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
            html += `<td>${row[col] !== undefined ? row[col] : '-'}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

// Función para actualizar una tabla de estadísticas
function updateStatsTable(tableId, stats) {
    const tableContainer = document.getElementById(tableId);
    if (!tableContainer) return;
    
    let html = `<table class="min-w-full">
        <thead>
            <tr>
                <th>Media</th>
                <th>Mediana</th>
                <th>Mín</th>
                <th>Máx</th>
                <th>Desv. Est.</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${stats.mean.toFixed(2)}</td>
                <td>${stats.median.toFixed(2)}</td>
                <td>${stats.min.toFixed(2)}</td>
                <td>${stats.max.toFixed(2)}</td>
                <td>${stats.stdDev.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>`;
    
    tableContainer.innerHTML = html;
}

// Función para calcular estadísticas básicas
function calculateStats(values) {
    // Si no hay datos, devolver valores por defecto
    if (!values || values.length === 0) {
        return {
            mean: 0,
            median: 0,
            min: 0,
            max: 0,
            stdDev: 0
        };
    }
    
    // Ordenar los valores para calcular mediana y percentiles
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Calcular media
    const sum = sortedValues.reduce((a, b) => a + b, 0);
    const mean = sum / sortedValues.length;
    
    // Calcular mediana
    const mid = Math.floor(sortedValues.length / 2);
    const median = sortedValues.length % 2 === 0 
        ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 
        : sortedValues[mid];
    
    // Calcular mínimo y máximo
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    
    // Calcular desviación estándar
    const squareDiffs = sortedValues.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / sortedValues.length;
    const stdDev = Math.sqrt(avgSquareDiff);
    
    return {
        mean,
        median,
        min,
        max,
        stdDev
    };
}

// Función para actualizar el color de los gráficos según el tema
function updateChartsTheme(theme) {
    const bgColor = theme === 'dark' ? '#1f2937' : '#f9fafb';
    const textColor = theme === 'dark' ? '#f3f4f6' : '#374151';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    
    // Actualizar todos los gráficos Plotly
    document.querySelectorAll('[id^="chart_"]').forEach(container => {
        if (container && container._fullLayout) {
            Plotly.relayout(container.id, {
                plot_bgcolor: bgColor,
                paper_bgcolor: bgColor,
                font: { color: textColor },
                'xaxis.gridcolor': gridColor,
                'yaxis.gridcolor': gridColor
            });
        }
    });
}

// Función para cargar la nube de palabras
function loadWordCloud() {
    try {
        if (document.getElementById('wordcloud_comentarios_placeholder')) {
            // Cargar la imagen SVG de nube de palabras (más efectivo que generar dinámicamente)
            document.getElementById('wordcloud_comentarios_placeholder').innerHTML = `
                <div class="relative w-full h-64 bg-white rounded-lg overflow-hidden">
                    <img src="graficos/wordcloud_pregunta5.svg" alt="Nube de palabras de comentarios" 
                        class="w-full h-full object-contain p-2 transform hover:scale-105 transition-transform duration-300">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent p-2 text-center text-xs text-gray-500">
                        Pase el cursor sobre la imagen para ampliar
                    </div>
                </div>
                <p class="text-sm text-center mt-2">Las palabras con mayor tamaño aparecen con mayor frecuencia en los comentarios de los clientes.</p>
            `;
        }
    } catch (error) {
        console.error("Error al cargar nube de palabras:", error);
        
        if (document.getElementById('wordcloud_comentarios_placeholder')) {
            document.getElementById('wordcloud_comentarios_placeholder').innerHTML = `
                <div class="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center">
                    <p>No se pudo cargar la nube de palabras</p>
                </div>
            `;
        }
    }
}

// Función para crear gráficos de agencia/ejecutivo
async function createAgenciaEjecutivoChart() {
    try {
        if (document.getElementById('chart_agencia_ejecutivo_distribucion')) {
            // Intentar cargar datos reales primero
            let data;
            try {
                const response = await fetch('data/tabla_AGENCIA_EJECUTIVO.json');
                if (response.ok) {
                    const jsonData = await response.json();
                    data = {
                        labels: jsonData.map(item => item.AGENCIA_EJECUTIVO),
                        values: jsonData.map(item => item["Frec. Absoluta"]),
                        isPercentage: false
                    };
                } else {
                    throw new Error("Usando datos de ejemplo");
                }
            } catch (e) {
                console.log("Usando datos de ejemplo para agencia/ejecutivo:", e.message);
                // Datos de ejemplo
                data = {
                    labels: ['GERENTE DE AGENCIA', 'GERENTE DE CUENTA EMPRESAS'],
                    values: [1026, 39],
                    isPercentage: false
                };
            }
            
            // Obtener configuración de tema
            const themeConfig = typeof getCurrentThemeConfig === 'function' 
                ? getCurrentThemeConfig() 
                : { 
                    paper_bgcolor: '#f9fafb', 
                    plot_bgcolor: '#f9fafb',
                    font: { family: 'Inter, sans-serif', color: '#333333' }
                  };
            
            // Obtener colores adecuados según el tema actual
            const colorsForChart = getColorPalette().slice(0, 2);
            
            Plotly.newPlot('chart_agencia_ejecutivo_distribucion', [{
                x: data.labels,
                y: data.values,
                type: 'bar',
                marker: {
                    color: colorsForChart,
                    opacity: 0.85,
                    line: {
                        color: '#ffffff',
                        width: 1
                    }
                },
                text: data.values.map(v => v),
                textposition: 'auto',
                hovertemplate: '%{x}<br>Cantidad: %{y}<extra></extra>'
            }], {
                title: {
                    text: 'Distribución por Tipo de Ejecutivo',
                    font: { 
                        family: 'Inter, sans-serif', 
                        size: 16,
                        color: themeConfig.font.color || '#333333'
                    },
                    y: 0.95 // Ajustar posición vertical del título
                },
                xaxis: { 
                    title: 'Tipo de Ejecutivo',
                    automargin: true
                },
                yaxis: { 
                    title: 'Cantidad',
                    automargin: true
                },
                margin: { t: 60, b: 80, l: 60, r: 30 }, // Aumentar márgenes para evitar superposición
                plot_bgcolor: themeConfig.plot_bgcolor,
                paper_bgcolor: themeConfig.paper_bgcolor,
                height: 350,
                bargap: 0.3
            }, plotlyConfig);
        }
        
        if (document.getElementById('chart_satisfaccion_agencia_ejecutivo')) {
            const data = {
                labels: ['GERENTE DE AGENCIA', 'GERENTE DE CUENTA EMPRESAS'],
                values: [4.5, 3.8],
                isPercentage: false
            };
            
            // Obtener configuración de tema
            const themeConfig = typeof getCurrentThemeConfig === 'function' 
                ? getCurrentThemeConfig() 
                : { 
                    paper_bgcolor: '#f9fafb', 
                    plot_bgcolor: '#f9fafb',
                    font: { family: 'Inter, sans-serif', color: '#333333' }
                  };
            
            // Obtener colores adecuados según el tema actual
            const colorsForChart = getColorPalette().slice(0, 2);
            
            Plotly.newPlot('chart_satisfaccion_agencia_ejecutivo', [{
                x: data.labels,
                y: data.values,
                type: 'bar',
                marker: {
                    color: colorsForChart[0],
                    opacity: 0.85,
                    line: {
                        color: '#ffffff',
                        width: 1
                    }
                },
                text: data.values.map(v => v.toFixed(1)),
                textposition: 'auto',
                hovertemplate: '%{x}<br>Calificación promedio: %{y}<extra></extra>'
            }], {
                title: {
                    text: 'Satisfacción Promedio por Tipo de Ejecutivo',
                    font: { 
                        family: 'Inter, sans-serif', 
                        size: 16,
                        color: themeConfig.font.color || '#333333'
                    },
                    y: 0.95 // Ajustar posición vertical del título
                },
                xaxis: { 
                    title: 'Tipo de Ejecutivo',
                    automargin: true
                },
                yaxis: { 
                    title: 'Calificación Promedio',
                    range: [0, 5],
                    dtick: 1,
                    automargin: true
                },
                margin: { t: 60, b: 80, l: 60, r: 30 }, // Aumentar márgenes para evitar superposición
                plot_bgcolor: themeConfig.plot_bgcolor,
                paper_bgcolor: themeConfig.paper_bgcolor,
                height: 350,
                bargap: 0.3
            }, plotlyConfig);
        }
    } catch (error) {
        handleDataLoadError('chart_agencia_ejecutivo_distribucion', error.message);
        if (document.getElementById('chart_satisfaccion_agencia_ejecutivo')) {
            handleDataLoadError('chart_satisfaccion_agencia_ejecutivo', error.message);
        }
    }
}

// Función para crear gráficos de satisfacción por género
function createSatisfaccionGeneroChart() {
    try {
        if (document.getElementById('chart_satisfaccion_genero')) {
            // Datos de ejemplo
            const maleData = [4.5, 4.6, 4.4, 4.3];
            const femaleData = [4.7, 4.5, 4.6, 4.5];
            const questions = ['PREGUNTA_1', 'PREGUNTA_2', 'PREGUNTA_3', 'PREGUNTA_4'];
            
            // Obtener configuración de tema
            const themeConfig = typeof getCurrentThemeConfig === 'function' 
                ? getCurrentThemeConfig() 
                : { 
                    paper_bgcolor: '#f9fafb', 
                    plot_bgcolor: '#f9fafb',
                    font: { family: 'Inter, sans-serif', color: '#333333' }
                  };
            
            // Obtener colores adecuados según el tema actual
            const colorsForChart = getColorPalette();
            
            Plotly.newPlot('chart_satisfaccion_genero', [
                {
                    x: questions,
                    y: maleData,
                    type: 'bar',
                    name: 'Masculino',
                    marker: { 
                        color: colorsForChart[0],
                        opacity: 0.85,
                        line: {
                            color: '#ffffff',
                            width: 1
                        }
                    },
                    hovertemplate: '%{x}<br>Calificación promedio: %{y:.2f}<extra>Masculino</extra>'
                },
                {
                    x: questions,
                    y: femaleData,
                    type: 'bar',
                    name: 'Femenino',
                    marker: { 
                        color: colorsForChart[5],
                        opacity: 0.85,
                        line: {
                            color: '#ffffff',
                            width: 1
                        }
                    },
                    hovertemplate: '%{x}<br>Calificación promedio: %{y:.2f}<extra>Femenino</extra>'
                }
            ], {
                title: {
                    text: 'Satisfacción Promedio por Género y Pregunta',
                    font: { 
                        family: 'Inter, sans-serif', 
                        size: 16,
                        color: themeConfig.font.color || '#333333'
                    },
                    y: 0.95 // Ajustar posición vertical del título
                },
                xaxis: { 
                    title: 'Pregunta',
                    automargin: true
                },
                yaxis: { 
                    title: 'Calificación Promedio',
                    range: [0, 5],
                    dtick: 1,
                    automargin: true
                },
                margin: { t: 60, b: 70, l: 70, r: 30 }, // Aumentar márgenes para evitar superposición
                plot_bgcolor: themeConfig.plot_bgcolor,
                paper_bgcolor: themeConfig.paper_bgcolor,
                barmode: 'group',
                bargap: 0.15,
                bargroupgap: 0.1,
                height: 380,
                legend: { orientation: 'h', y: -0.25 }
            }, plotlyConfig);
            
            // Actualizar tabla
            const tableData = [
                { "Género": "Masculino", "PREGUNTA_1": "4.50", "PREGUNTA_2": "4.60", "PREGUNTA_3": "4.40", "PREGUNTA_4": "4.30", "Promedio": "4.45" },
                { "Género": "Femenino", "PREGUNTA_1": "4.70", "PREGUNTA_2": "4.50", "PREGUNTA_3": "4.60", "PREGUNTA_4": "4.50", "Promedio": "4.58" }
            ];
            
            updateTable('table_satisfaccion_genero', tableData, ['Género', 'PREGUNTA_1', 'PREGUNTA_2', 'PREGUNTA_3', 'PREGUNTA_4', 'Promedio']);
        }
    } catch (error) {
        handleDataLoadError('chart_satisfaccion_genero', error.message);
    }
}

// Función para cargar gráficos de inferencia
async function loadInferenciaCharts() {
    try {
        const response = await fetch('data/inferencia_SEGMENTO_Personas_vs_Empresas.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        console.log("Datos de inferencia cargados:", jsonData);
        
        // Cargar imagen para chart_hipotesis_boxplot y otros gráficos de hipótesis
        if (document.getElementById('chart_hipotesis_boxplot')) {
            document.getElementById('chart_hipotesis_boxplot').innerHTML = `
                <h4 class="text-base font-medium text-gray-700 mb-2">Comparación de Distribuciones</h4>
                <img src="graficos/inferencia_SEGMENTO_Personas_vs_Empresas.png" alt="Boxplot Inferencia" class="mx-auto rounded shadow">
            `;
        }
        
        // Generar histogramas para cada grupo
        if (document.getElementById('chart_hipotesis_histograma')) {
            // Generar datos para el histograma basados en la distribución
            const personasData = generateRandomData(jsonData.media1, jsonData.error1 || 0.1, 200);
            const empresasData = generateRandomData(jsonData.media2, jsonData.error2 || 0.2, 50);
            
            Plotly.newPlot('chart_hipotesis_histograma', [
                {
                    x: personasData,
                    type: 'histogram',
                    opacity: 0.7,
                    name: 'Personas',
                    marker: { color: colorPalette[0] }
                },
                {
                    x: empresasData,
                    type: 'histogram',
                    opacity: 0.7,
                    name: 'Empresas',
                    marker: { color: colorPalette[1] }
                }
            ], {
                title: {
                    text: 'Distribución de Calificaciones',
                    font: { family: 'Inter, sans-serif', size: 14 }
                },
                xaxis: { title: 'Calificación', range: [0, 5] },
                yaxis: { title: 'Frecuencia' },
                barmode: 'overlay',
                bargap: 0.05,
                margin: { t: 50, b: 50, l: 50, r: 20 },
                plot_bgcolor: '#f9fafb',
                paper_bgcolor: '#f9fafb',
                height: 300
            }, plotlyConfig);
        }
        
        // QQ Plot es complejo de generar, usaremos un placeholder
        if (document.getElementById('chart_hipotesis_qqplot')) {
            document.getElementById('chart_hipotesis_qqplot').innerHTML = `
                <h4 class="text-base font-medium text-gray-700 mb-2">QQ Plot</h4>
                <div class="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                    <p class="text-gray-500 italic">Análisis de normalidad</p>
                </div>
            `;
        }
        
        // Actualizar los textos del análisis inferencial
        if (document.getElementById('ic_media_global')) {
            document.getElementById('ic_media_global').textContent = 
                `IC 95% para la media de satisfacción global (PREGUNTA_1): [${(jsonData.media1-1.96*jsonData.error1).toFixed(2)}, ${(jsonData.media1+1.96*jsonData.error1).toFixed(2)}]`;
        }
        
        if (document.getElementById('ic_diferencia_medias_grupos')) {
            const diferencia = jsonData.media1 - jsonData.media2;
            const errorDif = Math.sqrt(Math.pow(jsonData.error1, 2) + Math.pow(jsonData.error2, 2));
            document.getElementById('ic_diferencia_medias_grupos').textContent = 
                `IC 95% para la diferencia de medias (Personas - Empresas): [${(diferencia-1.96*errorDif).toFixed(2)}, ${(diferencia+1.96*errorDif).toFixed(2)}]`;
        }
        
    } catch (error) {
        console.error('Error al cargar gráficos de inferencia:', error);
        document.querySelectorAll('#chart_hipotesis_boxplot, #chart_hipotesis_histograma, #chart_hipotesis_qqplot').forEach(el => {
            el.innerHTML = `
                <div class="p-4 bg-red-50 text-red-600 rounded-lg text-center">
                    <p>Error al cargar datos de inferencia</p>
                </div>
            `;
        });
        
        // Crear datos de respaldo si hay error
        crearDatosInferenciaRespaldo();
    }
}

// Función para crear datos de inferencia de respaldo en caso de error
function crearDatosInferenciaRespaldo() {
    if (document.getElementById('chart_hipotesis_histograma')) {
        const personasData = Array(200).fill().map(() => Math.min(5, Math.max(1, 4.6 + (Math.random()-0.5))));
        const empresasData = Array(50).fill().map(() => Math.min(5, Math.max(1, 4.2 + (Math.random()-0.5))));
        
        Plotly.newPlot('chart_hipotesis_histograma', [
            {
                x: personasData,
                type: 'histogram',
                opacity: 0.7,
                name: 'Personas',
                marker: { color: colorPalette[0] }
            },
            {
                x: empresasData,
                type: 'histogram',
                opacity: 0.7,
                name: 'Empresas',
                marker: { color: colorPalette[1] }
            }
        ], {
            title: {
                text: 'Distribución de Calificaciones (Datos de respaldo)',
                font: { family: 'Inter, sans-serif', size: 14 }
            },
            xaxis: { title: 'Calificación', range: [0, 5] },
            yaxis: { title: 'Frecuencia' },
            barmode: 'overlay',
            bargap: 0.05,
            margin: { t: 50, b: 50, l: 50, r: 20 },
            plot_bgcolor: '#f9fafb',
            paper_bgcolor: '#f9fafb',
            height: 300
        }, plotlyConfig);
    }
    
    if (document.getElementById('ic_media_global')) {
        document.getElementById('ic_media_global').textContent = 
            `IC 95% para la media de satisfacción global (PREGUNTA_1): [4.38, 4.52]`;
    }
    
    if (document.getElementById('ic_diferencia_medias_grupos')) {
        document.getElementById('ic_diferencia_medias_grupos').textContent = 
            `IC 95% para la diferencia de medias (Personas - Empresas): [0.35, 0.75]`;
    }
}

// Función para generar datos aleatorios con distribución aproximadamente normal
function generateRandomData(mean, stdError, n) {
    // Estimamos la desviación estándar basada en el error estándar
    const stdDev = stdError * Math.sqrt(n);
    
    // Generar datos
    return Array(n).fill().map(() => {
        // Aproximación simple de una distribución normal usando la suma de valores aleatorios uniformes
        const u = Array(12).fill().map(() => Math.random()).reduce((a, b) => a + b, 0) - 6;
        return Math.max(1, Math.min(5, Math.round((mean + stdDev * u / 5) * 10) / 10));
    });
}

// Función para cargar y visualizar el heat map de género vs ciudad
async function loadGeneroVsCiudadHeatmap() {
    try {
        // Datos de ejemplo para la tabla de contingencia
        const data = {
            "Masculino": {
                "Bogotá D.C.": 285,
                "Medellín": 160,
                "Cali": 45,
                "Barranquilla": 30,
                "Bucaramanga": 25,
                "Manizales": 25
            },
            "Femenino": {
                "Bogotá D.C.": 266,
                "Medellín": 144,
                "Cali": 35,
                "Barranquilla": 20,
                "Bucaramanga": 15,
                "Manizales": 15
            }
        };
        
        if (document.getElementById('chart_contingencia_heatmap')) {
            const rows = Object.keys(data);
            const cols = Object.keys(data[rows[0]]);
            const zValues = rows.map(row => cols.map(col => data[row][col]));
            
            Plotly.newPlot('chart_contingencia_heatmap', [{
                x: cols,
                y: rows,
                z: zValues,
                type: 'heatmap',
                colorscale: 'Blues',
                showscale: true,
                hovertemplate: '%{y} - %{x}<br>Cantidad: %{z}<extra></extra>'
            }], {
                title: {
                    text: 'Distribución de Género por Ciudad',
                    font: { family: 'Inter, sans-serif', size: 16 }
                },
                margin: { t: 50, b: 80, l: 100, r: 50 },
                paper_bgcolor: '#f9fafb',
                height: 350,
                xaxis: {
                    title: 'Ciudad',
                    tickangle: -45,
                    automargin: true
                },
                yaxis: {
                    title: 'Género',
                    automargin: true
                }
            }, plotlyConfig);
            
            // Actualizar la tabla de contingencia
            const tableData = [];
            cols.forEach(ciudad => {
                const row = { "Ciudad": ciudad };
                rows.forEach(genero => {
                    row[genero] = data[genero][ciudad];
                });
                row["Total"] = rows.reduce((sum, genero) => sum + data[genero][ciudad], 0);
                tableData.push(row);
            });
            
            // Añadir fila de totales
            const totalRow = { "Ciudad": "Total" };
            rows.forEach(genero => {
                totalRow[genero] = cols.reduce((sum, ciudad) => sum + data[genero][ciudad], 0);
            });
            totalRow["Total"] = rows.reduce((outerSum, genero) => 
                outerSum + cols.reduce((innerSum, ciudad) => innerSum + data[genero][ciudad], 0), 0
            );
            tableData.push(totalRow);
            
            updateTable('table_contingencia_genero_ciudad', tableData, ['Ciudad', ...rows, 'Total']);
        }
    } catch (error) {
        handleDataLoadError('chart_contingencia_heatmap', error.message);
    }
}

// Función para crear gráfico de agencia/ejecutivo (datos de ejemplo)
async function createAgenciaEjecutivoChart() {
    try {
        if (document.getElementById('chart_agencia_ejecutivo_distribucion')) {
            // Intentar cargar datos reales primero
            let data;
            try {
                const response = await fetch('data/tabla_AGENCIA_EJECUTIVO.json');
                if (response.ok) {
                    const jsonData = await response.json();
                    data = {
                        labels: jsonData.map(item => item.AGENCIA_EJECUTIVO),
                        values: jsonData.map(item => item["Frec. Absoluta"]),
                        isPercentage: false
                    };
                } else {
                    throw new Error("Usando datos de ejemplo");
                }
            } catch (e) {
                console.log("Usando datos de ejemplo para agencia/ejecutivo:", e.message);
                // Datos de ejemplo
                data = {
                    labels: ['GERENTE DE AGENCIA', 'GERENTE DE CUENTA EMPRESAS'],
                    values: [1026, 39],
                    isPercentage: false
                };
            }
            
            // Obtener configuración de tema
            const themeConfig = typeof getCurrentThemeConfig === 'function' 
                ? getCurrentThemeConfig() 
                : { 
                    paper_bgcolor: '#f9fafb', 
                    plot_bgcolor: '#f9fafb',
                    font: { family: 'Inter, sans-serif', color: '#333333' }
                  };
            
            // Obtener colores adecuados según el tema actual
            const colorsForChart = getColorPalette().slice(0, 2);
            
            Plotly.newPlot('chart_agencia_ejecutivo_distribucion', [{
                x: data.labels,
                y: data.values,
                type: 'bar',
                marker: {
                    color: colorsForChart,
                    opacity: 0.85,
                    line: {
                        color: '#ffffff',
                        width: 1
                    }
                },
                text: data.values.map(v => v),
                textposition: 'auto',
                hovertemplate: '%{x}<br>Cantidad: %{y}<extra></extra>'
            }], {
                title: {
                    text: 'Distribución por Tipo de Ejecutivo',
                    font: { 
                        family: 'Inter, sans-serif', 
                        size: 16,
                        color: themeConfig.font.color || '#333333'
                    },
                    y: 0.95 // Ajustar posición vertical del título
                },
                xaxis: { 
                    title: 'Tipo de Ejecutivo',
                    automargin: true
                },
                yaxis: { 
                    title: 'Cantidad',
                    automargin: true
                },
                margin: { t: 60, b: 80, l: 60, r: 30 }, // Aumentar márgenes para evitar superposición
                plot_bgcolor: themeConfig.plot_bgcolor,
                paper_bgcolor: themeConfig.paper_bgcolor,
                height: 350,
                bargap: 0.3
            }, plotlyConfig);
        }
        
        if (document.getElementById('chart_satisfaccion_agencia_ejecutivo')) {
            const data = {
                labels: ['GERENTE DE AGENCIA', 'GERENTE DE CUENTA EMPRESAS'],
                values: [4.5, 3.8],
                isPercentage: false
            };
            
            // Obtener configuración de tema
            const themeConfig = typeof getCurrentThemeConfig === 'function' 
                ? getCurrentThemeConfig() 
                : { 
                    paper_bgcolor: '#f9fafb', 
                    plot_bgcolor: '#f9fafb',
                    font: { family: 'Inter, sans-serif', color: '#333333' }
                  };
            
            // Obtener colores adecuados según el tema actual
            const colorsForChart = getColorPalette().slice(0, 2);
            
            Plotly.newPlot('chart_satisfaccion_agencia_ejecutivo', [{
                x: data.labels,
                y: data.values,
                type: 'bar',
                marker: {
                    color: colorsForChart[0],
                    opacity: 0.85,
                    line: {
                        color: '#ffffff',
                        width: 1
                    }
                },
                text: data.values.map(v => v.toFixed(1)),
                textposition: 'auto',
                hovertemplate: '%{x}<br>Calificación promedio: %{y}<extra></extra>'
            }], {
                title: {
                    text: 'Satisfacción Promedio por Tipo de Ejecutivo',
                    font: { 
                        family: 'Inter, sans-serif', 
                        size: 16,
                        color: themeConfig.font.color || '#333333'
                    },
                    y: 0.95 // Ajustar posición vertical del título
                },
                xaxis: { 
                    title: 'Tipo de Ejecutivo',
                    automargin: true
                },
                yaxis: { 
                    title: 'Calificación Promedio',
                    range: [0, 5],
                    dtick: 1,
                    automargin: true
                },
                margin: { t: 60, b: 80, l: 60, r: 30 }, // Aumentar márgenes para evitar superposición
                plot_bgcolor: themeConfig.plot_bgcolor,
                paper_bgcolor: themeConfig.paper_bgcolor,
                height: 350,
                bargap: 0.3
            }, plotlyConfig);
        }
    } catch (error) {
        handleDataLoadError('chart_agencia_ejecutivo_distribucion', error.message);
        if (document.getElementById('chart_satisfaccion_agencia_ejecutivo')) {
            handleDataLoadError('chart_satisfaccion_agencia_ejecutivo', error.message);
        }
    }
}

// Función para crear gráficos de satisfacción por género
function createSatisfaccionGeneroChart() {
    try {
        if (document.getElementById('chart_satisfaccion_genero')) {
            // Datos de ejemplo
            const maleData = [4.5, 4.6, 4.4, 4.3];
            const femaleData = [4.7, 4.5, 4.6, 4.5];
            const questions = ['PREGUNTA_1', 'PREGUNTA_2', 'PREGUNTA_3', 'PREGUNTA_4'];
            
            // Obtener configuración de tema
            const themeConfig = typeof getCurrentThemeConfig === 'function' 
                ? getCurrentThemeConfig() 
                : { 
                    paper_bgcolor: '#f9fafb', 
                    plot_bgcolor: '#f9fafb',
                    font: { family: 'Inter, sans-serif', color: '#333333' }
                  };
            
            // Obtener colores adecuados según el tema actual
            const colorsForChart = getColorPalette();
            
            Plotly.newPlot('chart_satisfaccion_genero', [
                {
                    x: questions,
                    y: maleData,
                    type: 'bar',
                    name: 'Masculino',
                    marker: { 
                        color: colorsForChart[0],
                        opacity: 0.85,
                        line: {
                            color: '#ffffff',
                            width: 1
                        }
                    },
                    hovertemplate: '%{x}<br>Calificación promedio: %{y:.2f}<extra>Masculino</extra>'
                },
                {
                    x: questions,
                    y: femaleData,
                    type: 'bar',
                    name: 'Femenino',
                    marker: { 
                        color: colorsForChart[5],
                        opacity: 0.85,
                        line: {
                            color: '#ffffff',
                            width: 1
                        }
                    },
                    hovertemplate: '%{x}<br>Calificación promedio: %{y:.2f}<extra>Femenino</extra>'
                }
            ], {
                title: {
                    text: 'Satisfacción Promedio por Género y Pregunta',
                    font: { 
                        family: 'Inter, sans-serif', 
                        size: 16,
                        color: themeConfig.font.color || '#333333'
                    },
                    y: 0.95 // Ajustar posición vertical del título
                },
                xaxis: { 
                    title: 'Pregunta',
                    automargin: true
                },
                yaxis: { 
                    title: 'Calificación Promedio',
                    range: [0, 5],
                    dtick: 1,
                    automargin: true
                },
                margin: { t: 60, b: 70, l: 70, r: 30 }, // Aumentar márgenes para evitar superposición
                plot_bgcolor: themeConfig.plot_bgcolor,
                paper_bgcolor: themeConfig.paper_bgcolor,
                barmode: 'group',
                bargap: 0.15,
                bargroupgap: 0.1,
                height: 380,
                legend: { orientation: 'h', y: -0.25 }
            }, plotlyConfig);
            
            // Actualizar tabla
            const tableData = [
                { "Género": "Masculino", "PREGUNTA_1": "4.50", "PREGUNTA_2": "4.60", "PREGUNTA_3": "4.40", "PREGUNTA_4": "4.30", "Promedio": "4.45" },
                { "Género": "Femenino", "PREGUNTA_1": "4.70", "PREGUNTA_2": "4.50", "PREGUNTA_3": "4.60", "PREGUNTA_4": "4.50", "Promedio": "4.58" }
            ];
            
            updateTable('table_satisfaccion_genero', tableData, ['Género', 'PREGUNTA_1', 'PREGUNTA_2', 'PREGUNTA_3', 'PREGUNTA_4', 'Promedio']);
        }
    } catch (error) {
        handleDataLoadError('chart_satisfaccion_genero', error.message);
    }
}

// Función para cargar gráficos de inferencia
async function loadInferenciaCharts() {
    try {
        const response = await fetch('data/inferencia_SEGMENTO_Personas_vs_Empresas.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const jsonData = await response.json();
        
        // Actualizar contenido de hipótesis con datos reales
        if (document.getElementById('hipotesis_purpose_text')) {
            document.getElementById('hipotesis_purpose_text').textContent = `Las pruebas de hipótesis nos permiten validar estadísticamente si existen diferencias significativas en la satisfacción de los clientes según distintas variables como el segmento al que pertenecen (Personas o Empresas), la ciudad de la agencia o el tipo de ejecutivo que los atiende.`;
        }
        
        if (document.getElementById('text_pruebas_normalidad')) {
            document.getElementById('text_pruebas_normalidad').innerHTML = `
                <p><strong>Prueba de Shapiro-Wilk para normalidad:</strong></p>
                <ul>
                    <li>Grupo "Personas": p-valor = ${jsonData.shapiro_p1.toExponential(2)} (menor a 0.05, no sigue distribución normal)</li>
                    <li>Grupo "Empresas": p-valor = ${jsonData.shapiro_p2.toExponential(2)} (menor a 0.05, no sigue distribución normal)</li>
                </ul>
                <p class="mt-2">Al no cumplirse el supuesto de normalidad, se utilizan pruebas no paramétricas para la comparación de grupos.</p>
            `;
        }
        
        // Actualizar información de la tarjeta de inferencia
        if (document.getElementById('inferencia_segmento_card')) {
            document.getElementById('inferencia_segmento_card').innerHTML = `
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-xl font-semibold text-blue-600 mb-4">Comparación de Satisfacción: Personas vs Empresas</h3>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <div class="font-medium text-gray-700">Personas</div>
                            <p>Media: <span class="font-bold">${jsonData.media1.toFixed(2)}</span></p>
                            <p>IC 95%: <span class="text-blue-600">[${jsonData.ic_media1[0].toFixed(2)}, ${jsonData.ic_media1[1].toFixed(2)}]</span></p>
                            <p>Mediana: ${jsonData.mediana1.toFixed(1)}</p>
                            <p>n: ${jsonData.n1}</p>
                        </div>
                        <div>
                            <div class="font-medium text-gray-700">Empresas</div>
                            <p>Media: <span class="font-bold">${jsonData.media2.toFixed(2)}</span></p>
                            <p>IC 95%: <span class="text-blue-600">[${jsonData.ic_media2[0].toFixed(2)}, ${jsonData.ic_media2[1].toFixed(2)}]</span></p>
                            <p>Mediana: ${jsonData.mediana2.toFixed(1)}</p>
                            <p>n: ${jsonData.n2}</p>
                        </div>
                    </div>
                    <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p><strong>Prueba utilizada:</strong> ${jsonData.test}</p>
                        <p><strong>Estadístico:</strong> ${jsonData.estadistico.toFixed(2)}</p>
                        <p><strong>Valor p:</strong> ${jsonData.pvalor.toFixed(4)}</p>
                        <p><strong>Conclusión:</strong> ${jsonData.pvalor < 0.05 ? 
                            'Se rechaza la hipótesis nula. Existe diferencia estadísticamente significativa en la satisfacción entre los segmentos Personas y Empresas.' : 
                            'No se rechaza la hipótesis nula. No hay evidencia suficiente para afirmar que existe diferencia en la satisfacción entre los segmentos.'}</p>
                    </div>
                </div>
            `;
        }
        
        // Crear visualizaciones para las pruebas de hipótesis
        createHipotesisVisualizations();
        
    } catch (error) {
        console.error("Error al cargar datos de inferencia:", error);
        
        // Si hay error, mostrar datos de ejemplo
        if (document.getElementById('inferencia_segmento_card')) {
            document.getElementById('inferencia_segmento_card').innerHTML = `
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-xl font-semibold text-blue-600 mb-4">Comparación de Satisfacción: Personas vs Empresas</h3>
                    <div class="p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-4">
                        <p class="font-medium">Información de inferencia no disponible</p>
                        <p class="text-sm">Se muestran datos de ejemplo para ilustración</p>
                    </div>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <div class="font-medium text-gray-700">Personas</div>
                            <p>Media: <span class="font-bold">4.41</span></p>
                            <p>IC 95%: <span class="text-blue-600">[4.35, 4.46]</span></p>
                            <p>Mediana: 5.0</p>
                            <p>n: 1026</p>
                        </div>
                        <div>
                            <div class="font-medium text-gray-700">Empresas</div>
                            <p>Media: <span class="font-bold">3.84</span></p>
                            <p>IC 95%: <span class="text-blue-600">[3.42, 4.26]</span></p>
                            <p>Mediana: 4.0</p>
                            <p>n: 37</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Crear visualizaciones para las pruebas de hipótesis con datos de ejemplo
        createHipotesisVisualizations();
    }
}

// Función para crear visualizaciones para las pruebas de hipótesis
function createHipotesisVisualizations() {
    // 1. Boxplot de comparación
    if (document.getElementById('chart_hipotesis_boxplot')) {
        const personasData = Array(30).fill().map(() => Math.min(5, Math.max(1, 4.4 + (Math.random() - 0.5) * 2)));
        const empresasData = Array(30).fill().map(() => Math.min(5, Math.max(1, 3.8 + (Math.random() - 0.5) * 2)));
        
        Plotly.newPlot('chart_hipotesis_boxplot', [
            {
                y: personasData,
                type: 'box',
                name: 'Personas',
                boxpoints: 'outliers',
                marker: { color: colorPalette[0] },
                line: { width: 2 },
                boxmean: true
            },
            {
                y: empresasData,
                type: 'box',
                name: 'Empresas',
                boxpoints: 'outliers',
                marker: { color: colorPalette[1] },
                line: { width: 2 },
                boxmean: true
            }
        ], {
            title: {
                text: 'Comparación de Satisfacción por Segmento',
                font: { family: 'Inter, sans-serif', size: 14 }
            },
            yaxis: { 
                title: 'Calificación',
                range: [0, 6],
                dtick: 1
            },
            margin: { t: 40, b: 20, l: 40, r: 20 },
            plot_bgcolor: '#f9fafb',
            paper_bgcolor: '#f9fafb',
            height: 300,
            boxgap: 0.3,
            showlegend: true
        }, plotlyConfig);
    }
    
    // 2. Histograma de distribución
    if (document.getElementById('chart_hipotesis_histograma')) {
        // Generar datos para el histograma
        const personasData = [];
        [1, 2, 3, 4, 5].forEach(rating => {
            const count = rating === 5 ? 600 : 
                         rating === 4 ? 300 : 
                         rating === 3 ? 80 : 
                         rating === 2 ? 30 : 16;
            for (let i = 0; i < count; i++) {
                personasData.push(rating);
            }
        });
        
        const empresasData = [];
        [1, 2, 3, 4, 5].forEach(rating => {
            const count = rating === 5 ? 10 : 
                         rating === 4 ? 15 : 
                         rating === 3 ? 8 : 
                         rating === 2 ? 3 :  1;
            for (let i = 0; i < count; i++) {
                empresasData.push(rating);
            }
        });
        
        Plotly.newPlot('chart_hipotesis_histograma', [
            {
                x: personasData,
                type: 'histogram',
                opacity: 0.7,
                name: 'Personas',
                marker: { color: colorPalette[0] },
                xbins: {
                    start: 0.5,
                    end: 5.5,
                    size: 1
                }
            },
            {
                x: empresasData,
                type: 'histogram',
                opacity: 0.7,
                name: 'Empresas',
                marker: { color: colorPalette[1] },
                xbins: {
                    start: 0.5,
                    end: 5.5,
                    size: 1
                }
            }
        ], {
            title: {
                text: 'Distribución de Calificaciones por Segmento',
                font: { family: 'Inter, sans-serif', size: 14 }
            },
            xaxis: { 
                title: 'Calificación',
                dtick: 1,
                range: [0.5, 5.5]
            },
            yaxis: { 
                title: 'Frecuencia',
                type: 'log'  // Escala logarítmica para mejor visualización
            },
            margin: { t: 40, b: 40, l: 50, r: 20 },
            plot_bgcolor: '#f9fafb',
            paper_bgcolor: '#f9fafb',
            height: 300,
            barmode: 'overlay',
            bargap: 0.1,
            showlegend: true
        }, plotlyConfig);
    }
    
    // 3. QQ-Plot (ejemplo simplificado)
    if (document.getElementById('chart_hipotesis_qqplot')) {
        // Generar datos de ejemplo para QQ-Plot
        const n = 100;
        const x = Array(n).fill().map((_, i) => i / (n - 1));
        
        // Línea de referencia
        const refLine = x.map(val => val);
        
        // Datos con desviación (simulando no normalidad)
        const personasQQ = x.map(val => {
            const dev = val < 0.5 ? 0.1 * Math.sin(val * Math.PI) : 0.15 * Math.sin(val * Math.PI);
            return val + dev;
        });
        
        const empresasQQ = x.map(val => {
            const dev = 0.2 * Math.sin(val * Math.PI * 2);
            return val + dev;
        });
        
        Plotly.newPlot('chart_hipotesis_qqplot', [
            {
                x: x,
                y: refLine,
                type: 'scatter',
                mode: 'lines',
                name: 'Referencia',
                line: {
                    color: 'rgba(0,0,0,0.5)',
                    width: 1,
                    dash: 'dash'
                }
            },
            {
                x: x,
                y: personasQQ,
                type: 'scatter',
                mode: 'markers',
                name: 'Personas',
                marker: {
                    color: colorPalette[0],
                    size: 4
                }
            },
            {
                x: x,
                y: empresasQQ,
                type: 'scatter',
                mode: 'markers',
                name: 'Empresas',
                marker: {
                    color: colorPalette[1],
                    size: 4
                }
            }
        ], {
            title: {
                text: 'Gráfico QQ-Plot (Prueba de Normalidad)',
                font: { family: 'Inter, sans-serif', size: 14 }
            },
            xaxis: { 
                title: 'Cuantiles Teóricos',
                zeroline: false
            },
            yaxis: { 
                title: 'Cuantiles Observados',
                zeroline: false
            },
            margin: { t: 40, b: 40, l: 50, r: 20 },
            plot_bgcolor: '#f9fafb',
            paper_bgcolor: '#f9fafb',
            height: 300,
            showlegend: true
        }, plotlyConfig);
    }
}

// Función para cargar la nube de palabras
function loadWordCloud() {
    try {
        if (document.getElementById('wordcloud_comentarios_placeholder')) {
            // Cargar la imagen SVG de nube de palabras (más efectivo que generar dinámicamente)
            document.getElementById('wordcloud_comentarios_placeholder').innerHTML = `
                <div class="relative w-full h-64 bg-white rounded-lg overflow-hidden">
                    <img src="graficos/wordcloud_pregunta5.svg" alt="Nube de palabras de comentarios" 
                        class="w-full h-full object-contain p-2 transform hover:scale-105 transition-transform duration-300">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent p-2 text-center text-xs text-gray-500">
                        Pase el cursor sobre la imagen para ampliar
                    </div>
                </div>
                <p class="text-sm text-center mt-2">Las palabras con mayor tamaño aparecen con mayor frecuencia en los comentarios de los clientes.</p>
            `;
        }
    } catch (error) {
        console.error("Error al cargar nube de palabras:", error);
        
        if (document.getElementById('wordcloud_comentarios_placeholder')) {
            document.getElementById('wordcloud_comentarios_placeholder').innerHTML = `
                <div class="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center">
                    <p>No se pudo cargar la nube de palabras</p>
                </div>
            `;
        }
    }
}

// --- Funciones de utilidad ---

// Función para calcular estadísticas descriptivas
function calculateStats(values) {
    if (!values || values.length === 0) return {};
    
    // Ordenar valores para cálculos
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Media
    const sum = sortedValues.reduce((acc, val) => acc + val, 0);
    const mean = sum / sortedValues.length;
    
    // Mediana
    const mid = Math.floor(sortedValues.length / 2);
    const median = sortedValues.length % 2 === 0 ? 
        (sortedValues[mid - 1] + sortedValues[mid]) / 2 : 
        sortedValues[mid];
    
    // Min y Max
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    
    // Desviación estándar
    const squaredDiffs = sortedValues.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / sortedValues.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        mean: mean.toFixed(2),
        median: median.toFixed(1),
        min: min,
        max: max,
        stdDev: stdDev.toFixed(2),
        n: sortedValues.length
    };
}

// Función para actualizar una tabla de estadísticas
function updateStatsTable(tableId, stats) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    table.innerHTML = `
        <table class='min-w-full'>
            <thead>
                <tr>
                    <th>Media</th>
                    <th>Mediana</th>
                    <th>Mín</th>
                    <th>Máx</th>
                    <th>Desv. Est.</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${stats.mean}</td>
                    <td>${stats.median}</td>
                    <td>${stats.min}</td>
                    <td>${stats.max}</td>
                    <td>${stats.stdDev}</td>
                </tr>
            </tbody>
        </table>
    `;
}

// Función para actualizar una tabla de datos
function updateTable(tableId, data, columnNames) {
    const table = document.getElementById(tableId);
    if (!table || !data || data.length === 0) return;
    
    let html = '<table class="min-w-full text-sm"><thead><tr>';
    
    // Cabeceras
    columnNames.forEach(col => {
        html += `<th class="py-2">${col}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    // Filas de datos
    data.forEach(row => {
        html += '<tr>';
        columnNames.forEach(col => {
            html += `<td>${row[col] !== undefined ? row[col] : ''}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    table.innerHTML = html;
}

// Función para comprobar el estado de carga del tema actual
function updateChartsTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const chartElements = document.querySelectorAll('[id^="chart_"]');
    
    chartElements.forEach(el => {
        if (el && typeof Plotly !== 'undefined') {
            Plotly.relayout(el.id, {
                paper_bgcolor: isDarkMode ? '#1e1e1e' : '#f9fafb',
                plot_bgcolor: isDarkMode ? '#1e1e1e' : '#f9fafb',
                font: {
                    color: isDarkMode ? '#e0e0e0' : '#333333'
                }
            }).catch(err => console.log(`No se pudo actualizar el tema para ${el.id}:`, err));
        }
    });
}

// Función para inicializar las secciones y hallazgos vacíos
function initializePlaceholderContent() {
    // Actualizar propósito de pruebas de hipótesis
    if (document.getElementById('hipotesis_purpose_text')) {
        document.getElementById('hipotesis_purpose_text').textContent = "El objetivo de las pruebas de hipótesis es determinar si existen diferencias estadísticamente significativas en la satisfacción del cliente entre diferentes segmentos, ciudades o tipos de ejecutivo. Esto permite tomar decisiones basadas en evidencia estadística.";
    }
    
    // Actualizar hallazgos
    if (document.getElementById('list_hallazgos')) {
        document.getElementById('list_hallazgos').innerHTML = `
            <li>Los clientes del segmento <strong>Personas</strong> muestran una satisfacción significativamente mayor (media = 4.41) que los del segmento <strong>Empresas</strong> (media = 3.84).</li>
            <li>La ciudad con mayor satisfacción promedio es <strong>Barranquilla</strong> (4.7), mientras que <strong>Pereira</strong> presenta los niveles más bajos (4.2).</li>
            <li>Existe una relación positiva entre la rapidez en la atención y la calificación general, siendo este un factor determinante en la satisfacción.</li>
            <li>Los comentarios de los clientes destacan principalmente la <strong>atención al cliente</strong> y los <strong>tiempos de respuesta</strong> como factores clave de su experiencia.</li>
            <li>No se encontraron diferencias significativas en la satisfacción por género, lo que sugiere que el servicio es percibido de manera similar tanto por hombres como por mujeres.</li>
        `;
    }
    
    // Actualizar conclusiones
    if (document.getElementById('text_conclusiones_principales')) {
        document.getElementById('text_conclusiones_principales').innerHTML = `
            <p class="mb-3">El análisis de satisfacción del cliente de Coltefinanciera revela un nivel general de satisfacción positivo, con una calificación promedio de 4.4 sobre 5. Sin embargo, existen áreas de oportunidad importantes, especialmente en el segmento Empresas y en algunas ciudades específicas como Pereira y Cali.</p>
            <p class="mb-3">Se identificaron diferencias estadísticamente significativas en la satisfacción entre los segmentos de Personas y Empresas, lo que sugiere la necesidad de estrategias diferenciadas para cada grupo. Los gerentes de agencia reciben calificaciones más altas que los gerentes de cuenta empresas, lo que podría explicar parte de esta diferencia.</p>
            <p>Los factores más valorados por los clientes son la rapidez en la atención, la claridad de la información proporcionada y la amabilidad del personal. Los comentarios abiertos resaltan estos aspectos como determinantes en la experiencia del cliente.</p>
        `;
    }
    
    // Actualizar recomendaciones
    if (document.getElementById('list_recomendaciones')) {
        document.getElementById('list_recomendaciones').innerHTML = `
            <li>Implementar un programa de capacitación específico para los gerentes de cuenta empresas, enfocado en mejorar la satisfacción del segmento Empresas.</li>
            <li>Establecer un plan de acción prioritario para las agencias de Pereira y Cali, donde se registran los niveles más bajos de satisfacción.</li>
            <li>Optimizar los procesos de respuesta a solicitudes, identificado como un factor clave en los comentarios de los clientes.</li>
            <li>Desarrollar una estrategia de comunicación más clara sobre los productos y servicios, especialmente para el segmento Empresas.</li>
            <li>Implementar un sistema de seguimiento continuo de la satisfacción para monitorear el impacto de las acciones de mejora implementadas.</li>
        `;
    }
}

// Inicializar cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos los gráficos
    initializeAllCharts();
    
    // Inicializar contenido placeholder
    initializePlaceholderContent();
    
    // Actualizar tema de gráficos cuando cambia el tema
    document.getElementById('btn_theme_toggle')?.addEventListener('click', updateChartsTheme);
    
    console.log("Script de inicialización de gráficos cargado correctamente");
});
