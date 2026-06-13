import { Outlet } from 'react-router-dom'
import NavBar from './NavBar.jsx'

/**
 * Layout principal de la app autenticada.
 * Usa <Outlet /> de React Router para renderizar la ruta hija activa.
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-primary-50 flex justify-center">
      <div className="app-shell">
        <main className="page-content scrollbar-hide">
          <Outlet />
        </main>
        <NavBar />
      </div>
    </div>
  )
}
