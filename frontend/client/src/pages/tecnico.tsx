import { useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { useAuth } from "@/context/AuthContext";
import type { Cotizacion } from "@/hooks/useApi";
import { useEspecialista, useCalificaciones, useCotizaciones, useAceptarCotizacionPorCliente, useReabrirCotizacion } from "@/hooks/useApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { API_ORIGIN } from "@/lib/api";
import { useSubirImagenesEspecialista } from "@/hooks/useApi";
import { ArrowLeft, AlertCircle, CheckCircle, MessageSquare, ShieldCheck, Star } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function TecnicoPerfil() {
  const [match, params] = useRoute("/tecnico/:id");
  const tecnicoId = params?.id ?? "";

  const {
    data: especialistaData,
    isLoading: isLoadingEspecialista,
    isError: isErrorEspecialista,
  } = useEspecialista(tecnicoId);

  const { usuario } = useAuth();
  const { data: cotizacionesData } = useCotizaciones();
  const aceptarCotizacionCliente = useAceptarCotizacionPorCliente();
  const reabrirCotizacion = useReabrirCotizacion();
  const { toast } = useToast();
  const uploadEspecialista = useSubirImagenesEspecialista();
  const [selectedFilesEsp, setSelectedFilesEsp] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cotizacionAReabrir, setCotizacionAReabrir] = useState<Cotizacion | null>(null);

  const solicitudesPorAceptar = usuario?.tipo === "cliente"
    ? cotizacionesData?.cotizaciones.filter(
        (cot: Cotizacion) =>
          cot.estado === "en_revision" &&
          cot.especialista_asignado?._id === tecnicoId
      ) ?? []
    : [];

  const puedeVerContacto =
    usuario?.tipo !== "cliente" || solicitudesPorAceptar.length === 0;

  const cotizacionActiva = usuario?.tipo === "cliente"
    ? cotizacionesData?.cotizaciones.find(
        (cot: Cotizacion) =>
          (cot.especialista_asignado?._id === tecnicoId ||
            cot.especialistas_notificados?.includes(tecnicoId)) &&
          ["pendiente", "en_revision", "aceptada", "pendiente_confirmacion"].includes(cot.estado)
      )
    : undefined;

  const {
    data: calificacionesData,
    isLoading: isLoadingCalificaciones,
    isError: isErrorCalificaciones,
  } = useCalificaciones({
    especialista_id: tecnicoId,
    tipo: "cliente_a_tecnico",
    limit: 50,
  });

  const especialista = especialistaData?.especialista;
  const calificaciones = calificacionesData?.calificaciones ?? [];
  const totalReviews = calificaciones.length;
  const esPerfilPropio = usuario?.tipo === "tecnico" && especialista?.usuario_id?._id === usuario._id;

  const solicitudesTecnico = esPerfilPropio
    ? cotizacionesData?.cotizaciones.filter(
        (cot: Cotizacion) =>
          (cot.especialista_asignado?._id === tecnicoId ||
            cot.especialistas_notificados?.includes(tecnicoId)) &&
          ["pendiente", "en_revision", "aceptada", "pendiente_confirmacion"].includes(
            cot.estado
          )
      ) ?? []
    : [];

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

  const getEstadoLabel = (cot: Cotizacion) => {
    if (cot.estado === "pendiente_confirmacion") return "Pendiente de confirmación";
    if (cot.estado === "completada") return "Completado";
    if (cot.estado === "inconclusa") return "Inconcluso";

    switch (cot.estado) {
      case "pendiente":
        return "Pendiente";
      case "en_revision":
        return "En revisión";
      case "aceptada":
        return "Aceptada";
      case "rechazada":
        return "Rechazada";
      case "completada":
        return "Completada";
      default:
        return cot.estado.replace(/_/g, " ");
    }
  };

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

            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar solicitud del técnico</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que quieres cancelar la solicitud aceptada por este técnico? La cotización volverá a publicarse y otros técnicos podrán aceptarla.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCancelDialogOpen(false)}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      if (!cotizacionAReabrir) return;
                      try {
                        await reabrirCotizacion.mutateAsync(cotizacionAReabrir._id);
                        toast({ title: "Solicitud cancelada", description: "La cotización se publicó de nuevo." });
                      } catch (err: unknown) {
                        toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "No se pudo cancelar la solicitud." });
                      } finally {
                        setCancelDialogOpen(false);
                        setCotizacionAReabrir(null);
                      }
                    }}
                    disabled={reabrirCotizacion.status === "pending"}
                  >
                    {reabrirCotizacion.status === "pending" ? "Procesando..." : "Confirmar cancelación"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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
              {solicitudesPorAceptar.length > 0 && (
                <Card className="p-6 border border-amber-200 bg-amber-50">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
                      <div>
                        <p className="font-semibold">Tu técnico ya aceptó una cotización</p>
                        <p className="text-sm text-muted-foreground">
                          Confirma la cotización aquí para que el trabajo pueda comenzar.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {solicitudesPorAceptar.map((cot: Cotizacion) => (
                        <div key={cot._id} className="rounded-xl border border-border bg-white p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm text-muted-foreground">{cot.categoria}</p>
                                <Badge variant="secondary" className="text-xs uppercase">
                                  {getEstadoLabel(cot)}
                                </Badge>
                              </div>
                              <p className="font-medium">{cot.titulo}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/cotizacion/${cot._id}`}>
                                <Button size="sm" variant="outline">
                                  Ver detalles
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                onClick={async () => {
                                  try {
                                      await aceptarCotizacionCliente.mutateAsync(cot._id);
                                      toast({
                                        title: "Cotización confirmada",
                                        description: "El trabajo fue confirmado, ahora ve a tu cotización y hablen por whatsapp o en el chat.",
                                      });
                                  } catch (err: unknown) {
                                    toast({
                                      variant: "destructive",
                                      title: "No se pudo confirmar",
                                      description:
                                        err instanceof Error
                                          ? err.message
                                          : "Intenta de nuevo más tarde.",
                                    });
                                  }
                                }}
                                disabled={aceptarCotizacionCliente.status === "pending"}
                              >
                                {aceptarCotizacionCliente.status === "pending"
                                  ? "Confirmando..."
                                  : "Aceptar cotización"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setCotizacionAReabrir(cot);
                                  setCancelDialogOpen(true);
                                }}
                                disabled={reabrirCotizacion.status === "pending"}
                              >
                                {reabrirCotizacion.status === "pending" ? "Procesando..." : "Cancelar solicitud del técnico"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {esPerfilPropio && solicitudesTecnico.length > 0 && (
                <Card className="p-6 border border-sky-200 bg-sky-50">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-sky-600 mt-1" />
                      <div>
                        <p className="font-semibold">Cotizaciones para ti</p>
                        <p className="text-sm text-muted-foreground">
                          Estas son las solicitudes y órdenes asociadas a tu perfil de técnico.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {solicitudesTecnico.map((cot: Cotizacion) => (
                        <div key={cot._id} className="rounded-xl border border-border bg-white p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm text-muted-foreground">{cot.categoria}</p>
                                <Badge variant="secondary" className="text-xs uppercase">
                                  {getEstadoLabel(cot)}
                                </Badge>
                              </div>
                              <p className="font-medium">{cot.titulo}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/cotizacion/${cot._id}`}>
                                <Button size="sm" variant="outline">
                                  Ver detalles
                                </Button>
                              </Link>
                              {cot.estado === "pendiente" && (
                                <Badge variant="secondary" className="text-xs uppercase">
                                  Nueva solicitud
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
              {usuario?.tipo === "cliente" && solicitudesPorAceptar.length > 0 && (
                <Card className="p-6 border border-amber-200 bg-amber-50">
                  <div className="space-y-4">
                    <p className="font-semibold">Acuerda los detalles con el técnico</p>
                    <p className="text-sm text-muted-foreground">
                      El técnico ya aceptó tu solicitud. Confirma la cotización aquí para ver su WhatsApp y correo, y posteriormente ponte de acuerdo con él.
                    </p>
                  </div>
                </Card>
              )}

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
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <p className="text-3xl font-semibold tracking-tight">
                          {especialista.usuario_id?.nombre ?? "Técnico"}
                        </p>
                        {cotizacionActiva && (
                          <Badge variant="secondary" className="text-xs uppercase">
                            {getEstadoLabel(cotizacionActiva)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`w-4 h-4 ${index < Math.round(averageRating) ? "text-amber-400" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                        <span>
                          {totalReviews > 0
                            ? `${roundedAverage.toFixed(1)} · ${totalReviews} reseña${totalReviews === 1 ? "" : "s"}`
                            : "Aún no tiene reseñas"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    {whatsappLink && puedeVerContacto ? (
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

                  {!puedeVerContacto && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Primero confirma la cotización para ver el WhatsApp y correo del técnico.
                    </p>
                  )}

                  <p className="text-sm text-muted-foreground mt-4">{bio || "No hay descripción disponible."}</p>

                  <div className="mt-6 grid gap-4">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">Especialidad</p>
                      <p className="font-medium mt-1">{especialidad}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">Precio por visita</p>
                        <span className="text-xs font-semibold text-destructive">(obligatorio)</span>
                      </div>
                      <p className="font-medium mt-1">
                        {especialista.precio_hora ? `$${especialista.precio_hora} por visita` : "Precio pendiente"}
                      </p>
                    </div>
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
                {puedeVerContacto ? (
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
                ) : (
                  <div className="mt-5 rounded-xl border border-border bg-slate-50 p-4 text-sm text-muted-foreground">
                    Confirma la cotización para ver el WhatsApp y correo del técnico, y después coordina los detalles con él.
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold">Imágenes del Técnico</h2>
                {esPerfilPropio && (
                  <div className="mt-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files ? Array.from(e.target.files) : [];
                        setSelectedFilesEsp(files);
                        setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
                      }}
                    />
                    {previewUrls.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {previewUrls.slice(0, 4).map((u, i) => (
                          <img key={i} src={u} alt={`preview-${i}`} className="h-20 w-20 object-cover rounded-md" />
                        ))}
                      </div>
                    )}
                    <div className="mt-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (selectedFilesEsp.length === 0 || !especialista) return;
                          try {
                            await uploadEspecialista.mutateAsync({ especialistaId: especialista._id, files: selectedFilesEsp });
                            toast({ title: "Imágenes subidas", description: "Se agregaron las imágenes al perfil." });
                            setSelectedFilesEsp([]);
                            setPreviewUrls([]);
                          } catch (err: unknown) {
                            toast({ variant: "destructive", title: "Error", description: err instanceof Error ? err.message : "No se pudieron subir las imágenes." });
                          }
                        }}
                        disabled={uploadEspecialista.status === "pending"}
                      >
                        {uploadEspecialista.status === "pending" ? "Subiendo..." : "Subir imágenes"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  {especialista?.imagenes && especialista.imagenes.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {especialista.imagenes.slice(0, 4).map((src: string) => {
                          const imageUrl = src.startsWith("http") ? src : `${API_ORIGIN}${src}`;
                          return (
                            <div
                              key={src}
                              className="overflow-hidden rounded-md border border-border bg-background cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedImageUrl(imageUrl)}
                            >
                              <img src={imageUrl} alt="Trabajo" className="h-28 w-full object-cover" />
                            </div>
                          );
                        })}
                      </div>
                      {especialista.imagenes.length > 4 && (
                        <div className="mt-3">
                          <Button size="sm" onClick={() => setShowAllPhotos(true)}>Ver todas las fotos</Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aún no hay fotos cargadas por este técnico.</p>
                  )}
                </div>

                {showAllPhotos && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-auto p-6 rounded-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Todas las fotos</h3>
                        <Button size="sm" variant="outline" onClick={() => setShowAllPhotos(false)}>Cerrar</Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {especialista.imagenes.map((src: string) => {
                          const imageUrl = src.startsWith("http") ? src : `${API_ORIGIN}${src}`;
                          return (
                            <div
                              key={src}
                              className="overflow-hidden rounded-md border border-border bg-background cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedImageUrl(imageUrl)}
                            >
                              <img src={imageUrl} alt="Trabajo" className="h-48 w-full object-cover" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {selectedImageUrl && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
                      <button
                        onClick={() => setSelectedImageUrl(null)}
                        className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors z-10"
                      >
                        <span className="text-2xl">×</span>
                      </button>
                      <img
                        src={selectedImageUrl}
                        alt="Imagen ampliada"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
