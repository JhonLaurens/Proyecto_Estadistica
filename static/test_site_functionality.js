// test_site_functionality.js
// Este script prueba la funcionalidad del sitio web de Coltefinanciera

console.log('Iniciando pruebas del sitio web de Coltefinanciera...');

// Prueba 1: Verificar carga de gráficos Plotly
function testPlotlyCharts() {
    console.log('Prueba 1: Verificando la carga de gráficos Plotly...');
    
    // Obtener todos los contenedores de gráficos
    const chartContainers = document.querySelectorAll('.chart-container');
    console.log(`- Se encontraron ${chartContainers.length} contenedores de gráficos`);
    
    // Verificar si los gráficos de Plotly están cargados
    const plotlyGraphs = document.querySelectorAll('.js-plotly-plot');
    console.log(`- Se encontraron ${plotlyGraphs.length} gráficos de Plotly cargados`);
    
    if (plotlyGraphs.length > 0) {
        console.log('✅ Prueba de carga de gráficos Plotly exitosa');
    } else {
        console.log('❌ Prueba de carga de gráficos Plotly fallida');
    }
}

// Prueba 2: Probar cambio de tema (claro/oscuro)
function testThemeSwitching() {
    console.log('Prueba 2: Probando cambio de tema...');
    
    // Obtener botón de cambio de tema
    const themeToggle = document.getElementById('btn_theme_toggle');
    if (!themeToggle) {
        console.log('❌ No se encontró el botón de cambio de tema');
        return;
    }
    
    // Obtener tema actual
    const currentTheme = document.body.classList.contains('dark-theme') ? 'oscuro' : 'claro';
    console.log(`- Tema actual: ${currentTheme}`);
    
    // Hacer clic en el botón
    console.log('- Cambiando tema...');
    themeToggle.click();
    
    // Verificar si el tema cambió
    const newTheme = document.body.classList.contains('dark-theme') ? 'oscuro' : 'claro';
    console.log(`- Nuevo tema: ${newTheme}`);
    
    if (currentTheme !== newTheme) {
        console.log('✅ Prueba de cambio de tema exitosa');
    } else {
        console.log('❌ Prueba de cambio de tema fallida');
    }
}

// Prueba 3: Probar filtros
function testFilters() {
    console.log('Prueba 3: Probando filtros...');
    
    // Obtener un filtro (por ejemplo, filtro de segmento)
    const segmentFilter = document.getElementById('filter_segment');
    if (!segmentFilter) {
        console.log('❌ No se encontró el filtro de segmento');
        return;
    }
    
    // Contar gráficos antes de aplicar filtro
    const graphsBefore = document.querySelectorAll('.js-plotly-plot').length;
    console.log(`- Gráficos antes de aplicar filtro: ${graphsBefore}`);
    
    // Aplicar un filtro seleccionando una opción
    if (segmentFilter.options.length > 1) {
        // Seleccionar una opción que no sea la actual
        const currentIndex = segmentFilter.selectedIndex;
        const newIndex = (currentIndex + 1) % segmentFilter.options.length;
        segmentFilter.selectedIndex = newIndex;
        
        // Disparar evento de cambio
        const event = new Event('change');
        segmentFilter.dispatchEvent(event);
        
        console.log(`- Se cambió el filtro de segmento a: ${segmentFilter.value}`);
        
        // Dar tiempo para que se actualicen los gráficos
        setTimeout(() => {
            // Verificar si los gráficos cambiaron
            const graphsAfter = document.querySelectorAll('.js-plotly-plot').length;
            console.log(`- Gráficos después de aplicar filtro: ${graphsAfter}`);
            
            // La verificación exacta dependerá de la implementación
            console.log('✅ Prueba de filtros completada');
        }, 1000);
    } else {
        console.log('❌ No hay suficientes opciones para probar en el filtro');
    }
}

// Ejecutar pruebas después de que la página cargue completamente
window.addEventListener('load', function() {
    // Dar tiempo para que se carguen todos los gráficos
    setTimeout(() => {
        console.log('Comenzando pruebas después de carga completa...');
        testPlotlyCharts();
        testThemeSwitching();
        testFilters();
    }, 2000);
});

console.log('Script de pruebas cargado correctamente');
