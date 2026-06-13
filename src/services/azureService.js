/**
 * azureService.js — Cliente Azure OpenAI (gpt-4.1)
 * v2: prompts segmentados por rol (cuidador empático / médico técnico)
 */

const ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT
const API_KEY  = import.meta.env.VITE_AZURE_API_KEY

// ─── System prompts ───────────────────────────────────────────────────────────

/** Para el cuidador: valida síntomas + comentario muy empático */
const ANALYZE_PROMPT = `Eres un asistente médico experto en dermatitis atópica pediátrica.
Lee el reporte de voz del cuidador y determina si contiene síntomas cutáneos o médicos reales.

REGLA: Si el texto es un saludo, pregunta general o frase sin relación con síntomas de la piel, responde con esValido:false.
Si describe síntomas, zonas afectadas, picazón, enrojecimiento, brotes u otras manifestaciones clínicas, responde con esValido:true.

Para texto NO médico devuelve ÚNICAMENTE:
{"esValido":false,"gravedad":"","sintomas":"","zonas":"","comentario":""}

Para texto con síntomas médicos devuelve ÚNICAMENTE:
{"esValido":true,"gravedad":"Leve","sintomas":"síntoma1, síntoma2","zonas":"zona1, zona2","comentario":"Frase muy empática, cálida y tranquilizadora dirigida directamente a la mamá o papá, en lenguaje sencillo y sin tecnicismos. Reconoce su esfuerzo y da un ánimo genuino. Ej: ¡Lo estás haciendo increíble! Registrar esto ayuda muchísimo al médico."}

Valores válidos para gravedad: "Leve", "Moderado", "Severo".
El campo comentario SIEMPRE es empático, cálido y reconfortante. Lenguaje simple, no médico.
Devuelve ÚNICAMENTE el JSON, sin markdown ni texto adicional.`

/** Para el cuidador: detecta patrones en el historial, devuelve texto amigable */
const PATTERNS_PROMPT = `Eres un asistente amigable y empático que ayuda a padres cuidadores de niños con dermatitis atópica.
Analiza este historial de síntomas y devuelve entre 1 y 2 oraciones sencillas en español destacando el patrón más relevante que observas.
Usa lenguaje simple y cálido, sin tecnicismos. Habla directamente al cuidador en segunda persona.
Menciona el nombre del niño si está disponible en el contexto.
Ejemplo de respuesta: "Parece que la picazón de Sami tiende a ser peor en las noches. Quizás vale la pena revisar si la temperatura del cuarto o el pijama influyen."
Devuelve SOLO las oraciones, sin JSON, sin encabezados, sin formato adicional.`

/** Para el médico: resumen clínico técnico y estructurado */
const SUMMARY_PROMPT = `Eres un dermatólogo pediátrico analizando el historial clínico digital de un paciente con dermatitis atópica.
Redacta un resumen clínico altamente técnico, estructurado, directo y profesional para el médico tratante.
Incluye: evaluación de gravedad general del período, distribución cronológica de brotes, zonas anatómicas recurrentes, síntomas predominantes y posibles factores desencadenantes.
Usa lenguaje médico estricto. Sin frases coloquiales ni expresiones de ánimo. Solo hechos clínicos.
Formato Markdown con encabezados claros.

Usa exactamente esta estructura:
# Informe Clínico — Dermatitis Atópica Pediátrica
## 1. Resumen del Período Evaluado
## 2. Distribución de Gravedad y Cronología
## 3. Síntomas Clínicos Predominantes
## 4. Zonas Anatómicas Recurrentes
## 5. Factores Desencadenantes Identificados
## 6. Evaluación Global y Plan Sugerido`

// ─── Utilidades ───────────────────────────────────────────────────────────────

function checkConfig() {
  if (!ENDPOINT || ENDPOINT.includes('undefined'))
    throw new Error('VITE_AZURE_ENDPOINT no está configurado en el archivo .env')
  if (!API_KEY || API_KEY === 'tu_api_key_aqui')
    throw new Error('VITE_AZURE_API_KEY no está configurado en el archivo .env')
}

function extractJSON(raw) {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const match   = cleaned.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('La respuesta de IA no contiene JSON válido.')
  return JSON.parse(match[0])
}

function normalizeSeverity(raw) {
  const v = (raw ?? 'moderado').toLowerCase().trim()
  if (v === 'leve')   return 'leve'
  if (v === 'severo') return 'severo'
  return 'moderado'
}

async function callAzure(systemPrompt, userContent, maxTokens = 400) {
  checkConfig()
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': API_KEY },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userContent  },
      ],
      max_tokens:  maxTokens,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText)
    throw new Error(`Azure OpenAI error ${response.status}: ${err}`)
  }

  const data    = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Azure devolvió una respuesta vacía.')
  return content
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * (Cuidador) Analiza la transcripción de voz. Valida que sea contenido médico.
 * El comentario devuelto es empático y dirigido al cuidador.
 */
export async function analyzeSymptom(transcript, childProfile) {
  const userMessage = [
    `Reporte del cuidador: "${transcript}"`,
    '',
    'Contexto clínico del paciente:',
    `- Nombre: ${childProfile?.childNickname || 'desconocido'}, ${childProfile?.childAge || '?'} años`,
    `- Zonas previamente afectadas: ${childProfile?.zones?.join(', ')  || 'no especificadas'}`,
    `- Síntomas frecuentes: ${childProfile?.symptoms?.join(', ')       || 'no especificados'}`,
    `- Desencadenantes conocidos: ${childProfile?.triggers?.join(', ') || 'no especificados'}`,
    `- Productos en uso: ${childProfile?.products                      || 'no especificados'}`,
  ].join('\n')

  const content = await callAzure(ANALYZE_PROMPT, userMessage, 400)
  const parsed  = extractJSON(content)

  if (!parsed.esValido) {
    return {
      isValid: false, severity: '', symptoms: [], zones: [],
      note:    parsed.comentario || 'No se detectaron síntomas médicos en el audio.',
      raw:     parsed,
    }
  }

  const symptoms = (parsed.sintomas ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const zones    = (parsed.zonas    ?? '').split(',').map(z => z.trim()).filter(Boolean)

  return {
    isValid:  true,
    severity: normalizeSeverity(parsed.gravedad),
    symptoms: symptoms.length ? symptoms : ['Sin síntomas claros'],
    zones:    zones.length    ? zones    : ['No especificada'],
    note:     (parsed.comentario ?? '').trim(),
    raw:      parsed,
  }
}

/**
 * (Cuidador) Analiza el historial completo y devuelve 1-2 oraciones
 * con patrones detectados, en lenguaje amigable y empático.
 *
 * @returns {Promise<string>} — texto plano en español
 */
export async function analyzePatterns(historialArray, childProfile) {
  const childName = childProfile?.childNickname || 'el peque'
  const dates     = [...new Set(historialArray.map(r => r.date))].sort()

  const userMessage = [
    `Nombre del niño: ${childName}, ${childProfile?.childAge || '?'} años`,
    `Período: ${dates[0] || '—'} al ${dates[dates.length - 1] || '—'}`,
    `Total de registros: ${historialArray.length}`,
    '',
    'Historial de síntomas (JSON):',
    JSON.stringify(historialArray.slice(-20), null, 2),
  ].join('\n')

  return callAzure(PATTERNS_PROMPT, userMessage, 200)
}

/**
 * (Médico) Genera un informe clínico técnico en Markdown.
 *
 * @param {object[]} historialArray — reportes del paciente
 * @param {object}   childContext   — datos del paciente/cuidador
 * @returns {Promise<string>} — Markdown del informe
 */
export async function generateMedicalSummary(historialArray, childContext) {
  const dates = [...new Set(historialArray.map(r => r.date))].sort()

  const userMessage = [
    `Paciente: ${childContext?.childNickname || 'N/A'}, ${childContext?.childAge || '?'} años`,
    `Cuidador/Tutor: ${childContext?.name || childContext?.caregiverName || 'N/A'}`,
    `Médico tratante: ${childContext?.doctor || 'No especificado'}`,
    `Período evaluado: ${dates[0] || '—'} al ${dates[dates.length - 1] || '—'}`,
    `Total de registros: ${historialArray.length}`,
    `Distribución — Leve: ${historialArray.filter(r => r.severity === 'leve').length}, Moderado: ${historialArray.filter(r => r.severity === 'moderado').length}, Severo: ${historialArray.filter(r => r.severity === 'severo').length}`,
    '',
    'Detalle de registros (JSON):',
    JSON.stringify(historialArray.slice(-30), null, 2),
  ].join('\n')

  return callAzure(SUMMARY_PROMPT, userMessage, 1500)
}
