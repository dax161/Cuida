/**
 * Tarjeta base reutilizable.
 *
 * @param {'default'|'elevated'|'bordered'} variant
 * @param {string} className — Clases adicionales
 */
export default function Card({ children, variant = 'default', className = '', onClick }) {
  const variants = {
    default:  'bg-white rounded-3xl p-4 shadow-sm border border-gray-100',
    elevated: 'bg-white rounded-3xl p-4 shadow-md shadow-gray-100',
    bordered: 'bg-white rounded-3xl p-4 border-2 border-primary-100',
  }

  return (
    <div
      className={`${variants[variant]} ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

/**
 * Sub-componente: encabezado de tarjeta con título e icono opcional.
 */
Card.Header = function CardHeader({ title, subtitle, icon, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
            {icon}
          </span>
        )}
        <div>
          <p className="font-semibold text-gray-800 text-sm leading-tight">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 leading-tight">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
