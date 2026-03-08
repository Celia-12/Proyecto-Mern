"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Wrench, Users, Shield, Clock } from "lucide-react"

const values = [
  {
    icon: Users,
    title: "Equipo Profesional",
    description: "Contamos con especialistas verificados y certificados en todas las areas de servicio tecnico.",
  },
  {
    icon: Shield,
    title: "Confianza y Seguridad",
    description: "Todos nuestros socios pasan por un proceso de verificacion para garantizar la calidad del servicio.",
  },
  {
    icon: Clock,
    title: "Atencion Rapida",
    description: "Ofrecemos servicios de emergencia y programados para adaptarnos a tus necesidades.",
  },
  {
    icon: Wrench,
    title: "Servicios Completos",
    description: "Desde plomeria hasta mantenimiento general, cubrimos todas las necesidades de tu hogar.",
  },
]

export function QuienesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-center mb-10">
        <div className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5">
          <span className="text-sm font-medium text-primary">Sobre Nosotros</span>
        </div>
        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground sm:text-4xl text-balance">
          Quienes somos?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
          Somos una plataforma que conecta a clientes con los mejores especialistas tecnicos de la region.
          Nuestra mision es facilitar el acceso a servicios de calidad para tu hogar y oficina.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {values.map((value) => (
          <Card key={value.title} className="border border-border bg-card">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <value.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-card-foreground">{value.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
