/**
 * azureAudio.js — Integración con Azure Cognitive Services (Speech)
 *
 * TODO: Instalar SDK → npm install microsoft-cognitiveservices-speech-sdk
 * TODO: Configurar VITE_AZURE_SPEECH_KEY y VITE_AZURE_SPEECH_REGION en .env
 *
 * Funcionalidades planeadas:
 *  - startRecording()   → Inicia captura de voz del cuidador
 *  - stopRecording()    → Detiene y retorna el texto transcrito
 *  - parseSymptoms(text) → Extrae síntomas estructurados del texto libre
 */

// import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'

// const SPEECH_KEY    = import.meta.env.VITE_AZURE_SPEECH_KEY
// const SPEECH_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION

/**
 * @returns {Promise<string>} Texto transcrito del audio capturado
 */
export async function startRecording() {
  // TODO: Implementar con SpeechSDK
  console.warn('azureAudio: startRecording() aún no implementado')
  return ''
}

/**
 * @returns {Promise<void>}
 */
export async function stopRecording() {
  // TODO: Implementar con SpeechSDK
  console.warn('azureAudio: stopRecording() aún no implementado')
}

/**
 * @param {string} text — Texto libre del cuidador
 * @returns {{ sintomas: string[], zonas: string[], severidad: string }}
 */
export function parseSymptoms(text) {
  // TODO: Llamar a Azure Language / OpenAI para extracción de entidades
  console.warn('azureAudio: parseSymptoms() aún no implementado')
  return { sintomas: [], zonas: [], severidad: 'leve' }
}
