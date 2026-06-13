import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Leaf, User, Stethoscope } from 'lucide-react'
import { useApp, DEMO_USER } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'

const DEMO_MEDICO = { name: 'Dr. Pérez', specialty: 'Dermatología Pediátrica' }

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
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)

    const u = usuario.toLowerCase().trim()
    const p = password.trim()

    if (u === 'sami' && p === 'sami') {
      actions.login({ ...DEMO_USER, role: 'cuidador' })
      navigate('/inicio', { replace: true })
    } else if (u === 'doc' && p === 'doc') {
      actions.login({ ...DEMO_MEDICO, role: 'medico' })
      navigate('/medico/pacientes', { replace: true })
    } else {
      setError('Usuario o contraseña incorrectos.')
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
            <label className="label-xs">Usuario</label>
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
            <label className="label-xs">Contraseña</label>
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

        {/* Credenciales de demo */}
        <div className="w-full flex flex-col gap-2">
          <p className="text-xs text-gray-400 text-center font-medium mb-1">Cuentas de demostración</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setUsuario('sami'); setPassword('sami') }}
              className="flex-1 flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-2xl px-3 py-2.5 text-left active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                <User size={13} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary-700">Cuidador</p>
                <p className="text-[10px] text-primary-400 font-mono">sami / sami</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { setUsuario('doc'); setPassword('doc') }}
              className="flex-1 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-3 py-2.5 text-left active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Stethoscope size={13} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-700">Médico</p>
                <p className="text-[10px] text-emerald-400 font-mono">doc / doc</p>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
