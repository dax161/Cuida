import { Coins } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

/**
 * Badge de monedas que se conecta al estado global.
 * Muestra siempre el saldo actualizado en tiempo real.
 *
 * @param {'sm'|'md'} size
 * @param {boolean} animate — Pulsa brevemente cuando cambia el saldo
 */
export default function CoinBadge({ size = 'sm' }) {
  const { state } = useApp()

  return (
    <div className={`
      flex items-center gap-1.5
      bg-amber-50 border border-amber-200 rounded-2xl
      ${size === 'md' ? 'px-4 py-2' : 'px-3 py-1.5'}
      transition-all duration-300
    `}>
      <Coins size={size === 'md' ? 18 : 14} className="text-amber-500" />
      <span className={`font-bold text-amber-600 tabular-nums ${size === 'md' ? 'text-base' : 'text-sm'}`}>
        {state.coins.toLocaleString()}
      </span>
    </div>
  )
}
