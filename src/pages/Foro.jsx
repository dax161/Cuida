import { useState, useRef } from 'react'
import { Heart, MessageCircle, Bookmark, Share2, Search, Plus, X, Send } from 'lucide-react'
import { useApp, timeAgo } from '../context/AppContext.jsx'
import CoinBadge from '../components/CoinBadge.jsx'

const CATEGORIAS = ['Todos','Tratamientos','Alimentación','Emocional','Brotes','Productos']

// Avatars disponibles para nuevas publicaciones del usuario
const MI_AVATAR  = '🌿'
const MI_USUARIO = 'Yo'

// ─── Sub-componentes ───────────────────────────────────────────────────────────

function CommentRow({ comment }) {
  return (
    <div className="flex gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-base shrink-0">
        {comment.avatar}
      </div>
      <div className="flex-1 bg-gray-50 rounded-2xl px-3 py-2">
        <p className="text-xs font-bold text-gray-700 mb-0.5">{comment.user}</p>
        <p className="text-xs text-gray-600 leading-relaxed">{comment.text}</p>
      </div>
    </div>
  )
}

function PostCard({ post }) {
  const { actions }       = useApp()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText]   = useState('')
  const [saved, setSaved]               = useState(false)
  const inputRef = useRef(null)

  const handleLike = () => {
    actions.likePost(post.id)
    // Las monedas se suman dentro del reducer — CoinBadge refleja el cambio automáticamente
  }

  const handleComment = () => {
    const text = commentText.trim()
    if (!text) return
    actions.addComment(post.id, { user: MI_USUARIO, avatar: MI_AVATAR, text })
    setCommentText('')
    // +10 monedas manejado en el reducer
  }

  const handleOpenComments = () => {
    setShowComments(o => !o)
    if (!showComments) setTimeout(() => inputRef.current?.focus(), 200)
  }

  return (
    <div className="card flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center text-xl shrink-0">
          {post.avatar}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">{post.user}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{timeAgo(post.timestamp)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-xs font-semibold text-primary-500">{post.category}</span>
          </div>
        </div>
      </div>

      {/* Texto */}
      <p className="text-sm text-gray-700 leading-relaxed">{post.text}</p>

      {/* Acciones */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-2">
        <div className="flex items-center gap-4">
          {/* Like — +5 monedas */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 active:scale-90 transition-transform"
          >
            <Heart
              size={19}
              className={`transition-colors ${post.likedByMe ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
            />
            <span className={`text-xs font-bold tabular-nums ${post.likedByMe ? 'text-red-500' : 'text-gray-400'}`}>
              {post.likes}
            </span>
            {!post.likedByMe && (
              <span className="text-[10px] text-emerald-500 font-bold">+5</span>
            )}
          </button>

          {/* Comentarios — +10 monedas */}
          <button
            onClick={handleOpenComments}
            className="flex items-center gap-1.5 active:scale-90 transition-transform"
          >
            <MessageCircle size={19} className={`transition-colors ${showComments ? 'text-primary-500' : 'text-gray-400'}`} />
            <span className={`text-xs font-bold tabular-nums ${showComments ? 'text-primary-500' : 'text-gray-400'}`}>
              {post.comments.length}
            </span>
            <span className="text-[10px] text-emerald-500 font-bold">+10</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setSaved(s => !s)} className="active:scale-90 transition-transform">
            <Bookmark size={18} className={saved ? 'text-primary-500 fill-primary-500' : 'text-gray-400'} />
          </button>
          <button className="active:scale-90 transition-transform">
            <Share2 size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Sección de comentarios expandible */}
      {showComments && (
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
          {post.comments.map((c, i) => <CommentRow key={c.id ?? i} comment={c} />)}

          {/* Input de respuesta */}
          <div className="flex gap-2 mt-1">
            <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-base shrink-0">
              {MI_AVATAR}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                ref={inputRef}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder="Escribe tu respuesta… (+10 🪙)"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-primary-300 focus:outline-none"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white disabled:opacity-40 active:scale-95 transition-all shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Modal de nuevo post ───────────────────────────────────────────────────────
function NuevoPostModal({ onClose }) {
  const { actions }  = useApp()
  const [text, setText] = useState('')
  const [cat,  setCat]  = useState('Tratamientos')

  const handlePublish = () => {
    const t = text.trim()
    if (!t) return
    actions.addPost({ user: MI_USUARIO, avatar: MI_AVATAR, category: cat, text: t })
    onClose()
    // +15 monedas manejado en el reducer
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">Nueva publicación</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Categoría */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIAS.filter(c => c !== 'Todos').map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all
                ${cat === c ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
            >{c}</button>
          ))}
        </div>

        {/* Texto */}
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="¿Qué quieres compartir con la comunidad?"
          className="input-field resize-none h-32"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-emerald-600 font-semibold">+15 monedas al publicar 🪙</p>
          <button
            onClick={handlePublish}
            disabled={!text.trim()}
            className="bg-primary-600 text-white font-bold text-sm px-5 py-2.5 rounded-2xl active:scale-95 transition-all disabled:opacity-40"
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function Foro() {
  const { state }     = useApp()
  const [filtro, setFiltro]     = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [showModal, setShowModal] = useState(false)

  const posts = state.forumPosts.filter(p => {
    const matchCat = filtro === 'Todos' || p.category === filtro
    const matchBus = !busqueda ||
      p.text.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.user.toLowerCase().includes(busqueda.toLowerCase())
    return matchCat && matchBus
  })

  return (
    <div className="flex flex-col gap-4">

      {/* Encabezado */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Comunidad</h2>
          <p className="text-sm text-gray-400">Familias que entienden lo que vives</p>
        </div>
        <CoinBadge />
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input-field pl-10"
          placeholder="Buscar en el foro…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
        {CATEGORIAS.map(cat => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all duration-150
              ${filtro === cat ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
          >{cat}</button>
        ))}
      </div>

      {/* Indicador de gamificación */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
        <span className="text-sm">💡</span>
        <p className="text-xs text-emerald-700 font-medium">
          Interactúa para ganar monedas: <strong>+5 Like · +10 Comentar · +15 Publicar</strong>
        </p>
      </div>

      {/* Feed */}
      {posts.length > 0
        ? posts.map(p => <PostCard key={p.id} post={p} />)
        : (
          <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
            <MessageCircle size={40} className="opacity-20" />
            <p className="text-sm">No hay publicaciones para este filtro.</p>
          </div>
        )
      }

      {/* Botón flotante de nuevo post */}
      <button
        onClick={() => setShowModal(true)}
        className="
          fixed bottom-24 right-1/2 translate-x-[175px]
          w-14 h-14 bg-primary-600 text-white
          rounded-full shadow-xl shadow-primary-300
          flex items-center justify-center
          active:scale-95 transition-all duration-150 z-40
        "
      >
        <Plus size={26} />
      </button>

      {showModal && <NuevoPostModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
