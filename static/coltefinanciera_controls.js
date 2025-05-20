// coltefinanciera_controls.js
// Script para controles interactivos y filtros en el dashboard

// Función para crear un selector
function createSelector(containerId, options, defaultValue, label, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const selectId = `select_${containerId}`;
    
    // Crear el HTML del selector
    let html = `
        <div class="mb-4">
            <label for="${selectId}" class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
            <select id="${selectId}" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
    `;
    
    // Agregar las opciones
    options.forEach(option => {
        const selected = option.value === defaultValue ? 'selected' : '';
        html += `<option value="${option.value}" ${selected}>${option.label}</option>`;
    });
    
    html += `
            </select>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Agregar el evento change
    const select = document.getElementById(selectId);
    if (select && onChange) {
        select.addEventListener('change', function() {
            onChange(this.value);
        });
    }
    
    return select;
}

// Función para crear un rango de fechas
function createDateRange(containerId, startDate, endDate, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const startId = `date_start_${containerId}`;
    const endId = `date_end_${containerId}`;
    
    // Crear el HTML del rango de fechas
    const html = `
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label for="${startId}" class="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                <input type="date" id="${startId}" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" value="${startDate}">
            </div>
            <div>
                <label for="${endId}" class="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                <input type="date" id="${endId}" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" value="${endDate}">
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Agregar los eventos change
    const start = document.getElementById(startId);
    const end = document.getElementById(endId);
    
    if (start && end && onChange) {
        const handleChange = function() {
            onChange(start.value, end.value);
        };
        
        start.addEventListener('change', handleChange);
        end.addEventListener('change', handleChange);
    }
    
    return { start, end };
}

// Función para crear un rango numérico (slider)
function createRangeSlider(containerId, min, max, defaultMin, defaultMax, step, label, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const sliderId = `slider_${containerId}`;
    const minValueId = `min_value_${containerId}`;
    const maxValueId = `max_value_${containerId}`;
    
    // Crear el HTML del slider
    const html = `
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">${label}: <span id="${minValueId}">${defaultMin}</span> - <span id="${maxValueId}">${defaultMax}</span></label>
            <div class="flex items-center">
                <span class="text-xs text-gray-500">${min}</span>
                <input type="range" 
                       id="${sliderId}_min" 
                       min="${min}" 
                       max="${max}" 
                       step="${step}" 
                       value="${defaultMin}" 
                       class="mx-2 w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200">
                <input type="range" 
                       id="${sliderId}_max" 
                       min="${min}" 
                       max="${max}" 
                       step="${step}" 
                       value="${defaultMax}" 
                       class="mx-2 w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200">
                <span class="text-xs text-gray-500">${max}</span>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Actualizar los valores mostrados y manejar el evento change
    const minSlider = document.getElementById(`${sliderId}_min`);
    const maxSlider = document.getElementById(`${sliderId}_max`);
    const minValueSpan = document.getElementById(minValueId);
    const maxValueSpan = document.getElementById(maxValueId);
    
    if (minSlider && maxSlider && minValueSpan && maxValueSpan) {
        const handleMinChange = function() {
            if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
                minSlider.value = maxSlider.value;
            }
            minValueSpan.textContent = minSlider.value;
            if (onChange) onChange(parseInt(minSlider.value), parseInt(maxSlider.value));
        };
        
        const handleMaxChange = function() {
            if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
                maxSlider.value = minSlider.value;
            }
            maxValueSpan.textContent = maxSlider.value;
            if (onChange) onChange(parseInt(minSlider.value), parseInt(maxSlider.value));
        };
        
        minSlider.addEventListener('input', handleMinChange);
        maxSlider.addEventListener('input', handleMaxChange);
    }
    
    return { minSlider, maxSlider };
}

// Función para crear checkboxes
function createCheckboxes(containerId, options, label, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Crear el HTML de los checkboxes
    let html = `
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">${label}</label>
            <div class="space-y-2">
    `;
    
    // Agregar los checkboxes
    options.forEach(option => {
        const checked = option.checked ? 'checked' : '';
        html += `
            <div class="flex items-center">
                <input type="checkbox" id="check_${containerId}_${option.value}" value="${option.value}" ${checked} class="rounded text-blue-600 focus:ring-blue-500">
                <label for="check_${containerId}_${option.value}" class="ml-2 text-sm text-gray-700">${option.label}</label>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Agregar los eventos change
    const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
    
    if (checkboxes.length > 0 && onChange) {
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const selectedValues = checkboxes
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                onChange(selectedValues);
            });
        });
    }
    
    return checkboxes;
}

// Función para crear botones de filtro
function createFilterButtons(containerId, buttons, activeIndex, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Crear el HTML de los botones
    let html = `<div class="flex flex-wrap gap-2 mb-4">`;
    
    // Agregar los botones
    buttons.forEach((button, index) => {
        const activeClass = index === activeIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
        html += `
            <button data-index="${index}" class="px-3 py-1 rounded-md text-sm font-medium ${activeClass} transition-colors">
                ${button.label}
            </button>
        `;
    });
    
    html += `</div>`;
    
    container.innerHTML = html;
    
    // Agregar los eventos click
    const buttonElements = Array.from(container.querySelectorAll('button'));
    
    if (buttonElements.length > 0 && onChange) {
        buttonElements.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                
                // Actualizar clases
                buttonElements.forEach((btn, i) => {
                    if (i === index) {
                        btn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
                        btn.classList.add('bg-blue-600', 'text-white');
                    } else {
                        btn.classList.remove('bg-blue-600', 'text-white');
                        btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
                    }
                });
                
                onChange(index, buttons[index]);
            });
        });
    }
    
    return buttonElements;
}

// Función para crear un panel de filtros colapsable
function createFilterPanel(containerId, title) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Crear la estructura base del panel
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div id="${containerId}_header" class="flex justify-between items-center p-4 bg-gray-50 cursor-pointer">
                <h3 class="text-lg font-medium text-gray-700">${title}</h3>
                <svg id="${containerId}_icon" class="h-5 w-5 text-gray-500 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </div>
            <div id="${containerId}_content" class="p-4 border-t border-gray-200" style="display: block;">
                <!-- El contenido del filtro se agregará aquí -->
            </div>
        </div>
    `;
    
    // Agregar funcionalidad de colapsar/expandir
    const header = document.getElementById(`${containerId}_header`);
    const content = document.getElementById(`${containerId}_content`);
    const icon = document.getElementById(`${containerId}_icon`);
    
    if (header && content && icon) {
        header.addEventListener('click', function() {
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.style.transform = 'rotate(0deg)';
            } else {
                content.style.display = 'none';
                icon.style.transform = 'rotate(-90deg)';
            }
        });
    }
    
    return { 
        container,
        header,
        content,
        addFilter: function(filterHtml) {
            if (content) {
                const div = document.createElement('div');
                div.innerHTML = filterHtml;
                content.appendChild(div);
                return div;
            }
            return null;
        }
    };
}

// Función para inicializar los controles de filtros
function initializeFilters() {
    // Ejemplo: crear un panel de filtros para el análisis descriptivo
    if (document.getElementById('filtro_descriptivo')) {
        const panel = createFilterPanel('filtro_descriptivo', 'Filtros de Visualización');
        
        if (panel && panel.content) {
            // Crear un selector de variable
            const variableOptions = [
                { value: 'SEGMENTO', label: 'Segmento' },
                { value: 'CIUDAD_AGENCIA', label: 'Ciudad de Agencia' },
                { value: 'GENERO', label: 'Género' },
                { value: 'AGENCIA_EJECUTIVO', label: 'Agencia/Ejecutivo' }
            ];
            
            const variableSelector = document.createElement('div');
            variableSelector.id = 'variable_selector';
            panel.content.appendChild(variableSelector);
            
            createSelector('variable_selector', variableOptions, 'SEGMENTO', 'Variable a visualizar', function(value) {
                console.log('Variable seleccionada:', value);
                // Aquí iría la lógica para actualizar las visualizaciones
            });
            
            // Crear un filtro por ciudad
            const ciudadOptions = [
                { value: 'todas', label: 'Todas las ciudades' },
                { value: 'Bogota D.C.', label: 'Bogotá D.C.' },
                { value: 'Medellin', label: 'Medellín' },
                { value: 'Cali', label: 'Cali' },
                { value: 'Barranquilla', label: 'Barranquilla' }
            ];
            
            const ciudadSelector = document.createElement('div');
            ciudadSelector.id = 'ciudad_selector';
            panel.content.appendChild(ciudadSelector);
            
            createSelector('ciudad_selector', ciudadOptions, 'todas', 'Filtrar por Ciudad', function(value) {
                console.log('Ciudad seleccionada:', value);
                // Aquí iría la lógica para filtrar por ciudad
            });
            
            // Crear un filtro por calificación
            const rangeSlider = document.createElement('div');
            rangeSlider.id = 'calificacion_range';
            panel.content.appendChild(rangeSlider);
            
            createRangeSlider('calificacion_range', 1, 5, 1, 5, 1, 'Rango de Calificación', function(min, max) {
                console.log('Rango de calificación:', min, max);
                // Aquí iría la lógica para filtrar por rango de calificación
            });
            
            // Botón para aplicar filtros
            const applyButton = document.createElement('button');
            applyButton.className = 'mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors';
            applyButton.textContent = 'Aplicar Filtros';
            applyButton.addEventListener('click', function() {
                console.log('Aplicar filtros');
                // Aquí iría la lógica para aplicar todos los filtros
            });
            panel.content.appendChild(applyButton);
        }
    }
    
    // Ejemplo: crear filtros para el análisis bivariado
    if (document.getElementById('filtro_bivariado')) {
        const panel = createFilterPanel('filtro_bivariado', 'Comparación de Variables');
        
        if (panel && panel.content) {
            // Variables para el eje X
            const variableXOptions = [
                { value: 'SEGMENTO', label: 'Segmento' },
                { value: 'CIUDAD_AGENCIA', label: 'Ciudad de Agencia' },
                { value: 'GENERO', label: 'Género' }
            ];
            
            const variableXSelector = document.createElement('div');
            variableXSelector.id = 'variable_x_selector';
            panel.content.appendChild(variableXSelector);
            
            createSelector('variable_x_selector', variableXOptions, 'SEGMENTO', 'Variable Categórica (Eje X)', function(value) {
                console.log('Variable X seleccionada:', value);
                // Actualizar visualización
            });
            
            // Variables para el eje Y
            const variableYOptions = [
                { value: 'PREGUNTA_1', label: 'Satisfacción General' },
                { value: 'PREGUNTA_2', label: 'Calidad de Servicio' },
                { value: 'PREGUNTA_3', label: 'Facilidad de Uso' },
                { value: 'PREGUNTA_4', label: 'Recomendación' }
            ];
            
            const variableYSelector = document.createElement('div');
            variableYSelector.id = 'variable_y_selector';
            panel.content.appendChild(variableYSelector);
            
            createSelector('variable_y_selector', variableYOptions, 'PREGUNTA_1', 'Variable Numérica (Eje Y)', function(value) {
                console.log('Variable Y seleccionada:', value);
                // Actualizar visualización
            });
            
            // Tipo de visualización
            const chartTypeOptions = [
                { value: 'bar', label: 'Gráfico de Barras' },
                { value: 'box', label: 'Box Plot' },
                { value: 'heatmap', label: 'Mapa de Calor' }
            ];
            
            const chartTypeSelector = document.createElement('div');
            chartTypeSelector.id = 'chart_type_selector';
            panel.content.appendChild(chartTypeSelector);
            
            createSelector('chart_type_selector', chartTypeOptions, 'bar', 'Tipo de Visualización', function(value) {
                console.log('Tipo de gráfico seleccionado:', value);
                // Cambiar tipo de visualización
            });
            
            // Botón para generar gráfico
            const generateButton = document.createElement('button');
            generateButton.className = 'mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors';
            generateButton.textContent = 'Generar Visualización';
            generateButton.addEventListener('click', function() {
                console.log('Generar visualización');
                // Aquí iría la lógica para generar la visualización con los parámetros seleccionados
            });
            panel.content.appendChild(generateButton);
        }
    }
    
    // Ejemplo: crear un panel para filtrar comentarios
    if (document.getElementById('filtro_comentarios')) {
        const panel = createFilterPanel('filtro_comentarios', 'Análisis de Comentarios');
        
        if (panel && panel.content) {
            // Selector de sentimiento
            const sentimientoOptions = [
                { value: 'todos', label: 'Todos los comentarios' },
                { value: 'positivos', label: 'Comentarios positivos' },
                { value: 'negativos', label: 'Comentarios negativos' },
                { value: 'neutros', label: 'Comentarios neutros' }
            ];
            
            const sentimientoSelector = document.createElement('div');
            sentimientoSelector.id = 'sentimiento_selector';
            panel.content.appendChild(sentimientoSelector);
            
            createSelector('sentimiento_selector', sentimientoOptions, 'todos', 'Filtrar por Sentimiento', function(value) {
                console.log('Sentimiento seleccionado:', value);
                // Filtrar comentarios
            });
            
            // Búsqueda por palabra clave
            const keywordSearch = document.createElement('div');
            keywordSearch.innerHTML = `
                <div class="mb-4">
                    <label for="keyword_search" class="block text-sm font-medium text-gray-700 mb-1">Buscar por Palabra Clave</label>
                    <div class="flex">
                        <input type="text" id="keyword_search" class="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                        <button id="keyword_search_btn" class="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700">Buscar</button>
                    </div>
                </div>
            `;
            panel.content.appendChild(keywordSearch);
            
            document.getElementById('keyword_search_btn').addEventListener('click', function() {
                const keyword = document.getElementById('keyword_search').value;
                console.log('Buscar palabra clave:', keyword);
                // Buscar comentarios con la palabra clave
            });
        }
    }
}

// Inicializar controles cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar filtros
    initializeFilters();
    
    // Exportar funciones para uso global
    window.Controls = {
        createSelector,
        createDateRange,
        createRangeSlider,
        createCheckboxes,
        createFilterButtons,
        createFilterPanel,
        initializeFilters
    };
});
