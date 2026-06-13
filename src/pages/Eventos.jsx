import { useState } from 'react'
import { CalendarDays, Clock, Video, MapPin, Check } from 'lucide-react'

const DEMO_EVENTS = [
  {
    id: 'ev1',
    title: 'Charla: Alimentación y Dermatitis Atópica',
    description: '¿Qué alimentos pueden estar afectando la piel de tu peque? Aprende con especialistas en nutrición pediátrica.',
    date: '2026-06-20', time: '19:00',
    type: 'online', platform: 'Google Meet',
  },
  {
    id: 'ev2',
    title: 'Reunión Presencial de Apoyo Familiar',
    description: 'Grupo de apoyo para familias que viven con dermatitis atópica. Comparte experiencias y encuentra comunidad.',
    date: '2026-06-25', time: '15:00',
    type: 'presencial', location: 'Centro Comunitario Providencia, Sala 3',
  },
  {
    id: 'ev3',
    title: 'Taller: Técnica de Vendaje Húmedo',
    description: 'Aprende paso a paso cómo aplicar la técnica de vendaje húmedo para reducir el picor en brotes intensos.',
    date: '2026-07-05', time: '10:00',
    type: 'online', platform: 'Zoom',
  },
  {
    id: 'ev4',
    title: 'Q&A en Vivo con Dermatóloga',
    description: 'Sesión de preguntas y respuestas en vivo con la Dra. López, dermatóloga pediátrica con 15 años de experiencia.',
    date: '2026-07-10', time: '17:30',
    type: 'online', platform: 'Google Meet',
  },
  {
    id: 'ev5',
    title: 'Charla: Manejo del Estrés en Familias Cuidadoras',
    description: 'Psicóloga especializada guía a cuidadores en técnicas de autocuidado y manejo del agotamiento emocional.',
    date: '2026-07-18', time: '20:00',
    type: 'online', platform: 'Zoom',
  },
]

function formatEventDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return {
    day:   d.getDate(),
    month: d.toLocaleDateString('es-CL', { month: 'short' }).replace('.', '').toUpperCase(),
    full:  d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }),
  }
}

function EventCard({ event, isRsvpd, onToggle }) {
  const isOnline = event.type === 'online'
  const { day, month, full } = formatEventDate(event.date)

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {/* Date badge */}
        <div className="w-13 shrink-0 flex flex-col items-center bg-primary-50 border border-primary-100 rounded-2xl px-2 py-2">
          <span className="text-[10px] font-bold text-primary-400 uppercase leading-none">{month}</span>
          <span className="text-2xl font-extrabold text-primary-600 leading-tight">{day}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Type badge */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg mb-1 ${
            isOnline ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
          }`}>
            {isOnline ? '🔴 En línea' : '📍 Presencial'}
          </span>

          <p className="text-sm font-bold text-gray-800 leading-snug mb-1">{event.title}</p>
          <p className="text-xs text-gray-500 leading-snug line-clamp-2">{event.description}</p>

          <div className="flex flex-col gap-0.5 mt-2">
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-gray-400 shrink-0" />
              <span className="text-xs text-gray-400">{full} · {event.time} hrs</span>
            </div>
            {isOnline ? (
              <div className="flex items-center gap-1.5">
                <Video size={11} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400">{event.platform}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <MapPin size={11} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400 truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-2xl transition-all active:scale-95 ${
          isRsvpd
            ? isOnline
              ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
              : 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
            : 'bg-gray-50 text-gray-600 border border-gray-100'
        }`}
      >
        {isRsvpd ? (
          <><Check size={13} /> {isOnline ? 'Unirse al evento' : '¡Agendado!'}</>
        ) : (
          <><CalendarDays size={13} /> Agendar</>
        )}
      </button>
    </div>
  )
}

export default function Eventos() {
  const [rsvpd, setRsvpd] = useState(new Set())

  const toggle = (id) => setRsvpd(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const agendados = DEMO_EVENTS.filter(e => rsvpd.has(e.id))

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="pt-2">
        <h2 className="text-xl font-bold text-gray-800">Eventos</h2>
        <p className="text-sm text-gray-400">Talleres y charlas para tu familia</p>
      </div>

      {/* Agendados */}
      {agendados.length > 0 && (
        <div className="bg-primary-50 border border-primary-100 rounded-3xl px-4 py-3">
          <p className="text-xs font-bold text-primary-700 mb-1.5">
            🗓️ Tienes {agendados.length} evento{agendados.length > 1 ? 's' : ''} agendado{agendados.length > 1 ? 's' : ''}
          </p>
          {agendados.map(e => (
            <p key={e.id} className="text-xs text-primary-500 leading-snug">· {e.title} — {formatEventDate(e.date).full}</p>
          ))}
        </div>
      )}

      {/* Lista de eventos */}
      <div className="flex flex-col gap-3">
        {DEMO_EVENTS.map(event => (
          <EventCard
            key={event.id}
            event={event}
            isRsvpd={rsvpd.has(event.id)}
            onToggle={() => toggle(event.id)}
          />
        ))}
      </div>

      <p className="text-center text-xs text-gray-300 pb-2">
        Los eventos son organizados por la comunidad Cuida 🌿
      </p>
    </div>
  )
}
