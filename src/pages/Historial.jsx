import { useState } from 'react'
import { FileText, X, Printer, Droplets, AlertCircle, Sun, ChevronDown, ChevronUp, Loader, Sparkles, AlertTriangle, Trash2 } from 'lucide-react'
import { useApp, useReportsByDate } from '../context/AppContext.jsx'
import { generateMedicalSummary } from '../services/azureService.js'
import Button from '../components/Button.jsx'

// ─── Constantes ───────────────────────────────────────────────────────────────
const SEV = {
  leve:     { label: 'Leve',     bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  moderado: { label: 'Moderado', bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-400',   text: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700'   },
  severo:   { label: 'Severo',   bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-400',     text: 'text-red-600',     badge: 'bg-red-100 text-red-700'       },
}
const EMOJI = { leve: '🙂', moderado: '😐', severo: '😣' }

function formatFecha(dateStr) {
  const today     = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (dateStr === today)     return 'Hoy'
  if (dateStr === yesterday) return 'Ayer'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function parseBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold text-gray-800">{part}</strong>
      : part
  )
}

function renderMarkdown(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# '))
      return <h1 key={i} className="text-base font-extrabold text-primary-700 mt-4 mb-2 first:mt-0">{line.slice(2)}</h1>
    if (line.startsWith('## '))
      return <h2 key={i} className="text-sm font-bold text-primary-600 mt-4 mb-1.5 border-b border-primary-100 pb-1">{line.slice(3)}</h2>
    if (line.startsWith('### '))
      return <h3 key={i} className="text-sm font-semibold text-gray-700 mt-3 mb-1">{line.slice(4)}</h3>
    if (line.startsWith('- ') || line.startsWith('* '))
      return <li key={i} className="text-sm text-gray-600 ml-4 mb-0.5 list-disc leading-snug">{parseBold(line.slice(2))}</li>
    if (line.trim() === '---' || line.trim() === '***')
      return <hr key={i} className="border-gray-200 my-3" />
    if (!line.trim())
      return <div key={i} className="h-1.5" />
    return <p key={i} className="text-sm text-gray-600 leading-relaxed">{parseBold(line)}</p>
  })
}

// ─── Modal de reporte médico ──────────────────────────────────────────────────

function ReportModal({ text, childName, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 no-print" onClick={onClose} />

      {/* Sheet */}
      <div className="relative mt-auto w-full max-h-[92vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-10">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 no-print">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
              <FileText size={17} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Reporte Médico</p>
              <p className="text-xs text-gray-400">
                {childName} · {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Contenido — visible al imprimir */}
        <div className="flex-1 overflow-y-auto px-5 py-4 report-print-content">
          {renderMarkdown(text)}
          <div className="h-4" />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 no-print">
          <button
            onClick={() => window.print()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Printer size={16} />
            Imprimir / Guardar como PDF
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            En el diálogo de impresión elige "Guardar como PDF"
          </p>
        </div>

      </div>
    </div>
  )
}

// ─── Tarjeta de reporte (timeline UI) ────────────────────────────────────────
function ReporteCard({ report, onDelete }) {
  const [open,    setOpen]    = useState(false)
  const [confirm, setConfirm] = useState(false)
  const meta = SEV[report.severity] ?? SEV.moderado

  return (
    <div className={`${meta.bg} ${meta.border} border rounded-3xl overflow-hidden`}>
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-2xl shrink-0">{EMOJI[report.severity] ?? '😐'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${meta.badge}`}>{meta.label}</span>
            <span className="text-xs text-gray-400">{report.time}</span>
          </div>
          <p className="text-sm text-gray-700 font-medium truncate">{report.symptoms.join(', ')}</p>
          <p className="text-xs text-gray-400 truncate">en {report.zones.join(', ')}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-white/60">
          <div className="flex flex-wrap gap-1.5 pt-3">
            {report.symptoms.map(s => (
              <span key={s} className="bg-white rounded-xl px-2 py-0.5 text-xs font-medium text-gray-600 border border-gray-100">{s}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Droplets size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500">Zonas: {report.zones.join(', ')}</span>
          </div>
          {report.note && (
            <div className="bg-white/70 rounded-2xl px-3 py-2">
              <p className="text-xs text-gray-600 italic">"{report.note}"</p>
            </div>
          )}
          {report.transcript && (
            <div className="bg-white/50 rounded-2xl px-3 py-2 flex items-start gap-2">
              <span className="text-xs text-gray-400">🎤</span>
              <p className="text-[11px] text-gray-400 italic leading-snug">"{report.transcript}"</p>
            </div>
          )}

          {/* Borrar registro con confirmación */}
          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              className="mt-1 w-full flex items-center justify-center gap-1.5 text-xs text-red-400 font-semibold py-2 rounded-2xl bg-red-50/60 active:scale-95 transition-transform"
            >
              <Trash2 size={12} />
              Eliminar registro
            </button>
          ) : (
            <div className="mt-1 flex gap-2">
              <button
                onClick={() => onDelete(report.id)}
                className="flex-1 text-xs font-bold text-white bg-red-500 py-2 rounded-2xl active:scale-95 transition-transform"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 text-xs font-semibold text-gray-500 bg-gray-100 py-2 rounded-2xl active:scale-95 transition-transform"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Historial() {
  const { state, actions } = useApp()
  const gruposFecha = useReportsByDate()

  const [generating,  setGenerating]  = useState(false)
  const [reportText,  setReportText]  = useState(null)
  const [showModal,   setShowModal]   = useState(false)
  const [genError,    setGenError]    = useState(null)

  const total  = state.reports.length
  const brotes = state.reports.filter(r => r.severity === 'severo').length
  const diasOk = (() => {
    const dates = [...new Set(state.reports.map(r => r.date))]
    return dates.filter(d =>
      state.reports.filter(r => r.date === d).every(r => r.severity === 'leve')
    ).length
  })()

  const handleGenerateReport = async () => {
    if (generating) return
    setGenerating(true)
    setGenError(null)
    try {
      const markdown = await generateMedicalSummary(state.reports, state.user)
      setReportText(markdown)
      setShowModal(true)
    } catch (err) {
      setGenError(err.message || 'Error al generar el reporte con IA.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Toast de error de generación ─────────────────────────────────── */}
      {genError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[390px]">
          <div className="bg-white border border-red-200 rounded-3xl p-4 shadow-xl shadow-red-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">Error al generar el reporte</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{genError}</p>
            </div>
            <button onClick={() => setGenError(null)} className="text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Historial</h2>
          <p className="text-sm text-gray-400">Evolución de {state.user?.childNickname || 'Sami'}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={generating
            ? <Loader size={15} className="animate-spin" />
            : <Sparkles size={15} />
          }
          onClick={handleGenerateReport}
          disabled={generating || gruposFecha.length === 0}
        >
          {generating ? 'Analizando…' : 'Reporte IA'}
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Registros', value: total,  icon: <Droplets size={18} className="text-primary-500" />, bg: 'bg-primary-50', text: 'text-primary-700' },
          { label: 'Brotes',    value: brotes, icon: <AlertCircle size={18} className="text-red-400" />,  bg: 'bg-red-50',     text: 'text-red-700'   },
          { label: 'Días ok',   value: diasOk, icon: <Sun size={18} className="text-amber-400" />,         bg: 'bg-amber-50',   text: 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 flex flex-col items-center gap-1.5`}>
            {s.icon}
            <span className={`text-2xl font-extrabold ${s.text}`}>{s.value}</span>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Banner de estado mientras se genera */}
      {generating && (
        <div className="bg-primary-50 border border-primary-100 rounded-3xl px-4 py-3 flex items-center gap-3">
          <Loader size={16} className="text-primary-500 animate-spin shrink-0" />
          <div>
            <p className="text-xs font-semibold text-primary-700">Analizando historial con IA…</p>
            <p className="text-xs text-primary-400">Esto puede tardar unos segundos</p>
          </div>
        </div>
      )}

      {/* Timeline interactivo */}
      {gruposFecha.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm text-gray-500 font-medium">No hay registros aún.</p>
          <p className="text-xs text-gray-400 mt-1">Presiona el micrófono en Inicio para comenzar.</p>
        </div>
      ) : (
        gruposFecha.map(({ date, items }) => (
          <div key={date} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap px-1 capitalize">
                {formatFecha(date)}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="flex flex-col gap-2 ml-1">
              {items.map((r, i) => (
                <div key={r.id ?? i} className="flex gap-2.5">
                  <div className="flex flex-col items-center mt-3 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${SEV[r.severity]?.dot ?? 'bg-gray-400'}`} />
                    {i < items.length - 1 && <div className="w-px flex-1 bg-primary-100 mt-1 min-h-[16px]" />}
                  </div>
                  <div className="flex-1">
                    <ReporteCard report={r} onDelete={actions.deleteReport} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <button className="text-center text-sm text-primary-500 font-semibold py-3">
        Cargar más registros…
      </button>

      {/* Modal de reporte médico */}
      {showModal && reportText && (
        <ReportModal
          text={reportText}
          childName={state.user?.childNickname || 'Sami'}
          onClose={() => setShowModal(false)}
        />
      )}

    </div>
  )
}
