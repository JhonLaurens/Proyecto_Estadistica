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
