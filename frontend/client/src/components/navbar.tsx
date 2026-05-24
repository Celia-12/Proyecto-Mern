import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Wrench,
  Menu,
  LogOut,
  User,
  FileText,
  ChevronDown,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/tecnicos", label: "Directorio de técnicos" },
];

export function Navbar() {
  const [location] = useLocation();
  const { usuario, logout, estaAutenticado } = useAuth();
  const [, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const enlaces = [
    ...navLinks,
    ...(usuario?.tipo === "tecnico" ? [{ href: "/nuevos-trabajos", label: "Nuevos Trabajos" }] : []),
  ];

  const initials = usuario?.nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <Wrench className="w-4 h-4" />
              </div>
              <span>
                Multiservicios{" "}
                <span className="text-primary">TÉCNICOS</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {enlaces.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location === link.href
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <form
              className="hidden lg:flex items-center rounded-full border border-border/80 bg-background px-3 py-1.5 shadow-sm"
              onSubmit={(event) => {
                event.preventDefault();
                navigate(
                  searchQuery.trim()
                    ? `/tecnicos?q=${encodeURIComponent(searchQuery.trim())}`
                    : "/tecnicos"
                );
              }}
            >
              <Search className="mr-2 h-4 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="¿Qué necesitas? Ej: plomería, electricidad..."
                className="w-96 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </form>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {estaAutenticado ? (
              <>
                {usuario?.tipo !== "tecnico" && (
                  <Link href="/cotizacion">
                    <Button size="sm" className="gap-1.5">
                      <FileText className="w-4 h-4" />
                      Solicitar Cotización
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-muted transition-colors">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={usuario?.foto ?? undefined} />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium max-w-[120px] truncate">
                        {usuario?.nombre}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-0.5">
                        <p className="font-medium text-sm truncate">{usuario?.nombre}</p>
                        <p className="text-xs text-muted-foreground truncate">{usuario?.email}</p>
                        <p className="text-xs text-primary capitalize">{usuario?.tipo}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/perfil" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-1 mt-6">
                {enlaces.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      location === link.href
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t mt-3 pt-3 flex flex-col gap-2">
                  {estaAutenticado ? (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{usuario?.nombre}</p>
                          <p className="text-xs text-muted-foreground capitalize">{usuario?.tipo}</p>
                        </div>
                      </div>
                      {usuario?.tipo !== "tecnico" && (
                        <Link href="/cotizacion" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full" size="sm">
                            Solicitar Cotización
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => { logout(); setMobileOpen(false); }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full" size="sm">
                          Iniciar Sesión
                        </Button>
                      </Link>
                      <Link href="/registro" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full" size="sm">
                          Registrarse
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
