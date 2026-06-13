/**
 * AppContext — Estado global de Cuida con persistencia en localStorage.
 * v2: Multi-rol (cuidador / médico), Eventos, Patrones IA.
 */

import { createContext, useContext, useReducer, useEffect } from 'react'

const uid = () => Math.random().toString(36).slice(2, 9)

// ─── Nivel de gamificación ────────────────────────────────────────────────────
export function getLevel(coins) {
  if (coins >= 1000) return { name: 'Experto Cuida',  next: null,           nextAt: null, from: 1000 }
  if (coins >= 500)  return { name: 'Cuidador Pro',   next: 'Experto Cuida', nextAt: 1000, from: 500  }
  if (coins >= 200)  return { name: 'Cuidador',        next: 'Cuidador Pro',  nextAt: 500,  from: 200  }
  return                    { name: 'Explorador',      next: 'Cuidador',      nextAt: 200,  from: 0    }
}

// ─── Demo data — Cuidador ─────────────────────────────────────────────────────
const NOW = Date.now()

export const DEMO_USER = {
  caregiverName:    'María',
  childNickname:    'Sami',
  childAge:         '3',
  doctor:           'Dra. López',
  medKey:           'KEY-492',
  zones:            ['Codos', 'Rodillas', 'Cara'],
  symptoms:         ['Picazón intensa', 'Enrojecimiento'],
  triggers:         ['Calor', 'Polvo'],
  products:         'Cerave, Eucerin',
  doubts:           '¿Cuándo podemos reducir el corticoide?',
  controlFrequency: 'Mensual',
}

const DEMO_REPORTS = [
  { id: 'r1', date: '2026-06-13', time: '08:30', severity: 'moderado', symptoms: ['Picazón intensa', 'Enrojecimiento'],        zones: ['Codos', 'Rodillas'],        note: 'Noche difícil, se rascó mucho.' },
  { id: 'r2', date: '2026-06-13', time: '18:00', severity: 'leve',     symptoms: ['Piel seca', 'Descamación'],                  zones: ['Mejillas'],                  note: 'Después de salir al parque.' },
  { id: 'r3', date: '2026-06-12', time: '07:45', severity: 'leve',     symptoms: ['Picazón leve'],                              zones: ['Brazos'],                    note: 'Amaneció bien. Aplicó Cerave.' },
  { id: 'r4', date: '2026-06-11', time: '09:00', severity: 'severo',   symptoms: ['Picazón intensa', 'Costras', 'Insomnio'],    zones: ['Cara', 'Cuello', 'Espalda'], note: 'Brote fuerte. Se contactó al médico.' },
  { id: 'r5', date: '2026-06-11', time: '20:00', severity: 'moderado', symptoms: ['Enrojecimiento', 'Ardor'],                   zones: ['Cara'],                      note: 'Tras aplicar corticoide mejoró bastante.' },
  { id: 'r6', date: '2026-06-10', time: '10:00', severity: 'leve',     symptoms: ['Piel seca'],                                 zones: ['Manos', 'Brazos'],           note: 'Día tranquilo.' },
]

const DEMO_POSTS = [
  { id: 'p1', user: 'Mamá de Lucas', avatar: '🦊', category: 'Tratamientos',
    text: 'El dermatólogo nos recetó tacrolimus 0.03% para la cara. ¿Alguien más lo usa en niños pequeños? ¿Qué experiencia tuvieron?',
    timestamp: new Date(NOW - 2 * 3600000).toISOString(), likes: 24, likedByMe: false,
    comments: [{ id: 'c1', user: 'Papá de Sofía', avatar: '🐻', text: 'Sí, lo usamos 6 meses con muy buenos resultados. Al principio pica un poco.' }],
  },
  { id: 'p2', user: 'Ana Carolina', avatar: '🌺', category: 'Alimentación',
    text: '¡Buenas noticias! Eliminamos el gluten de la dieta de mi hija (3 años) hace 3 semanas y los brotes bajaron un 70%. ¿Le ha pasado a alguien más?',
    timestamp: new Date(NOW - 4 * 3600000).toISOString(), likes: 58, likedByMe: false, comments: [],
  },
  { id: 'p3', user: 'Papá de Mateo', avatar: '🐼', category: 'Emocional',
    text: 'A veces siento que no puedo más. Los rasquidos nocturnos de mi hijo me tienen sin dormir hace semanas. ¿Cómo manejan el agotamiento?',
    timestamp: new Date(NOW - 6 * 3600000).toISOString(), likes: 97, likedByMe: false,
    comments: [{ id: 'c2', user: 'Ana Carolina', avatar: '🌺', text: 'Una psicóloga especializada en padres cuidadores me cambió la vida 💙' }],
  },
  { id: 'p4', user: 'Valentina M.', avatar: '🌿', category: 'Productos',
    text: 'Cerave vs Eucerin para DA: para mi nena, Eucerin fue la diferencia. Cerave la resecaba más. ¿Cuál usan ustedes?',
    timestamp: new Date(NOW - 24 * 3600000).toISOString(), likes: 41, likedByMe: false, comments: [],
  },
  { id: 'p5', user: 'Rodrigo P.', avatar: '🐯', category: 'Brotes',
    text: 'Brote severo en cara y cuello de mi hijo de 4 años. El médico sugirió vendajes húmedos. ¿Alguien tiene experiencia con esta técnica? Tips bienvenidos 🙏',
    timestamp: new Date(NOW - 48 * 3600000).toISOString(), likes: 33, likedByMe: false, comments: [],
  },
]

// ─── Demo data — Médico ───────────────────────────────────────────────────────
export const DEMO_PATIENTS = [
  {
    id: 'pat1', name: 'María García', childNickname: 'Sami', childAge: '3', medKey: 'KEY-492',
    reports: [
      { id: 'r1', date: '2026-06-13', time: '08:30', severity: 'moderado', symptoms: ['Picazón intensa', 'Enrojecimiento'],     zones: ['Codos', 'Rodillas'],        note: 'Noche difícil, se rascó mucho.' },
      { id: 'r2', date: '2026-06-13', time: '18:00', severity: 'leve',     symptoms: ['Piel seca', 'Descamación'],               zones: ['Mejillas'],                  note: 'Después de salir al parque.' },
      { id: 'r4', date: '2026-06-11', time: '09:00', severity: 'severo',   symptoms: ['Picazón intensa', 'Costras', 'Insomnio'], zones: ['Cara', 'Cuello', 'Espalda'], note: 'Brote fuerte. Se contactó al médico.' },
      { id: 'r5', date: '2026-06-11', time: '20:00', severity: 'moderado', symptoms: ['Enrojecimiento', 'Ardor'],                zones: ['Cara'],                      note: 'Tras aplicar corticoide mejoró bastante.' },
    ],
  },
  {
    id: 'pat2', name: 'Carlos Rojas', childNickname: 'Leo', childAge: '5', medKey: 'KEY-107',
    reports: [
      { id: 'rp1', date: '2026-06-12', time: '10:00', severity: 'severo',   symptoms: ['Ampollas', 'Costras', 'Ardor intenso'], zones: ['Cuello', 'Axilas'],  note: 'Muy mal día, rascado incontrolable.' },
      { id: 'rp2', date: '2026-06-10', time: '09:30', severity: 'moderado', symptoms: ['Enrojecimiento', 'Picazón'],             zones: ['Brazos', 'Torso'],   note: 'Reacción al detergente nuevo.' },
      { id: 'rp3', date: '2026-06-08', time: '08:00', severity: 'leve',     symptoms: ['Piel seca'],                             zones: ['Manos'],             note: 'Día tranquilo.' },
    ],
  },
  {
    id: 'pat3', name: 'Ana Morales', childNickname: 'Nico', childAge: '2', medKey: 'KEY-831',
    reports: [
      { id: 'rq1', date: '2026-06-13', time: '08:00', severity: 'leve', symptoms: ['Piel seca', 'Descamación leve'], zones: ['Mejillas'], note: 'Buen día en general.' },
    ],
  },
]

const DEMO_KEYS = [
  { id: 'k1', code: 'KEY-492', usedBy: 'María García', active: true },
  { id: 'k2', code: 'KEY-107', usedBy: 'Carlos Rojas', active: true },
  { id: 'k3', code: 'KEY-831', usedBy: 'Ana Morales',  active: true },
  { id: 'k4', code: 'KEY-215', usedBy: null,            active: true },
]

// ─── Estado inicial ────────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  user:            null,
  role:            null,   // 'cuidador' | 'medico'
  coins:           340,
  aiPattern:       null,   // string de análisis IA para cuidador
  reports:         DEMO_REPORTS,
  forumPosts:      DEMO_POSTS,
  redeemedCoupons: [],
  medico: {
    patients: DEMO_PATIENTS,
    keys:     DEMO_KEYS,
  },
}

const STORAGE_KEY = 'cuida_state_v2'

function hydrateState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const s = JSON.parse(raw)
    return {
      user:            s.user             ?? null,
      role:            s.role             ?? null,
      coins:           s.coins            ?? DEFAULT_STATE.coins,
      aiPattern:       s.aiPattern        ?? null,
      reports:         s.reports?.length   ? s.reports    : DEMO_REPORTS,
      forumPosts:      s.forumPosts?.length ? s.forumPosts : DEMO_POSTS,
      redeemedCoupons: s.redeemedCoupons   ?? [],
      medico: {
        patients: s.medico?.patients?.length ? s.medico.patients : DEMO_PATIENTS,
        keys:     s.medico?.keys?.length     ? s.medico.keys     : DEMO_KEYS,
      },
    }
  } catch {
    return DEFAULT_STATE
  }
}

// ─── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'LOGIN':
      return { ...state, user: action.payload, role: action.payload.role ?? null }

    case 'LOGOUT':
      return { ...DEFAULT_STATE, user: null, role: null }

    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.amount }

    case 'SPEND_COINS':
      return { ...state, coins: Math.max(0, state.coins - action.amount) }

    case 'SET_AI_PATTERN':
      return { ...state, aiPattern: action.text }

    case 'ADD_REPORT':
      return { ...state, reports: [action.payload, ...state.reports] }

    case 'DELETE_REPORT':
      return { ...state, reports: state.reports.filter(r => r.id !== action.id) }

    case 'LIKE_POST': {
      const post     = state.forumPosts.find(p => p.id === action.id)
      const wasLiked = post?.likedByMe ?? false
      return {
        ...state,
        coins: state.coins + (wasLiked ? 0 : 5),
        forumPosts: state.forumPosts.map(p =>
          p.id === action.id
            ? { ...p, likedByMe: !wasLiked, likes: wasLiked ? p.likes - 1 : p.likes + 1 }
            : p
        ),
      }
    }

    case 'ADD_COMMENT':
      return {
        ...state,
        coins: state.coins + 10,
        forumPosts: state.forumPosts.map(p =>
          p.id === action.postId
            ? { ...p, comments: [...p.comments, { id: uid(), ...action.comment }] }
            : p
        ),
      }

    case 'ADD_POST':
      return {
        ...state,
        coins: state.coins + 15,
        forumPosts: [
          { id: uid(), ...action.payload, timestamp: new Date().toISOString(), likes: 0, likedByMe: false, comments: [] },
          ...state.forumPosts,
        ],
      }

    case 'REDEEM_COUPON':
      return {
        ...state,
        coins:           state.coins - action.cost,
        redeemedCoupons: [...state.redeemedCoupons, action.couponId],
      }

    // ── Médico ──
    case 'REMOVE_PATIENT':
      return {
        ...state,
        medico: { ...state.medico, patients: state.medico.patients.filter(p => p.id !== action.id) },
      }

    case 'ADD_KEY': {
      if (state.medico.keys.length >= 10) return state
      const code   = `KEY-${Math.floor(100 + Math.random() * 900)}`
      const newKey = { id: uid(), code, usedBy: null, active: true }
      return {
        ...state,
        medico: { ...state.medico, keys: [...state.medico.keys, newKey] },
      }
    }

    case 'REMOVE_KEY':
      return {
        ...state,
        medico: { ...state.medico, keys: state.medico.keys.filter(k => k.id !== action.id) },
      }

    default:
      return state
  }
}

// ─── Contexto ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, hydrateState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const actions = {
    login:         (user)            => dispatch({ type: 'LOGIN',         payload: user }),
    logout:        ()                => dispatch({ type: 'LOGOUT' }),
    addCoins:      (amount)          => dispatch({ type: 'ADD_COINS',     amount }),
    spendCoins:    (amount)          => dispatch({ type: 'SPEND_COINS',   amount }),
    setAiPattern:  (text)            => dispatch({ type: 'SET_AI_PATTERN', text }),
    addReport:     (report)          => dispatch({ type: 'ADD_REPORT',    payload: { id: uid(), ...report } }),
    deleteReport:  (id)              => dispatch({ type: 'DELETE_REPORT', id }),
    likePost:      (id)              => dispatch({ type: 'LIKE_POST',     id }),
    addComment:    (postId, comment) => dispatch({ type: 'ADD_COMMENT',   postId, comment }),
    addPost:       (payload)         => dispatch({ type: 'ADD_POST',      payload }),
    redeemCoupon:  (couponId, cost)  => dispatch({ type: 'REDEEM_COUPON', couponId, cost }),
    removePatient: (id)              => dispatch({ type: 'REMOVE_PATIENT', id }),
    addKey:        ()                => dispatch({ type: 'ADD_KEY' }),
    removeKey:     (id)              => dispatch({ type: 'REMOVE_KEY',    id }),
  }

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}

// ─── Selector helpers ──────────────────────────────────────────────────────────
export function useReportsToday() {
  const { state } = useApp()
  const today = new Date().toISOString().slice(0, 10)
  return state.reports.filter(r => r.date === today)
}

export function useReportsByDate() {
  const { state } = useApp()
  const groups = {}
  state.reports.forEach(r => {
    if (!groups[r.date]) groups[r.date] = []
    groups[r.date].push(r)
  })
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }))
}

export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)    return 'ahora'
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return `hace ${Math.floor(diff / 86400)} d`
}
