import { useState } from 'react'
import { Plus, Trash2, KeyRound, ShoppingCart, X } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

const MAX_KEYS = 10

function KeyRow({ keyData, onRemove }) {
  const [confirm, setConfirm] = useState(false)
  const isUsed = !!keyData.usedBy

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Icon */}
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
        isUsed ? 'bg-primary-50' : 'bg-gray-50'
      }`}>
        <KeyRound size={16} className={isUsed ? 'text-primary-500' : 'text-gray-300'} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono font-bold text-gray-700">{keyData.code}</p>
        {isUsed ? (
          <p className="text-xs text-primary-500 font-medium">En uso · {keyData.usedBy}</p>
        ) : (
          <p className="text-xs text-gray-400">Disponible</p>
        )}
      </div>

      {/* Delete */}
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Trash2 size={13} className="text-red-400" />
        </button>
      ) : (
        <div className="flex gap-1.5">
          <button
            onClick={() => onRemove(keyData.id)}
            className="text-[11px] font-bold text-white bg-red-500 px-2.5 py-1.5 rounded-xl active:scale-95 transition-transform"
          >
            Eliminar
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
          >
            <X size={12} className="text-gray-500" />
          </button>
        </div>
      )}
    </div>
  )
}

function BuyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative mt-auto w-full bg-white rounded-t-3xl shadow-2xl z-10 p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-gray-800">Comprar más llaves</p>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { qty: 5,  price: '$4.990', highlight: false },
            { qty: 10, price: '$8.990', highlight: true  },
            { qty: 20, price: '$14.990', highlight: false },
          ].map(opt => (
            <button
              key={opt.qty}
              onClick={() => {
                alert(`Gracias por tu interés. La pasarela de pago estará disponible próximamente.`)
                onClose()
              }}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border font-semibold text-sm transition-all active:scale-95 ${
                opt.highlight
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              <span>+{opt.qty} llaves adicionales</span>
              <span className={opt.highlight ? 'text-primary-100' : 'text-gray-400'}>{opt.price}</span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400">
          Las llaves se acumulan a tu cuenta. Pagos seguros vía Transbank.
        </p>
      </div>
    </div>
  )
}

export default function GestionLlaves() {
  const { state, actions } = useApp()
  const keys               = state.medico.keys
  const active             = keys.length
  const [showBuy, setShowBuy] = useState(false)

  const pct = Math.round((active / MAX_KEYS) * 100)

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestión de Llaves</h2>
          <p className="text-sm text-gray-400">Controla el acceso de cuidadores</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center">
          <KeyRound size={18} className="text-primary-500" />
        </div>
      </div>

      {/* Contador */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 rounded-3xl p-5 flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-extrabold text-primary-700">{active}<span className="text-base font-bold text-primary-300"> / {MAX_KEYS}</span></p>
            <p className="text-sm text-primary-500 font-medium mt-0.5">Llaves activas</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-primary-400">{MAX_KEYS - active} disponibles</p>
            <p className="text-xs text-primary-300">de {MAX_KEYS} en tu plan</p>
          </div>
        </div>
        {/* Barra */}
        <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          onClick={actions.addKey}
          disabled={active >= MAX_KEYS}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-primary-600 py-3 rounded-2xl shadow-sm shadow-primary-200 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Generar nueva llave
        </button>
        <button
          onClick={() => setShowBuy(true)}
          className="flex items-center justify-center gap-1 text-sm font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-4 py-3 rounded-2xl active:scale-95 transition-transform"
        >
          <ShoppingCart size={16} />
        </button>
      </div>

      {active >= MAX_KEYS && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <p className="text-xs text-amber-700 font-medium">
            Alcanzaste el límite de {MAX_KEYS} llaves. Compra más para continuar.
          </p>
        </div>
      )}

      {/* Lista de llaves */}
      <div className="card">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Llaves generadas</p>
        {keys.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">🔑</p>
            <p className="text-sm text-gray-400">No has generado ninguna llave aún.</p>
          </div>
        ) : (
          <div>
            {keys.map(k => (
              <KeyRow key={k.id} keyData={k} onRemove={actions.removeKey} />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-3xl px-4 py-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-700">¿Cómo funciona?</strong> Comparte el código de una llave con el cuidador. Al registrarse, ingresarán el código y quedarán vinculados a tu cuenta. Puedes revocar el acceso eliminando la llave en cualquier momento.
        </p>
      </div>

      {showBuy && <BuyModal onClose={() => setShowBuy(false)} />}
    </div>
  )
}
