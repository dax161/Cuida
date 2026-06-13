/**
 * Botón genérico y reutilizable.
 *
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} fullWidth
 * @param {ReactNode} icon — Icono Lucide opcional (a la izquierda del label)
 * @param {boolean} loading — Muestra spinner y deshabilita el botón
 */
export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  fullWidth = false,
  icon,
  loading  = false,
  className = '',
  ...props
}) {
  const base = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-2xl
    active:scale-95 transition-all duration-150 select-none
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `

  const variants = {
    primary:   'bg-primary-600 text-white shadow-md shadow-primary-200 hover:bg-primary-700',
    secondary: 'bg-white text-primary-600 border-2 border-primary-200 hover:bg-primary-50',
    ghost:     'bg-transparent text-primary-600 hover:bg-primary-50',
    danger:    'bg-red-500 text-white shadow-md shadow-red-200 hover:bg-red-600',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
      ) : icon}
      {children}
    </button>
  )
}
