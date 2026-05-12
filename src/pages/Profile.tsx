import { useEffect, useState } from 'react'
import { LogOut, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function Profile() {
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [info, setInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setEmail(user.email ?? '')
    supabase.from('profiles').select('username').eq('id', user.id).single()
      .then(({ data }) => setUsername(data?.username ?? ''))
  }, [user])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true); setError(null); setInfo(null)
    const { error } = await supabase.from('profiles').update({ username }).eq('id', user.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    setInfo('Perfil guardado.')
  }

  async function handleChangeEmail() {
    setError(null); setInfo(null)
    const { error } = await supabase.auth.updateUser({ email })
    if (error) { setError(error.message); return }
    setInfo('Te enviamos un correo para confirmar el cambio de email.')
  }

  async function handleChangePassword() {
    setError(null); setInfo(null)
    if (newPassword.length < 6) { setError('Mínimo 6 caracteres.'); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setError(error.message); return }
    setNewPassword('')
    setInfo('Contraseña actualizada.')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-4 space-y-5">
      <h1 className="heading-xl">Mi perfil</h1>

      {info && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm">{info}</div>}
      {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSaveProfile} className="card p-5 space-y-4">
        <h2 className="font-semibold">Datos</h2>
        <div>
          <label className="label">Nombre de usuario</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <button className="btn-primary w-full" disabled={saving}>
          <Save className="w-4 h-4" /> Guardar
        </button>
      </form>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Email</h2>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={handleChangeEmail} className="btn-secondary w-full">Cambiar email</button>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Contraseña</h2>
        <input className="input" type="password" placeholder="Nueva contraseña"
          value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button onClick={handleChangePassword} className="btn-secondary w-full">Cambiar contraseña</button>
      </div>

      <button onClick={handleSignOut} className="btn-danger w-full">
        <LogOut className="w-4 h-4" /> Cerrar sesión
      </button>
    </div>
  )
}
