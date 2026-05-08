import { NavLink, Outlet } from 'react-router-dom'
import { Shirt, Tag, Heart, User } from 'lucide-react'
import GlobalSearch from './GlobalSearch'
import { cx } from '@/lib/utils'

const NAV = [
  { to: '/armario', label: 'Armario', icon: Shirt },
  { to: '/venta', label: 'A la Venta', icon: Tag },
  { to: '/wishlist', label: 'Deseos', icon: Heart },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center">
            <Shirt className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <GlobalSearch />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 safe-area-pad">
        <div className="max-w-3xl mx-auto grid grid-cols-4">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cx(
                  'flex flex-col items-center justify-center py-2.5 text-xs',
                  isActive ? 'text-brand-700' : 'text-gray-500 hover:text-gray-800'
                )
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
