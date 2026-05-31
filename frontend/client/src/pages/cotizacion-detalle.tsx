import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  useCotizacion,
  useMensajes,
  useEnviarMensaje,
  useSubirImagenesCotizacion,
  useAceptarCotizacionPorTecnico,
  useRechazarCotizacionPorTecnico,
  useConfirmarTrabajo,
  useCalificarTrabajo,
} from "@/hooks/useApi";
import { API_ORIGIN } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Clock,
  MapPin,
  FileText,
  ImagePlus,
  Phone,
  ExternalLink,
  Star,
} from "lucide-react";
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

export default function CotizacionDetalle() {
  const [match, params] = useRoute("/cotizacion/:id");
  const cotizacionId = params?.id ?? "";
  const { usuario } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mensajeTexto, setMensajeTexto] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError, error } = useCotizacion(cotizacionId);
  const mensajesQuery = useMensajes(cotizacionId);
  const enviarMensaje = useEnviarMensaje();
  const uploadMutation = useSubirImagenesCotizacion();

  const cot = data?.cotizacion;
  const esPropietario = usuario?._id === cot?.cliente_id?._id;
  const telefonoCliente = cot?.cliente_id?.telefono?.replace(/\D/g, "");
  const whatsappLink = telefonoCliente
    ? `https://wa.me/${telefonoCliente.length === 10 ? `52${telefonoCliente}` : telefonoCliente}`
    : null;

  const aceptarCotizacionTecnico = useAceptarCotizacionPorTecnico();
  const rechazarCotizacionTecnico = useRechazarCotizacionPorTecnico();
  const confirmarTrabajo = useConfirmarTrabajo();
  const calificarTrabajo = useCalificarTrabajo();

  const aceptandoTecnico = aceptarCotizacionTecnico.status === "pending";
  const rechazandoTecnico = rechazarCotizacionTecnico.status === "pending";
  const enviandoMensaje = enviarMensaje.status === "pending";
  const confirmandoTrabajo = confirmarTrabajo.status === "pending";
  const calificando = calificarTrabajo.status === "pending";
  const subiendoImagenes = uploadMutation.status === "pending";

  const puedeAceptarComoTecnico = usuario?.tipo === "tecnico" && cot?.estado === "pendiente";
  const puedeReportarTrabajoRealizado = usuario?.tipo === "tecnico" && ["aceptada", "en_revision"].includes(cot?.estado ?? "");
  const puedeConfirmarTrabajo = usuario?.tipo === "cliente" && cot?.estado === "pendiente_confirmacion";
  const puedeChatear =
    cot?.especialista_asignado?.usuario_id?._id &&
    (usuario?.tipo === "cliente" ||
      (usuario?.tipo === "tecnico" && usuario?._id === cot.especialista_asignado?.usuario_id?._id));
  const puedeCalificar =
    usuario?.tipo === "cliente" &&
    esPropietario &&
    cot?.estado === "completada" &&
    !cot?.trabajo_id?.calificado;
  const estadoCotizacion = cot?.estado === "completada" ? "terminada" : cot?.estado;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setSelectedFiles(Array.from(event.target.files));
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensajesQuery.data?.mensajes]);

  const mensajesActuales = mensajesQuery.data?.mensajes ?? [];
  const systemNotificationTexts = [
    "El técnico ha aceptado tu cotización. La cotización está en proceso y ahora puedes confirmarla para continuar.",
    "El técnico ha rechazado tu cotización. Puedes solicitar otro técnico o enviar una nueva solicitud.",
    "El cliente ha confirmado tu cotización. El trabajo está en proceso y pronto podrás marcarlo como realizado.",
  ];
  const notificacionesSistema = mensajesActuales.filter((msg) =>
    systemNotificationTexts.includes(msg.texto)
  );
  const chatMensajes = mensajesActuales.filter(
    (msg) => !systemNotificationTexts.includes(msg.texto)
  );

  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingEstrellas, setRatingEstrellas] = useState(5);
  const [ratingComentario, setRatingComentario] = useState("");

  const handleUpload = async () => {
    if (!cotizacionId || selectedFiles.length === 0) return;

    try {
      await uploadMutation.mutateAsync({ cotizacionId, files: selectedFiles });
      toast({
        title: "Imágenes subidas",
        description: "Las imágenes se agregaron correctamente a la cotización.",
      });
      setSelectedFiles([]);
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Error al subir imágenes",
        description:
          err instanceof Error
            ? err.message
            : "No se pudieron subir las imágenes. Intenta de nuevo.",
      });
    }
  };

  const handleEnviarCalificacion = async () => {
    if (!cot?.trabajo_id?._id || !cot?.especialista_asignado?._id) return;

    try {
      await calificarTrabajo.mutateAsync({
        trabajo_id: cot.trabajo_id._id,
        comentario: ratingComentario,
        estrellas: ratingEstrellas,
        a_quien: cot.especialista_asignado.usuario_id?._id ?? "",
        especialista_id: cot.especialista_asignado._id,
        tipo: "cliente_a_tecnico",
      });
      toast({
        title: "Gracias por calificar",
        description: "Tu opinión se envió correctamente.",
      });
      setRatingDialogOpen(false);
      setRatingEstrellas(5);
      setRatingComentario("");
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Error al calificar",
        description:
          err instanceof Error
            ? err.message
            : "No se pudo enviar la calificación. Intenta de nuevo.",
      });
    }
  };

  const handleEnviarMensaje = async () => {
    if (!cot || !mensajeTexto.trim()) return;
    const destinatario = usuario?.tipo === "cliente"
      ? cot.especialista_asignado?.usuario_id?._id
      : cot.cliente_id?._id;
    if (!destinatario) return;

    try {
      await enviarMensaje.mutateAsync({
        cotizacion_id: cot._id,
        para: destinatario,
        texto: mensajeTexto.trim(),
      });
      setMensajeTexto("");
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar el mensaje",
        description: err instanceof Error ? err.message : "Intenta de nuevo más tarde.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Detalle de publicación</p>
            <h1 className="text-3xl font-bold">Cotización</h1>
            
          </div>
          <Link href={usuario?.tipo === "tecnico" ? "/nuevos-trabajos" : "/perfil"}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Button>
          </Link>
        </div>

        {isLoading && (
          <Card className="p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        )}

        {isError && (
          <Card className="p-6 text-center">
            <p className="font-semibold">No se pudo cargar la cotización.</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : "Intenta de nuevo más tarde."}
            </p>
          </Card>
        )}

        {cot && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="grid gap-6 lg:grid-cols-[1.7fr_0.95fr]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {cot.categoria}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{cot.codigo_postal}</span>
                    <span className="text-sm text-muted-foreground capitalize">
                      Estado: {estadoCotizacion?.replace("_", " ")}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold">{cot.titulo}</h2>
                  {cot.descripcion && (
                    <p className="text-sm text-muted-foreground">{cot.descripcion}</p>
                  )}
                  {cot.imagenes && cot.imagenes.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {cot.imagenes.map((src) => {
                        const imageUrl = src.startsWith("http") ? src : `${API_ORIGIN}${src}`;
                        return (
                          <div key={src} className="overflow-hidden rounded-xl border border-border bg-background">
                            <img src={imageUrl} alt="Imagen de la cotización" className="h-52 w-full object-cover" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Ubicación</p>
                    <p className="mt-2 text-sm">{cot.ubicacion}</p>
                  </div>
                  {cot.fecha_preferida && (
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Fecha preferida</p>
                      <p className="mt-2 text-sm">{new Date(cot.fecha_preferida).toLocaleDateString("es-MX")}</p>
                    </div>
                  )}
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Resumen</p>
                    <p className="mt-2 text-sm">{estadoCotizacion?.replace("_", " ")} • {cot.codigo_postal}</p>
                    {(cot.monto_final ?? cot.monto_estimado) != null && (
                      <p className="mt-2 text-sm">Presupuesto: ${(cot.monto_final ?? cot.monto_estimado)?.toLocaleString("es-MX")} MXN</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</p>
                    <div className="mt-2">
                      <p className="font-medium">{cot.cliente_id.nombre}</p>
                      <p className="text-sm text-muted-foreground">{cot.cliente_id.ciudad ?? "Ciudad no registrada"}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Contacto</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">{cot.cliente_id.email}</p>
                      <p className="text-sm">{cot.cliente_id.telefono ?? "Teléfono no disponible"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {usuario?.tipo === "tecnico" && whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Button size="sm" className="gap-2">
                      <Phone className="w-4 h-4" />
                      Contactar por WhatsApp
                    </Button>
                  </a>
                )}
                {usuario?.tipo === "tecnico" && (
                  <a
                    href={`mailto:${cot.cliente_id.email}`}
                    className="inline-flex items-center gap-2"
                  >
                    <Button size="sm" variant="outline" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Enviar correo
                    </Button>
                  </a>
                )}
                {puedeCalificar && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setRatingDialogOpen(true)}
                  >
                    Calificar técnico
                  </Button>
                )}

                {puedeAceptarComoTecnico && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={async () => {
                        try {
                          const res = await aceptarCotizacionTecnico.mutateAsync(cotizacionId);
                          toast({
                            title: "Cotización aceptada",
                            description: "Tu aceptación fue enviada y el cliente recibirá la notificación.",
                          });
                          const trabajoId = res?.cotizacion?.trabajo_id?._id ?? res?.cotizacion?.trabajo_id;
                          if (trabajoId) {
                            navigate(`/trabajos/${trabajoId}`);
                          }
                        } catch (err: unknown) {
                          toast({
                            variant: "destructive",
                            title: "Error al aceptar",
                            description:
                              err instanceof Error
                                ? err.message
                                : "No se pudo aceptar la cotización.",
                          });
                        }
                      }}
                      disabled={aceptandoTecnico || rechazandoTecnico}
                    >
                      {aceptandoTecnico ? "Aceptando..." : "Aceptar trabajo"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await rechazarCotizacionTecnico.mutateAsync(cotizacionId);
                          toast({
                            title: "Cotización rechazada",
                            description: "El cliente recibió la notificación de rechazo.",
                          });
                        } catch (err: unknown) {
                          toast({
                            variant: "destructive",
                            title: "Error al rechazar",
                            description:
                              err instanceof Error
                                ? err.message
                                : "No se pudo rechazar la cotización.",
                          });
                        }
                      }}
                      disabled={aceptandoTecnico || rechazandoTecnico}
                    >
                      {rechazandoTecnico ? "Rechazando..." : "Rechazar cotización"}
                    </Button>
                  </div>
                )}


                {puedeReportarTrabajoRealizado && cot.trabajo_id && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await confirmarTrabajo.mutateAsync({ trabajoId: cot?.trabajo_id?._id ?? "", estado: "pendiente_confirmacion" });
                        toast({
                          title: "Solicitud de término enviada",
                          description: "El cliente podrá confirmar que el trabajo fue terminado.",
                        });
                      } catch (err: unknown) {
                        toast({
                          variant: "destructive",
                          title: "Error al terminar la cotización",
                          description:
                            err instanceof Error
                              ? err.message
                              : "No se pudo terminar la cotización.",
                        });
                      }
                    }}
                    disabled={confirmandoTrabajo}
                  >
                    {confirmandoTrabajo ? "Procesando..." : "Terminar cotización"}
                  </Button>
                )}

                {puedeConfirmarTrabajo && cot.trabajo_id && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await confirmarTrabajo.mutateAsync({ trabajoId: cot?.trabajo_id?._id ?? "", estado: "completado" });
                          toast({
                            title: "Cotización terminada",
                            description: "El trabajo se marcó como completado y podrás calificar al técnico.",
                          });
                        } catch (err: unknown) {
                          toast({
                            variant: "destructive",
                            title: "Error al terminar la cotización",
                            description:
                              err instanceof Error
                                ? err.message
                                : "No se pudo terminar la cotización.",
                          });
                        }
                      }}
                      disabled={confirmandoTrabajo}
                    >
                      {confirmandoTrabajo ? "Procesando..." : "Terminar cotización"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await confirmarTrabajo.mutateAsync({ trabajoId: cot?.trabajo_id?._id ?? "", estado: "inconcluso" });
                          toast({
                            title: "Trabajo marcado como inconcluso",
                            description: "El trabajo fue marcado como inconcluso y se guardará en el historial.",
                          });
                        } catch (err: unknown) {
                          toast({
                            variant: "destructive",
                            title: "Error al marcar inconcluso",
                            description:
                              err instanceof Error
                                ? err.message
                                : "No se pudo marcar el trabajo como inconcluso.",
                          });
                        }
                      }}
                      disabled={confirmandoTrabajo}
                    >
                      {confirmandoTrabajo ? "Enviando..." : "Marcar inconcluso"}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {puedeChatear && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4" />
                  <h2 className="text-lg font-semibold">Chat de la cotización</h2>
                </div>
                <div className="space-y-4">
                  {notificacionesSistema.length > 0 && (
                    <div className="space-y-2 rounded-2xl border border-border bg-slate-50 p-4">
                      {notificacionesSistema.map((msg) => (
                        <div key={msg._id} className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Notificación</p>
                          <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{msg.texto}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    ref={scrollRef}
                    className="max-h-96 overflow-y-auto space-y-3 rounded-2xl border border-border bg-background p-4"
                  >
                    {mensajesQuery.isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ) : chatMensajes.length ? (
                      chatMensajes.map((msg) => {
                        const miId = usuario?._id ? String(usuario._id) : null;
                        const remitenteId = msg.de?._id ? String(msg.de._id) : null;
                        const esMio = miId !== null && remitenteId !== null && miId === remitenteId;
                        return (
                          <div
                            key={msg._id}
                            className={`rounded-2xl p-3 ${esMio ? "bg-primary/10 self-end text-right" : "bg-slate-100 text-left"}`}
                          >
                            <p className="text-xs text-muted-foreground">
                              {esMio ? "Tú" : msg.de.nombre || "Usuario"} · {new Date(msg.createdAt).toLocaleString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <p className="mt-2 whitespace-pre-wrap">{msg.texto}</p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">Aún no hay mensajes en este chat.</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Textarea
                      value={mensajeTexto}
                      onChange={(event) => setMensajeTexto(event.target.value)}
                      onKeyDown={async (event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          await handleEnviarMensaje();
                        }
                      }}
                      placeholder="Escribe tu mensaje..."
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleEnviarMensaje}
                        disabled={enviandoMensaje || !mensajeTexto.trim()}
                      >
                        {enviandoMensaje ? "Enviando..." : "Enviar mensaje"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {esPropietario && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ImagePlus className="w-4 h-4" />
                  <h2 className="text-lg font-semibold">Subir imágenes</h2>
                </div>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full text-sm text-muted-foreground"
                  />
                  {selectedFiles.length > 0 && (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {selectedFiles.map((file) => (
                        <p key={file.name}>{file.name}</p>
                      ))}
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || subiendoImagenes}
                  >
                    {subiendoImagenes ? "Subiendo..." : "Subir imágenes"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
      <AlertDialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Calificar al técnico</AlertDialogTitle>
            <AlertDialogDescription>
              Valora el trabajo realizado y comparte un comentario sobre tu experiencia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 px-6 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Estrellas: {ratingEstrellas}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={ratingEstrellas}
              onChange={(event) => setRatingEstrellas(Number(event.target.value))}
              className="w-full"
            />
            <Textarea
              value={ratingComentario}
              onChange={(event) => setRatingComentario(event.target.value)}
              placeholder="Deja tu comentario sobre el trabajo..."
              className="min-h-[120px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnviarCalificacion}
              disabled={calificando || ratingComentario.trim().length === 0}
            >
              {calificando ? "Enviando..." : "Enviar calificación"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
