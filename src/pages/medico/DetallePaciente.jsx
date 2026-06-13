import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Droplets, AlertCircle, Sun, Sparkles, Loader, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { generateMedicalSummary } from '../../services/azureService.js'
import ReportModal from '../../components/ReportModal.jsx'

const SEV = {
  leve:     { label: 'Leve',     bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
  moderado: { label: 'Moderado', bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700'   },
  severo:   { label: 'Severo',   bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-400',     badge: 'bg-red-100 text-red-700'       },
}
const EMOJI = { leve: '🙂', moderado: '😐', severo: '😣' }

function formatFecha(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
}

function ReporteCard({ report }) {
  const [open, setOpen] = useState(false)
  const meta = SEV[report.severity] ?? SEV.moderado

  return (
    <div className={`${meta.bg} ${meta.border} border rounded-3xl overflow-hidden`}>
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setOpen(o => !o)}>
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
            {report.symptoms.map(s => <span key={s} className="bg-white rounded-xl px-2 py-0.5 text-xs font-medium text-gray-600 border border-gray-100">{s}</span>)}
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
        </div>
      )}
    </div>
  )
}

export default function DetallePaciente() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { state }  = useApp()

  const patient = state.medico.patients.find(p => p.id === id)

  const [generating, setGenerating] = useState(false)
  const [reportText, setReportText] = useState(null)
  const [showModal,  setShowModal]  = useState(false)
  const [genError,   setGenError]   = useState(null)

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-4xl">🔍</p>
        <p className="text-sm text-gray-500 font-medium">Paciente no encontrado.</p>
        <button onClick={() => navigate('/medico/pacientes')} className="text-sm text-primary-600 font-semibold">
          ← Volver a pacientes
        </button>
      </div>
    )
  }

  const reports = patient.reports ?? []
  const total   = reports.length
  const brotes  = reports.filter(r => r.severity === 'severo').length
  const diasOk  = (() => {
    const dates = [...new Set(reports.map(r => r.date))]
    return dates.filter(d => reports.filter(r => r.date === d).every(r => r.severity === 'leve')).length
  })()

  const byDate = Object.entries(
    reports.reduce((acc, r) => {
      acc[r.date] = acc[r.date] ? [...acc[r.date], r] : [r]
      return acc
    }, {})
  ).sort(([a], [b]) => b.localeCompare(a))

  const handleGenerateReport = async () => {
    if (generating) return
    setGenerating(true); setGenError(null)
    try {
      const ctx = {
        childNickname: patient.childNickname,
        childAge: patient.childAge,
        name: patient.name,
      }
      const markdown = await generateMedicalSummary(reports, ctx)
      setReportText(markdown)
      setShowModal(true)
    } catch (err) {
      setGenError(err.message || 'Error al generar el resumen clínico.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/medico/pacientes')}
          className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 truncate">{patient.childNickname}</h2>
          <p className="text-xs text-gray-400">{patient.name} · {patient.childAge} años · <span className="font-mono">{patient.medKey}</span></p>
        </div>
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

      {/* CTA Resumen Clínico */}
      <button
        onClick={handleGenerateReport}
        disabled={generating || reports.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-3xl font-bold text-sm text-white bg-gradient-to-r from-primary-500 to-primary-600 shadow-md shadow-primary-200 active:scale-95 transition-transform disabled:opacity-40"
      >
        {generating
          ? <><Loader size={16} className="animate-spin" /> Analizando con IA…</>
          : <><FileText size={16} /> Generar Resumen Clínico IA</>
        }
      </button>

      {genError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-xs text-red-600 font-medium">{genError}</p>
        </div>
      )}

      {/* Timeline */}
      {reports.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm text-gray-500 font-medium">Sin registros aún.</p>
        </div>
      ) : (
        byDate.map(([date, items]) => (
          <div key={date} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap px-1 capitalize">{formatFecha(date)}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="flex flex-col gap-2 ml-1">
              {items.map((r, i) => (
                <div key={r.id ?? i} className="flex gap-2.5">
                  <div className="flex flex-col items-center mt-3 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${SEV[r.severity]?.dot ?? 'bg-gray-400'}`} />
                    {i < items.length - 1 && <div className="w-px flex-1 bg-primary-100 mt-1 min-h-[16px]" />}
                  </div>
                  <div className="flex-1"><ReporteCard report={r} /></div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && reportText && (
        <ReportModal
          text={reportText}
          childName={patient.childNickname}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
