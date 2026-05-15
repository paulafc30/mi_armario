import { useEffect, useState } from 'react'
import { LogOut, User, Mail, Lock, Sun, Moon, Monitor, Info, Sparkles, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useTheme, ThemeChoice } from '@/lib/theme'
import { cx } from '@/lib/utils'
import { uploadAvatar, deleteAvatar } from '@/lib/images'
import { compressImage } from '@/lib/imageCompression'
import SettingsRow, { SettingsSection } from '@/components/profile/SettingsRow'
import EditFieldModal from '@/components/profile/EditFieldModal'
import ProfileHeader from '@/components/profile/ProfileHeader'

type Field = 'username' | 'email' | 'password' | null

export default function Profile() {
  const { user } = useAuth()
  const [theme, setTheme] = useTheme()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPath, setAvatarPath] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [editing, setEditing] = useState<Field>(null)
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (!user) return
    setEmail(user.email ?? '')
    supabase
      .from('profiles')
      .select('username, avatar_url, avatar_path')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setUsername(data?.username ?? '')
        setAvatarUrl(data?.avatar_url ?? null)
        setAvatarPath(data?.avatar_path ?? null)
      })
  }, [user])

  function showToast(kind: 'ok' | 'err', text: string) {
    setToast({ kind, text })
    setTimeout(() => setToast(null), 2500)
  }

  async function handleAvatarPick(file: File) {
    if (!user) return
    setUploadingAvatar(true)
    try {
      const compressed = await compressImage(file, { maxSize: 480, quality: 0.85 })
      const { url, path } = await uploadAvatar(compressed, user.id)
      // Guardar nueva URL y path en profiles
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url, avatar_path: path })
        .eq('id', user.id)
      if (error) throw error
      // Borrar la foto antigua si existía
      if (avatarPath) await deleteAvatar(avatarPath).catch(() => null)
      setAvatarUrl(url)
      setAvatarPath(path)
      showToast('ok', 'Foto actualizada')
    } catch (err: any) {
      showToast('err', err?.message ?? 'No se pudo subir la foto')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleAvatarRemove() {
    if (!user || !avatarPath) return
    if (!confirm('¿Quitar tu foto de perfil?')) return
    setUploadingAvatar(true)
    try {
      await deleteAvatar(avatarPath).catch(() => null)
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null, avatar_path: null })
        .eq('id', user.id)
      if (error) throw error
      setAvatarUrl(null)
      setAvatarPath(null)
      showToast('ok', 'Foto eliminada')
    } catch (err: any) {
      showToast('err', err?.message ?? 'No se pudo quitar la foto')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function saveUsername(value: string) {
    if (!user) return { error: 'Sin sesión' }
    const { error } = await supabase.from('profiles').update({ username: value }).eq('id', user.id)
    if (error) return { error: error.message }
    setUsername(value)
    showToast('ok', 'Nombre actualizado')
  }

  async function saveEmail(value: string) {
    const { error } = await supabase.auth.updateUser({ email: value })
    if (error) return { error: error.message }
    return { info: 'Te enviamos un correo para confirmar el cambio.' }
  }

  async function savePassword(value: string) {
    const { error } = await supabase.auth.updateUser({ password: value })
    if (error) return { error: error.message }
    showToast('ok', 'Contraseña actualizada')
  }

  async function handleSignOut() {
    if (!confirm('¿Cerrar sesión?')) return
    await supabase.auth.signOut()
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-6 space-y-6">
      <ProfileHeader
        username={username}
        email={email}
        avatarUrl={avatarUrl}
        uploading={uploadingAvatar}
        onPickFile={handleAvatarPick}
      />

      {toast && (
        <div className={cx(
          'p-3 rounded-xl text-sm text-center',
          toast.kind === 'ok'
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300'
        )}>{toast.text}</div>
      )}

      <SettingsSection title="Cuenta">
        <SettingsRow icon={User} label="Nombre"     value={username || 'Sin nombre'} onClick={() => setEditing('username')} />
        <SettingsRow icon={Mail} label="Email"      value={email}                    onClick={() => setEditing('email')} />
        <SettingsRow icon={Lock} label="Contraseña" value="••••••••"                  onClick={() => setEditing('password')} />
        {avatarUrl && (
          <SettingsRow icon={Trash2} iconAccent="rose" label="Quitar foto de perfil" onClick={handleAvatarRemove} chevron={false} />
        )}
      </SettingsSection>

      <SettingsSection title="Apariencia" description={
        theme === 'system' ? 'Sigue el tema del sistema operativo.' :
        theme === 'dark'   ? 'Tema oscuro activado.' : 'Tema claro activado.'
      }>
        <div className="p-3">
          <ThemeSegmented value={theme} onChange={setTheme} />
        </div>
      </SettingsSection>

      <SettingsSection title="Acerca de">
        <SettingsRow icon={Sparkles} label="Versión" value="0.1.0" chevron={false} />
        <SettingsRow icon={Info}     label="Política de privacidad" chevron={false} />
      </SettingsSection>

      <div className="card overflow-hidden">
        <SettingsRow icon={LogOut} label="Cerrar sesión" destructive onClick={handleSignOut} chevron={false} />
      </div>

      <EditFieldModal
        open={editing === 'username'}
        onClose={() => setEditing(null)}
        title="Cambiar nombre"
        label="Nombre de usuario"
        initialValue={username}
        placeholder="Tu nombre"
        onSave={saveUsername}
      />
      <EditFieldModal
        open={editing === 'email'}
        onClose={() => setEditing(null)}
        title="Cambiar email"
        label="Nuevo email"
        type="email"
        initialValue={email}
        hint="Te enviaremos un correo de confirmación al nuevo email."
        onSave={saveEmail}
      />
      <EditFieldModal
        open={editing === 'password'}
        onClose={() => setEditing(null)}
        title="Cambiar contraseña"
        label="Nueva contraseña"
        type="password"
        placeholder="Mínimo 6 caracteres"
        minLength={6}
        onSave={savePassword}
      />
    </div>
  )
}

function ThemeSegmented({ value, onChange }: { value: ThemeChoice; onChange: (v: ThemeChoice) => void }) {
  const options: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
    { value: 'light',  label: 'Claro',   icon: Sun },
    { value: 'dark',   label: 'Oscuro',  icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ]
  return (
    <div className="grid grid-cols-3 gap-1 bg-surface-soft rounded-xl p-1">
      {options.map((o) => {
        const Icon = o.icon
        const active = value === o.value
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            className={cx(
              'flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition',
              active ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'
            )}>
            <Icon className="w-4 h-4" /> {o.label}
          </button>
        )
      })}
    </div>
  )
}
