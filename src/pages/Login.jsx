import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { useApp, DEMO_USER } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'

export default function Login() {
  const { actions } = useApp()
  const navigate    = useNavigate()

  const [usuario,  setUsuario]  = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!usuario.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)

    if (usuario.toLowerCase() === 'sami') {
      actions.login(DEMO_USER)
      navigate('/inicio', { replace: true })
    } else {
      setError('Usuario o contraseña incorrectos. Prueba con "sami".')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex justify-center items-center px-6 py-12">
      <div className="w-full max-w-[390px] flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-200">
            <Leaf size={44} className="text-white" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-primary-700 tracking-tight">Cuida</h1>
            <p className="text-sm text-gray-500 mt-1">Tu aliado en el cuidado de la piel</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide pl-1">Usuario</label>
            <input
              type="text"
              placeholder="Ej: sami"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              autoComplete="username"
              className="input-field"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide pl-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-2">
            Ingresar
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2">
          <button className="text-sm text-primary-500 font-medium">¿Olvidaste tu contraseña?</button>
          <p className="text-sm text-gray-400">
            ¿Eres nuevo?{' '}
            <Link to="/register" className="text-primary-600 font-bold">Regístrate aquí</Link>
          </p>
        </div>

        <p className="text-xs text-gray-300 text-center">
          Cuenta de prueba: usuario <span className="font-mono font-bold text-gray-400">sami</span>
        </p>
      </div>
    </div>
  )
}
