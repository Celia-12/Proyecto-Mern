"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StarRating } from "@/components/star-rating"
import { Search, Clock, AlertTriangle, ShoppingCart, Check, DollarSign, Briefcase, Info } from "lucide-react"
import { specialists } from "@/lib/data"
import type { CartItem, Specialist } from "@/lib/types"

export function SociosPage({
  onNavigate,
  onAddToCart,
  cart,
  isLoggedIn,
  initialCategory,
}: {
  onNavigate: (page: string) => void
  onAddToCart: (specialist: Specialist) => void
  cart: CartItem[]
  isLoggedIn: boolean
  initialCategory?: string
}) {
  const [category, setCategory] = useState(initialCategory || "Todas")

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory)
    }
  }, [initialCategory])
  const [horario, setHorario] = useState("Todos")
  const [priceRange, setPriceRange] = useState("Todos")

  const filtered = specialists.filter((s) => {
    const catMatch = category === "Todas" || s.category === category
    const horMatch = horario === "Todos" || s.horario === horario
    let priceMatch = true
    if (priceRange === "bajo") priceMatch = s.pricePerVisit <= 1200
    else if (priceRange === "medio") priceMatch = s.pricePerVisit > 1200 && s.pricePerVisit <= 2000
    else if (priceRange === "alto") priceMatch = s.pricePerVisit > 2000
    return catMatch && horMatch && priceMatch
  })

  const isInCart = (id: string) => cart.some((item) => item.specialist.id === id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Nuestros Socios</h1>
        <p className="mt-2 text-muted-foreground">Encuentra al especialista ideal para tu necesidad</p>
      </div>

      {/* Security notice */}
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-foreground leading-relaxed">
          <p className="font-medium">Por tu seguridad y la de nuestros socios:</p>
          <p className="text-muted-foreground mt-1">
            Solo mostramos la especialidad y disponibilidad de cada socio. La informacion personal se mantiene privada hasta que se confirme una cotizacion.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-end gap-4 rounded-xl bg-card p-4 border border-border shadow-sm">
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            Especialidad
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value="Plomeria">Plomeria</SelectItem>
              <SelectItem value="Electricidad">Electricidad</SelectItem>
              <SelectItem value="Carpinteria">Carpinteria</SelectItem>
              <SelectItem value="Cerrajeria">Cerrajeria</SelectItem>
              <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Horario
          </label>
          <Select value={horario} onValueChange={setHorario}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Matutino">Matutino</SelectItem>
              <SelectItem value="Vespertino">Vespertino</SelectItem>
              <SelectItem value="Completo">Completo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            Precio por visita
          </label>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="bajo">Hasta $1,200</SelectItem>
              <SelectItem value="medio">$1,200 - $2,000</SelectItem>
              <SelectItem value="alto">Mas de $2,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
      </div>

      {/* Price clarification */}
      <div className="mb-6 rounded-xl border border-amber-300/50 bg-amber-50 p-4 flex items-start gap-3">
        <DollarSign className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm leading-relaxed">
          <p className="font-medium text-amber-800">Aclaracion sobre precios</p>
          <p className="text-amber-700 mt-1">
            El precio por visita mostrado es exclusivamente por el servicio del especialista y NO incluye los materiales necesarios para el trabajo. Los materiales se cotizan por separado.
          </p>
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} especialista{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Specialist cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {filtered.map((specialist) => {
          const inCart = isInCart(specialist.id)
          return (
            <Card
              key={specialist.id}
              className="group overflow-hidden border border-border bg-card transition-all hover:shadow-lg"
            >
              {/* Image - only shows work-related photo, no personal faces */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={specialist.image}
                  alt={`Trabajo de ${specialist.specialty}`}
                  className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
                />
                {!specialist.available && (
                  <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                    <Badge variant="destructive" className="text-xs">
                      No disponible
                    </Badge>
                  </div>
                )}
                {inCart && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-accent text-accent-foreground text-xs">
                      <Check className="mr-1 h-3 w-3" />
                      En cotizacion
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                {/* Only show specialty and work info, NOT personal name */}
                <h3 className="text-lg font-heading font-bold text-card-foreground">{specialist.specialty}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{specialist.highlight}</p>

                {/* Price per visit */}
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-primary">${specialist.pricePerVisit.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">/visita</span>
                </div>
                <p className="text-[11px] text-muted-foreground">*No incluye materiales</p>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{specialist.schedule}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-5">{specialist.hours}</p>

                <div className="mt-3">
                  <StarRating rating={specialist.rating} />
                </div>

                <div className="mt-4">
                  {specialist.available ? (
                    <Button
                      className={`w-full ${
                        inCart
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                      size="sm"
                      onClick={() => {
                        if (!inCart) onAddToCart(specialist)
                        onNavigate("cotizacion")
                      }}
                    >
                      {inCart ? (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                          Ver cotizacion
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                          Agregar a cotizacion
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${
                        inCart
                          ? "border-accent text-accent hover:bg-accent/10"
                          : "border-destructive text-destructive hover:bg-destructive/10"
                      }`}
                      onClick={() => {
                        if (!inCart) onAddToCart(specialist)
                        onNavigate("cotizacion")
                      }}
                    >
                      {inCart ? (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                          Ver cotizacion
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                          Solicitar (+${specialist.extraFee})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">No se encontraron especialistas con esos filtros</p>
          <p className="mt-1 text-sm text-muted-foreground">Intenta cambiar los criterios de busqueda</p>
        </div>
      )}
    </div>
  )
}
