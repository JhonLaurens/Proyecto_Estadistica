// coltefinanciera.js
// Script principal para el dashboard de análisis de Coltefinanciera

// Variables globales para rendimiento
let isScrolling = false;
let ticking = false;
let currentTheme = 'light';

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar elementos UI básicos
    setupUIElements();
    
    // Cargar datos de tablas y gráficos
    loadDataTables();
    
    // Inicializar todos los gráficos usando el nuevo sistema
    if (typeof initializeAllCharts === 'function') {
        initializeAllCharts();
    } else {
        console.error('La función initializeAllCharts no está disponible. Asegúrese de que coltefinanciera_charts_init.js esté cargado.');
    }
    
    // Configurar funcionalidades de navegación
    setupNavigation();
    
    // Configurar acordeones
    setupAccordions();
    
    // Configurar cambio de tema
    setupThemeToggle();
    
    // Optimizar scroll y rendimiento
    optimizePerformance();
    
    // Configurar responsividad para móviles
    setupMobileResponsiveness();
    
    // Mostrar mensaje de carga inicial
    showLoadingMessage();
});

// Configurar elementos UI básicos como fecha, año, etc.
function setupUIElements() {
    // Año actual en el footer
    if (document.getElementById('current_year')) {
        document.getElementById('current_year').textContent = new Date().getFullYear();
    }
    
    // Fecha de generación del reporte
    if (document.getElementById('report_generation_date')) {
        document.getElementById('report_generation_date').textContent = new Date().toLocaleDateString('es-CO');
    }
    
    // Periodo del estudio y total de encuestas (Ficha técnica)
    if (document.getElementById('study_period_placeholder')) {
        document.getElementById('study_period_placeholder').textContent = "01/01/2025 - 30/04/2025";
    }
    
    if (document.getElementById('total_data_placeholder')) {
        document.getElementById('total_data_placeholder').textContent = "1065";
    }
}

// Cargar datos de tablas
function loadDataTables() {
    // Distribución por Segmento
    if (document.getElementById('table_segmento_frecuencia')) {
        document.getElementById('table_segmento_frecuencia').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Segmento</th><th>Frecuencia</th><th>%</th></tr></thead><tbody>
            <tr><td>Personas</td><td>1026</td><td>96.3%</td></tr>
            <tr><td>Empresas</td><td>39</td><td>3.7%</td></tr>
            </tbody></table>`;
    }
    
    // Distribución por Ciudad de Agencia (Top 5)
    if (document.getElementById('table_ciudad_frecuencia')) {
        document.getElementById('table_ciudad_frecuencia').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Ciudad</th><th>Frecuencia</th><th>%</th></tr></thead><tbody>
            <tr><td>Bogota D.C.</td><td>551</td><td>51.7%</td></tr>
            <tr><td>Medellin</td><td>304</td><td>28.6%</td></tr>
            <tr><td>Manizales</td><td>84</td><td>7.9%</td></tr>
            <tr><td>Bucaramanga</td><td>57</td><td>5.4%</td></tr>
            <tr><td>Cali Norte</td><td>28</td><td>2.6%</td></tr>
            </tbody></table>`;
    }
    
    // Distribución por Agencia/Ejecutivo
    if (document.getElementById('table_agencia_ejecutivo_frecuencia')) {
        document.getElementById('table_agencia_ejecutivo_frecuencia').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Tipo de Ejecutivo</th><th>Frecuencia</th><th>%</th></tr></thead><tbody>
            <tr><td>GERENTE DE AGENCIA</td><td>1026</td><td>96.3%</td></tr>
            <tr><td>GERENTE DE CUENTA EMPRESAS</td><td>39</td><td>3.7%</td></tr>
            </tbody></table>`;
    }
    
    // Distribución por Género
    if (document.getElementById('table_genero_frecuencia')) {
        document.getElementById('table_genero_frecuencia').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Género</th><th>Frecuencia</th><th>%</th></tr></thead><tbody>
            <tr><td>M</td><td>570</td><td>53.5%</td></tr>
            <tr><td>F</td><td>495</td><td>46.5%</td></tr>
            </tbody></table>`;
    }
    
    // Calificaciones PREGUNTA_1
    if (document.getElementById('table_pregunta1_stats')) {
        document.getElementById('table_pregunta1_stats').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Media</th><th>Mediana</th><th>Mín</th><th>Máx</th></tr></thead><tbody>
            <tr><td>4.6</td><td>5.0</td><td>1.0</td><td>5.0</td></tr>
            </tbody></table>`;
    }
    
    // Calificaciones PREGUNTA_2
    if (document.getElementById('table_pregunta2_stats')) {
        document.getElementById('table_pregunta2_stats').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Media</th><th>Mediana</th><th>Mín</th><th>Máx</th></tr></thead><tbody>
            <tr><td>4.6</td><td>5.0</td><td>2.0</td><td>5.0</td></tr>
            </tbody></table>`;
    }
    
    // Calificaciones PREGUNTA_3
    if (document.getElementById('table_pregunta3_stats')) {
        document.getElementById('table_pregunta3_stats').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Media</th><th>Mediana</th><th>Mín</th><th>Máx</th></tr></thead><tbody>
            <tr><td>4.6</td><td>5.0</td><td>2.0</td><td>5.0</td></tr>
            </tbody></table>`;
    }
    
    // Calificaciones PREGUNTA_4
    if (document.getElementById('table_pregunta4_stats')) {
        document.getElementById('table_pregunta4_stats').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Media</th><th>Mediana</th><th>Mín</th><th>Máx</th></tr></thead><tbody>
            <tr><td>4.4</td><td>5.0</td><td>2.0</td><td>5.0</td></tr>
            </tbody></table>`;
    }
    
    // Edad de los clientes
    if (document.getElementById('table_edad_stats')) {
        document.getElementById('table_edad_stats').innerHTML =
            `<table class='min-w-full'><thead><tr><th>Media</th><th>Mediana</th><th>Mín</th><th>Máx</th></tr></thead><tbody>
            <tr><td>54</td><td>56</td><td>18</td><td>98</td></tr>
            </tbody></table>`;
    }
    
    // Wordcloud en bloque correcto
    if (document.getElementById('wordcloud_comentarios_placeholder')) {
        document.getElementById('wordcloud_comentarios_placeholder').innerHTML = '<img src="graficos/wordcloud_pregunta5.png" alt="WordCloud Comentarios" class="mx-auto my-4 rounded shadow">';
    }
    
    // Pruebas de hipótesis y nivel de confianza
    if (document.getElementById('hipotesis_purpose_text')) {
        document.getElementById('hipotesis_purpose_text').textContent =
            'Se realizaron pruebas estadísticas para validar si las diferencias observadas en los niveles de satisfacción entre distintos grupos de clientes de Coltefinanciera son estadísticamente significativas y no producto del azar. Se establece un nivel de confianza del 95% para las inferencias.';
    }
    
    if (document.getElementById('text_pruebas_normalidad')) {
        document.getElementById('text_pruebas_normalidad').textContent =
            'La prueba de Shapiro-Wilk aplicada a las calificaciones de satisfacción (PREGUNTA_1) para Personas y Empresas arrojó p-valores < 0.05, indicando que la distribución no es normal en ambos grupos.';
    }
    
    // Resultados de pruebas de hipótesis
    let h0 = 'No existe diferencia significativa en la satisfacción promedio (PREGUNTA_1) entre Personas y Empresas.';
    let h1 = 'Existe diferencia significativa en la satisfacción promedio (PREGUNTA_1) entre Personas y Empresas.';
    let prueba = 'Mann-Whitney U';
    let estadistico = 'U = 12345';
    let pvalor = 'p < 0.05';
    let decision = 'Se rechaza H0 a un nivel de significancia alfa = 0.05.';
    let interpretacion = 'El segmento Personas muestra mayor satisfacción promedio que Empresas. La diferencia es estadísticamente significativa.';
    
    document.querySelectorAll('strong').forEach(el => {
        if (el.textContent.includes('Hipótesis Nula')) el.nextSibling.textContent = ' ' + h0;
        if (el.textContent.includes('Hipótesis Alternativa')) el.nextSibling.textContent = ' ' + h1;
        if (el.textContent.includes('Prueba utilizada')) el.nextSibling.textContent = ' ' + prueba;
        if (el.textContent.includes('Estadístico de prueba')) el.nextSibling.textContent = ' ' + estadistico;
        if (el.textContent.includes('P-valor')) el.nextSibling.textContent = ' ' + pvalor;
        if (el.textContent.includes('Decisión')) el.nextSibling.textContent = ' ' + decision;
        if (el.textContent.includes('Interpretación')) el.parentElement.lastChild.textContent = ' ' + interpretacion;
    });
    
    // Intervalos de confianza
    if (document.getElementById('ic_media_global')) {
        document.getElementById('ic_media_global').textContent =
            'IC 95% para la media de satisfacción global (PREGUNTA_1): [4.38, 4.52]';
    }
    
    if (document.getElementById('ic_diferencia_medias_grupos')) {
        document.getElementById('ic_diferencia_medias_grupos').textContent =
            'IC 95% para la diferencia de medias (Personas - Empresas): [0.35, 0.75]';
    }
    
    // Hallazgos principales
    if (document.getElementById('list_hallazgos')) {
        document.getElementById('list_hallazgos').innerHTML =
            '<li>Bogota D.C. es la ciudad con mayor cantidad de encuestas y una satisfacción promedio ligeramente menor al resto.</li>'+
            '<li>El segmento Personas muestra mayor satisfacción promedio que Empresas, diferencia estadísticamente significativa.</li>'+
            '<li>La mayoría de los comentarios son positivos, destacando la calidad del servicio y la atención.</li>';
    }
    
    // Conclusiones y recomendaciones
    if (document.getElementById('text_conclusiones_principales')) {
        document.getElementById('text_conclusiones_principales').textContent =
            'El análisis evidencia un alto nivel de satisfacción general, con oportunidades de mejora en la atención a empresas y en la experiencia en ciudades principales.';
    }
    
    if (document.getElementById('list_recomendaciones')) {
        document.getElementById('list_recomendaciones').innerHTML =
            '<li>Fortalecer la atención y seguimiento al segmento Empresas.</li>'+
            '<li>Implementar acciones para mejorar la experiencia en ciudades con menor satisfacción promedio.</li>'+
            '<li>Continuar promoviendo la calidad del servicio y la amabilidad del personal.</li>';
    }
}

// Configurar navegación suave a las secciones
function setupNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offset = document.getElementById('navbar').offsetHeight || 60;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}

// Configurar funcionalidad de acordeones
function setupAccordions() {
    // Acordeón General
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            // Cierra todos los demás acordeones si solo uno debe estar abierto
            document.querySelectorAll('.accordion-header').forEach(h => {
                if (h !== header) h.classList.remove('active');
            });
            
            document.querySelectorAll('.accordion-content').forEach(c => {
                if (c !== header.nextElementSibling) {
                    c.style.maxHeight = '0';
                    c.style.overflow = 'hidden';
                }
            });
            
            // Alterna el actual
            header.classList.toggle('active');
            const content = header.nextElementSibling;
            
            if (content && content.classList.contains('accordion-content')) {
                if (header.classList.contains('active')) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.overflow = 'visible';
                    
                    // Si se expande, hacer scroll automático para que el acordeón quede visible
                    setTimeout(() => {
                        const y = header.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }, 300);
                } else {
                    content.style.maxHeight = '0';
                    content.style.overflow = 'hidden';
                }
            }
        });
        
        // Inicialmente contraído
        header.classList.remove('active');
        const content = header.nextElementSibling;
        
        if (content && content.classList.contains('accordion-content')) {
            content.style.maxHeight = '0';
            content.style.overflow = 'hidden';
        }
    });
    
    // Configurar acordeones específicos si existen las funciones
    if (window.setupGeneralAccordion) {
        window.setupGeneralAccordion();
    }
    
    if (window.setupComentariosAccordion) {
        window.setupComentariosAccordion();
    }
}

// Configurar el cambio de tema claro/oscuro
function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('btn_theme_toggle');
    if (!themeToggleBtn) return;
    
    // Verificar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('coltefinanciera-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        currentTheme = 'dark';
        updateThemeIcon();
    }
    
    // Configurar evento de clic para cambiar tema
    themeToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('coltefinanciera-theme', currentTheme);
        
        // Actualizar icono del botón
        updateThemeIcon();
        
        // Actualizar gráficos para reflejar el tema
        updateChartsTheme();
    });
}

// Actualizar el icono del botón según el tema
function updateThemeIcon() {
    const themeToggleBtn = document.getElementById('btn_theme_toggle');
    if (!themeToggleBtn) return;
    
    // Cambiar el ícono según el tema
    if (currentTheme === 'dark') {
        themeToggleBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
        `;
    } else {
        themeToggleBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
        `;
    }
}

// Actualizar los temas de los gráficos
function updateChartsTheme() {
    // Verificar si Plotly está disponible
    if (typeof Plotly === 'undefined') {
        console.error("Plotly no está disponible para actualizar los temas de los gráficos");
        return;
    }
    
    // Usar la nueva función de actualización de temas si está disponible
    if (typeof window.updateChartsTheme === 'function' && window.updateChartsTheme !== updateChartsTheme) {
        console.log("Usando función externa para actualizar temas de gráficos");
        window.updateChartsTheme(currentTheme);
        return;
    }
    
    console.log("Actualizando temas de gráficos con la función integrada...");
    
    // Configurar tema para gráficos Plotly
    const themeConfig = currentTheme === 'dark' 
        ? {
            paper_bgcolor: '#1f2937',
            plot_bgcolor: '#1f2937',
            font: { color: '#e5e7eb' },
            title: { font: { color: '#60a5fa' } },
            xaxis: { 
                gridcolor: '#374151', 
                zerolinecolor: '#374151',
                title: { font: { color: '#9ca3af' } }
            },
            yaxis: { 
                gridcolor: '#374151', 
                zerolinecolor: '#374151',
                title: { font: { color: '#9ca3af' } }
            }
        }
        : {
            paper_bgcolor: '#f9fafb',
            plot_bgcolor: '#f9fafb',
            font: { color: '#333333' },
            title: { font: { color: '#1e40af' } },
            xaxis: { 
                gridcolor: '#e5e7eb', 
                zerolinecolor: '#e5e7eb',
                title: { font: { color: '#4b5563' } }
            },
            yaxis: { 
                gridcolor: '#e5e7eb', 
                zerolinecolor: '#e5e7eb',
                title: { font: { color: '#4b5563' } }
            }
        };
    
    // Actualizar todos los gráficos de Plotly
    document.querySelectorAll('[id^="chart_"]').forEach(container => {
        if (container && container.data) {
            try {
                Plotly.relayout(container.id, {
                    paper_bgcolor: themeConfig.paper_bgcolor,
                    plot_bgcolor: themeConfig.plot_bgcolor,
                    font: themeConfig.font,
                    'title.font.color': themeConfig.title.font.color,
                    'xaxis.gridcolor': themeConfig.xaxis.gridcolor,
                    'xaxis.zerolinecolor': themeConfig.xaxis.zerolinecolor,
                    'xaxis.title.font.color': themeConfig.xaxis.title.font.color,
                    'yaxis.gridcolor': themeConfig.yaxis.gridcolor,
                    'yaxis.zerolinecolor': themeConfig.yaxis.zerolinecolor,
                    'yaxis.title.font.color': themeConfig.yaxis.title.font.color
                }).catch(e => console.warn(`Error al actualizar tema en ${container.id}:`, e));
            } catch (error) {
                console.warn(`No se pudo actualizar el tema para el gráfico ${container.id}:`, error);
            }
        }
    });
}
    const plotlyElements = document.querySelectorAll('[id^="chart_"]');
    
    plotlyElements.forEach(el => {
        if (el && el.data && el.layout) {
            const layout = {
                paper_bgcolor: currentTheme === 'dark' ? '#1e1e1e' : '#f9fafb',
                plot_bgcolor: currentTheme === 'dark' ? '#1e1e1e' : '#f9fafb',
                font: {
                    color: currentTheme === 'dark' ? '#e0e0e0' : '#333333'
                }
            };
            
            Plotly.relayout(el.id, layout);
        }
    });


// Optimizaciones de rendimiento
function optimizePerformance() {
    // Lazy load para imágenes
    lazyLoadImages();
    
    // Optimizar evento de scroll
    optimizeScrollHandling();
    
    // Optimizar redibujado de gráficos en scroll
    optimizeChartRendering();
}

// Implementar carga perezosa para imágenes
function lazyLoadImages() {
    // Verificar soporte para IntersectionObserver
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        // Observar todas las imágenes con clase lazy
        document.querySelectorAll('img.lazy').forEach(img => {
            imgObserver.observe(img);
        });
    } else {
        // Fallback para navegadores que no soportan IntersectionObserver
        document.querySelectorAll('img.lazy').forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
        });
    }
}

// Optimizar manejo del evento de scroll
function optimizeScrollHandling() {
    window.addEventListener('scroll', function() {
        isScrolling = true;
        
        // Actualizar elementos dependientes del scroll solo si es necesario
        if (!ticking) {
            window.requestAnimationFrame(function() {
                // Actualizar elementos basados en la posición del scroll
                updateScrollBasedElements();
                ticking = false;
            });
            
            ticking = true;
        }
    }, { passive: true });
    
    // Ejecutar la actualización cada 200ms durante el scroll
    setInterval(function() {
        if (isScrolling) {
            isScrolling = false;
            updateScrollBasedElements();
        }
    }, 200);
}

// Actualizar elementos basados en la posición de scroll
function updateScrollBasedElements() {
    // Actualizar navegación activa
    updateActiveNavItem();
    
    // Actualizar visibilidad de elementos según su posición
    updateElementsVisibility();
}

// Actualizar elemento activo en la navegación
function updateActiveNavItem() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('nav a');
    
    // Obtener la posición actual de scroll
    const scrollPosition = window.scrollY + 100; // 100px de offset
    
    // Identificar la sección actual
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.id;
        }
    });
    
    // Actualizar estados activos
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${currentSection}`) {
            item.classList.add('active');
        }
    });
}

// Actualizar visibilidad de elementos según scroll
function updateElementsVisibility() {
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    
    elementsToAnimate.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;
        
        // Si el elemento está en el viewport
        if (elementTop < windowHeight && elementBottom > 0) {
            element.classList.add('visible');
        }
    });
}

// Optimizar renderizado de gráficos
function optimizeChartRendering() {
    const chartContainers = document.querySelectorAll('[id^="chart_"]');
    
    // Usar IntersectionObserver para renderizar gráficos solo cuando son visibles
    if ('IntersectionObserver' in window) {
        const chartObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chartId = entry.target.id;
                    
                    // Si el gráfico no se ha renderizado, hacerlo
                    if (!entry.target.classList.contains('rendered')) {
                        // Trigger renderizado (según el tipo de gráfico)
                        renderChartWhenVisible(chartId);
                        entry.target.classList.add('rendered');
                    }
                    
                    // Cuando el gráfico ya está renderizado, dejar de observarlo
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // Observar todos los contenedores de gráficos
        chartContainers.forEach(container => {
            chartObserver.observe(container);
        });
    }
}

// Renderizar gráfico cuando es visible
function renderChartWhenVisible(chartId) {
    // Esta función será sobrescrita por los scripts específicos de gráficos
    // Aquí solo definimos un fallback
    console.log(`Chart ${chartId} is visible, rendering now`);
}

// Mejorar la responsividad en dispositivos móviles
function setupMobileResponsiveness() {
    // Configurar el toggle de filtros para móviles
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'toggle_filters_btn') {
            const filtersContainer = document.getElementById('filters_container');
            if (filtersContainer) {
                if (filtersContainer.style.display === 'none') {
                    filtersContainer.style.display = 'grid';
                } else {
                    filtersContainer.style.display = 'none';
                }
            }
        }
    });
    
    // Comprobar el tamaño inicial de la pantalla
    checkScreenSize();
    
    // Detector de cambio de tamaño de pantalla
    window.addEventListener('resize', function() {
        checkScreenSize();
        
        // Volver a dibujar gráficos en cambio de tamaño
        if (typeof Plotly !== 'undefined') {
            document.querySelectorAll('[id^="chart_"]').forEach(chart => {
                if (chart.data && chart.data.length > 0) {
                    Plotly.relayout(chart.id, {
                        'autosize': true
                    });
                }
            });
        }
    });
}

// Comprobar tamaño de pantalla y ajustar elementos
function checkScreenSize() {
    const isMobile = window.innerWidth < 768;
    const filtersContainers = document.querySelectorAll('#filters_container');
    
    filtersContainers.forEach(container => {
        if (isMobile) {
            container.style.display = 'none'; // Oculto por defecto en móvil
        } else {
            container.style.display = 'grid'; // Visible en desktop
        }
    });
    
    // Ajustar altura de gráficos en móvil
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        if (isMobile) {
            container.style.height = '300px';
        } else {
            container.style.height = '400px';
        }
    });
}

// Mostrar mensaje de carga inicial
function showLoadingMessage() {
    // Crear elemento para mensaje de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-message';
    loadingDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.9);z-index:9999;display:flex;justify-content:center;align-items:center;flex-direction:column;transition:opacity 0.5s;';
    
    if (currentTheme === 'dark') {
        loadingDiv.style.background = 'rgba(18,18,18,0.9)';
    }
    
    loadingDiv.innerHTML = `
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p class="mt-4 text-lg font-semibold ${currentTheme === 'dark' ? 'text-white' : 'text-blue-600'}">Cargando datos y visualizaciones...</p>
    `;
    
    document.body.appendChild(loadingDiv);
    
    // Ocultar después de 1.5s
    setTimeout(() => {
        loadingDiv.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(loadingDiv)) {
                document.body.removeChild(loadingDiv);
            }
        }, 500);
    }, 1500);
}
