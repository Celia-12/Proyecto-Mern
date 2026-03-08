import { Wrench } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-6">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wrench className="h-4 w-4" />
          <span className="text-sm">Multiservicios Tecnicos</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Derechos Reservados Multiservicios Tecnicos
        </p>
      </div>
    </footer>
  )
}
