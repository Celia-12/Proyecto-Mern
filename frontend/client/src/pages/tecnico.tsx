import { useMemo } from "react";
import { Link, useRoute } from "wouter";
import { useEspecialista, useCalificaciones } from "@/hooks/useApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, MessageSquare, ShieldCheck, Star } from "lucide-react";

export default function TecnicoPerfil() {
  const [match, params] = useRoute("/tecnico/:id");
  const tecnicoId = params?.id ?? "";

  const {
    data: especialistaData,
    isLoading: isLoadingEspecialista,
    isError: isErrorEspecialista,
  } = useEspecialista(tecnicoId);

  const {
    data: calificacionesData,
    isLoading: isLoadingCalificaciones,
    isError: isErrorCalificaciones,
  } = useCalificaciones({
    especialista_id: tecnicoId,
    tipo: "cliente_a_tecnico",
    limit: 50,
  });

  if (!match) return null;

  const especialista = especialistaData?.especialista;
  const calificaciones = calificacionesData?.calificaciones ?? [];
  const totalReviews = calificaciones.length;

  const telefono = especialista?.usuario_id?.telefono;
  const telefonoLimpio = telefono?.replace(/\D/g, "");
  const whatsappLink = telefonoLimpio
    ? `https://wa.me/${telefonoLimpio.length === 10 ? `52${telefonoLimpio}` : telefonoLimpio}`
    : undefined;

  const averageRating = especialista?.calificacion_promedio ??
    (totalReviews > 0
      ? calificaciones.reduce((sum, cal) => sum + cal.estrellas, 0) / totalReviews
      : 0);

  const roundedAverage = Number(averageRating.toFixed(1));

  const starCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0];
    calificaciones.forEach((cal) => {
      counts[cal.estrellas] = (counts[cal.estrellas] ?? 0) + 1;
    });
    return counts;
  }, [calificaciones]);

  const initials = especialista?.usuario_id?.nombre
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const ubicacion = especialista?.ubicacion || especialista?.usuario_id?.ciudad || "No disponible";
  const especialidad = especialista?.especialidad || "Técnico";
  const horario = especialista?.horario || "No disponible";
  const bio = especialista?.bio || "";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <Link href="/tecnicos">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a técnicos
            </Button>
          </Link>
        </div>

        {(isLoadingEspecialista || isLoadingCalificaciones) && (
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </Card>
        )}

        {(isErrorEspecialista || isErrorCalificaciones || (!isLoadingEspecialista && !especialista)) && (
          <Card className="p-6 text-center">
            <p className="font-semibold">No se pudo cargar el perfil del técnico.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Intenta recargar la página o selecciona otro técnico.
            </p>
          </Card>
        )}

        {!isLoadingEspecialista && especialista && (
          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Avatar className="w-28 h-28 border-2 border-border">
                      <AvatarImage src={especialista.usuario_id?.foto ?? undefined} />
                      <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                        {initials ?? "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <p className="text-3xl font-semibold tracking-tight">
                        {especialista.usuario_id?.nombre ?? "Técnico"}
                      </p>
                      
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    {whatsappLink ? (
                      <a href={whatsappLink} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" className="w-full sm:w-auto" size="sm" disabled>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    )}
                    <Link href={`/cotizacion?especialista=${tecnicoId}`} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto" size="sm">
                        Pídele cotización
                      </Button>
                    </Link>
                  </div>
                      
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">Calificación</p>
                      <p className="text-2xl font-semibold">{roundedAverage}</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${index < Math.round(roundedAverage) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{totalReviews} reseña{totalReviews === 1 ? "" : "s"}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">Experiencia</p>
                      <p className="text-2xl font-semibold">{especialista.experiencia_anos} años</p>
                      <p className="text-xs text-muted-foreground mt-1">Experiencia comprobada</p>
                    </div>
                  </div>


                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">Ubicación</p>
                      <p className="font-medium mt-1">{ubicacion}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">Horario</p>
                      <p className="font-medium mt-1">{horario}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold">Información sobre {especialista.usuario_id?.nombre?.split(" ")[0] ?? "el técnico"}</h2>
                <p className="text-sm text-muted-foreground mt-2">{bio || "No hay descripción disponible."}</p>
                <div className="mt-6 grid gap-4">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">Especialidad</p>
                    <p className="font-medium mt-1">{especialidad}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">Precio por visita</p>
                    <p className="font-medium mt-1">${especialista.precio_hora} por visita</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Opiniones</h2>
                    <p className="text-sm text-muted-foreground mt-1">Comentarios reales de clientes.</p>
                  </div>
                  <Badge variant="secondary">{totalReviews} reseña{totalReviews === 1 ? "" : "s"}</Badge>
                </div>

                <div className="mt-6 space-y-4">
                  {totalReviews === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      Este técnico aún no tiene reseñas.
                    </div>
                  ) : (
                    calificaciones.map((cal) => (
                      <Card key={cal._id} className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10 border border-border">
                            <AvatarImage src={cal.quien_califica?.foto ?? undefined} />
                            <AvatarFallback>
                              {cal.quien_califica?.nombre
                                ?.split(" ")
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="font-medium">{cal.quien_califica?.nombre}</span>
                              <span className="flex items-center gap-1 text-amber-400">
                                {Array.from({ length: cal.estrellas }).map((_, index) => (
                                  <Star key={index} className="w-4 h-4" />
                                ))}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{cal.comentario || "Sin comentario."}</p>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-semibold">Sellos de confianza</h2>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-emerald-500/10 p-2 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">Técnico verificado</p>
                      <p className="text-sm text-muted-foreground">Perfil verificado por la plataforma.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-sky-500/10 p-2 text-sky-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">Disponible ahora</p>
                      <p className="text-sm text-muted-foreground">Acepta nuevas solicitudes de cotización.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                      <span className="text-sm font-semibold">{especialista.experiencia_anos}+</span>
                    </div>
                    <div>
                      <p className="font-medium">Años de experiencia</p>
                      <p className="text-sm text-muted-foreground">Con experiencia en proyectos reales.</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold">Detalles de contacto</h2>
                <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Teléfono</p>
                    <p className="font-medium mt-1">{telefono ?? "No disponible"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Correo</p>
                    <p className="font-medium mt-1">{especialista.usuario_id?.email ?? "No disponible"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Ubicación</p>
                    <p className="font-medium mt-1">{ubicacion}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
