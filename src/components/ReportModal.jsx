import { FileText, X, Printer } from 'lucide-react'

// ─── Markdown renderer minimalista ────────────────────────────────────────────

function parseBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold text-gray-800">{part}</strong>
      : part
  )
}

export function renderMarkdown(text) {
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

// ─── Componente modal ─────────────────────────────────────────────────────────

/**
 * Modal de bottom-sheet que muestra un informe en Markdown.
 * Incluye botón de impresión / guardar como PDF.
 *
 * @prop {string}   text       — Markdown del informe
 * @prop {string}   childName  — Nombre del paciente (aparece en header)
 * @prop {Function} onClose    — Callback para cerrar el modal
 */
export default function ReportModal({ text, childName, onClose }) {
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
