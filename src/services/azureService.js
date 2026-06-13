/**
 * azureService.js — Cliente para Azure OpenAI (gpt-4.1)
 *
 * Seguridad: la API key queda expuesta en el bundle del navegador.
 * Para producción, mover este fetch a una Cloud Function / Edge API.
 */

const ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT
const API_KEY  = import.meta.env.VITE_AZURE_API_KEY

// ─── System prompts ───────────────────────────────────────────────────────────

const ANALYZE_PROMPT = `Eres un asistente médico experto en dermatitis atópica pediátrica.
Lee el reporte de voz del cuidador y determina si contiene síntomas cutáneos o médicos reales.

REGLA CLAVE: Si el texto es un saludo, pregunta general, o frase sin relación con síntomas de la piel o la salud del paciente, responde con esValido:false.
Si el texto describe síntomas, zonas afectadas, picazón, enrojecimiento, brotes u otras manifestaciones clínicas de la piel, responde con esValido:true.

Para texto NO médico devuelve ÚNICAMENTE este JSON:
{"esValido":false,"gravedad":"","sintomas":"","zonas":"","comentario":"No se detectaron síntomas médicos en el audio."}

Para texto con síntomas médicos devuelve ÚNICAMENTE este JSON:
{"esValido":true,"gravedad":"Leve","sintomas":"síntoma1, síntoma2","zonas":"zona1, zona2","comentario":"Frase breve resumiendo lo observado"}

Valores válidos para gravedad: "Leve", "Moderado", "Severo".
Devuelve ÚNICAMENTE el JSON, sin markdown ni texto adicional.`

const SUMMARY_PROMPT = `Eres una dermatóloga pediátrica de primer nivel. Analiza el historial clínico digital de un paciente con dermatitis atópica y genera un informe clínico en Markdown para presentar al médico tratante.
El informe debe ser profesional, conciso y clínicamente útil. Usa español formal médico.
Devuelve ÚNICAMENTE el texto Markdown del informe, sin frases introductorias adicionales fuera de los encabezados.

Usa exactamente esta estructura:
# Informe Clínico — Dermatitis Atópica Pediátrica
## 1. Resumen del Período Evaluado
## 2. Distribución de Gravedad
## 3. Síntomas Registrados con Mayor Frecuencia
## 4. Zonas Corporales Más Afectadas
## 5. Tendencia y Evolución
## 6. Recomendaciones para el Médico Tratante`

// ─── Utilidades internas ──────────────────────────────────────────────────────

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
      temperature: 0.2,
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
 * Analiza la transcripción de voz. Valida primero que contenga síntomas médicos.
 *
 * @param {string} transcript
 * @param {object} childProfile — { childNickname, childAge, zones, symptoms, triggers, products }
 * @returns {Promise<{ isValid, severity, symptoms, zones, note, raw }>}
 *   isValid:false → audio no médico, no guardar ni sumar monedas.
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
      isValid:  false,
      severity: '',
      symptoms: [],
      zones:    [],
      note:     parsed.comentario || 'No se detectaron síntomas médicos en el audio.',
      raw:      parsed,
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
 * Genera un informe clínico en Markdown a partir del historial completo.
 *
 * @param {object[]} historialArray — state.reports
 * @param {object}   childContext   — state.user
 * @returns {Promise<string>} — Markdown del informe clínico
 */
export async function generateMedicalSummary(historialArray, childContext) {
  const dates = [...new Set(historialArray.map(r => r.date))].sort()

  const userMessage = [
    `Paciente: ${childContext?.childNickname || 'N/A'}, ${childContext?.childAge || '?'} años`,
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
