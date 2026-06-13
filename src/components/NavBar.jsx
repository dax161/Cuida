import { NavLink } from 'react-router-dom'
import { Home, Clock, MessageCircle, Gift } from 'lucide-react'

const TABS = [
  { to: '/inicio',      label: 'Inicio',      Icon: Home          },
  { to: '/historial',   label: 'Historial',   Icon: Clock         },
  { to: '/foro',        label: 'Foro',        Icon: MessageCircle },
  { to: '/recompensas', label: 'Recompensas', Icon: Gift          },
]

export default function NavBar() {
  return (
    <nav className="
      fixed bottom-0 left-1/2 -translate-x-1/2
      w-full max-w-[430px] bg-white
      border-t border-gray-100
      flex items-center justify-around
      px-2 pt-1 pb-5
      shadow-[0_-4px_24px_rgba(0,0,0,0.06)]
      z-50
    ">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `
            flex flex-col items-center gap-1 py-2 px-5 rounded-2xl
            transition-all duration-200
            ${isActive ? 'text-primary-600' : 'text-gray-400 active:text-primary-400'}
          `}
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-600" />
                )}
              </div>
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
