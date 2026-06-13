import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Mic, MicOff, LogOut, Droplets, ChevronRight,
  Baby, Thermometer, Wind, Sparkles, AlertTriangle, BrainCircuit,
} from 'lucide-react'
import { useApp, useReportsToday } from '../context/AppContext.jsx'
import { analyzeSymptom } from '../services/azureService.js'
import CoinBadge from '../components/CoinBadge.jsx'
import Card from '../components/Card.jsx'

// ─── Máquina de estados ───────────────────────────────────────────────────────
const RS = {
  IDLE:      'idle',
  LISTENING: 'listening',
  ANALYZING: 'analyzing',
  DONE:      'done',
}

const SEV = {
  leve:     { label: 'Leve',     bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-400', text: 'text-emerald-600' },
  moderado: { label: 'Moderado', bg: 'bg-amber-50',    border: 'border-amber-200',   dot: 'bg-amber-400',   text: 'text-amber-600'   },
  severo:   { label: 'Severo',   bg: 'bg-red-50',      border: 'border-red-200',     dot: 'bg-red-400',     text: 'text-red-600'     },
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Inicio() {
  const { state, actions } = useApp()
  const reportsToday       = useReportsToday()
  const user               = state.user

  const [recState,   setRecState]   = useState(RS.IDLE)
  const [transcript, setTranscript] = useState('')
  const [toast,      setToast]      = useState(null)
  const [errorMsg,   setErrorMsg]   = useState(null)
  const [invalidMsg, setInvalidMsg] = useState(null)

  const recognitionRef = useRef(null)
  const hasResultRef   = useRef(false)

  useEffect(() => { if (!toast)      return; const t = setTimeout(() => setToast(null),      5000); return () => clearTimeout(t) }, [toast])
  useEffect(() => { if (!errorMsg)   return; const t = setTimeout(() => setErrorMsg(null),   6000); return () => clearTimeout(t) }, [errorMsg])
  useEffect(() => { if (!invalidMsg) return; const t = setTimeout(() => setInvalidMsg(null), 5000); return () => clearTimeout(t) }, [invalidMsg])

  const handleTranscript = useCallback(async (text) => {
    setRecState(RS.ANALYZING)
    try {
      const result = await analyzeSymptom(text, user)

      if (!result.isValid) {
        setInvalidMsg(result.note || 'No se detectaron síntomas médicos. Intenta de nuevo.')
        setRecState(RS.IDLE)
        return
      }

      const now    = new Date()
      const report = {
        date: now.toISOString().slice(0, 10),
        time: now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        severity:   result.severity,
        symptoms:   result.symptoms,
        zones:      result.zones,
        note:       result.note,
        transcript: text,
      }
      actions.addReport(report)
      actions.addCoins(20)
      setToast({ ...report, coins: 20 })
      setRecState(RS.DONE)
      setTimeout(() => setRecState(RS.IDLE), 1000)

    } catch (err) {
      console.error('[Cuida] Azure error:', err)
      setErrorMsg(err.message || 'Error al analizar el audio con IA.')
      setRecState(RS.IDLE)
    }
  }, [user, actions])

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { setErrorMsg('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.'); return }

    const rec = new SpeechRecognition()
    rec.lang = 'es-CL'; rec.continuous = false; rec.interimResults = true; rec.maxAlternatives = 1
    hasResultRef.current = false
    setTranscript(''); setErrorMsg(null)

    rec.onstart  = () => setRecState(RS.LISTENING)
    rec.onresult = (event) => {
      let interim = '', final = ''
      for (const r of event.results) { if (r.isFinal) final += r[0].transcript; else interim += r[0].transcript }
      setTranscript(final || interim)
      if (final) { hasResultRef.current = true; recognitionRef.current?.stop(); handleTranscript(final.trim()) }
    }
    rec.onerror  = (event) => {
      const MSG = { 'no-speech': 'No se detectó voz. Habla más cerca del micrófono.', 'audio-capture': 'No se pudo acceder al micrófono.', 'not-allowed': 'Permiso de micrófono denegado.', 'network': 'Error de red.', 'aborted': null }
      const msg = MSG[event.error]
      if (msg) setErrorMsg(msg)
      if (event.error !== 'aborted') setRecState(RS.IDLE)
    }
    rec.onend    = () => { if (!hasResultRef.current) setRecState(RS.IDLE) }
    recognitionRef.current = rec
    rec.start()
  }, [handleTranscript])

  const stopListening  = useCallback(() => { recognitionRef.current?.stop() }, [])
  const handleMicClick = () => { if (recState === RS.IDLE) startListening(); else if (recState === RS.LISTENING) stopListening() }

  const isListening = recState === RS.LISTENING
  const isAnalyzing = recState === RS.ANALYZING
  const isActive    = isListening || isAnalyzing
  const isDisabled  = isAnalyzing || recState === RS.DONE

  return (
    <div className="flex flex-col gap-5 relative">

      {/* Toast éxito */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[390px]">
          <div className="bg-white border border-emerald-200 rounded-3xl p-4 shadow-xl shadow-emerald-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0"><Sparkles size={20} className="text-emerald-500" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">¡Síntoma registrado con IA!</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug"><span className="font-semibold capitalize">{toast.severity}</span>{' · '}{toast.symptoms.slice(0, 2).join(', ')} en {toast.zones.slice(0, 2).join(', ')}</p>
              {toast.note && <p className="text-xs text-gray-400 italic mt-0.5 truncate">"{toast.note}"</p>}
              <p className="text-xs font-bold text-amber-600 mt-1">+{toast.coins} monedas ganadas 🪙</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast audio no médico */}
      {invalidMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[390px]">
          <div className="bg-white border border-amber-200 rounded-3xl p-4 shadow-xl shadow-amber-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0"><AlertTriangle size={20} className="text-amber-500" /></div>
            <div className="flex-1"><p className="text-sm font-bold text-gray-800">Audio no reconocido</p><p className="text-xs text-gray-500 mt-0.5 leading-snug">{invalidMsg}</p></div>
          </div>
        </div>
      )}

      {/* Toast error técnico */}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[390px]">
          <div className="bg-white border border-red-200 rounded-3xl p-4 shadow-xl shadow-red-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0"><AlertTriangle size={20} className="text-red-500" /></div>
            <div className="flex-1"><p className="text-sm font-bold text-gray-800">Ocurrió un problema</p><p className="text-xs text-gray-500 mt-0.5 leading-snug">{errorMsg}</p></div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs text-gray-400 font-medium">Buenos días,</p>
          <h2 className="text-lg font-bold text-gray-800">Hola, {user?.caregiverName || 'Mamá'} 👋</h2>
        </div>
        <div className="flex items-center gap-2">
          <CoinBadge />
          <button onClick={actions.logout} title="Cerrar sesión" className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 active:scale-95 transition-transform">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Banda estado día */}
      {reportsToday.length > 0 && (() => {
        const worst = reportsToday.some(r => r.severity === 'severo') ? 'severo' : reportsToday.some(r => r.severity === 'moderado') ? 'moderado' : 'leve'
        const meta  = SEV[worst]
        return (
          <div className={`${meta.bg} ${meta.border} border rounded-3xl px-4 py-3 flex items-center gap-3`}>
            <span className={`w-2.5 h-2.5 rounded-full ${meta.dot} shrink-0`} />
            <div>
              <p className="text-xs font-semibold text-gray-500">Estado de hoy · {reportsToday.length} {reportsToday.length === 1 ? 'registro' : 'registros'}</p>
              <p className={`text-sm font-bold ${meta.text}`}>
                {worst === 'severo' ? 'Brote severo detectado — contacta al médico' : worst === 'moderado' ? `Síntomas moderados en ${user?.childNickname || 'el peque'}` : `Día tranquilo para ${user?.childNickname || 'el peque'} 🌿`}
              </p>
            </div>
          </div>
        )
      })()}

      {/* Botón de voz */}
      <div className="flex flex-col items-center gap-4 py-2">

        {/* Guía de voz */}
        <div className="w-full bg-primary-50/70 border border-primary-100 rounded-2xl px-4 py-2.5 text-center">
          <p className="text-xs text-primary-600 leading-snug">
            💡 <span className="font-semibold">Guía:</span> Cuéntame qué síntomas tiene hoy, en qué partes del cuerpo y si algo lo empeoró.
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          {isActive && (
            <>
              <span className="absolute w-44 h-44 rounded-full bg-primary-200 pulse-ring" />
              <span className="absolute w-36 h-36 rounded-full bg-primary-300 pulse-ring" style={{ animationDelay: '0.4s' }} />
            </>
          )}
          <button
            onClick={handleMicClick}
            disabled={isDisabled}
            aria-label={isListening ? 'Detener grabación' : 'Iniciar grabación'}
            className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 shadow-2xl transition-all duration-300 ${!isDisabled ? 'active:scale-95' : 'cursor-not-allowed opacity-90'} ${isListening ? 'bg-red-500 shadow-red-200' : isAnalyzing ? 'bg-primary-400 shadow-primary-200' : 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary-200'}`}
          >
            {isAnalyzing ? <BrainCircuit size={36} className="text-white animate-pulse" /> : isListening ? <MicOff size={38} className="text-white" /> : <Mic size={38} className="text-white" />}
          </button>
        </div>

        <div className="text-center px-4">
          <p className="text-sm font-semibold text-gray-700 leading-snug">
            {isListening ? '🔴 Escuchando… toca para detener' : isAnalyzing ? '🧠 Analizando con IA…' : recState === RS.DONE ? '✅ ¡Guardado!' : 'Presiona para hablar'}
          </p>
          {isListening  && transcript && <p className="text-xs text-primary-500 mt-1.5 italic px-2 leading-snug max-h-12 overflow-hidden">"{transcript}"</p>}
          {isAnalyzing  && transcript && <p className="text-xs text-gray-400 mt-1 italic px-2 leading-snug">"{transcript}"</p>}
          {!isActive && recState !== RS.DONE && <p className="text-xs text-gray-400 mt-0.5">+20 monedas por cada registro</p>}
        </div>
      </div>

      {/* Historial de hoy */}
      <Card>
        <Card.Header
          title="Historial de hoy"
          subtitle={formatDate(new Date().toISOString().slice(0, 10))}
          icon={<Droplets size={16} className="text-primary-500" />}
          action={<button className="text-xs text-primary-500 font-semibold flex items-center gap-0.5">Ver todo <ChevronRight size={14} /></button>}
        />
        {reportsToday.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">No hay registros hoy.</p>
            <p className="text-xs text-gray-300 mt-1">¡Presiona el micrófono para empezar!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reportsToday.slice(0, 4).map((r, i) => {
              const meta = SEV[r.severity] ?? SEV.moderado
              return (
                <div key={r.id ?? i} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="text-xs font-bold text-gray-400">{r.time}</span>
                    {i < Math.min(reportsToday.length, 4) - 1 && <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[16px]" />}
                  </div>
                  <div className={`flex-1 min-w-0 ${meta.bg} ${meta.border} border rounded-2xl px-3 py-2.5`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      <span className={`text-xs font-bold ${meta.text}`}>{meta.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-snug truncate">{r.symptoms.join(', ')} en {r.zones.join(', ')}</p>
                    {r.note       && <p className="text-xs text-gray-400 italic mt-0.5 leading-snug line-clamp-2">"{r.note}"</p>}
                    {r.transcript && <p className="text-[10px] text-gray-300 mt-1 leading-snug truncate">🎤 "{r.transcript}"</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Tus Peques */}
      <Card variant="bordered">
        <Card.Header title="Tus Peques" icon={<Baby size={16} className="text-primary-500" />} action={<button className="text-xs text-primary-500 font-semibold">+ Agregar</button>} />
        <div className="flex items-center gap-3 bg-primary-50 rounded-2xl p-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-2xl shrink-0">🐻</div>
          <div className="flex-1">
            <p className="font-bold text-gray-800">{user?.childNickname || 'Sami'}</p>
            <p className="text-xs text-gray-500">{user?.childAge || 3} años · Dermatitis atópica</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-amber-500">
              <Thermometer size={13} />
              <span className="text-xs font-semibold">{reportsToday.some(r => r.severity === 'severo') ? 'Severo' : reportsToday.some(r => r.severity === 'moderado') ? 'Moderado' : 'Leve'}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-400">
              <Wind size={13} />
              <span className="text-xs text-gray-400">Hoy: {reportsToday.length} reg.</span>
            </div>
          </div>
        </div>
      </Card>

    </div>
  )
}
