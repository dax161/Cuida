import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Leaf, Users, KeyRound, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const TABS = [
  { to: '/medico/pacientes', label: 'Mis Pacientes',      Icon: Users    },
  { to: '/medico/llaves',    label: 'Gestión de Llaves',  Icon: KeyRound },
]

export default function LayoutMedico() {
  const { actions, state } = useApp()
  const navigate           = useNavigate()

  const handleLogout = () => {
    actions.logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="app-shell flex flex-col">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0">
                <Leaf size={17} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Cuida <span className="text-primary-600">Médico</span></p>
                <p className="text-xs text-gray-400">{state.user?.name || 'Portal profesional'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 active:scale-95 transition-transform"
            >
              <LogOut size={13} />
              Salir
            </button>
          </div>

          {/* Tabs */}
          <div className="flex">
            {TABS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `
                  flex-1 flex items-center justify-center gap-1.5 py-3
                  text-xs font-semibold border-b-2 transition-all duration-200
                  ${isActive
                    ? 'border-primary-600 text-primary-600 bg-primary-50/40'
                    : 'border-transparent text-gray-400'
                  }
                `}
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-5 pb-8 scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
