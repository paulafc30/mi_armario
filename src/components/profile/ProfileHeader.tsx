import { cx } from '@/lib/utils'

export default function ProfileHeader({
  username,
  email,
}: {
  username: string
  email: string
}) {
  const display = username?.trim() || email.split('@')[0] || 'Tú'
  const initial = (display[0] ?? '?').toUpperCase()

  return (
    <div className="flex flex-col items-center text-center pt-2 pb-4">
      <div className={cx(
        'w-20 h-20 rounded-2xl bg-brand-gradient text-white shadow-lift',
        'flex items-center justify-center text-3xl font-extrabold'
      )}>
        {initial}
      </div>
      <h1 className="heading-lg mt-3 truncate max-w-full">{display}</h1>
      {username && <p className="text-sm text-muted mt-0.5 truncate max-w-full">{email}</p>}
    </div>
  )
}
