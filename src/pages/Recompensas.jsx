import { useState } from 'react'
import { Trophy, Coins, Gift, Lock, Check, ChevronDown, ChevronUp, Star, Zap } from 'lucide-react'
import { useApp, getLevel } from '../context/AppContext.jsx'

const CUPONES = [
  {
    id: 'c1', marca: 'Cerave',            emoji: '🧴', tipo: 'Descuento',
    titulo: '20% OFF en hidratantes',     descripcion: 'Válido en tienda oficial y farmacias afiliadas.',
    costo: 150, gradient: 'from-blue-400 to-blue-600',
  },
  {
    id: 'c2', marca: 'Eucerin',           emoji: '🌿', tipo: 'Descuento',
    titulo: '15% OFF Atopi-Control',      descripcion: 'En compras mayores a $30.000.',
    costo: 200, gradient: 'from-green-400 to-teal-500',
  },
  {
    id: 'c3', marca: 'Farmacia Cruz Verde', emoji: '💊', tipo: 'Beneficio',
    titulo: 'Envío gratis en tu pedido', descripcion: 'Sin monto mínimo. Una vez por mes.',
    costo: 100, gradient: 'from-red-400 to-rose-500',
  },
  {
    id: 'c4', marca: 'La Roche-Posay',   emoji: '☀️', tipo: 'Muestra',
    titulo: 'Muestra gratis Lipikar Balm', descripcion: 'Solicítala en cualquier farmacia colaboradora.',
    costo: 250, gradient: 'from-purple-400 to-violet-500',
  },
  {
    id: 'c5', marca: 'Consulta médica',  emoji: '🩺', tipo: 'Prioridad',
    titulo: 'Agenda prioritaria online', descripcion: 'Salta a la fila en el portal de tu médico.',
    costo: 500, gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'c6', marca: 'Bioderma',         emoji: '💧', tipo: 'Descuento',
    titulo: '25% OFF Atoderm Intensive', descripcion: 'Exclusivo socios Cuida. Código único.',
    costo: 300, gradient: 'from-indigo-400 to-blue-500',
  },
]

const TAREAS = [
  { label: 'Dar 5 likes en el Foro',    coins: 25,  icon: '❤️' },
  { label: 'Registrar un síntoma',       coins: 20,  icon: '🎤' },
  { label: 'Publicar en el Foro',        coins: 15,  icon: '💬' },
  { label: 'Responder un comentario',    coins: 10,  icon: '🗨️' },
  { label: '7 días consecutivos',        coins: 100, icon: '🔥' },
]

// ─── Tarjeta de cupón ──────────────────────────────────────────────────────────
function CuponCard({ cupon }) {
  const { state, actions } = useApp()
  const isRedeemed = state.redeemedCoupons.includes(cupon.id)
  const canRedeem  = state.coins >= cupon.costo && !isRedeemed

  const handleRedeem = () => {
    if (isRedeemed) return
    if (state.coins < cupon.costo) {
      alert(`Te faltan ${cupon.costo - state.coins} monedas para canjear este cupón.\n\n💡 Tip: registra síntomas, da likes y comenta en el foro para ganar más monedas.`)
      return
    }
    actions.redeemCoupon(cupon.id, cupon.costo)
  }

  return (
    <div className={`card relative overflow-hidden ${!canRedeem && !isRedeemed ? 'opacity-75' : ''}`}>
      {/* Borde superior degradado */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cupon.gradient}`} />

      <div className="flex items-start gap-3 pt-1">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cupon.gradient} flex items-center justify-center text-2xl shrink-0`}>
          {cupon.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{cupon.marca}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-gradient-to-r ${cupon.gradient} text-white`}>{cupon.tipo}</span>
          </div>
          <p className="text-sm font-bold text-gray-800 leading-snug">{cupon.titulo}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-snug">{cupon.descripcion}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-3">
        <div className="flex items-center gap-1.5">
          <Coins size={14} className="text-amber-500" />
          <span className="text-sm font-bold text-amber-600">{cupon.costo}</span>
          <span className="text-xs text-gray-400">monedas</span>
        </div>

        {isRedeemed ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 rounded-xl px-3 py-1.5">
            <Check size={14} />
            <span className="text-xs font-bold">¡Canjeado!</span>
          </div>
        ) : state.coins < cupon.costo ? (
          <div className="flex items-center gap-1 text-gray-400">
            <Lock size={13} />
            <span className="text-xs font-medium">Faltan {cupon.costo - state.coins}</span>
          </div>
        ) : (
          <button
            onClick={handleRedeem}
            className={`flex items-center gap-1.5 bg-gradient-to-r ${cupon.gradient} text-white rounded-xl px-3 py-1.5 active:scale-95 transition-all duration-150 shadow-md`}
          >
            <Gift size={13} />
            <span className="text-xs font-bold">Canjear</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function Recompensas() {
  const { state }          = useApp()
  const [showTasks, setShowTasks] = useState(false)
  const [filtro, setFiltro]       = useState('Todos')

  const level    = getLevel(state.coins)
  const progress = level.nextAt
    ? Math.round(((state.coins - level.from) / (level.nextAt - level.from)) * 100)
    : 100

  const FILTROS  = ['Todos', 'Disponibles', 'Canjeados']
  const cupones  = CUPONES.filter(c => {
    if (filtro === 'Disponibles') return !state.redeemedCoupons.includes(c.id)
    if (filtro === 'Canjeados')   return state.redeemedCoupons.includes(c.id)
    return true
  })

  return (
    <div className="flex flex-col gap-5">

      {/* Encabezado */}
      <div className="pt-2">
        <h2 className="text-xl font-bold text-gray-800">Recompensas</h2>
        <p className="text-sm text-gray-400">Registrar síntomas te da monedas 💜</p>
      </div>

      {/* Banner de nivel y saldo */}
      <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-3xl p-5 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={16} className="text-amber-300" />
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">Tu nivel</span>
              </div>
              <p className="text-2xl font-extrabold">{level.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/70 mb-0.5">Saldo</p>
              <div className="flex items-center gap-1.5">
                <Coins size={18} className="text-amber-300" />
                <span className="text-2xl font-extrabold tabular-nums">{state.coins.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          {level.nextAt ? (
            <div>
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>{level.name}</span>
                <span>{state.coins}/{level.nextAt} → {level.next}</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-300 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white/60 mt-1.5 text-right">
                {level.nextAt - state.coins} monedas para {level.next}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Star size={14} className="text-amber-300" />
              <p className="text-sm text-white/80 font-semibold">¡Nivel máximo alcanzado! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* ¿Cómo ganar monedas? */}
      <div className="card">
        <button
          className="w-full flex items-center justify-between"
          onClick={() => setShowTasks(v => !v)}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
              <Zap size={16} className="text-primary-500" />
            </div>
            <span className="text-sm font-bold text-gray-800">¿Cómo ganar más monedas?</span>
          </div>
          {showTasks ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>

        {showTasks && (
          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
            {TAREAS.map(t => (
              <div key={t.label} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-3 py-3">
                <span className="text-xl">{t.icon}</span>
                <p className="flex-1 text-sm text-gray-700">{t.label}</p>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl px-2 py-1">
                  <Coins size={12} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-600">+{t.coins}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {FILTROS.map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold border transition-all duration-150
              ${filtro === f ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
          >{f}</button>
        ))}
      </div>

      {/* Tienda de cupones */}
      <div className="flex flex-col gap-3">
        {cupones.length > 0
          ? cupones.map(c => <CuponCard key={c.id} cupon={c} />)
          : (
            <div className="text-center py-8 text-gray-400">
              <Gift size={36} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">No hay cupones en esta categoría.</p>
            </div>
          )
        }
      </div>

      <p className="text-xs text-gray-300 text-center pb-4">
        Cupones simulados · Integración con marcas próximamente
      </p>
    </div>
  )
}
