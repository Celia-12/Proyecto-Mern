"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/star-rating"
import {
  User,
  Mail,
  MapPin,
  Calendar,
  History,
  Star,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Truck,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react"

const profileData = {
  name: "Rocio Miramontes",
  age: 53,
  email: "Periquita43@example.com",
  birthdate: "12/03/1972",
  address: "Calle Manzana 123, Cd. Colinas, NL, 67666",
  image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Nxa4EPAubBHoe7UvUsFnnlJ4gKRIGo.png",
}

const orderHistory = ["#111112", "#111123", "#100009"]

const reviews = [
  { name: "Maria", rating: 5, canRate: false },
  { name: "Patricio", rating: 4, canRate: false },
  { name: "Antonio", rating: 2, canRate: false },
  { name: "Pedro", rating: 0, canRate: true },
]

type PaymentStatus = "idle" | "processing" | "success" | "error"

export function PerfilClientePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [ratingForPedro, setRatingForPedro] = useState(0)
  const [cotizacionNum, setCotizacionNum] = useState("123456")
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle")

  const handlePay = () => {
    setPaymentStatus("processing")
    
    setTimeout(() => {
      setPaymentStatus("success")
    }, 2500)
  }

  const resetPayment = () => {
    setPaymentStatus("idle")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-5">
        {}
        <div className="lg:col-span-3">
          <Card className="border border-border bg-card">
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-3">
                {}
                <div className="flex flex-col items-center sm:items-start gap-4">
                  <h2 className="font-heading font-bold text-lg text-card-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Perfil
                  </h2>
                  <div className="h-40 w-40 overflow-hidden rounded-xl border-2 border-border">
                    <img
                      src={profileData.image}
                      alt={`Foto de ${profileData.name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-lg text-card-foreground">{profileData.name}</p>
                    <p className="text-sm text-muted-foreground">{profileData.age} anios</p>
                  </div>

                  <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground w-full">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span>{profileData.birthdate}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{profileData.address}</span>
                    </div>
                  </div>
                </div>

                {}
                <div>
                  <h3 className="font-heading font-semibold text-card-foreground mb-3 flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Historial de pedidos
                  </h3>
                  <div className="flex flex-col gap-2">
                    {orderHistory.map((order) => (
                      <button
                        key={order}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors text-left"
                      >
                        {order}
                      </button>
                    ))}
                  </div>
                </div>

                {}
                <div>
                  <h3 className="font-heading font-semibold text-card-foreground mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Resenas
                  </h3>
                  <div className="flex flex-col gap-3">
                    {reviews.map((review) => (
                      <div key={review.name} className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-card-foreground">{review.name}</span>
                        {review.canRate ? (
                          <div className="flex items-center gap-2">
                            <StarRating
                              rating={ratingForPedro}
                              interactive
                              onRate={setRatingForPedro}
                            />
                            {ratingForPedro === 0 && (
                              <Badge className="bg-primary text-primary-foreground text-xs">
                                Calificar
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <StarRating rating={review.rating} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="lg:col-span-2">
          <Card className="border border-border bg-card sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Realizar Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {paymentStatus === "success" ? (
                
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                    <CheckCircle2 className="h-10 w-10 text-accent" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-heading font-bold text-card-foreground">Pago realizado</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tu pedido ha sido confirmado exitosamente.
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Cotizacion #{cotizacionNum}
                    </p>
                  </div>
                  <div className="w-full rounded-lg bg-accent/5 border border-accent/20 p-3">
                    <p className="text-sm text-center text-accent font-medium">Total pagado: $7,100</p>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      (Mano de obra + envio. Materiales se cobraran por separado)
                    </p>
                  </div>
                  <div className="flex gap-3 w-full mt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={resetPayment}
                    >
                      Nuevo pedido
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => onNavigate("servicios")}
                    >
                      Inicio
                    </Button>
                  </div>
                </div>
              ) : (
                
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      No de cotizacion:
                    </label>
                    <Input
                      value={cotizacionNum}
                      onChange={(e) => setCotizacionNum(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Cotizacion (servicio):</span>
                      </div>
                      <span className="text-lg font-bold text-primary">$6,800</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>Envio:</span>
                      </div>
                      <span className="text-lg font-bold text-primary">$300</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-heading font-bold text-card-foreground">Total:</span>
                      <span className="text-2xl font-heading font-bold text-primary">$7,100</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs text-amber-800 font-medium">
                      Este total incluye unicamente la mano de obra y envio. Los materiales necesarios se cotizan y cobran por separado directamente con el especialista.
                    </p>
                  </div>

                  {paymentStatus === "error" && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-center gap-2">
                      <X className="h-4 w-4 text-destructive shrink-0" />
                      <p className="text-xs text-destructive font-medium">
                        Error en el pago. Intenta de nuevo.
                      </p>
                    </div>
                  )}

                  <Button
                    className="mt-2 w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 font-semibold"
                    onClick={handlePay}
                    disabled={paymentStatus === "processing"}
                  >
                    {paymentStatus === "processing" ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Procesando pago...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        PAGAR
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Pago simulado con fines demostrativos
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
