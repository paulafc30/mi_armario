import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shirt } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      navigate('/armario', { replace: true })
    } else {
      setInfo('Te hemos enviado un email para confirmar tu cuenta.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-brand-50 to-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-200">
            <Shirt className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold mt-4">Crear cuenta</h1>
          <p className="text-sm text-gray-500 mt-1">Empieza a organizar tu ropa.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} className="input" placeholder="tu@email.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input id="password" type="password" required value={password} minLength={6}
              onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Mínimo 6 caracteres" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-emerald-700">{info}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creando…' : 'Crear cuenta'}
          </button>

          <p className="text-sm text-center pt-2">
            ¿Ya tienes cuenta? <Link to="/login" className="text-brand-700 hover:underline font-medium">Entra</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
