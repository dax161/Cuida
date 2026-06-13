import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext.jsx'

import Login       from './pages/Login.jsx'
import Register    from './pages/Register.jsx'
import Layout      from './components/Layout.jsx'
import Inicio      from './pages/Inicio.jsx'
import Historial   from './pages/Historial.jsx'
import Foro        from './pages/Foro.jsx'
import Recompensas from './pages/Recompensas.jsx'

/** Redirige al login si no hay sesión activa */
function PrivateRoute({ children }) {
  const { state } = useApp()
  return state.user ? children : <Navigate to="/login" replace />
}

/** Redirige al inicio si ya hay sesión */
function PublicRoute({ children }) {
  const { state } = useApp()
  return state.user ? <Navigate to="/inicio" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Rutas protegidas dentro del Layout con NavBar */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index        element={<Navigate to="/inicio" replace />} />
        <Route path="inicio"      element={<Inicio />} />
        <Route path="historial"   element={<Historial />} />
        <Route path="foro"        element={<Foro />} />
        <Route path="recompensas" element={<Recompensas />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
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
