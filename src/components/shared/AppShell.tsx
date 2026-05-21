import { NavLink, Outlet } from "react-router-dom";
import { Shirt, Tag, Heart, User } from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import { cx } from "@/lib/utils";

const NAV = [
  { to: "/armario", label: "Armario", icon: Shirt },
  { to: "/venta", label: "Venta", icon: Tag },
  { to: "/wishlist", label: "Deseos", icon: Heart },
  { to: "/perfil", label: "Perfil", icon: User },
];

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header anclado al tope. Usa el mismo color de fondo de la página
          (con leve transparencia + blur) para que no se note como un corte. */}
      <header className="sticky top-0 z-20 bg-page/20 backdrop-blur-xl safe-top">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-gradient text-white shadow-lift shrink-0">
            <Shirt className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <GlobalSearch />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto pb-32 pt-3">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav: se mantiene flotante para mantener el aire visual del fondo */}
      <nav className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-20 safe-bottom">
        <div className="card-glass rounded-3xl px-2 py-1.5 mx-auto sm:w-auto">
          <div className="grid grid-cols-4 sm:flex sm:gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cx(
                    "nav-pill min-w-[64px]",
                    isActive
                      ? "bg-brand-gradient text-white shadow-lift"
                      : "text-muted hover:text-ink hover:bg-surface-soft",
                  )
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-2xs font-semibold mt-0.5">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
