/**
 * Este archivo contiene el conector entre los filtros y los gráficos para mantener
 * la visualización actualizada cuando se aplican filtros.
 */

// Variables globales
let activeFilters = {
    city: 'todas',
    segment: 'todos',
    gender: 'todos',
    executiveType: 'todos',
    dateStart: null,
    dateEnd: null,
    ratingMin: 1,
    ratingMax: 5
};

// Suscripciones a cambios de filtros
document.addEventListener('DOMContentLoaded', function() {
    // Conectar eventos de cambio de filtros
    setupFilterEvents();
});

/**
 * Configura los eventos de cambio en todos los filtros disponibles
 */
function setupFilterEvents() {
    // Filtro de ciudad
    const cityFilter = document.getElementById('filter_city');
    if (cityFilter) {
        cityFilter.addEventListener('change', function() {
            activeFilters.city = this.value;
            applyFiltersToCharts();
        });
    }
    
    // Filtro de segmento
    const segmentFilter = document.getElementById('filter_segment');
    if (segmentFilter) {
        segmentFilter.addEventListener('change', function() {
            activeFilters.segment = this.value;
            applyFiltersToCharts();
        });
    }
    
    // Filtro de género
    const genderFilter = document.getElementById('filter_gender');
    if (genderFilter) {
        genderFilter.addEventListener('change', function() {
            activeFilters.gender = this.value;
            applyFiltersToCharts();
        });
    }
    
    // Filtro de tipo de ejecutivo
    const executiveFilter = document.getElementById('filter_executive_type');
    if (executiveFilter) {
        executiveFilter.addEventListener('change', function() {
            activeFilters.executiveType = this.value;
            applyFiltersToCharts();
        });
    }
    
    // Filtros de fecha
    const dateStartFilter = document.getElementById('filter_date_start');
    const dateEndFilter = document.getElementById('filter_date_end');
    
    if (dateStartFilter && dateEndFilter) {
        dateStartFilter.addEventListener('change', function() {
            activeFilters.dateStart = this.value;
            applyFiltersToCharts();
        });
        
        dateEndFilter.addEventListener('change', function() {
            activeFilters.dateEnd = this.value;
            applyFiltersToCharts();
        });
    }
    
    // Filtros de calificación
    const ratingMinFilter = document.getElementById('filter_rating_min');
    const ratingMaxFilter = document.getElementById('filter_rating_max');
    
    if (ratingMinFilter && ratingMaxFilter) {
        ratingMinFilter.addEventListener('change', function() {
            activeFilters.ratingMin = parseInt(this.value);
            applyFiltersToCharts();
        });
        
        ratingMaxFilter.addEventListener('change', function() {
            activeFilters.ratingMax = parseInt(this.value);
            applyFiltersToCharts();
        });
    }
    
    // Botón de aplicar filtros (opcional)
    const applyFiltersBtn = document.getElementById('apply_filters_btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFiltersToCharts);
    }
    
    // Botón de reset filtros
    const resetFiltersBtn = document.getElementById('reset_filters_btn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetAllFilters);
    }
}

/**
 * Aplica los filtros activos a todos los gráficos
 */
async function applyFiltersToCharts() {
    console.log("Aplicando filtros:", activeFilters);
    
    // Mostrar indicador de carga
    document.querySelectorAll('.chart-container').forEach(container => {
        showChartSkeleton(container.id);
    });
    
    try {
        // Recarga los gráficos principales con los filtros aplicados
        if (typeof loadSegmentoChart === 'function') await loadSegmentoChart(activeFilters);
        if (typeof loadCiudadChart === 'function') await loadCiudadChart(activeFilters);
        if (typeof loadGeneroChart === 'function') await loadGeneroChart(activeFilters);
        if (typeof loadPreguntasCharts === 'function') await loadPreguntasCharts(null, activeFilters);
        if (typeof loadBivariadoCharts === 'function') await loadBivariadoCharts(activeFilters);
        
        // Actualizar cualquier tabla relacionada
        updateTablasWithFilters(activeFilters);
        
        console.log("✅ Filtros aplicados correctamente a todos los gráficos");
    } catch (error) {
        console.error("❌ Error al aplicar filtros a los gráficos:", error);
    }
}

/**
 * Restablece todos los filtros a sus valores predeterminados
 */
function resetAllFilters() {
    // Restablecer valores de los controles de filtro
    const cityFilter = document.getElementById('filter_city');
    if (cityFilter) cityFilter.value = 'todas';
    
    const segmentFilter = document.getElementById('filter_segment');
    if (segmentFilter) segmentFilter.value = 'todos';
    
    const genderFilter = document.getElementById('filter_gender');
    if (genderFilter) genderFilter.value = 'todos';
    
    const executiveFilter = document.getElementById('filter_executive_type');
    if (executiveFilter) executiveFilter.value = 'todos';
    
    const dateStartFilter = document.getElementById('filter_date_start');
    if (dateStartFilter) dateStartFilter.value = '2025-01-01';
    
    const dateEndFilter = document.getElementById('filter_date_end');
    if (dateEndFilter) dateEndFilter.value = '2025-04-30';
    
    const ratingMinFilter = document.getElementById('filter_rating_min');
    if (ratingMinFilter) ratingMinFilter.value = '1';
    
    const ratingMaxFilter = document.getElementById('filter_rating_max');
    if (ratingMaxFilter) ratingMaxFilter.value = '5';
    
    // Restablecer objeto de filtros activos
    activeFilters = {
        city: 'todas',
        segment: 'todos',
        gender: 'todos',
        executiveType: 'todos',
        dateStart: '2025-01-01',
        dateEnd: '2025-04-30',
        ratingMin: 1,
        ratingMax: 5
    };
    
    // Volver a cargar los gráficos sin filtros
    applyFiltersToCharts();
    
    console.log("✅ Filtros restablecidos");
}

/**
 * Actualiza las tablas con los filtros aplicados
 */
function updateTablasWithFilters(filters) {
    // Implementación según las tablas específicas que necesiten actualizarse
    console.log("Actualizando tablas con filtros");
}

/**
 * Filtra un conjunto de datos según los filtros activos
 * @param {Array} data - Datos a filtrar
 * @param {Object} filters - Filtros a aplicar
 * @returns {Array} - Datos filtrados
 */
function filterData(data, filters) {
    if (!data || !Array.isArray(data)) return [];
    
    return data.filter(item => {
        // Filtro por ciudad
        if (filters.city !== 'todas' && item.CIUDAD_AGENCIA !== filters.city) {
            return false;
        }
        
        // Filtro por segmento
        if (filters.segment !== 'todos' && item.SEGMENTO !== filters.segment) {
            return false;
        }
        
        // Filtro por género
        if (filters.gender !== 'todos') {
            const gender = filters.gender === 'M' ? 'M' : 'F';
            if (item.GENERO !== gender) {
                return false;
            }
        }
        
        // Filtro por tipo de ejecutivo
        if (filters.executiveType !== 'todos' && item.TIPO_EJECUTIVO !== filters.executiveType) {
            return false;
        }
        
        // Filtro por fecha
        if (filters.dateStart && filters.dateEnd) {
            const itemDate = new Date(item.FECHA_ENCUESTA);
            const startDate = new Date(filters.dateStart);
            const endDate = new Date(filters.dateEnd);
            
            if (itemDate < startDate || itemDate > endDate) {
                return false;
            }
        }
        
        // Filtro por calificación (si aplica)
        if (item.PREGUNTA_1) {
            const rating = parseFloat(item.PREGUNTA_1);
            if (rating < filters.ratingMin || rating > filters.ratingMax) {
                return false;
            }
        }
        
        return true;
    });
}
