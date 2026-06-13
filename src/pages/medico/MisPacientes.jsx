import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, ChevronRight, Users } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

const SEV_META = {
  leve:     { label: 'Leve',     badge: 'bg-emerald-100 text-emerald-700' },
  moderado: { label: 'Moderado', badge: 'bg-amber-100 text-amber-700'     },
  severo:   { label: 'Severo',   badge: 'bg-red-100 text-red-700'         },
}

function worstSeverity(reports) {
  if (reports.some(r => r.severity === 'severo'))   return 'severo'
  if (reports.some(r => r.severity === 'moderado')) return 'moderado'
  return 'leve'
}

function PatientCard({ patient, onView, onRemove }) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const sev  = worstSeverity(patient.reports)
  const meta = SEV_META[sev] ?? SEV_META.leve

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-extrabold text-lg shrink-0">
          {patient.childNickname.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-bold text-gray-800">{patient.childNickname}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${meta.badge}`}>
              {meta.label}
            </span>
          </div>
          <p className="text-xs text-gray-500">{patient.name} · {patient.childAge} años</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">
              {patient.medKey}
            </span>
            <span className="text-[10px] text-gray-400">{patient.reports.length} registros</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      {!confirmRemove ? (
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 py-2.5 rounded-2xl active:scale-95 transition-transform"
          >
            Ver detalle <ChevronRight size={13} />
          </button>
          <button
            onClick={() => setConfirmRemove(true)}
            className="flex items-center justify-center gap-1 text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-3 py-2.5 rounded-2xl active:scale-95 transition-transform"
          >
            <Trash2 size={13} />
            Quitar
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onRemove}
            className="flex-1 text-xs font-bold text-white bg-red-500 py-2.5 rounded-2xl active:scale-95 transition-transform"
          >
            Sí, quitar paciente
          </button>
          <button
            onClick={() => setConfirmRemove(false)}
            className="flex-1 text-xs font-semibold text-gray-500 bg-gray-100 py-2.5 rounded-2xl active:scale-95 transition-transform"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

export default function MisPacientes() {
  const { state, actions } = useApp()
  const navigate           = useNavigate()
  const patients           = state.medico.patients

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Mis Pacientes</h2>
          <p className="text-sm text-gray-400">{patients.length} paciente{patients.length !== 1 ? 's' : ''} vinculado{patients.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center">
          <Users size={18} className="text-primary-500" />
        </div>
      </div>

      {/* Lista */}
      {patients.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm text-gray-500 font-medium">No tienes pacientes vinculados.</p>
          <p className="text-xs text-gray-400 mt-1">Genera llaves en "Gestión de Llaves" y compártelas con los cuidadores.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {patients.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onView={() => navigate(`/medico/pacientes/${patient.id}`)}
              onRemove={() => actions.removePatient(patient.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
