/**
 * coltefinanciera_data_loader.js
 * Módulo centralizado para cargar datos JSON generados por Python
 * 
 * Este módulo proporciona funciones para cargar y gestionar datos JSON
 * de manera unificada en toda la aplicación.
 */

// Constantes de configuración
const DATA_PATH = 'data/';
const PLOTLY_PREFIX = 'plotly_';

/**
 * Carga datos JSON desde el servidor con manejo de errores unificado
 * 
 * @param {string} jsonPath - Ruta relativa o completa al archivo JSON
 * @param {Object} options - Opciones de configuración
 * @returns {Promise} Promesa que resuelve al objeto JSON o rechaza con un error
 */
function fetchJsonData(jsonPath, options = {}) {
    // Normalizar la ruta
    const path = normalizeJsonPath(jsonPath);
    
    // Configurar opciones por defecto
    const defaultOptions = {
        useMockData: false,
        mockDataGenerator: null,
        retries: 1,
        timeout: 5000  // 5 segundos
    };
    
    // Combinar opciones
    const config = { ...defaultOptions, ...options };
    
    // Crear controlador de tiempo límite
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    return new Promise((resolve, reject) => {
        // Intentar cargar los datos
        fetch(path, { signal: controller.signal })
            .then(response => {
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                
                return response.json();
            })
            .then(data => {
                console.log(`✅ Datos cargados correctamente desde: ${path}`);
                resolve(data);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                
                // Si hay error y quedan reintentos, volver a intentar
                if (config.retries > 0) {
                    console.warn(`⚠️ Reintentando cargar: ${path} (${config.retries} intentos restantes)`);
                    setTimeout(() => {
                        fetchJsonData(path, { ...config, retries: config.retries - 1 })
                            .then(resolve)
                            .catch(reject);
                    }, 1000);
                } 
                // Si se especifica datos de ejemplo, usarlos como fallback
                else if (config.useMockData && config.mockDataGenerator) {
                    console.warn(`⚠️ Usando datos de ejemplo para: ${path}`);
                    resolve(config.mockDataGenerator());
                } 
                // Si no hay más opciones, rechazar la promesa
                else {
                    console.error(`❌ Error al cargar datos desde: ${path}`, error);
                    reject(error);
                }
            });
    });
}

/**
 * Normaliza la ruta a un archivo JSON añadiendo prefijos necesarios
 * 
 * @param {string} path - Ruta al archivo JSON
 * @returns {string} Ruta normalizada
 */
function normalizeJsonPath(path) {
    // Si ya es una ruta completa, devolverla tal cual
    if (path.startsWith('http') || path.startsWith('/') || path.includes(DATA_PATH)) {
        return path;
    }
    
    // Si no tiene extensión .json, añadirla
    if (!path.endsWith('.json')) {
        path = `${path}.json`;
    }
    
    // Añadir prefijo de directorio de datos
    if (!path.startsWith(DATA_PATH)) {
        path = `${DATA_PATH}${path}`;
    }
    
    return path;
}

/**
 * Carga un archivo JSON específico para gráficos Plotly
 * 
 * @param {string} baseName - Nombre base del archivo (ej: 'univariado_SEGMENTO')
 * @param {Object} options - Opciones adicionales
 * @returns {Promise} Promesa que resuelve al objeto JSON para Plotly
 */
function loadPlotlyJson(baseName, options = {}) {
    return fetchJsonData(`${PLOTLY_PREFIX}${baseName}`, options);
}

/**
 * Carga un archivo JSON para tablas de datos
 * 
 * @param {string} baseName - Nombre base del archivo (ej: 'tabla_SEGMENTO')
 * @param {Object} options - Opciones adicionales
 * @returns {Promise} Promesa que resuelve al objeto JSON para tabla
 */
function loadTableJson(baseName, options = {}) {
    // Si el nombre ya incluye 'tabla_', usarlo tal cual
    if (baseName.startsWith('tabla_')) {
        return fetchJsonData(baseName, options);
    }
    
    // Si no, añadir el prefijo 'tabla_'
    return fetchJsonData(`tabla_${baseName}`, options);
}

/**
 * Genera un generador de datos aleatorios para usarlos como fallback
 * 
 * @param {string} type - Tipo de datos a generar ('bar', 'pie', 'line', etc.)
 * @param {Object} options - Opciones para generar los datos
 * @returns {Function} Función que genera datos aleatorios para Plotly
 */
function createMockDataGenerator(type = 'bar', options = {}) {
    return function() {
        // Colores del tema actual
        const colors = (window.getThemeColorPalette && window.getThemeColorPalette()) || 
            ['#3b82f6', '#60a5fa', '#93c5fd', '#1e40af', '#1d4ed8'];
        
        // Opciones por defecto
        const config = { 
            categories: ['Categoría A', 'Categoría B', 'Categoría C', 'Categoría D', 'Categoría E'],
            title: 'Gráfico de Demostración',
            maxValue: 100,
            ...options
        };
        
        // Generar valores aleatorios
        const values = config.categories.map(() => Math.round(Math.random() * config.maxValue));
        
        // Crear diferentes tipos de trazas según el tipo especificado
        let trace;
        
        switch (type) {
            case 'pie':
                trace = {
                    type: 'pie',
                    labels: config.categories,
                    values: values,
                    marker: { colors: colors }
                };
                break;
                
            case 'line':
                trace = {
                    type: 'scatter',
                    mode: 'lines+markers',
                    x: config.categories,
                    y: values,
                    marker: { color: colors[0] }
                };
                break;
                
            case 'bar':
            default:
                trace = {
                    type: 'bar',
                    x: config.categories,
                    y: values,
                    marker: { color: colors }
                };
        }
        
        // Devolver formato compatible con Plotly
        return {
            data: [trace],
            layout: {
                title: config.title,
                showlegend: type === 'pie',
                margin: { t: 50, r: 20, b: 50, l: 50 }
            }
        };
    };
}

// Exportar funciones para uso en otros scripts
window.fetchJsonData = fetchJsonData;
window.loadPlotlyJson = loadPlotlyJson;
window.loadTableJson = loadTableJson;
window.createMockDataGenerator = createMockDataGenerator;

console.log("✅ Módulo de carga de datos JSON inicializado correctamente");
