import { Link } from "wouter";
import { Wrench, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
                <Wrench className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold tracking-tight">Multiservicios</span>
                <span className="text-xs font-semibold text-primary tracking-widest uppercase">TECNICOS</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conectamos clientes con los mejores técnicos de la region.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Técnicos</h4>
            <div className="space-y-2">
              <Link href="/tecnicos" className="block text-sm text-muted-foreground transition-colors" data-testid="link-footer-partners">
                Ver técnicos
              </Link>
              <Link href="/cotizacion" className="block text-sm text-muted-foreground transition-colors" data-testid="link-footer-quote">
                Solicitar cotizacion
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Empresa</h4>
            <div className="space-y-2">
              <Link href="/nosotros" className="block text-sm text-muted-foreground transition-colors" data-testid="link-footer-about">
                Sobre nosotros
              </Link>
              <Link href="/tecnicos" className="block text-sm text-muted-foreground transition-colors" data-testid="link-footer-partners">
                Nuestros técnicos
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Contacto</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Ciudad de Mexico, Mexico</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>+52 55 1234 5678</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span>contacto@multiservicios.mx</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6">
          <p className="text-center text-xs text-muted-foreground" data-testid="text-copyright">
            2026 Multiservicios TECNICOS. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
