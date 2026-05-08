import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shirt } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [info, setInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setInfo(null); setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setInfo('Revisa tu correo para el enlace de recuperación.')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-brand-50 to-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-200">
            <Shirt className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold mt-4">Recuperar contraseña</h1>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-emerald-700">{info}</p>}
          <button disabled={loading} className="btn-primary w-full">
            {loading ? 'Enviando…' : 'Enviar enlace'}
          </button>
          <p className="text-sm text-center"><Link to="/login" className="text-brand-700 hover:underline">Volver al login</Link></p>
        </form>
      </div>
    </div>
  )
}
