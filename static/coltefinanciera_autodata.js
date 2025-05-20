// static/coltefinanciera_autodata.js
// Este script carga automáticamente los resultados JSON y gráficos generados por Python y los inserta en el dashboard web.

function renderTableFromJson(jsonPath, containerId) {
    fetch(jsonPath)
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) {
                document.getElementById(containerId).innerHTML = '<em>No hay datos disponibles</em>';
                return;
            }
            let html = '<table class="min-w-full"><thead><tr>';
            Object.keys(data[0]).forEach(col => html += `<th>${col}</th>`);
            html += '</tr></thead><tbody>';
            data.forEach(row => {
                html += '<tr>';
                Object.values(row).forEach(cell => html += `<td>${cell}</td>`);
                html += '</tr>';
            });
            html += '</tbody></table>';
            document.getElementById(containerId).innerHTML = html;
        })
        .catch(() => {
            document.getElementById(containerId).innerHTML = '<em>No disponible</em>';
        });
}

/**
 * Carga y renderiza un gráfico Plotly basado en un JSON generado por Python.
 * Esta función reemplaza a renderImage para proporcionar gráficos interactivos.
 * 
 * @param {string} jsonPath - Ruta al archivo JSON generado por Python 
 * @param {string} containerId - ID del contenedor HTML donde se renderizará el gráfico
 * @param {string} title - Título del gráfico
 * @param {object} options - Opciones adicionales para el gráfico (opcional)
 */
function loadJsonPlotlyChart(jsonPath, containerId, title, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Mostrar indicador de carga
    container.innerHTML = '<div class="loading-spinner"><div></div><div></div><div></div><div></div></div>';
    
    // Configurar generador de datos de muestra
    const mockGenerator = createMockDataGenerator(
        options.chartType || 'bar', 
        { title: title, ...options.mockOptions }
    );
    
    // Utilizar el módulo centralizado para cargar datos
    loadPlotlyJson(jsonPath, {
        useMockData: options.useMockData || false,
        mockDataGenerator: mockGenerator,
        retries: options.retries || 1
    })
    .then(jsonData => {
        // Configuración del gráfico
        let data, layout;
        
        if (jsonData.data) {
            // Formato estándar de Plotly
            data = jsonData.data;
            layout = {
                ...jsonData.layout,
                title: title,
                autosize: true
            };
        } else if (Array.isArray(jsonData)) {
            // Formato de tabla/array
            const values = jsonData.map(item => Object.values(item)[1]);
            const labels = jsonData.map(item => Object.values(item)[0]);
            
            data = [{
                type: options.chartType || 'bar',
                x: labels,
                y: values,
                marker: {
                    color: window.getThemeColorPalette ? window.getThemeColorPalette() : ['#3b82f6'],
                }
            }];
            
            layout = {
                title: title,
                font: { family: 'Inter, sans-serif' },
                autosize: true,
                ...options.layout
            };
        }
        
        // Aplicar tema actual si está disponible
        if (window.getCurrentThemeConfig) {
            const themeConfig = window.getCurrentThemeConfig();
            layout.paper_bgcolor = themeConfig.paper_bgcolor;
            layout.plot_bgcolor = themeConfig.plot_bgcolor;
            layout.font = themeConfig.font;
        }
        
        // Configuración de Plotly
        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            ...options.config
        };
        
        // Renderizar gráfico
        Plotly.newPlot(containerId, data, layout, config);
    })
    .catch(error => {
        console.error(`Error al cargar gráfico ${title}:`, error);
        container.innerHTML = `
            <div class="p-4 bg-red-50 text-red-600 rounded-lg text-center">
                <p class="font-medium">Error al cargar los datos</p>
                <p class="text-sm mt-1">Intente recargar la página o contacte al administrador.</p>
            </div>
        `;
    });
}

// --- Acordeón para sección de comentarios y análisis de frases ---
window.setupComentariosAccordion = function() {
    const header = document.querySelector('#summary_comentarios_temas h4');
    const content = document.getElementById('summary_comentarios_temas');
    if(header && content) {
        header.style.cursor = 'pointer';
        header.onclick = function() {
            content.classList.toggle('collapsed');
            if(content.classList.contains('collapsed')) {
                content.style.maxHeight = '3rem';
                content.style.overflow = 'hidden';
            } else {
                content.style.maxHeight = '1000px';
                content.style.overflow = 'visible';
            }
        };
        // Inicialmente contraído
        content.classList.add('collapsed');
        content.style.maxHeight = '3rem';
        content.style.overflow = 'hidden';
    }
}

// --- Acordeón general para cualquier sección con .accordion-header y .accordion-content ---
window.setupGeneralAccordion = function() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            header.classList.toggle('active');
            const content = header.nextElementSibling;
            if(content && content.classList.contains('accordion-content')) {
                if(header.classList.contains('active')) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.overflow = 'visible';
                } else {
                    content.style.maxHeight = '0';
                    content.style.overflow = 'hidden';
                }
            }
        });
        // Inicialmente contraído
        header.classList.remove('active');
        const content = header.nextElementSibling;
        if(content && content.classList.contains('accordion-content')) {
            content.style.maxHeight = '0';
            content.style.overflow = 'hidden';
        }
    });
}

// --- Visualización de intervalos de confianza y pruebas de hipótesis ---
function renderInferenciaCard(jsonPath, containerPrefix) {
    fetch(jsonPath)
        .then(r => r.json())
        .then(data => {
            // Tarjeta resumen
            let html = `<div class="bg-white rounded-lg shadow p-6 mb-4">
                <h5 class="text-lg font-bold text-blue-700 mb-2">Comparación: <span class="font-semibold">${data.grupo1}</span> vs <span class="font-semibold">${data.grupo2}</span></h5>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                        <div class="font-semibold text-gray-600">${data.grupo1}</div>
                        <div>Media: <span class="font-bold">${data.media1.toFixed(2)}</span></div>
                        <div>IC 95%: <span class="text-blue-600">[${data.ic_media1[0].toFixed(2)}, ${data.ic_media1[1].toFixed(2)}]</span></div>
                        <div>Mediana: ${data.mediana1.toFixed(2)}</div>
                        <div>n: ${data.n1}</div>
                    </div>
                    <div>
                        <div class="font-semibold text-gray-600">${data.grupo2}</div>
                        <div>Media: <span class="font-bold">${data.media2.toFixed(2)}</span></div>
                        <div>IC 95%: <span class="text-blue-600">[${data.ic_media2[0].toFixed(2)}, ${data.ic_media2[1].toFixed(2)}]</span></div>
                        <div>Mediana: ${data.mediana2.toFixed(2)}</div>
                        <div>n: ${data.n2}</div>
                    </div>
                </div>
                <div class="mt-2">
                    <div><span class="font-semibold">Prueba:</span> ${data.test}</div>
                    <div><span class="font-semibold">Estadístico:</span> ${data.estadistico.toFixed(3)}</div>
                    <div><span class="font-semibold">p-valor:</span> <span class="${data.pvalor < 0.05 ? 'text-red-600 font-bold' : 'text-green-700 font-bold'}">${data.pvalor.toExponential(2)}</span></div>
                    <div><span class="font-semibold">Shapiro p (gr1):</span> ${data.shapiro_p1.toExponential(2)} | <span class="font-semibold">Shapiro p (gr2):</span> ${data.shapiro_p2.toExponential(2)}</div>
                    <div><span class="font-semibold">Levene p:</span> ${data.levene_p.toExponential(2)}</div>
                </div>
            </div>`;
            document.getElementById(containerPrefix+"_card").innerHTML = html;
            // Intervalos de confianza en texto
            document.getElementById("ic_media_global").textContent = `IC 95% media ${data.grupo1}: [${data.ic_media1[0].toFixed(2)}, ${data.ic_media1[1].toFixed(2)}], ${data.grupo2}: [${data.ic_media2[0].toFixed(2)}, ${data.ic_media2[1].toFixed(2)}]`;
            // Prueba de hipótesis
            document.getElementById("hipotesis_purpose_text").textContent = `Se comparan las medias de ${data.grupo1} y ${data.grupo2} usando la prueba ${data.test}. p-valor: ${data.pvalor.toExponential(2)}.`;
            // Decisión e interpretación
            document.querySelectorAll("#pruebas_hipotesis .bg-white p").forEach(p => {
                if(p.innerText.includes('P-valor:')) p.innerHTML = `<strong>P-valor:</strong> ${data.pvalor.toExponential(2)}`;
                if(p.innerText.includes('Decisión:')) p.innerHTML = `<strong>Decisión:</strong> ${data.pvalor < 0.05 ? 'Se rechaza H0 (diferencia significativa)' : 'No se rechaza H0 (no hay diferencia significativa)'}`;
                if(p.innerText.includes('Interpretación:')) p.innerHTML = `<strong>Interpretación:</strong> ${data.pvalor < 0.05 ? 'Existe evidencia estadística de diferencia entre los grupos.' : 'No se observa diferencia estadísticamente significativa entre los grupos.'}`;
            });
        });
}

window.addEventListener('DOMContentLoaded', function() {
    // Univariado
    loadJsonPlotlyChart('data/plotly_univariado_SEGMENTO.json', 'chart_segmento_distribucion', 'Distribución de Segmento');
    renderTableFromJson('data/tabla_SEGMENTO.json', 'table_segmento_frecuencia');
    
    loadJsonPlotlyChart('data/plotly_univariado_CIUDAD_AGENCIA.json', 'chart_ciudad_distribucion', 'Distribución de Ciudad Agencia');
    renderTableFromJson('data/tabla_CIUDAD_AGENCIA.json', 'table_ciudad_frecuencia');
    
    loadJsonPlotlyChart('data/plotly_univariado_TIPO_EJECUTIVO.json', 'chart_agencia_ejecutivo_distribucion', 'Distribución de Tipo Ejecutivo');
    renderTableFromJson('data/tabla_TIPO_EJECUTIVO.json', 'table_agencia_ejecutivo_frecuencia');
    
    loadJsonPlotlyChart('data/plotly_univariado_GENERO.json', 'chart_genero_distribucion', 'Distribución de Género');
    renderTableFromJson('data/tabla_GENERO.json', 'table_genero_frecuencia');
    
    // Calificaciones
    loadJsonPlotlyChart('data/plotly_univariado_PREGUNTA_1.json', 'chart_pregunta1_distribucion', 'Distribución PREGUNTA_1');
    renderTableFromJson('data/tabla_PREGUNTA_1.json', 'table_pregunta1_stats');
    
    loadJsonPlotlyChart('data/plotly_univariado_PREGUNTA_2.json', 'chart_pregunta2_distribucion', 'Distribución PREGUNTA_2');
    renderTableFromJson('data/tabla_PREGUNTA_2.json', 'table_pregunta2_stats');
    
    loadJsonPlotlyChart('data/plotly_univariado_PREGUNTA_3.json', 'chart_pregunta3_distribucion', 'Distribución PREGUNTA_3');
    renderTableFromJson('data/tabla_PREGUNTA_3.json', 'table_pregunta3_stats');
    
    loadJsonPlotlyChart('data/plotly_univariado_PREGUNTA_4.json', 'chart_pregunta4_distribucion', 'Distribución PREGUNTA_4');
    renderTableFromJson('data/tabla_PREGUNTA_4.json', 'table_pregunta4_stats');
    
    // Bivariado ejemplo
    loadJsonPlotlyChart('data/plotly_bivariado_CIUDAD_AGENCIA_vs_PREGUNTA_1.json', 'chart_satisfaccion_ciudad', 'Satisfacción por Ciudad');
    renderTableFromJson('data/tabla_CIUDAD_AGENCIA_vs_PREGUNTA_1.json', 'table_satisfaccion_ciudad');
    
    loadJsonPlotlyChart('data/plotly_bivariado_TIPO_EJECUTIVO_vs_PREGUNTA_1.json', 'chart_satisfaccion_agencia_ejecutivo', 'Satisfacción por Ejecutivo');
    renderTableFromJson('data/tabla_TIPO_EJECUTIVO_vs_PREGUNTA_1.json', 'table_satisfaccion_agencia_ejecutivo');
    
    loadJsonPlotlyChart('data/plotly_bivariado_SEGMENTO_vs_PREGUNTA_1.json', 'chart_satisfaccion_segmento', 'Satisfacción por Segmento');
    renderTableFromJson('data/tabla_SEGMENTO_vs_PREGUNTA_1.json', 'table_satisfaccion_segmento');
    
    loadJsonPlotlyChart('data/plotly_bivariado_GENERO_vs_PREGUNTA_1.json', 'chart_satisfaccion_genero', 'Satisfacción por Género');
    renderTableFromJson('data/tabla_GENERO_vs_PREGUNTA_1.json', 'table_satisfaccion_genero');
    
    // Bivariado categórica-categórica ejemplo
    loadJsonPlotlyChart('data/plotly_bivariado_GENERO_vs_CIUDAD_AGENCIA.json', 'chart_genero_ciudad', 'Género por Ciudad');
    renderTableFromJson('data/tabla_GENERO_vs_CIUDAD_AGENCIA.json', 'table_contingencia_genero_ciudad');
    
    // Wordcloud y comentarios - Nota: se conserva como imagen por su naturaleza
    loadJsonPlotlyChart('data/plotly_wordcloud_pregunta5.json', 'wordcloud_comentarios_placeholder', 'Nube de Palabras Comentarios', {
        useMockData: true, // Usar solo si no existe JSON de nube de palabras
        layout: {
            title: 'Términos más frecuentes en comentarios'
        }
    });
    renderTableFromJson('data/tabla_wordcloud_pregunta5.json', 'summary_comentarios_temas');
    
    // Ejemplo: cargar resultados de inferencia para PREGUNTA_1 entre Personas y Empresas
    renderInferenciaCard('data/inferencia_SEGMENTO_Personas_vs_Empresas.json', 'inferencia_segmento');
});
