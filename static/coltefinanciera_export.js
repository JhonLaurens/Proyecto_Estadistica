// coltefinanciera_export.js
// Script para implementar funcionalidades de exportación de datos

// Función para exportar los datos actuales en formato CSV
function exportDataToCSV(data, filename = 'datos_coltefinanciera.csv') {
    if (!data || !data.length) {
        alert('No hay datos disponibles para exportar');
        return;
    }
    
    // Obtener encabezados de las columnas
    const headers = Object.keys(data[0]);
    
    // Crear el contenido del CSV
    let csvContent = headers.join(',') + '\n';
    
    // Agregar filas de datos
    data.forEach(item => {
        const row = headers.map(header => {
            // Manejar valores con comas, comillas, etc.
            let cell = item[header] || '';
            cell = cell.toString().replace(/"/g, '""'); // Escapar comillas dobles
            
            // Si contiene comas, saltos de línea o comillas, encerrarlo en comillas
            if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
                cell = `"${cell}"`;
            }
            
            return cell;
        }).join(',');
        
        csvContent += row + '\n';
    });
    
    // Crear un objeto Blob con el contenido CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Crear un enlace para descargar el archivo
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Función para exportar visualizaciones (gráficos) como imágenes
function exportChartAsImage(chartId, filename = 'grafico_coltefinanciera.png') {
    const chartElement = document.getElementById(chartId);
    
    if (!chartElement) {
        alert('No se encontró el gráfico especificado');
        return;
    }
    
    // Verificar si es un gráfico Plotly
    if (typeof Plotly !== 'undefined') {
        Plotly.downloadImage(chartId, {
            format: 'png',
            filename: filename,
            width: 800,
            height: 600,
            scale: 2
        })
        .catch(error => {
            console.error('Error al exportar el gráfico:', error);
            alert('Error al exportar el gráfico. Verifica la consola para más detalles.');
        });
    } else {
        // Si no es un gráfico Plotly, intentar usar html2canvas
        if (typeof html2canvas !== 'undefined') {
            html2canvas(chartElement)
                .then(canvas => {
                    const link = document.createElement('a');
                    link.download = filename;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                })
                .catch(error => {
                    console.error('Error al exportar el gráfico:', error);
                    alert('Error al exportar el gráfico. Verifica la consola para más detalles.');
                });
        } else {
            alert('No se encontró la biblioteca necesaria para exportar el gráfico');
        }
    }
}

// Función para exportar el reporte completo como PDF
function exportReportAsPDF(callback) {
    // Verificar si se ha cargado la biblioteca html2pdf.js
    if (typeof html2pdf === 'undefined') {
        // Carga dinámica de html2pdf.js si no está disponible
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = function() {
            // Ejecutar la exportación una vez que se cargue la biblioteca
            performPDFExport(callback);
        };
        document.head.appendChild(script);
    } else {
        // Si ya está cargada, ejecutar directamente
        performPDFExport(callback);
    }
}

// Función auxiliar para realizar la exportación a PDF
function performPDFExport(callback) {
    // Mostrar mensaje de preparación
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdf-loading';
    loadingDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.8);z-index:9999;display:flex;justify-content:center;align-items:center;flex-direction:column;';
    loadingDiv.innerHTML = `
        <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        <p class="mt-4 text-lg font-semibold text-blue-600">Generando PDF, por favor espere...</p>
    `;
    document.body.appendChild(loadingDiv);
    
    // Obtener el elemento main que contiene el reporte
    const reportElement = document.querySelector('main');
    
    // Clonar el elemento para no afectar el original
    const clonedReport = reportElement.cloneNode(true);
    
    // Ocultar elementos no deseados en el PDF (como botones de exportación)
    Array.from(clonedReport.querySelectorAll('.no-print, button, .filter-component')).forEach(el => {
        el.style.display = 'none';
    });
    
    // Configuración para html2pdf
    const options = {
        margin: [15, 15],
        filename: 'reporte_coltefinanciera.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Ejecutar la exportación
    html2pdf().set(options).from(clonedReport).save()
        .then(() => {
            // Eliminar el elemento de carga
            document.body.removeChild(loadingDiv);
            if (typeof callback === 'function') callback(true);
        })
        .catch(error => {
            console.error('Error al generar el PDF:', error);
            document.body.removeChild(loadingDiv);
            alert('Error al generar el PDF. Verifica la consola para más detalles.');
            if (typeof callback === 'function') callback(false);
        });
}

// Función para crear botones de exportación
function createExportButtons(containerSelector) {
    const container = document.querySelector(containerSelector);
    
    if (!container) return;
    
    // Crear el HTML para los botones
    const buttonsHtml = `
        <div class="export-buttons bg-white rounded-lg shadow p-4 mb-6">
            <h3 class="text-lg font-medium text-gray-700 mb-3">Opciones de Exportación</h3>
            <div class="flex flex-wrap gap-3">
                <button id="btn_export_csv" class="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    Exportar Datos (CSV)
                </button>
                <button id="btn_export_charts" class="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M2 9.5A3.5 3.5 0 005.5 13H9v2.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 15.586V13h2.5a4.5 4.5 0 10-.616-8.958 4.002 4.002 0 10-7.753 1.977A3.5 3.5 0 002 9.5zm9 3.5H9V8a1 1 0 012 0v5z" clip-rule="evenodd" />
                    </svg>
                    Exportar Gráficos
                </button>
                <button id="btn_export_pdf" class="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" />
                    </svg>
                    Exportar Reporte (PDF)
                </button>
            </div>
        </div>
    `;
    
    // Insertar los botones en el contenedor
    container.insertAdjacentHTML('beforebegin', buttonsHtml);
    
    // Configurar eventos para los botones
    document.getElementById('btn_export_csv').addEventListener('click', function() {
        // Exportar los datos actualmente filtrados
        if (window.datosFiltrados && window.datosFiltrados.length) {
            exportDataToCSV(window.datosFiltrados, 'datos_coltefinanciera_filtrados.csv');
        } else if (window.datosCompletos && window.datosCompletos.length) {
            exportDataToCSV(window.datosCompletos, 'datos_coltefinanciera_completos.csv');
        } else {
            alert('No hay datos disponibles para exportar');
        }
    });
    
    document.getElementById('btn_export_charts').addEventListener('click', function() {
        // Mostrar un diálogo para seleccionar qué gráfico exportar
        const charts = document.querySelectorAll('[id^="chart_"]');
        
        if (charts.length === 0) {
            alert('No se encontraron gráficos para exportar');
            return;
        }
        
        // Crear un diálogo modal
        const modalDiv = document.createElement('div');
        modalDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;justify-content:center;align-items:center;';
        
        let modalContent = `
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Seleccionar Gráfico para Exportar</h3>
                <div class="space-y-2">
        `;
        
        charts.forEach(chart => {
            const chartId = chart.id;
            const chartTitle = chart.closest('.bg-white')?.querySelector('h4, h5')?.textContent || chartId;
            
            modalContent += `
                <div class="p-3 border rounded hover:bg-gray-50 cursor-pointer flex items-center" data-chart-id="${chartId}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>${chartTitle}</span>
                </div>
            `;
        });
        
        modalContent += `
                </div>
                <div class="mt-6 flex justify-end">
                    <button id="modal_close" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        modalDiv.innerHTML = modalContent;
        document.body.appendChild(modalDiv);
        
        // Configurar eventos para el modal
        document.getElementById('modal_close').addEventListener('click', function() {
            document.body.removeChild(modalDiv);
        });
        
        // Configurar eventos para cada opción de gráfico
        modalDiv.querySelectorAll('[data-chart-id]').forEach(option => {
            option.addEventListener('click', function() {
                const chartId = this.getAttribute('data-chart-id');
                const chartTitle = this.querySelector('span').textContent;
                exportChartAsImage(chartId, `grafico_${chartId.replace('chart_', '')}.png`);
                document.body.removeChild(modalDiv);
            });
        });
    });
    
    document.getElementById('btn_export_pdf').addEventListener('click', function() {
        exportReportAsPDF();
    });
}

// Exportar funciones
window.exportDataToCSV = exportDataToCSV;
window.exportChartAsImage = exportChartAsImage;
window.exportReportAsPDF = exportReportAsPDF;
window.createExportButtons = createExportButtons;

// Inicializar cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Crear botones de exportación en la parte superior del contenido principal
    createExportButtons('main > section:first-child');
});
