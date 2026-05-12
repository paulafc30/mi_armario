import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from './Login'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) return setError(error.message)
    navigate('/armario', { replace: true })
  }

  return (
    <AuthLayout title="Nueva contraseña" subtitle="Define una contraseña nueva para tu cuenta.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Contraseña</label>
          <input type="password" required minLength={6} value={password}
            onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Mínimo 6 caracteres" />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </AuthLayout>
  )
}
