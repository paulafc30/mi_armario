import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from './Login'

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
    if (error) return setError(error.message)
    setInfo('Revisa tu correo para el enlace de recuperación.')
  }

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Te enviamos un enlace por email.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} className="input" placeholder="tu@email.com" />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        {info && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">{info}</p>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </button>
        <p className="text-sm text-center text-muted">
          <Link to="/login" className="text-brand-700 font-semibold hover:underline">Volver al login</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
