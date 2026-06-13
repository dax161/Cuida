import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext.jsx'

import Login            from './pages/Login.jsx'
import Register         from './pages/Register.jsx'
import Layout           from './components/Layout.jsx'
import LayoutMedico     from './components/LayoutMedico.jsx'
import Inicio           from './pages/Inicio.jsx'
import Historial        from './pages/Historial.jsx'
import Foro             from './pages/Foro.jsx'
import Eventos          from './pages/Eventos.jsx'
import Recompensas      from './pages/Recompensas.jsx'
import MisPacientes     from './pages/medico/MisPacientes.jsx'
import DetallePaciente  from './pages/medico/DetallePaciente.jsx'
import GestionLlaves    from './pages/medico/GestionLlaves.jsx'

// ─── Guardas de ruta ──────────────────────────────────────────────────────────

/** Redirige al login si no hay sesión, o al portal correcto según rol */
function CuidadorRoute({ children }) {
  const { state } = useApp()
  if (!state.user) return <Navigate to="/login" replace />
  if (state.role !== 'cuidador') return <Navigate to="/medico/pacientes" replace />
  return children
}

function MedicoRoute({ children }) {
  const { state } = useApp()
  if (!state.user) return <Navigate to="/login" replace />
  if (state.role !== 'medico') return <Navigate to="/inicio" replace />
  return children
}

/** Redirige al portal correcto si ya hay sesión activa */
function PublicRoute({ children }) {
  const { state } = useApp()
  if (!state.user) return children
  if (state.role === 'medico') return <Navigate to="/medico/pacientes" replace />
  return <Navigate to="/inicio" replace />
}

// ─── Árbol de rutas ───────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Cuidador */}
      <Route path="/" element={<CuidadorRoute><Layout /></CuidadorRoute>}>
        <Route index              element={<Navigate to="/inicio" replace />} />
        <Route path="inicio"      element={<Inicio />} />
        <Route path="historial"   element={<Historial />} />
        <Route path="foro"        element={<Foro />} />
        <Route path="eventos"     element={<Eventos />} />
        <Route path="recompensas" element={<Recompensas />} />
      </Route>

      {/* Médico */}
      <Route path="/medico" element={<MedicoRoute><LayoutMedico /></MedicoRoute>}>
        <Route index                  element={<Navigate to="/medico/pacientes" replace />} />
        <Route path="pacientes"       element={<MisPacientes />} />
        <Route path="pacientes/:id"   element={<DetallePaciente />} />
        <Route path="llaves"          element={<GestionLlaves />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  )
}
