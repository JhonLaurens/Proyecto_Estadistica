// coltefinanciera_filtros.js
// Script para implementar filtros dinámicos y herramientas de búsqueda

// --- Configuraciones globales ---
const defaultDateRange = {
    start: '2025-01-01',
    end: '2025-04-30'
};

// Variable para almacenar el estado global de los filtros
let filtroState = {
    fechaInicio: defaultDateRange.start,
    fechaFin: defaultDateRange.end,
    ciudad: 'todas',
    segmento: 'todos',
    genero: 'todos',
    tipoeEjecutivo: 'todos',
    calificacionMin: 1,
    calificacionMax: 5,
    searchTerm: ''
};

// Datos cargados (se actualizarán al cargar los datos)
let datosCompletos = [];
let datosFiltrados = [];

// --- Funciones para crear los componentes de filtro ---

// Función para crear el panel de filtros completo
function createFilterPanel(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Determinar qué filtros incluir
    const includeDate = options.includeDate !== false; // Predeterminado: true
    const includeCity = options.includeCity !== false; // Predeterminado: true
    const includeSegment = options.includeSegment !== false; // Predeterminado: true
    const includeGender = options.includeGender !== false; // Predeterminado: true
    const includeExecutive = options.includeExecutive !== false; // Predeterminado: true
    const includeRating = options.includeRating !== false; // Predeterminado: true
    const includeSearch = options.includeSearch !== false; // Predeterminado: true
    
    // Crear estructura básica del panel de filtros
    let html = `
        <div class="bg-white rounded-lg shadow p-4 mb-6 filter-panel">
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-medium text-gray-700">Filtros de Análisis</h3>
                <button id="toggle_filters_btn" class="md:hidden px-2 py-1 bg-blue-500 text-white rounded-md text-sm">
                    Mostrar/Ocultar
                </button>            </div>
            <div id="filters_container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    `;
    
    // Filtro de fecha
    if (includeDate) {
        html += `
            <div class="filter-component filter-group" id="date_filter_component">
                <label class="block text-sm font-medium text-gray-700 mb-1">Período de Tiempo</label>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <input type="date" id="filter_date_start" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm" value="${defaultDateRange.start}">
                    </div>
                    <div>
                        <input type="date" id="filter_date_end" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm" value="${defaultDateRange.end}">
                    </div>
                </div>
            </div>
        `;
    }
    
    // Filtro de ciudad
    if (includeCity) {
        html += `
            <div class="filter-component filter-group" id="city_filter_component">
                <label for="filter_city" class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <select id="filter_city" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm">
                    <option value="todas">Todas las ciudades</option>
                    <option value="Bogota D.C.">Bogotá D.C.</option>
                    <option value="Medellin">Medellín</option>
                    <option value="Manizales">Manizales</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                    <option value="Cali Norte">Cali Norte</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Pereira">Pereira</option>
                </select>
            </div>
        `;
    }
    
    // Filtro de segmento
    if (includeSegment) {
        html += `
            <div class="filter-component" id="segment_filter_component">
                <label for="filter_segment" class="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
                <select id="filter_segment" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm">
                    <option value="todos">Todos los segmentos</option>
                    <option value="Personas">Personas</option>
                    <option value="Empresas">Empresas</option>
                </select>
            </div>
        `;
    }
    
    // Filtro de género
    if (includeGender) {
        html += `
            <div class="filter-component" id="gender_filter_component">
                <label for="filter_gender" class="block text-sm font-medium text-gray-700 mb-1">Género</label>
                <select id="filter_gender" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm">
                    <option value="todos">Todos</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                </select>
            </div>
        `;
    }
    
    // Filtro de tipo de ejecutivo
    if (includeExecutive) {
        html += `
            <div class="filter-component" id="executive_filter_component">
                <label for="filter_executive" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Ejecutivo</label>
                <select id="filter_executive" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm">
                    <option value="todos">Todos los tipos</option>
                    <option value="GERENTE DE AGENCIA">Gerente de Agencia</option>
                    <option value="GERENTE DE CUENTA EMPRESAS">Gerente de Cuenta Empresas</option>
                </select>
            </div>
        `;
    }
    
    // Filtro de calificación
    if (includeRating) {
        html += `
            <div class="filter-component" id="rating_filter_component">
                <label class="block text-sm font-medium text-gray-700 mb-1">Rango de Calificación</label>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <select id="filter_rating_min" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>
                    <div>
                        <select id="filter_rating_max" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5" selected>5</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Barra de búsqueda
    if (includeSearch) {
        html += `
            <div class="filter-component md:col-span-2 lg:col-span-3" id="search_filter_component">
                <label for="filter_search" class="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                    <input type="text" id="filter_search" class="block w-full pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md" placeholder="Buscar...">
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Botones de acción
    html += `
            </div>
            <div class="flex justify-end mt-4 space-x-3">
                <button id="filter_reset" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Reiniciar Filtros
                </button>
                <button id="filter_apply" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Aplicar Filtros
                </button>
            </div>
            <div id="filter_results_summary" class="text-sm text-gray-600 mt-3 hidden">
                Mostrando <span id="filter_count">0</span> resultados de <span id="filter_total">0</span>
            </div>
        </div>
    `;
    
    // Insertar HTML en el contenedor
    container.innerHTML = html;
    
    // Configurar controladores de eventos
    setupFilterEventListeners(containerId, options.onFilterChange);
}

// Configurar los controladores de eventos para los filtros
function setupFilterEventListeners(containerId, onFilterChange) {
    // Obtener referencias a los elementos del DOM
    const dateStart = document.getElementById('filter_date_start');
    const dateEnd = document.getElementById('filter_date_end');
    const citySelect = document.getElementById('filter_city');
    const segmentSelect = document.getElementById('filter_segment');
    const genderSelect = document.getElementById('filter_gender');
    const executiveSelect = document.getElementById('filter_executive');
    const ratingMinSelect = document.getElementById('filter_rating_min');
    const ratingMaxSelect = document.getElementById('filter_rating_max');
    const searchInput = document.getElementById('filter_search');
    const resetButton = document.getElementById('filter_reset');
    const applyButton = document.getElementById('filter_apply');
    
    // Función para actualizar el estado de los filtros
    const updateFilterState = () => {
        filtroState = {
            fechaInicio: dateStart ? dateStart.value : defaultDateRange.start,
            fechaFin: dateEnd ? dateEnd.value : defaultDateRange.end,
            ciudad: citySelect ? citySelect.value : 'todas',
            segmento: segmentSelect ? segmentSelect.value : 'todos',
            genero: genderSelect ? genderSelect.value : 'todos',
            tipoEjecutivo: executiveSelect ? executiveSelect.value : 'todos',
            calificacionMin: ratingMinSelect ? parseInt(ratingMinSelect.value) : 1,
            calificacionMax: ratingMaxSelect ? parseInt(ratingMaxSelect.value) : 5,
            searchTerm: searchInput ? searchInput.value.toLowerCase() : ''
        };
        
        // Aplicar filtros y actualizar visualización
        aplicarFiltros();
        
        // Notificar cambio si se proporciona la función callback
        if (typeof onFilterChange === 'function') {
            onFilterChange(filtroState, datosFiltrados);
        }
    };
    
    // Configurar eventos para cada componente de filtro
    if (dateStart) dateStart.addEventListener('change', updateFilterState);
    if (dateEnd) dateEnd.addEventListener('change', updateFilterState);
    if (citySelect) citySelect.addEventListener('change', updateFilterState);
    if (segmentSelect) segmentSelect.addEventListener('change', updateFilterState);
    if (genderSelect) genderSelect.addEventListener('change', updateFilterState);
    if (executiveSelect) executiveSelect.addEventListener('change', updateFilterState);
    if (ratingMinSelect) ratingMinSelect.addEventListener('change', updateFilterState);
    if (ratingMaxSelect) ratingMaxSelect.addEventListener('change', updateFilterState);
    
    // Búsqueda con retraso para evitar muchas actualizaciones
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(updateFilterState, 300);
        });
    }
    
    // Botón para reiniciar filtros
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            // Restablecer valores de los filtros a sus valores predeterminados
            if (dateStart) dateStart.value = defaultDateRange.start;
            if (dateEnd) dateEnd.value = defaultDateRange.end;
            if (citySelect) citySelect.selectedIndex = 0;
            if (segmentSelect) segmentSelect.selectedIndex = 0;
            if (genderSelect) genderSelect.selectedIndex = 0;
            if (executiveSelect) executiveSelect.selectedIndex = 0;
            if (ratingMinSelect) ratingMinSelect.selectedIndex = 0;
            if (ratingMaxSelect) ratingMaxSelect.selectedIndex = 4; // Índice para valor 5
            if (searchInput) searchInput.value = '';
            
            // Actualizar estado y aplicar filtros
            updateFilterState();
        });
    }
    
    // Botón para aplicar filtros manualmente
    if (applyButton) {
        applyButton.addEventListener('click', updateFilterState);
    }
}

// Aplicar filtros a los datos y actualizar visualizaciones
function aplicarFiltros() {
    // Si no hay datos cargados, intentar cargarlos
    if (datosCompletos.length === 0) {
        cargarDatosEncuesta();
        return;
    }
    
    // Filtrar los datos según el estado actual de los filtros
    datosFiltrados = datosCompletos.filter(item => {
        // Filtro de fecha
        const fechaItem = new Date(item.FECHA_ENCUESTA);
        const fechaInicio = new Date(filtroState.fechaInicio);
        const fechaFin = new Date(filtroState.fechaFin);
        if (fechaItem < fechaInicio || fechaItem > fechaFin) return false;
        
        // Filtro de ciudad
        if (filtroState.ciudad !== 'todas' && item.CIUDAD_AGENCIA !== filtroState.ciudad) return false;
        
        // Filtro de segmento
        if (filtroState.segmento !== 'todos' && item.SEGMENTO !== filtroState.segmento) return false;
        
        // Filtro de género
        if (filtroState.genero !== 'todos' && item.GENERO !== filtroState.genero) return false;
        
        // Filtro de tipo de ejecutivo
        if (filtroState.tipoEjecutivo !== 'todos' && item.TIPO_EJECUTIVO !== filtroState.tipoEjecutivo) return false;
        
        // Filtro de calificación (usamos PREGUNTA_1 como ejemplo, se podría adaptar a múltiples preguntas)
        const calificacion = parseFloat(item.PREGUNTA_1);
        if (calificacion < filtroState.calificacionMin || calificacion > filtroState.calificacionMax) return false;
        
        // Filtro de búsqueda
        if (filtroState.searchTerm) {
            const searchIn = (
                (item.NOMBRE || '') + ' ' +
                (item.EMAIL || '') + ' ' +
                (item.CIUDAD_AGENCIA || '') + ' ' +
                (item.AGENCIA_EJECUTIVO || '') + ' ' +
                (item.PREGUNTA_5 || '')
            ).toLowerCase();
            
            if (!searchIn.includes(filtroState.searchTerm)) return false;
        }
        
        // Si pasa todos los filtros
        return true;
    });
    
    // Actualizar el contador de resultados
    const filterCount = document.getElementById('filter_count');
    const filterTotal = document.getElementById('filter_total');
    const filterResultsSummary = document.getElementById('filter_results_summary');
    
    if (filterCount && filterTotal && filterResultsSummary) {
        filterCount.textContent = datosFiltrados.length;
        filterTotal.textContent = datosCompletos.length;
        filterResultsSummary.classList.remove('hidden');
    }
    
    // Actualizar visualizaciones
    actualizarVisualizaciones();
}

// Función para cargar los datos de la encuesta
function cargarDatosEncuesta() {
    fetch('data/encuesta_satisfaccion.json')
        .then(response => response.json())
        .then(data => {
            datosCompletos = data;
            datosFiltrados = [...data]; // Inicialmente, todos los datos están filtrados
            
            // Actualizar el contador de resultados
            const filterCount = document.getElementById('filter_count');
            const filterTotal = document.getElementById('filter_total');
            const filterResultsSummary = document.getElementById('filter_results_summary');
            
            if (filterCount && filterTotal && filterResultsSummary) {
                filterCount.textContent = datosFiltrados.length;
                filterTotal.textContent = datosCompletos.length;
                filterResultsSummary.classList.remove('hidden');
            }
            
            // Actualizar visualizaciones
            actualizarVisualizaciones();
        })
        .catch(error => {
            console.error('Error cargando datos de encuesta:', error);
            // Crear datos simulados para demostración
            crearDatosSimulados();
        });
}

// Función para crear datos simulados en caso de error o para demostración
function crearDatosSimulados() {
    const ciudades = ['Bogota D.C.', 'Medellin', 'Manizales', 'Bucaramanga', 'Cali Norte', 'Barranquilla', 'Pereira'];
    const segmentos = ['Personas', 'Empresas'];
    const generos = ['M', 'F'];
    const tiposEjecutivo = ['GERENTE DE AGENCIA', 'GERENTE DE CUENTA EMPRESAS'];
    
    // Generar 1000 registros simulados
    datosCompletos = Array.from({ length: 1000 }, (_, i) => {
        const fechaRandom = new Date(2025, Math.floor(Math.random() * 4), Math.floor(Math.random() * 28) + 1);
        const segmento = segmentos[Math.random() > 0.95 ? 1 : 0]; // 5% empresas, 95% personas
        const tipoEjecutivo = segmento === 'Empresas' ? tiposEjecutivo[1] : tiposEjecutivo[0];
        
        return {
            ID: i + 1,
            FECHA_ENCUESTA: fechaRandom.toISOString().split('T')[0],
            EMAIL: `cliente${i}@example.com`,
            NOMBRE: `Cliente ${i}`,
            CEDULA: `1000${i}`,
            FECHA_VINCULACION: '2024-01-01',
            SEGMENTO: segmento,
            CIUDAD_AGENCIA: ciudades[Math.floor(Math.random() * ciudades.length)],
            AGENCIA_EJECUTIVO: `Agencia ${i % 10}`,
            TIPO_EJECUTIVO: tipoEjecutivo,
            EJECUTIVO: `Ejecutivo ${i % 20}`,
            CIUDAD_RESIDENCIA: ciudades[Math.floor(Math.random() * ciudades.length)],
            GENERO: generos[Math.floor(Math.random() * generos.length)],
            FECHA_NACIMIENTO_FUNDACION: '1980-01-01',
            ESTRATO: Math.floor(Math.random() * 6) + 1,
            PREGUNTA_1: Math.floor(Math.random() * 5) + 1,
            PREGUNTA_2: Math.floor(Math.random() * 5) + 1,
            PREGUNTA_3: Math.floor(Math.random() * 5) + 1,
            PREGUNTA_4: Math.floor(Math.random() * 5) + 1,
            PREGUNTA_5: 'Comentario de ejemplo para la demostración.'
        };
    });
    
    datosFiltrados = [...datosCompletos];
    
    // Actualizar el contador de resultados
    const filterCount = document.getElementById('filter_count');
    const filterTotal = document.getElementById('filter_total');
    const filterResultsSummary = document.getElementById('filter_results_summary');
    
    if (filterCount && filterTotal && filterResultsSummary) {
        filterCount.textContent = datosFiltrados.length;
        filterTotal.textContent = datosCompletos.length;
        filterResultsSummary.classList.remove('hidden');
    }
    
    // Actualizar visualizaciones
    actualizarVisualizaciones();
}

// Función para actualizar las visualizaciones basadas en los datos filtrados
function actualizarVisualizaciones() {
    // Actualizar gráfico de segmento
    actualizarGraficoSegmento();
    
    // Actualizar gráfico de ciudad
    actualizarGraficoCiudad();
    
    // Actualizar gráfico de género
    actualizarGraficoGenero();
    
    // Actualizar gráfico de calificaciones
    actualizarGraficoCalificaciones();
    
    // Actualizar BoxPlot de satisfacción por segmento
    actualizarBoxPlotSatisfaccion();
    
    // Actualizar heatmap de contingencia
    actualizarHeatmapContingencia();
}

// Funciones específicas para actualizar cada visualización

function actualizarGraficoSegmento() {
    const divId = 'chart_segmento_interactivo';
    if (!document.getElementById(divId)) return;
    
    // Contar frecuencias por segmento
    const conteo = {};
    datosFiltrados.forEach(item => {
        const segmento = item.SEGMENTO || 'No especificado';
        conteo[segmento] = (conteo[segmento] || 0) + 1;
    });
    
    // Preparar datos para la visualización
    const labels = Object.keys(conteo);
    const values = Object.values(conteo);
    const total = values.reduce((a, b) => a + b, 0);
    const percentages = values.map(v => (v / total * 100).toFixed(1));
    
    // Verificar si existe la función para gráficos animados
    if (typeof window.createAnimatedPieChart === 'function') {
        window.createAnimatedPieChart(divId, {
            labels,
            values: percentages,
            isPercentage: true
        }, 'Distribución por Segmento');
    }
    
    // Actualizar tabla de frecuencias
    const tableId = 'table_segmento_frecuencia';
    if (document.getElementById(tableId)) {
        let tableHtml = `
            <table class='min-w-full'>
                <thead>
                    <tr>
                        <th>Segmento</th>
                        <th>Frecuencia</th>
                        <th>%</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        labels.forEach((label, index) => {
            tableHtml += `
                <tr>
                    <td>${label}</td>
                    <td>${values[index]}</td>
                    <td>${percentages[index]}%</td>
                </tr>
            `;
        });
        
        tableHtml += `
                </tbody>
            </table>
        `;
        
        document.getElementById(tableId).innerHTML = tableHtml;
    }
}

function actualizarGraficoCiudad() {
    const divId = 'chart_ciudad_interactivo';
    if (!document.getElementById(divId)) return;
    
    // Contar frecuencias por ciudad
    const conteo = {};
    datosFiltrados.forEach(item => {
        const ciudad = item.CIUDAD_AGENCIA || 'No especificada';
        conteo[ciudad] = (conteo[ciudad] || 0) + 1;
    });
    
    // Preparar datos para la visualización
    const labels = Object.keys(conteo);
    const values = Object.values(conteo);
    const total = values.reduce((a, b) => a + b, 0);
    const percentages = values.map(v => (v / total * 100).toFixed(1));
    
    // Verificar si existe la función para gráficos animados
    if (typeof window.createAnimatedBarChart === 'function') {
        window.createAnimatedBarChart(divId, {
            labels,
            values: percentages,
            isPercentage: true
        }, 'Distribución por Ciudad de Agencia', 'Ciudad', 'Porcentaje');
    }
    
    // Actualizar tabla de frecuencias
    const tableId = 'table_ciudad_frecuencia';
    if (document.getElementById(tableId)) {
        let tableHtml = `
            <table class='min-w-full'>
                <thead>
                    <tr>
                        <th>Ciudad</th>
                        <th>Frecuencia</th>
                        <th>%</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Ordenar por frecuencia descendente
        const ciudadesOrdenadas = labels.map((label, i) => ({ 
            label, 
            value: values[i], 
            percentage: percentages[i] 
        })).sort((a, b) => b.value - a.value);
        
        ciudadesOrdenadas.forEach(item => {
            tableHtml += `
                <tr>
                    <td>${item.label}</td>
                    <td>${item.value}</td>
                    <td>${item.percentage}%</td>
                </tr>
            `;
        });
        
        tableHtml += `
                </tbody>
            </table>
        `;
        
        document.getElementById(tableId).innerHTML = tableHtml;
    }
}

function actualizarGraficoGenero() {
    const divId = 'chart_genero_interactivo';
    if (!document.getElementById(divId)) return;
    
    // Contar frecuencias por género
    const conteo = {};
    datosFiltrados.forEach(item => {
        const genero = item.GENERO || 'No especificado';
        conteo[genero] = (conteo[genero] || 0) + 1;
    });
    
    // Preparar datos para la visualización
    const labels = Object.keys(conteo);
    const values = Object.values(conteo);
    const total = values.reduce((a, b) => a + b, 0);
    const percentages = values.map(v => (v / total * 100).toFixed(1));
    
    // Verificar si existe la función para gráficos animados
    if (typeof window.createAnimatedPieChart === 'function') {
        window.createAnimatedPieChart(divId, {
            labels,
            values: percentages,
            isPercentage: true
        }, 'Distribución por Género');
    }
    
    // Actualizar tabla de frecuencias
    const tableId = 'table_genero_frecuencia';
    if (document.getElementById(tableId)) {
        let tableHtml = `
            <table class='min-w-full'>
                <thead>
                    <tr>
                        <th>Género</th>
                        <th>Frecuencia</th>
                        <th>%</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        labels.forEach((label, index) => {
            tableHtml += `
                <tr>
                    <td>${label === 'M' ? 'Masculino' : (label === 'F' ? 'Femenino' : label)}</td>
                    <td>${values[index]}</td>
                    <td>${percentages[index]}%</td>
                </tr>
            `;
        });
        
        tableHtml += `
                </tbody>
            </table>
        `;
        
        document.getElementById(tableId).innerHTML = tableHtml;
    }
}

function actualizarGraficoCalificaciones() {
    const divId = 'chart_pregunta1_interactivo';
    if (!document.getElementById(divId)) return;
    
    // Contar frecuencias por calificación PREGUNTA_1
    const conteo = {
        '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
    };
    
    datosFiltrados.forEach(item => {
        const calificacion = item.PREGUNTA_1?.toString() || 'No especificada';
        if (conteo[calificacion] !== undefined) {
            conteo[calificacion]++;
        }
    });
    
    // Preparar datos para la visualización
    const labels = Object.keys(conteo);
    const values = Object.values(conteo);
    const total = values.reduce((a, b) => a + b, 0);
    const percentages = values.map(v => (v / total * 100).toFixed(1));
    
    // Verificar si existe la función para gráficos animados
    if (typeof window.createAnimatedBarChart === 'function') {
        window.createAnimatedBarChart(divId, {
            labels,
            values: percentages,
            isPercentage: true
        }, 'Distribución de Calificaciones - PREGUNTA_1', 'Calificación', 'Porcentaje');
    }
    
    // Actualizar tabla de estadísticas
    const tableId = 'table_pregunta1_stats';
    if (document.getElementById(tableId)) {
        // Calcular estadísticas
        const calificaciones = datosFiltrados
            .map(item => parseFloat(item.PREGUNTA_1))
            .filter(cal => !isNaN(cal));
        
        if (calificaciones.length > 0) {
            const suma = calificaciones.reduce((a, b) => a + b, 0);
            const media = (suma / calificaciones.length).toFixed(1);
            const calificacionesOrdenadas = [...calificaciones].sort((a, b) => a - b);
            const mediana = calificacionesOrdenadas.length % 2 === 0 ?
                ((calificacionesOrdenadas[calificacionesOrdenadas.length / 2 - 1] + calificacionesOrdenadas[calificacionesOrdenadas.length / 2]) / 2).toFixed(1) :
                calificacionesOrdenadas[Math.floor(calificacionesOrdenadas.length / 2)].toFixed(1);
            const min = Math.min(...calificaciones).toFixed(1);
            const max = Math.max(...calificaciones).toFixed(1);
            
            let tableHtml = `
                <table class='min-w-full'>
                    <thead>
                        <tr>
                            <th>Media</th>
                            <th>Mediana</th>
                            <th>Mín</th>
                            <th>Máx</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${media}</td>
                            <td>${mediana}</td>
                            <td>${min}</td>
                            <td>${max}</td>
                        </tr>
                    </tbody>
                </table>
            `;
            
            document.getElementById(tableId).innerHTML = tableHtml;
        } else {
            document.getElementById(tableId).innerHTML = '<p>No hay datos suficientes para calcular estadísticas.</p>';
        }
    }
}

function actualizarBoxPlotSatisfaccion() {
    const divId = 'chart_satisfaccion_segmento_boxplot';
    if (!document.getElementById(divId)) return;
    
    // Agrupar calificaciones por segmento
    const calificacionesPorSegmento = {};
    
    datosFiltrados.forEach(item => {
        const segmento = item.SEGMENTO || 'No especificado';
        const calificacion = parseFloat(item.PREGUNTA_1);
        
        if (!isNaN(calificacion)) {
            if (!calificacionesPorSegmento[segmento]) {
                calificacionesPorSegmento[segmento] = [];
            }
            calificacionesPorSegmento[segmento].push(calificacion);
        }
    });
    
    // Verificar si existe la función para crear boxplots interactivos
    if (typeof window.createInteractiveBoxPlot === 'function') {
        window.createInteractiveBoxPlot(divId, calificacionesPorSegmento, 'Satisfacción por Segmento', 'Calificación');
    }
    
    // Actualizar tabla de estadísticas
    const tableId = 'table_satisfaccion_segmento';
    if (document.getElementById(tableId)) {
        let tableHtml = `
            <table class='min-w-full'>
                <thead>
                    <tr>
                        <th>Segmento</th>
                        <th>n</th>
                        <th>Media</th>
                        <th>Mediana</th>
                        <th>Mín</th>
                        <th>Máx</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        for (const segmento in calificacionesPorSegmento) {
            const calificaciones = calificacionesPorSegmento[segmento];
            if (calificaciones.length > 0) {
                const n = calificaciones.length;
                const suma = calificaciones.reduce((a, b) => a + b, 0);
                const media = (suma / n).toFixed(2);
                const calificacionesOrdenadas = [...calificaciones].sort((a, b) => a - b);
                const mediana = calificacionesOrdenadas.length % 2 === 0 ?
                    ((calificacionesOrdenadas[n / 2 - 1] + calificacionesOrdenadas[n / 2]) / 2).toFixed(1) :
                    calificacionesOrdenadas[Math.floor(n / 2)].toFixed(1);
                const min = Math.min(...calificaciones).toFixed(1);
                const max = Math.max(...calificaciones).toFixed(1);
                
                tableHtml += `
                    <tr>
                        <td>${segmento}</td>
                        <td>${n}</td>
                        <td>${media}</td>
                        <td>${mediana}</td>
                        <td>${min}</td>
                        <td>${max}</td>
                    </tr>
                `;
            }
        }
        
        tableHtml += `
                </tbody>
            </table>
        `;
        
        document.getElementById(tableId).innerHTML = tableHtml;
    }
}

function actualizarHeatmapContingencia() {
    const divId = 'chart_contingencia_heatmap';
    if (!document.getElementById(divId)) return;
    
    // Crear tabla de contingencia Género vs Ciudad
    const generos = ['M', 'F'];
    const ciudadesSet = new Set();
    
    // Identificar todas las ciudades en los datos filtrados
    datosFiltrados.forEach(item => {
        if (item.CIUDAD_AGENCIA) {
            ciudadesSet.add(item.CIUDAD_AGENCIA);
        }
    });
    
    const ciudades = Array.from(ciudadesSet);
    
    // Inicializar matriz de contingencia
    const conteoContingencia = {};
    generos.forEach(genero => {
        conteoContingencia[genero] = {};
        ciudades.forEach(ciudad => {
            conteoContingencia[genero][ciudad] = 0;
        });
    });
    
    // Contar las ocurrencias
    datosFiltrados.forEach(item => {
        const genero = item.GENERO;
        const ciudad = item.CIUDAD_AGENCIA;
        
        if (genero && ciudad && conteoContingencia[genero] && conteoContingencia[genero][ciudad] !== undefined) {
            conteoContingencia[genero][ciudad]++;
        }
    });
    
    // Preparar datos para el heatmap
    const heatmapData = {
        rowNames: generos,
        columnNames: ciudades,
        values: generos.map(genero => 
            ciudades.map(ciudad => conteoContingencia[genero][ciudad])
        )
    };
    
    // Verificar si existe la función para crear heatmaps interactivos
    if (typeof window.createInteractiveHeatmap === 'function') {
        window.createInteractiveHeatmap(divId, heatmapData, 'Relación Género y Ciudad de Agencia');
    }
    
    // Actualizar tabla de contingencia
    const tableId = 'table_contingencia_genero_ciudad';
    if (document.getElementById(tableId)) {
        let tableHtml = `
            <table class='min-w-full'>
                <thead>
                    <tr>
                        <th>Género / Ciudad</th>
        `;
        
        ciudades.forEach(ciudad => {
            tableHtml += `<th>${ciudad}</th>`;
        });
        
        tableHtml += `
                    </tr>
                </thead>
                <tbody>
        `;
        
        generos.forEach(genero => {
            tableHtml += `
                <tr>
                    <td>${genero === 'M' ? 'Masculino' : 'Femenino'}</td>
            `;
            
            ciudades.forEach(ciudad => {
                tableHtml += `<td>${conteoContingencia[genero][ciudad]}</td>`;
            });
            
            tableHtml += `
                </tr>
            `;
        });
        
        tableHtml += `
                </tbody>
            </table>
        `;
        
        document.getElementById(tableId).innerHTML = tableHtml;
    }
}

// --- Exportar funciones ---
window.createFilterPanel = createFilterPanel;
window.setupFilterEventListeners = setupFilterEventListeners;
window.aplicarFiltros = aplicarFiltros;
window.cargarDatosEncuesta = cargarDatosEncuesta;
window.actualizarVisualizaciones = actualizarVisualizaciones;

// Inicializar cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar paneles de filtro en las diferentes secciones
    createFilterPanel('filtro_descriptivo', {
        includeDate: true,
        includeCity: true,
        includeSegment: true,
        includeGender: true,
        includeExecutive: true,
        includeRating: false,
        includeSearch: true
    });
    
    createFilterPanel('filtro_bivariado', {
        includeDate: false,
        includeCity: true,
        includeSegment: true,
        includeGender: true,
        includeExecutive: true,
        includeRating: true,
        includeSearch: false
    });
    
    createFilterPanel('filtro_comentarios', {
        includeDate: true,
        includeCity: true,
        includeSegment: true,
        includeGender: true,
        includeExecutive: false,
        includeRating: true,
        includeSearch: true
    });
    
    // Cargar datos iniciales
    cargarDatosEncuesta();
});
