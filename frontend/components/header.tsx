"use client"

import { Search, Wrench, MessageCircle, ShoppingCart, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { id: "servicios", label: "Servicios" },
  { id: "socios", label: "Socios" },
  { id: "cotizacion", label: "Cotizacion" },
  { id: "login", label: "Iniciar Sesion" },
  { id: "quienes", label: "Quienes somos?" },
]

export function Header({
  activePage,
  onNavigate,
  isLoggedIn,
  userType,
  cartCount = 0,
  onLogout,
}: {
  activePage: string
  onNavigate: (page: string) => void
  isLoggedIn: boolean
  userType: "cliente" | "especialista"
  cartCount?: number
  onLogout?: () => void
}) {
  const displayNav = navItems.map((item) => {
    if (item.id === "login" && isLoggedIn) {
      return { id: "perfil", label: "Perfil" }
    }
    return item
  })

  return (
    <header className="bg-primary text-primary-foreground shadow-lg backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => onNavigate("servicios")}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="flex items-center justify-center rounded-xl bg-primary-foreground p-2.5 shadow-sm group-hover:shadow-md transition-shadow">
              <Wrench className="h-7 w-7 text-primary" />
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-heading font-bold leading-tight">Multiservicios</p>
              <p className="text-xs font-heading tracking-wider opacity-80">TECNICOS</p>
            </div>
          </button>

          <div className="relative flex-1 max-w-xl hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Que servicios buscas?"
              className="pl-10 bg-primary-foreground text-foreground border-0 h-10 rounded-full shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Cart icon */}
            <button
              onClick={() => onNavigate("cotizacion")}
              className="relative flex items-center justify-center rounded-full bg-primary-foreground/10 p-2.5 hover:bg-primary-foreground/20 transition-colors"
              aria-label="Ver cotizacion"
            >
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold p-0 border-2 border-primary">
                  {cartCount}
                </Badge>
              )}
            </button>

            {/* WhatsApp */}
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full bg-accent p-2.5 hover:opacity-90 transition-opacity"
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle className="h-5 w-5 text-accent-foreground" />
            </a>

            {/* Logout */}
            {isLoggedIn && (
              <button
                onClick={onLogout}
                className="flex items-center justify-center rounded-full bg-primary-foreground/10 p-2.5 hover:bg-destructive/80 transition-colors"
                aria-label="Cerrar sesion"
              >
                <LogOut className="h-5 w-5 text-primary-foreground" />
              </button>
            )}
          </div>
        </div>

        <nav className="mt-3 flex items-center gap-1 overflow-x-auto pb-1">
          {displayNav.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                activePage === item.id
                  ? "bg-primary-foreground text-primary shadow-sm"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
            >
              {item.label}
              {item.id === "cotizacion" && cartCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1">
                  {cartCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
