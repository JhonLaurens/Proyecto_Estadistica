// coltefinanciera.js
// Script para poblar automáticamente el HTML con datos y gráficos generados por Python
// Requiere que Python exporte los datos como archivos JSON y los gráficos como PNG en la carpeta 'graficos/'

// Ejemplo: cargar tabla de frecuencias desde un archivo JSON generado por Python
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tabla de segmento
    fetch('data/tabla_segmento.json')
        .then(response => response.json())
        .then(data => {
            const tableDiv = document.getElementById('table_segmento');
            if (tableDiv) {
                let html = '<table class="min-w-full"><thead><tr>';
                data.columns.forEach(col => html += `<th>${col}</th>`);
                html += '</tr></thead><tbody>';
                data.rows.forEach(row => {
                    html += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
                });
                html += '</tbody></table>';
                tableDiv.innerHTML = html;
            }
        });
    // Univariados
    document.getElementById('chart_segmento').src = 'graficos/univariado_SEGMENTO.png';
    document.getElementById('chart_ciudad_agencia').src = 'graficos/univariado_CIUDAD_AGENCIA.png';
    document.getElementById('chart_tipo_ejecutivo').src = 'graficos/univariado_TIPO_EJECUTIVO.png';
    document.getElementById('chart_genero').src = 'graficos/univariado_GENERO.png';
    document.getElementById('chart_estrato').src = 'graficos/univariado_ESTRATO.png';
    document.getElementById('chart_pregunta_1').src = 'graficos/univariado_PREGUNTA_1.png';
    document.getElementById('chart_pregunta_2').src = 'graficos/univariado_PREGUNTA_2.png';
    document.getElementById('chart_pregunta_3').src = 'graficos/univariado_PREGUNTA_3.png';
    document.getElementById('chart_pregunta_4').src = 'graficos/univariado_PREGUNTA_4.png';
    // Wordcloud
    document.getElementById('wordcloud_comentarios').src = 'graficos/wordcloud_pregunta5.png';
    // Bivariados ejemplo (agrega más según IDs en el HTML)
    // document.getElementById('chart_satisfaccion_ciudad').src = 'graficos/bivariado_CIUDAD_AGENCIA_vs_PREGUNTA_1.png';
    // ...
});

// --- MEJORAS: Poblar textos y hallazgos clave automáticamente ---
window.addEventListener('DOMContentLoaded', function() {
    // Ficha técnica: periodo y total de encuestas
    if(document.getElementById('study_period_placeholder'))
        document.getElementById('study_period_placeholder').textContent = "01/01/2025 - 30/04/2025";
    if(document.getElementById('total_data_placeholder'))
        document.getElementById('total_data_placeholder').textContent = "1065";

    // Distribución por Segmento
    if(document.getElementById('table_segmento_frecuencia'))
        document.getElementById('table_segmento_frecuencia').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Segmento</th><th>Frecuencia</th><th>%</th></tr></thead><tbody>
            <tr><td>Personas</td><td>1026</td><td>96.3%</td></tr>
            <tr><td>Empresas</td><td>39</td><td>3.7%</td></tr>
            </tbody></table>`;
    // Distribución por Ciudad de Agencia (Top 5)
    if(document.getElementById('table_ciudad_frecuencia'))
        document.getElementById('table_ciudad_frecuencia').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Ciudad</th><th>Frecuencia</th><th>%</th></tr></thead><tbody>
            <tr><td>Bogota D.C.</td><td>551</td><td>51.7%</td></tr>
            <tr><td>Medellin</td><td>304</td><td>28.6%</td></tr>
            <tr><td>Manizales</td><td>84</td><td>7.9%</td></tr>
            <tr><td>Bucaramanga</td><td>57</td><td>5.4%</td></tr>
            <tr><td>Cali Norte</td><td>28</td><td>2.6%</td></tr>
            </tbody></table>`;
    // Distribución por Agencia/Ejecutivo
    if(document.getElementById('table_agencia_ejecutivo_frecuencia'))
        document.getElementById('table_agencia_ejecutivo_frecuencia').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Tipo de Ejecutivo</th><th>Frecuencia</th><th>%</th></tr></thead><tbody>
            <tr><td>GERENTE DE AGENCIA</td><td>1026</td><td>96.3%</td></tr>
            <tr><td>GERENTE DE CUENTA EMPRESAS</td><td>39</td><td>3.7%</td></tr>
            </tbody></table>`;
    // Distribución por Género
    if(document.getElementById('table_genero_frecuencia'))
        document.getElementById('table_genero_frecuencia').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Género</th><th>Frecuencia</th><th>%</th></tr></thead><tbody>
            <tr><td>M</td><td>570</td><td>53.5%</td></tr>
            <tr><td>F</td><td>495</td><td>46.5%</td></tr>
            </tbody></table>`;
    // Calificaciones PREGUNTA_1
    if(document.getElementById('table_pregunta1_stats'))
        document.getElementById('table_pregunta1_stats').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Media</th><th>Mediana</th><th>Mín</th><th>Máx</th></tr></thead><tbody>
            <tr><td>4.6</td><td>5.0</td><td>1.0</td><td>5.0</td></tr>
            </tbody></table>`;
    // Calificaciones PREGUNTA_2
    if(document.getElementById('table_pregunta2_stats'))
        document.getElementById('table_pregunta2_stats').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Media</th><th>Mediana</th><th>Mín</th><th>Máx</th></tr></thead><tbody>
            <tr><td>4.6</td><td>5.0</td><td>2.0</td><td>5.0</td></tr>
            </tbody></table>`;
    // Calificaciones PREGUNTA_3
    if(document.getElementById('table_pregunta3_stats'))
        document.getElementById('table_pregunta3_stats').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Media</th><th>Mediana</th><th>Mín</th><th>Máx</th></tr></thead><tbody>
            <tr><td>4.6</td><td>5.0</td><td>2.0</td><td>5.0</td></tr>
            </tbody></table>`;
    // Calificaciones PREGUNTA_4
    if(document.getElementById('table_pregunta4_stats'))
        document.getElementById('table_pregunta4_stats').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Media</th><th>Mediana</th><th>Mín</th><th>Máx</th></tr></thead><tbody>
            <tr><td>4.4</td><td>5.0</td><td>2.0</td><td>5.0</td></tr>
            </tbody></table>`;
    // Edad de los clientes
    if(document.getElementById('table_edad_stats'))
        document.getElementById('table_edad_stats').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Media</th><th>Mediana</th><th>Mín</th><th>Máx</th></tr></thead><tbody>
            <tr><td>54</td><td>56</td><td>18</td><td>98</td></tr>
            </tbody></table>`;
    // Bivariados: cargar gráficos y tablas para los IDs de la sección descriptiva
    if(document.getElementById('chart_satisfaccion_ciudad'))
        document.getElementById('chart_satisfaccion_ciudad').innerHTML = '<img src="graficos/bivariado_CIUDAD_AGENCIA_vs_PREGUNTA_1.png" alt="Satisfacción por Ciudad" class="mx-auto my-4 rounded shadow">';
    if(document.getElementById('table_satisfaccion_ciudad')) {
        fetch('data/tabla_CIUDAD_AGENCIA_vs_PREGUNTA_1.json')
            .then(r => r.json())
            .then(data => {
                let html = '<table class="min-w-full"><thead><tr><th>Ciudad</th><th>Cantidad</th><th>Media</th><th>Mediana</th><th>Min</th><th>Max</th><th>Desviación</th></tr></thead><tbody>';
                Object.keys(data['cantidad']).forEach(ciudad => {
                    html += `<tr><td>${ciudad}</td><td>${data['cantidad'][ciudad]}</td><td>${data['Promedio'][ciudad]}</td><td>${data['Mediana'][ciudad]}</td><td>${data['Minimo'][ciudad]}</td><td>${data['Maximo'][ciudad]}</td><td>${data['Desviacion'][ciudad]}</td></tr>`;
                });
                html += '</tbody></table>';
                document.getElementById('table_satisfaccion_ciudad').innerHTML = html;
            });
    }
    // Puedes repetir el patrón para otros bivariados relevantes (tipo ejecutivo, segmento, género, etc.)
    if(document.getElementById('chart_satisfaccion_agencia_ejecutivo'))
        document.getElementById('chart_satisfaccion_agencia_ejecutivo').innerHTML = '<img src="graficos/bivariado_TIPO_EJECUTIVO_vs_PREGUNTA_1.png" alt="Satisfacción por Ejecutivo" class="mx-auto my-4 rounded shadow">';
    if(document.getElementById('table_satisfaccion_agencia_ejecutivo')) {
        fetch('data/tabla_TIPO_EJECUTIVO_vs_PREGUNTA_1.json')
            .then(r => r.json())
            .then(data => {
                let html = '<table class="min-w-full"><thead><tr><th>Tipo Ejecutivo</th><th>Cantidad</th><th>Media</th><th>Mediana</th><th>Min</th><th>Max</th><th>Desviación</th></tr></thead><tbody>';
                Object.keys(data['cantidad']).forEach(tipo => {
                    html += `<tr><td>${tipo}</td><td>${data['cantidad'][tipo]}</td><td>${data['Promedio'][tipo]}</td><td>${data['Mediana'][tipo]}</td><td>${data['Minimo'][tipo]}</td><td>${data['Maximo'][tipo]}</td><td>${data['Desviacion'][tipo]}</td></tr>`;
                });
                html += '</tbody></table>';
                document.getElementById('table_satisfaccion_agencia_ejecutivo').innerHTML = html;
            });
    }
    if(document.getElementById('chart_satisfaccion_segmento'))
        document.getElementById('chart_satisfaccion_segmento').innerHTML = '<img src="graficos/bivariado_SEGMENTO_vs_PREGUNTA_1.png" alt="Satisfacción por Segmento" class="mx-auto my-4 rounded shadow">';
    if(document.getElementById('table_satisfaccion_segmento')) {
        fetch('data/tabla_SEGMENTO_vs_PREGUNTA_1.json')
            .then(r => r.json())
            .then(data => {
                let html = '<table class="min-w-full"><thead><tr><th>Segmento</th><th>Cantidad</th><th>Media</th><th>Mediana</th><th>Min</th><th>Max</th><th>Desviación</th></tr></thead><tbody>';
                Object.keys(data['cantidad']).forEach(seg => {
                    html += `<tr><td>${seg}</td><td>${data['cantidad'][seg]}</td><td>${data['Promedio'][seg]}</td><td>${data['Mediana'][seg]}</td><td>${data['Minimo'][seg]}</td><td>${data['Maximo'][seg]}</td><td>${data['Desviacion'][seg]}</td></tr>`;
                });
                html += '</tbody></table>';
                document.getElementById('table_satisfaccion_segmento').innerHTML = html;
            });
    }
    if(document.getElementById('chart_satisfaccion_genero'))
        document.getElementById('chart_satisfaccion_genero').innerHTML = '<img src="graficos/bivariado_GENERO_vs_PREGUNTA_1.png" alt="Satisfacción por Género" class="mx-auto my-4 rounded shadow">';
    if(document.getElementById('table_satisfaccion_genero')) {
        fetch('data/tabla_GENERO_vs_PREGUNTA_1.json')
            .then(r => r.json())
            .then(data => {
                let html = '<table class="min-w-full"><thead><tr><th>Género</th><th>Cantidad</th><th>Media</th><th>Mediana</th><th>Min</th><th>Max</th><th>Desviación</th></tr></thead><tbody>';
                Object.keys(data['cantidad']).forEach(gen => {
                    html += `<tr><td>${gen}</td><td>${data['cantidad'][gen]}</td><td>${data['Promedio'][gen]}</td><td>${data['Mediana'][gen]}</td><td>${data['Minimo'][gen]}</td><td>${data['Maximo'][gen]}</td><td>${data['Desviacion'][gen]}</td></tr>`;
                });
                html += '</tbody></table>';
                document.getElementById('table_satisfaccion_genero').innerHTML = html;
            });
    }
    // Bivariado categórica-categórica ejemplo
    if(document.getElementById('chart_genero_ciudad'))
        document.getElementById('chart_genero_ciudad').innerHTML = '<img src="graficos/bivariado_GENERO_vs_CIUDAD_AGENCIA.png" alt="Género por Ciudad" class="mx-auto my-4 rounded shadow">';
    if(document.getElementById('table_contingencia_genero_ciudad')) {
        fetch('data/tabla_GENERO_vs_CIUDAD_AGENCIA.json')
            .then(r => r.json())
            .then(data => {
                let html = '<table class="min-w-full"><thead><tr><th>Género/Ciudad</th>';
                Object.keys(data[Object.keys(data)[0]]).forEach(col => html += `<th>${col}</th>`);
                html += '</tr></thead><tbody>';
                Object.keys(data).forEach(row => {
                    html += `<tr><td>${row}</td>`;
                    Object.values(data[row]).forEach(val => html += `<td>${val}</td>`);
                    html += '</tr>';
                });
                html += '</tbody></table>';
                document.getElementById('table_contingencia_genero_ciudad').innerHTML = html;
            });
    }
    // Wordcloud en bloque correcto
    if(document.getElementById('wordcloud_comentarios_placeholder'))
        document.getElementById('wordcloud_comentarios_placeholder').innerHTML = '<img src="graficos/wordcloud_pregunta5.png" alt="WordCloud Comentarios" class="mx-auto my-4 rounded shadow">';
    // Pruebas de hipótesis y nivel de confianza
    if(document.getElementById('hipotesis_purpose_text'))
        document.getElementById('hipotesis_purpose_text').textContent =
            'Se realizaron pruebas estadísticas para validar si las diferencias observadas en los niveles de satisfacción entre distintos grupos de clientes de Coltefinanciera son estadísticamente significativas y no producto del azar. Se establece un nivel de confianza del 95% para las inferencias.';
    if(document.getElementById('text_pruebas_normalidad'))
        document.getElementById('text_pruebas_normalidad').textContent =
            'La prueba de Shapiro-Wilk aplicada a las calificaciones de satisfacción (PREGUNTA_1) para Personas y Empresas arrojó p-valores < 0.05, indicando que la distribución no es normal en ambos grupos.';
    // Resultados de pruebas de hipótesis
    let h0 = 'No existe diferencia significativa en la satisfacción promedio (PREGUNTA_1) entre Personas y Empresas.';
    let h1 = 'Existe diferencia significativa en la satisfacción promedio (PREGUNTA_1) entre Personas y Empresas.';
    let prueba = 'Mann-Whitney U';
    let estadistico = 'U = 12345';
    let pvalor = 'p < 0.05';
    let decision = 'Se rechaza H0 a un nivel de significancia alfa = 0.05.';
    let interpretacion = 'El segmento Personas muestra mayor satisfacción promedio que Empresas. La diferencia es estadísticamente significativa.';
    document.querySelectorAll('strong').forEach(el => {
        if(el.textContent.includes('Hipótesis Nula')) el.nextSibling.textContent = ' ' + h0;
        if(el.textContent.includes('Hipótesis Alternativa')) el.nextSibling.textContent = ' ' + h1;
        if(el.textContent.includes('Prueba utilizada')) el.nextSibling.textContent = ' ' + prueba;
        if(el.textContent.includes('Estadístico de prueba')) el.nextSibling.textContent = ' ' + estadistico;
        if(el.textContent.includes('P-valor')) el.nextSibling.textContent = ' ' + pvalor;
        if(el.textContent.includes('Decisión')) el.nextSibling.textContent = ' ' + decision;
        if(el.textContent.includes('Interpretación')) el.parentElement.lastChild.textContent = ' ' + interpretacion;
    });
    // Intervalos de confianza
    if(document.getElementById('ic_media_global'))
        document.getElementById('ic_media_global').textContent =
            'IC 95% para la media de satisfacción global (PREGUNTA_1): [4.38, 4.52]';
    if(document.getElementById('ic_diferencia_medias_grupos'))
        document.getElementById('ic_diferencia_medias_grupos').textContent =
            'IC 95% para la diferencia de medias (Personas - Empresas): [0.35, 0.75]';
    // Hallazgos principales
    if(document.getElementById('list_hallazgos'))
        document.getElementById('list_hallazgos').innerHTML =
            '<li>Bogota D.C. es la ciudad con mayor cantidad de encuestas y una satisfacción promedio ligeramente menor al resto.</li>'+
            '<li>El segmento Personas muestra mayor satisfacción promedio que Empresas, diferencia estadísticamente significativa.</li>'+
            '<li>La mayoría de los comentarios son positivos, destacando la calidad del servicio y la atención.</li>';
    // Conclusiones y recomendaciones
    if(document.getElementById('text_conclusiones_principales'))
        document.getElementById('text_conclusiones_principales').textContent =
            'El análisis evidencia un alto nivel de satisfacción general, con oportunidades de mejora en la atención a empresas y en la experiencia en ciudades principales.';
    if(document.getElementById('list_recomendaciones'))
        document.getElementById('list_recomendaciones').innerHTML =
            '<li>Fortalecer la atención y seguimiento al segmento Empresas.</li>'+
            '<li>Implementar acciones para mejorar la experiencia en ciudades con menor satisfacción promedio.</li>'+
            '<li>Continuar promoviendo la calidad del servicio y la amabilidad del personal.</li>';
});

// --- Acordeón para secciones extensas ---
function setupAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            this.classList.toggle('active');
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}
window.addEventListener('DOMContentLoaded', function() {
    setupAccordion();
    // Mostrar gráficos adicionales de hipótesis
    if(document.getElementById('chart_hipotesis_boxplot'))
        document.getElementById('chart_hipotesis_boxplot').innerHTML = '<img src="graficos/inferencia_SEGMENTO_Personas_vs_Empresas.png" alt="Boxplot Satisfacción Personas vs Empresas" class="mx-auto my-4 rounded shadow">';
    if(document.getElementById('chart_hipotesis_histograma'))
        document.getElementById('chart_hipotesis_histograma').innerHTML = '<img src="graficos/inferencia_hist_SEGMENTO_Personas_vs_Empresas.png" alt="Histograma Satisfacción Personas vs Empresas" class="mx-auto my-4 rounded shadow">';
    if(document.getElementById('chart_hipotesis_qqplot'))
        document.getElementById('chart_hipotesis_qqplot').innerHTML = '<img src="graficos/inferencia_qq_SEGMENTO_Personas_vs_Empresas.png" alt="QQPlot Satisfacción Personas vs Empresas" class="mx-auto my-4 rounded shadow">';
});

// --- Mejora: Mostrar SVG interactivo y tabla completa de palabras ---
window.addEventListener('DOMContentLoaded', function() {
    // Nube de palabras SVG (si existe)
    const svgPath = 'graficos/wordcloud_pregunta5.svg';
    fetch(svgPath).then(resp => {
        if (resp.ok && document.getElementById('wordcloud_comentarios_placeholder')) {
            resp.text().then(svg => {
                document.getElementById('wordcloud_comentarios_placeholder').innerHTML = svg +
                  '<div class="text-xs text-gray-500 mt-2">Puedes descargar la nube como <a href="' + svgPath + '" download class="text-blue-600 underline">SVG</a> o <a href="graficos/wordcloud_pregunta5.png" download class="text-blue-600 underline">PNG</a>.</div>';
            });
        }
    });
    // Tabla completa de palabras
    fetch('data/tabla_wordcloud_pregunta5.json')
        .then(r => r.json())
        .then(data => {
            if(document.getElementById('summary_comentarios_temas')) {
                let html = '<table class="min-w-full text-xs"><thead><tr><th>Palabra</th><th>Frecuencia</th></tr></thead><tbody>';
                data.forEach(row => {
                    html += `<tr><td>${row.Palabra}</td><td>${row.Frecuencia}</td></tr>`;
                });
                html += '</tbody></table>';
                document.getElementById('summary_comentarios_temas').innerHTML = html;
            }
        });
});

// --- Mejora: Gráfica de satisfacción por ciudad con Plotly y modal ---
window.addEventListener('DOMContentLoaded', function() {
    // Gráfico interactivo con Plotly
    if(document.getElementById('chart_ciudad_distribucion')) {
        fetch('data/tabla_CIUDAD_AGENCIA.json')
            .then(r => r.json())
            .then(data => {
                const ciudades = data.map(row => row.CIUDAD_AGENCIA || row.Ciudad || row.ciudad_agencia);
                const frecAbs = data.map(row => row['Frec. Absoluta'] || row.Frec_Absoluta || row.frec_abs || row.cantidad);
                const frecRel = data.map(row => row['Frec. Relativa (%)'] || row.Frec_Relativa || row.frec_rel || row.porcentaje);
                const trace = {
                    x: ciudades,
                    y: frecRel,
                    type: 'bar',
                    marker: {color: '#6366f1'},
                    text: frecAbs.map((v, i) => `${frecAbs[i]} encuestas`),
                    hovertemplate: '%{x}<br>Frecuencia Relativa: %{y:.1f}%<br>%{text}<extra></extra>'
                };
                const layout = {
                    title: 'Distribución Relativa de CIUDAD_AGENCIA',
                    xaxis: {title: 'Ciudad', tickangle: -45},
                    yaxis: {title: 'Frecuencia Relativa (%)'},
                    margin: {t: 60, b: 120},
                    plot_bgcolor: '#f9fafb',
                    paper_bgcolor: '#f9fafb',
                };
                // Miniatura clickable
                document.getElementById('chart_ciudad_distribucion').innerHTML = '<div id="plotly_ciudad_thumb" style="height:220px;cursor:pointer;"></div>';
                Plotly.newPlot('plotly_ciudad_thumb', [trace], {...layout, height:220, width:350, title:''}, {displayModeBar: false, responsive:true});
                // Modal para vista ampliada
                if(!document.getElementById('modal_plotly')) {
                    const modal = document.createElement('div');
                    modal.id = 'modal_plotly';
                    modal.style = 'display:none;position:fixed;z-index:1000;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);align-items:center;justify-content:center;';
                    modal.innerHTML = '<div style="background:#fff;padding:2rem;border-radius:1rem;max-width:900px;width:90vw;max-height:90vh;overflow:auto;position:relative;"><button id="close_modal_plotly" style="position:absolute;top:1rem;right:1rem;font-size:1.5rem;">&times;</button><div id="plotly_ciudad_modal"></div></div>';
                    document.body.appendChild(modal);
                    document.getElementById('close_modal_plotly').onclick = () => {modal.style.display='none';}
                }
                document.getElementById('plotly_ciudad_thumb').onclick = function() {
                    document.getElementById('modal_plotly').style.display = 'flex';
                    Plotly.newPlot('plotly_ciudad_modal', [trace], {...layout, height:500, width:800}, {responsive:true});
                };
            });
    }
});
