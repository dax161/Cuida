import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, User, Baby, Stethoscope, MapPin, Package, HelpCircle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import Button from '../components/Button.jsx'

const ZONAS      = ['Cara','Cuello','Pecho','Espalda','Brazos','Codos','Manos','Piernas','Rodillas','Pies']
const SINTOMAS   = ['Picazón intensa','Piel seca','Enrojecimiento','Costras','Descamación','Hinchazón','Ardor','Insomnio por picazón']
const FACTORES   = ['Calor','Sudor','Estrés','Polen','Polvo','Ropa sintética','Jabones','Alimentos','Animales','Temperatura']
const FRECUENCIAS = ['Semanal','Quincenal','Mensual','Cada 2 meses','Según necesidad']

const STEPS = [
  { title: 'Acceso médico',         icon: Stethoscope, gradient: 'from-violet-500 to-purple-600' },
  { title: 'Tu perfil',             icon: User,        gradient: 'from-pink-500 to-rose-600'     },
  { title: 'Tu peque',              icon: Baby,        gradient: 'from-orange-400 to-amber-500'  },
  { title: 'Zonas y síntomas',      icon: MapPin,      gradient: 'from-teal-500 to-cyan-600'     },
  { title: 'Productos y factores',  icon: Package,     gradient: 'from-blue-500 to-indigo-600'   },
  { title: 'Dudas para el médico',  icon: HelpCircle,  gradient: 'from-emerald-500 to-green-600' },
]

function Chips({ options, selected, onChange }) {
  const toggle = (o) =>
    onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o])

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          className={`px-3 py-2 rounded-2xl text-sm font-medium border-2 transition-all duration-150
            ${selected.includes(o)
              ? 'bg-primary-600 border-primary-600 text-white'
              : 'bg-white border-gray-200 text-gray-600 active:border-primary-300'}`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export default function Register() {
  const { actions } = useApp()
  const navigate    = useNavigate()
  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    medKey: '', caregiverName: '', childNickname: '', childAge: '',
    doctor: '', controlFrequency: '', zones: [], symptoms: [],
    products: '', triggers: [], doubts: '',
  })

  const setF   = (key) => (val) => setForm(f => ({ ...f, [key]: val }))
  const setInp = (key) => (e)   => setF(key)(e.target.value)

  const isLast     = step === STEPS.length - 1
  const { icon: Icon, gradient } = STEPS[step]

  const handleFinish = () => {
    actions.login(form)
    navigate('/inicio', { replace: true })
  }

  return (
    <div className="min-h-screen bg-primary-50 flex justify-center">
      <div className="w-full max-w-[430px] bg-white flex flex-col min-h-screen">

        {/* Header degradado del paso */}
        <div className={`bg-gradient-to-r ${gradient} px-5 pt-14 pb-8 text-white shrink-0`}>
          <button
            onClick={step === 0 ? () => navigate('/login') : () => setStep(s => s - 1)}
            className="mb-4 opacity-80 active:opacity-100"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium opacity-75">Paso {step + 1} de {STEPS.length}</p>
              <h2 className="text-xl font-bold">{STEPS[step].title}</h2>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 px-5 pt-6 pb-4 overflow-y-auto scrollbar-hide flex flex-col gap-5">

          {step === 0 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="label-xs">Clave médica del paciente</label>
                <input className="input-field" placeholder="Ej: DA-2024-00123" value={form.medKey} onChange={setInp('medKey')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label-xs">Médico tratante</label>
                <input className="input-field" placeholder="Nombre del dermatólogo/a" value={form.doctor} onChange={setInp('doctor')} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label-xs">Frecuencia de controles</label>
                {FRECUENCIAS.map(f => (
                  <button
                    key={f} type="button" onClick={() => setF('controlFrequency')(f)}
                    className={`text-left px-4 py-3 rounded-2xl text-sm font-medium border-2 transition-all
                      ${form.controlFrequency === f ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                  >{f}</button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-1.5">
              <label className="label-xs">Tu nombre (cuidador/a)</label>
              <input className="input-field" placeholder="Ej: María García" value={form.caregiverName} onChange={setInp('caregiverName')} />
            </div>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="label-xs">Apodo del niño/a</label>
                <input className="input-field" placeholder="Ej: Sami" value={form.childNickname} onChange={setInp('childNickname')} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label-xs">Edad (1-6 años)</label>
                <div className="flex gap-2">
                  {['1','2','3','4','5','6'].map(n => (
                    <button
                      key={n} type="button" onClick={() => setF('childAge')(n)}
                      className={`flex-1 h-14 rounded-2xl text-base font-bold border-2 transition-all
                        ${form.childAge === n ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex flex-col gap-2">
                <label className="label-xs">Zonas afectadas</label>
                <Chips options={ZONAS} selected={form.zones} onChange={setF('zones')} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label-xs">Síntomas frecuentes</label>
                <Chips options={SINTOMAS} selected={form.symptoms} onChange={setF('symptoms')} />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="label-xs">Productos usados</label>
                <textarea
                  className="input-field resize-none" rows={3}
                  placeholder="Ej: Cerave, Eucerin, corticoide tópico…"
                  value={form.products} onChange={setInp('products')}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label-xs">Factores desencadenantes</label>
                <Chips options={FACTORES} selected={form.triggers} onChange={setF('triggers')} />
              </div>
            </>
          )}

          {step === 5 && (
            <div className="flex flex-col gap-1.5">
              <label className="label-xs">Anota tus dudas para el médico</label>
              <textarea
                className="input-field resize-none" rows={6}
                placeholder="¿Cuándo podemos reducir el corticoide? ¿Es seguro el tacrolimus?…"
                value={form.doubts} onChange={setInp('doubts')}
              />
              <p className="text-xs text-gray-400 px-1">
                Las guardaremos para que puedas compartirlas en la próxima consulta.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-5 pb-10 shrink-0">
          <Button
            variant="primary" size="lg" fullWidth
            onClick={isLast ? handleFinish : () => setStep(s => s + 1)}
            icon={isLast ? <Check size={18} /> : <ArrowRight size={18} />}
          >
            {isLast ? '¡Comenzar!' : 'Continuar'}
          </Button>
          {step === 0 && (
            <p className="text-center text-sm text-gray-400 mt-4">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary-600 font-semibold">Inicia sesión</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
