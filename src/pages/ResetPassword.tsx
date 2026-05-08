import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

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
    if (error) { setError(error.message); return }
    navigate('/armario', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 w-full max-w-sm">
        <h1 className="text-xl font-bold">Nueva contraseña</h1>
        <input type="password" required minLength={6} value={password}
          onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Nueva contraseña" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  )
}
