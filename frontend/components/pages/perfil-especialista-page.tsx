"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/star-rating"
import {
  User,
  Mail,
  MapPin,
  Calendar,
  History,
  Star,
  Briefcase,
  DollarSign,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowDown,
  Loader2,
  AlertCircle,
} from "lucide-react"

const profileData = {
  name: "Jose Torres",
  age: 20,
  email: "capitanazo2006@example.com",
  birthdate: "1/1/2006",
  address: "Mozambique 89, Cd. Monteboros, 62000",
  image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OMArzk2E8myxneriwz47Q5FwoM3c8I.png",
}

const orderHistory = ["#100001"]

const reviews = [{ name: "Sandra", rating: 1 }]

type OfferStatus = "pending" | "accepting" | "accepted" | "rejected"

export function PerfilEspecialistaPage() {
  const [offerStatus, setOfferStatus] = useState<OfferStatus>("pending")

  const handleAccept = () => {
    setOfferStatus("accepting")
    setTimeout(() => {
      setOfferStatus("accepted")
    }, 1500)
  }

  const handleReject = () => {
    setOfferStatus("rejected")
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
                        <StarRating rating={review.rating} />
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
                <Briefcase className="h-5 w-5 text-primary" />
                OFERTA ACTUAL
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {offerStatus === "accepted" ? (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                    <CheckCircle2 className="h-10 w-10 text-accent" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-heading font-bold text-card-foreground">Oferta aceptada</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Se te ha asignado el trabajo. Revisa los detalles.
                    </p>
                  </div>
                  <div className="w-full rounded-lg bg-accent/5 border border-accent/20 p-3">
                    <p className="text-sm text-center text-accent font-medium">Ganaras: $1,200</p>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      (Despues de descuento por materiales)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setOfferStatus("pending")}
                  >
                    Ver otra oferta
                  </Button>
                </div>
              ) : offerStatus === "rejected" ? (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <XCircle className="h-10 w-10 text-destructive" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-heading font-bold text-card-foreground">Oferta rechazada</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Has rechazado esta oferta de trabajo.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setOfferStatus("pending")}
                  >
                    Ver otra oferta
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      No de cotizacion:
                    </label>
                    <Input defaultValue="123456" className="bg-background" />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Cotizacion total:</span>
                      </div>
                      <span className="text-lg font-bold text-primary">$6,800</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Tu cobras:</span>
                      </div>
                      <span className="text-lg font-bold text-primary">$2,100</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowDown className="h-4 w-4" />
                        <span>Descuento material:</span>
                      </div>
                      <span className="text-lg font-bold text-destructive">-$900</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-heading font-bold text-card-foreground">Ganas:</span>
                      <span className="text-2xl font-heading font-bold text-accent">$1,200</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      El precio de la cotizacion es por tu servicio (mano de obra). Los materiales necesarios se manejan por separado con el cliente.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Button
                      className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold py-5"
                      onClick={handleAccept}
                      disabled={offerStatus === "accepting"}
                    >
                      {offerStatus === "accepting" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Aceptar
                    </Button>
                    <Button
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold py-5"
                      onClick={handleReject}
                      disabled={offerStatus === "accepting"}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
