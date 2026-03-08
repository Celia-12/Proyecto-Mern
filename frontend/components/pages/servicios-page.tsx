"use client"

import { Droplets, Zap, KeyRound, Wind, Settings, Hammer, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const services = [
  { name: "Plomeria", icon: Droplets, description: "Reparacion e instalacion de tuberias, grifos y sistemas hidraulicos", filterCategory: "Plomeria" },
  { name: "Electricidad", icon: Zap, description: "Instalaciones electricas, reparaciones y mantenimiento de circuitos", filterCategory: "Electricidad" },
  { name: "Cerrajeria", icon: KeyRound, description: "Apertura de cerraduras, cambio de chapas y sistemas de seguridad", filterCategory: "Cerrajeria" },
  { name: "Aire Acondicionado", icon: Wind, description: "Instalacion, mantenimiento y reparacion de equipos de clima", filterCategory: "Mantenimiento" },
  { name: "Mantenimiento General", icon: Settings, description: "Servicios generales de mantenimiento para hogar y oficina", filterCategory: "Mantenimiento" },
  { name: "Carpinteria", icon: Hammer, description: "Fabricacion, reparacion e instalacion de muebles y estructuras de madera", filterCategory: "Carpinteria" },
]

export function ServiciosPage({
  onNavigate,
  onSelectCategory,
}: {
  onNavigate: (page: string) => void
  onSelectCategory: (category: string) => void
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <div className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">Nuestros Servicios</span>
          </div>
          <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Contamos con especialistas en:
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Profesionales certificados listos para resolver cualquier necesidad tecnica en tu hogar u oficina.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-u3Kbkdy0JPZIEvtJ6OBvk2coTvL9re.png"
            alt="Tecnico profesional trabajando"
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
        </div>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card
            key={service.name}
            className="group cursor-pointer border border-border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
            onClick={() => onSelectCategory(service.filterCategory)}
          >
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <service.icon className="h-7 w-7" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-semibold text-card-foreground">{service.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
              <span className="text-xs font-medium text-primary group-hover:underline">
                Ver especialistas
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
