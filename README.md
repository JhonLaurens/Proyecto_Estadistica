# GUIA TRABAJO DE CAMPO

|             |              |
| :---------- | :----------- |
| **Código**  | [COD-SAT-02] |  <!-- Updated code example -->
| **Versión** | 2.0          |  <!-- Updated version -->
| **Fecha**   | 2024         |

---

| NOMBRE DE LA ASIGNATURA | Análisis de Satisfacción del Cliente | CODIGO EBX04 |
| :---------------------- | :----------------------------------- | :----------- |
| **NOMBRE DEL DOCENTE**  | XXXXXX                               | XXXXX        | XXXX |
| **FECHA dd/mm/aaaa**    | 16/10/2024                           |              |      | <!-- Updated date -->

| NOMBRE DE LOS ESTUDIANTES | CARNET | PROGRAMA |
| :------------------------ | :----- | :------- |
| PEDRO PEREZ               | 1234   |          |
| FULANITO RODRIGUEZ        | 5678   |          |
| PASCUAL BRAVO             | 9012   |          |
|                           |        |          |

---

## ANÁLISIS DE SATISFACCIÓN DEL CLIENTE / GENERAL

Este documento presenta una guía actualizada para realizar un trabajo de campo enfocado en el análisis de la satisfacción de los clientes de Coltefinanciera, utilizando los datos recopilados y descritos según la estructura de variables proporcionada.

Contiene el paso a paso del proceso para llevar a cabo un análisis de datos bajo métodos descriptivos, se expondrá la estructura esperada del informe final de acuerdo al desarrollo del trabajo, incorporando las variables demográficas y de contexto adicionales.

## COMPETENCIA:

Aplicar herramientas básicas de análisis de datos para recoger, procesar, analizar y presentar información sobre la satisfacción del cliente y la percepción del servicio de Coltefinanciera, identificando áreas de mejora, fortalezas y posibles patrones demográficos a partir de los datos de la encuesta.

## PROCEDIMIENTO

**1. Objetivo General:**
Realizar un análisis descriptivo de la satisfacción, lealtad, percepción del servicio y características demográficas de los clientes de Coltefinanciera encuestados, utilizando la base de datos definida.

**2. Objetivos Específicos:**
*   Identificar los indicadores numéricos y gráficos clave (ej. promedios de satisfacción, distribución de recomendación, perfiles demográficos) en función de la naturaleza de las variables que conforman la base de datos.
*   Analizar la distribución de las respuestas para cada pregunta de satisfacción, lealtad y claridad de la encuesta.
*   Caracterizar demográficamente la muestra de clientes encuestados (Segmento, Género, Edad derivada, Estrato, Ubicación).
*   Evaluar la percepción general sobre la claridad de la información suministrada por Coltefinanciera.
*   Medir la probabilidad de recomendación (NPS Proxy) y la satisfacción general con los servicios.
*   Analizar la lealtad potencial del cliente frente a ofertas competitivas.
*   Resumir y categorizar las recomendaciones y sugerencias cualitativas proporcionadas por los clientes.
*   Explorar posibles diferencias descriptivas en las métricas de satisfacción y lealtad basadas en variables demográficas como `SEGMENTO`, `GENERO`, `Edad` (calculada a partir de `FECHA_NACIMIENTO`), `ESTRATO` y `CIUDAD AGENCIA`/`CIUDAD RESIDENCIA`.

**3. Definición de variables:**

| VARIABLE (Alias)                | NOMBRE ORIGINAL / DESCRIPCIÓN                                                                                                                    | TIPO         | SUBTIPO                 | NOTAS                                                      |
| :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------- | :----------- | :---------------------- | :--------------------------------------------------------- |
| `ID`                            | ID de registro de encuesta                                                                                                                       | CUALITATIVA  | NOMINAL                 | Identificador único.                                       |
| `EMAIL`                         | email del cliente                                                                                                                                | CUALITATIVA  | NOMINAL                 | Identificación.                                            |
| `NOMBRE`                        | nombre del cliente                                                                                                                               | CUALITATIVA  | NOMINAL                 | Identificación.                                            |
| `CEDULA`                        | documento del cliente                                                                                                                            | CUALITATIVA  | NOMINAL                 | Identificación.                                            |
| `SEGMENTO`                      | Segmento persona o empresa                                                                                                                       | CUALITATIVA  | NOMINAL                 | Categoría principal del cliente.                           |
| `CIUDAD_AGENCIA`                | Ciudad donde fue vinculado el cliente                                                                                                            | CUALITATIVA  | NOMINAL                 | Ubicación de la agencia de origen.                         |
| `AGENCIA_EJECUTIVO`             | Agencia donde fue vinculado el cliente                                                                                                           | CUALITATIVA  | NOMINAL                 | Nombre específico de la agencia.                           |
| `TIPO_EJECUTIVO`                | Ejecutivo que vincula                                                                                                                            | CUALITATIVA  | NOMINAL                 | Rol del ejecutivo.                                         |
| `EJECUTIVO`                     | Nombre ejecutivo                                                                                                                                 | CUALITATIVA  | NOMINAL                 | Nombre del ejecutivo.                                      |
| `CIUDAD_RESIDENCIA`             | Ciudad de residencia del cliente                                                                                                                 | CUALITATIVA  | NOMINAL                 | Ubicación actual del cliente.                              |
| `GENERO`                        | Genero M o F, no aplica empresas                                                                                                                 | CUALITATIVA  | NOMINAL                 | Aplicable solo al segmento 'Personas'.                     |
| `FECHA_NACIMIENTO`              | Fecha nacimiento cliente                                                                                                                         | FECHA        |                         | Usar para calcular Edad. No aplica a 'Empresas'.         |
| `Edad`                          | *Variable Derivada* de `FECHA_NACIMIENTO`                                                                                                        | CUANTITATIVA | CONTINUA (o DISCRETA) | Edad calculada en años.                                    |
| `ESTRATO`                       | Estrato socioeconómico, no aplica empresas                                                                                                       | CUANTITATIVA | ORDINAL                 | Nivel socioeconómico (1-6). Aplicable a 'Personas'.        |
| `FECHA_ENCUESTA`                | Fecha que se realizó la encuesta                                                                                                                 | FECHA        |                         | Contexto temporal del feedback.                            |
| `Claridad_Info` (Pregunta 1)    | En general, ¿La información suministrada en nuestros canales de atención fue clara y fácil de comprender?                                          | CUANTITATIVA | ORDINAL                 | Escala Likert (e.g., 1-5).                                 |
| `Prob_Recomendacion` (Pregunta 2) | ¿Qué tan probable es que usted le recomiende Coltefinanciera a sus colegas, familiares o amigos?                                                 | CUANTITATIVA | ORDINAL                 | Escala Likert/NPS (e.g., 1-5 o 0-10).                      |
| `Satisfaccion_General` (Pregunta 3) | En general, ¿Qué tan satisfecho se encuentra con los servicios que le ofrece Coltefinanciera?                                                | CUANTITATIVA | ORDINAL                 | Escala Likert (e.g., 1-5).                                 |
| `Lealtad_Potencial` (Pregunta 4)  | Asumiendo que otra entidad [...] ¿Qué tan probable es que usted continúe siendo cliente de Coltefinanciera?                                    | CUANTITATIVA | ORDINAL                 | Escala Likert (e.g., 1-5).                                 |
| `Recomendaciones_Sugerencias` (Pregunta 5) | ¿Tiene alguna recomendación o sugerencia acerca del servicio que le ofrecemos en Coltefinanciera?                                        | CUALITATIVA  | TEXTUAL                 | Respuesta abierta para comentarios.                        |

**4. Fuente de datos:**
Base de datos de encuesta de satisfacción realizada a clientes de Coltefinanciera, conteniendo las variables descritas anteriormente.

**5. Descripción de la ficha técnica (Aplicada al dataset provisto):**

| CONCEPTO                           | DESCRIPCIÓN                                                                                                  |
| :--------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Población Objetivo (Conceptual)**| Clientes activos de Coltefinanciera (Personas y Empresas).                                                     |
| **Población Analizada (Dataset)**  | Clientes de Coltefinanciera incluidos en la base de datos de la encuesta.                                      |
| **Tamaño del Dataset Analizado:**  | Número total de registros en la base de datos proporcionada.                                                  |
| **Cobertura Geográfica:**          | Determinada por las variables `CIUDAD_AGENCIA` y `CIUDAD_RESIDENCIA`.                                        |
| **Cobertura Temporal:**            | Periodo cubierto por las fechas en `FECHA_ENCUESTA`.                                                         |
| **Variable(s) Clave de Análisis:** | `Claridad_Info`, `Prob_Recomendacion`, `Satisfaccion_General`, `Lealtad_Potencial`, `Recomendaciones_Sugerencias`. |
| **Variables Demográficas Clave:**  | `SEGMENTO`, `GENERO`, `Edad` (derivada), `ESTRATO`, `CIUDAD_AGENCIA`, `CIUDAD_RESIDENCIA`.                    |
| **Nivel de confianza:**            | N/A (Análisis descriptivo del dataset proporcionado, no inferencial, a menos que se especifique lo contrario). |
| **Error de muestreo:**             | N/A (Análisis descriptivo del dataset proporcionado).                                                        |
| **Tamaño de muestra efectivo:**    | Número total de registros válidos en el dataset.                                                             |
| **Técnica de Muestreo:**           | Datos proporcionados (método de selección original usualmente desconocido o no relevante para el análisis descriptivo). |

**6. Metodología:**
*   **Preparación de datos:**
    *   Carga y limpieza inicial de la base de datos.
    *   Verificación de tipos de datos y manejo de valores faltantes o inconsistentes.
    *   Derivación de la variable `Edad` a partir de `FECHA_NACIMIENTO` y `FECHA_ENCUESTA` (o fecha actual).
    *   Manejo adecuado de variables aplicables solo a ciertos segmentos (e.g., `GENERO`, `ESTRATO` para 'Personas').
*   **Análisis univariado descriptivo:**
    *   Tablas de frecuencia absoluta y relativa para variables categóricas (`SEGMENTO`, `CIUDAD_AGENCIA`, `AGENCIA_EJECUTIVO`, `TIPO_EJECUTIVO`, `CIUDAD_RESIDENCIA`, `GENERO`, `ESTRATO`).
    *   Estadísticos descriptivos (media, mediana, moda, desviación estándar, mínimo, máximo) y distribuciones de frecuencia/histogramas para variables cuantitativas (`Edad`, `Claridad_Info`, `Prob_Recomendacion`, `Satisfaccion_General`, `Lealtad_Potencial`).
    *   Análisis de distribución temporal si `FECHA_ENCUESTA` abarca un período significativo.
    *   Análisis de contenido/temático de las respuestas abiertas (`Recomendaciones_Sugerencias`).
    *   Generación de gráficos descriptivos apropiados.
*   **Análisis Bivariado descriptivo:**
    *   Exploración de relaciones descriptivas entre pares de variables. Ejemplos:
        *   Comparación de métricas de satisfacción (`Satisfaccion_General`, `Prob_Recomendacion`, etc.) entre diferentes `SEGMENTO`s, `GENERO`s, grupos de `Edad`, niveles de `ESTRATO`, `CIUDAD_AGENCIA`.
        *   Tablas de contingencia entre variables categóricas (e.g., `SEGMENTO` vs `CIUDAD_AGENCIA`).
        *   Análisis de correlación (descriptiva) entre las métricas cuantitativas ordinales.

**7. Resultados y Discusión:**
Se presentarán los hallazgos clave del análisis univariado y bivariado. Esto incluirá:
*   Perfil demográfico de la muestra.
*   Tablas resumen con frecuencias, porcentajes y estadísticos descriptivos.
*   Gráficos ilustrativos (histogramas, barras, etc.).
*   Resumen de los temas principales de las recomendaciones cualitativas.
*   Una discusión interpretativa de los resultados, destacando fortalezas, debilidades y patrones observados (ej., diferencias entre segmentos o grupos demográficos), basado estrictamente en los datos analizados.

**8. Conclusiones:**
Se redactará un resumen ejecutivo de los principales hallazgos respecto a:
*   Niveles generales de claridad, satisfacción, recomendación y lealtad.
*   Características demográficas predominantes de los encuestados.
*   Identificación concisa de fortalezas y debilidades según la percepción del cliente.
*   Observaciones sobre posibles diferencias significativas entre grupos de clientes (si los datos lo sugieren).
*   Potenciales implicaciones o recomendaciones preliminares basadas en el análisis descriptivo.

---

**EVALUACION:** Se adjunta Rúbrica de evaluación con los criterios para evaluar el informe final del trabajo de campo en términos de los objetivos anteriormente planteados. El informe debe incluir los resultados tabulados, gráficos generados (ej. en Excel, R, Python) y el análisis correspondiente, incorporando la riqueza de las nuevas variables disponibles.
