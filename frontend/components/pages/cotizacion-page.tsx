"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CalendarDays,
  Clock,
  FileText,
  Info,
  DollarSign,
  Trash2,
  ShoppingCart,
  Send,
  MessageSquare,
  AlertCircle,
  ArrowRight,
} from "lucide-react"
import type { CartItem } from "@/lib/types"

interface CotizacionMessage {
  id: string
  from: "cliente" | "especialista"
  name: string
  text: string
  timestamp: string
}

const mockMessages: CotizacionMessage[] = [
  {
    id: "1",
    from: "cliente",
    name: "Tu",
    text: "Hola, necesito servicio de carpinteria para instalar closets en 2 habitaciones. Tengo la madera.",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    from: "especialista",
    name: "Carpintero",
    text: "Buenos dias. Puedo visitarle el martes. El costo por visita es $3,000. Los materiales adicionales como tornillos y pegamento van por mi cuenta.",
    timestamp: "10:45 AM",
  },
  {
    id: "3",
    from: "cliente",
    name: "Tu",
    text: "Perfecto, el martes entre 10am y 12pm me funciona. Tambien necesito un cerrajero.",
    timestamp: "11:00 AM",
  },
]

export function CotizacionPage({
  cart,
  onRemoveFromCart,
  onClearCart,
  isLoggedIn,
  onNavigate,
}: {
  cart: CartItem[]
  onRemoveFromCart: (specialistId: string) => void
  onClearCart: () => void
  isLoggedIn: boolean
  onNavigate: (page: string) => void
}) {
  const [needMaterials, setNeedMaterials] = useState("si")
  const [messages, setMessages] = useState<CotizacionMessage[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [fecha, setFecha] = useState("")
  const [horario, setHorario] = useState("")
  const [specs, setSpecs] = useState("")

  const subtotal = cart.reduce((acc, item) => acc + item.specialist.pricePerVisit, 0)
  const extras = cart.reduce((acc, item) => acc + item.specialist.extraFee, 0)
  const materialDiscount = needMaterials === "no" ? 0 : 0
  const total = subtotal + extras - materialDiscount

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    const msg: CotizacionMessage = {
      id: Date.now().toString(),
      from: "cliente",
      name: "Tu",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, msg])
    setNewMessage("")
  }

  
  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Tu cotizacion esta vacia</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Agrega especialistas desde la seccion de Socios para comenzar tu cotizacion.
          </p>
          <Button
            className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onNavigate("socios")}
          >
            Ver Socios
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }


  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Cotizacion</h1>
              <p className="mt-1 text-muted-foreground">Tu carrito de servicios</p>
            </div>
          </div>
        </div>

        {/* Materials pricing clarification */}
        <div className="mb-6 rounded-xl border border-amber-300/50 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold text-amber-800">Importante: Precio de servicio vs. materiales</p>
            <p className="text-amber-700 mt-1">
              El precio cotizado por cada especialista corresponde UNICAMENTE al costo del servicio (mano de obra). Los materiales necesarios para realizar el trabajo se cotizan y cobran por separado. Si usted proporciona los materiales, el costo total puede reducirse.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left panel - Cart items */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Service cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cart.map((item) => (
                <Card key={item.specialist.id} className="overflow-hidden border border-border bg-card relative group">
                  <button
                    onClick={() => onRemoveFromCart(item.specialist.id)}
                    className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 border border-border text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    aria-label="Eliminar de cotizacion"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={item.specialist.image}
                      alt={`Trabajo de ${item.specialist.specialty}`}
                      className="h-full w-full object-cover object-top"
                    />
                    <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
                      {item.specialist.specialty}
                    </Badge>
                    {!item.specialist.available && (
                      <Badge variant="destructive" className="absolute left-3 bottom-3 text-xs">
                        No disponible
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="font-heading font-semibold text-card-foreground text-sm">{item.specialist.specialty}</p>
                    <p className="text-xs text-muted-foreground">{item.specialist.highlight}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xl font-bold text-primary">${item.specialist.pricePerVisit.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">/visita</span>
                    </div>
                    {item.specialist.extraFee > 0 && (
                      <p className="text-sm text-destructive font-medium">+${item.specialist.extraFee} extra (no disponible)</p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">*Solo servicio, materiales aparte</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Date, time, specs */}
            <Card className="border border-border bg-card">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      Fecha
                    </label>
                    <Input
                      placeholder="Ej: Martes 27/02/2026"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      Horario
                    </label>
                    <Input
                      placeholder="Ej: Entre 10 am a 12 pm"
                      value={horario}
                      onChange={(e) => setHorario(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Especificaciones
                  </label>
                  <Textarea
                    placeholder="Describe el trabajo que necesitas, incluyendo detalles relevantes..."
                    value={specs}
                    onChange={(e) => setSpecs(e.target.value)}
                    className="bg-background min-h-[100px]"
                  />
                </div>

                <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      <p>El costo del servicio depende del tipo de trabajo y la urgencia.</p>
                      <p>Los servicios inmediatos incluyen materiales de nuestra bodega y tienen un precio mas alto.</p>
                      <p className="font-medium text-foreground">Si el cliente aporta los materiales, el costo puede reducirse.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right panel - Receipt */}
          <div className="lg:col-span-2">
            <Card className="border border-border bg-card sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Aclaraciones
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Si el cliente proporcionara los materiales, debera indicarlo en las especificaciones del servicio,
                  detallando que materiales tiene disponibles y marcando que no requiere que se le proporcionen
                  materiales. De lo contrario, se utilizaran materiales de nuestra bodega y el costo podra ser
                  mayor, especialmente en servicios urgentes.
                </p>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Necesita que traigan materiales?
                  </p>
                  <RadioGroup value={needMaterials} onValueChange={setNeedMaterials} className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="si" id="mat-si" />
                      <Label htmlFor="mat-si" className="text-sm">Si</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="mat-no" />
                      <Label htmlFor="mat-no" className="text-sm">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div>
                  <h3 className="font-heading font-semibold text-primary mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Recibo
                  </h3>

                  <div className="flex flex-col gap-2">
                    {cart.map((item) => (
                      <div key={item.specialist.id} className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-card-foreground">
                            {item.specialist.specialty}
                          </span>
                          <span className="font-semibold text-primary">${item.specialist.pricePerVisit.toLocaleString()}</span>
                        </div>
                        {item.specialist.extraFee > 0 && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground ml-3">
                            <span>Extra (no disponible)</span>
                            <span className="text-destructive">${item.specialist.extraFee}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground ml-3">
                          <span>Materiales</span>
                          <span>Cotizacion aparte</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Descuento por material</span>
                    <span>${materialDiscount}</span>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-heading font-bold text-card-foreground">Total</span>
                    <span className="text-2xl font-heading font-bold text-primary">
                      ${total.toLocaleString()}*
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    No de cotizacion #{Math.floor(100000 + Math.random() * 900000)}
                  </p>
                  <p className="text-xs text-destructive font-medium">
                    *No incluye costo de envio ni materiales
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    *Precio de servicio unicamente (mano de obra)
                  </p>

                  <Button
                    className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => onNavigate("login")}
                  >
                    Inicie Sesion para continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    className="mt-2 w-full border-destructive text-destructive hover:bg-destructive/10"
                    onClick={onClearCart}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Vaciar cotizacion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Cotizacion</h1>
            <p className="mt-1 text-muted-foreground">Comunicate con los especialistas para detallar tu servicio</p>
          </div>
        </div>
      </div>

      {/* Materials pricing clarification */}
      <div className="mb-6 rounded-xl border border-amber-300/50 bg-amber-50 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm leading-relaxed">
          <p className="font-semibold text-amber-800">Recordatorio: Precio de servicio vs. materiales</p>
          <p className="text-amber-700 mt-1">
            El precio cotizado corresponde UNICAMENTE al servicio del especialista (mano de obra). Los materiales necesarios se cotizan y cobran por separado. Coordina con el especialista si tu proporcionaras los materiales.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left - Chat & services */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Selected services summary */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {cart.map((item) => (
              <Card key={item.specialist.id} className="shrink-0 w-48 overflow-hidden border border-border bg-card relative">
                <button
                  onClick={() => onRemoveFromCart(item.specialist.id)}
                  className="absolute top-1 right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-card/90 border border-border text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <div className="aspect-[3/2] overflow-hidden bg-muted">
                  <img
                    src={item.specialist.image}
                    alt={`Trabajo de ${item.specialist.specialty}`}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-semibold text-card-foreground">{item.specialist.specialty}</p>
                  <p className="text-sm font-bold text-primary">${item.specialist.pricePerVisit.toLocaleString()}<span className="text-[10px] text-muted-foreground font-normal">/visita</span></p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chat area */}
          <Card className="border border-border bg-card flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Conversacion de cotizacion
              </CardTitle>
              <p className="text-xs text-muted-foreground">Coordina los detalles del servicio con los especialistas</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4">
              {/* Messages */}
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto rounded-lg bg-muted/50 p-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.from === "cliente" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`rounded-xl px-4 py-2.5 max-w-[85%] ${
                        msg.from === "cliente"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border text-card-foreground"
                      }`}
                    >
                      <p className="text-xs font-medium opacity-75 mb-0.5">{msg.name}</p>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">{msg.timestamp}</span>
                  </div>
                ))}
              </div>

              {/* Message input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribe tu mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="bg-background min-h-[60px] flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 self-end"
                  onClick={handleSendMessage}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel - Receipt */}
        <div className="lg:col-span-2">
          <Card className="border border-border bg-card sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Resumen de cotizacion
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Necesita que traigan materiales?
                </p>
                <RadioGroup value={needMaterials} onValueChange={setNeedMaterials} className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="si" id="mat-si-2" />
                    <Label htmlFor="mat-si-2" className="text-sm">Si</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="mat-no-2" />
                    <Label htmlFor="mat-no-2" className="text-sm">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                {cart.map((item) => (
                  <div key={item.specialist.id} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-card-foreground">{item.specialist.specialty}</span>
                      <span className="font-semibold text-primary">${item.specialist.pricePerVisit.toLocaleString()}</span>
                    </div>
                    {item.specialist.extraFee > 0 && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground ml-3">
                        <span>Extra</span>
                        <span className="text-destructive">${item.specialist.extraFee}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground ml-3">
                      <span>Materiales</span>
                      <span>Aparte</span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-lg font-heading font-bold text-card-foreground">Total servicio</span>
                <span className="text-2xl font-heading font-bold text-primary">
                  ${total.toLocaleString()}*
                </span>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs text-amber-800 font-medium">
                  *Precio de mano de obra unicamente. Los materiales se cotizan y cobran por separado.
                </p>
              </div>

              <p className="text-xs text-destructive">
                *No incluye costo de envio
              </p>

              <Button
                className="mt-2 w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                onClick={() => onNavigate("perfil")}
              >
                Ir a pagar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
