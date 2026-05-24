import { ChangeEvent, useState } from "react";
import { Link, useRoute } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  useCotizacion,
  useSubirImagenesCotizacion,
  useAceptarCotizacionPorTecnico,
  useAceptarCotizacionPorCliente,
  useConfirmarTrabajo,
} from "@/hooks/useApi";
import { API_ORIGIN } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export default function CotizacionDetalle() {
  const [match, params] = useRoute("/cotizacion/:id");
  const cotizacionId = params?.id ?? "";
  const { usuario } = useAuth();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data, isLoading, isError, error } = useCotizacion(cotizacionId);
  const uploadMutation = useSubirImagenesCotizacion();

  const cot = data?.cotizacion;
  const esPropietario = usuario?._id === cot?.cliente_id?._id;
  const telefonoCliente = cot?.cliente_id?.telefono?.replace(/\D/g, "");
  const whatsappLink = telefonoCliente
    ? `https://wa.me/${telefonoCliente.length === 10 ? `52${telefonoCliente}` : telefonoCliente}`
    : null;

  const aceptarCotizacionTecnico = useAceptarCotizacionPorTecnico();
  const aceptarCotizacionCliente = useAceptarCotizacionPorCliente();
  const confirmarTrabajo = useConfirmarTrabajo();

  const aceptandoTecnico = aceptarCotizacionTecnico.status === "pending";
  const aceptandoCliente = aceptarCotizacionCliente.status === "pending";
  const confirmandoTrabajo = confirmarTrabajo.status === "pending";
  const subiendoImagenes = uploadMutation.status === "pending";

  const puedeAceptarComoTecnico = usuario?.tipo === "tecnico" && cot?.estado === "pendiente";
  const puedeAceptarComoCliente = usuario?.tipo === "cliente" && cot?.estado === "en_revision";
  const puedeConfirmarTrabajo = usuario?.tipo === "cliente" && cot?.estado === "aceptada" && cot?.trabajo_id?.estado !== "completado";

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setSelectedFiles(Array.from(event.target.files));
  };

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

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Detalle de publicación</p>
            <h1 className="text-3xl font-bold">Cotización</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Revisa la solicitud del cliente, sube imágenes si eres el dueño y contacta por WhatsApp.
            </p>
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
                      Estado: {cot.estado.replace("_", " ")}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold">{cot.descripcion}</h2>
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
                    <p className="mt-2 text-sm">{cot.estado.replace("_", " ")} • {cot.codigo_postal}</p>
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
                <a
                  href={`mailto:${cot.cliente_id.email}`}
                  className="inline-flex items-center gap-2"
                >
                  <Button size="sm" variant="outline" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Enviar correo
                  </Button>
                </a>

                {puedeAceptarComoTecnico && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={async () => {
                      try {
                        await aceptarCotizacionTecnico.mutateAsync(cotizacionId);
                        toast({
                          title: "Cotización aceptada",
                          description: "Tu aceptación fue enviada y el cliente recibirá la notificación.",
                        });
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
                    disabled={aceptandoTecnico}
                  >
                    {aceptandoTecnico ? "Aceptando..." : "Aceptar trabajo"}
                  </Button>
                )}

                {puedeAceptarComoCliente && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    {cot.especialista_asignado?.usuario_id && (
                      <Link href={`/tecnico/${cot.especialista_asignado._id}`}>
                        <Button size="sm" variant="outline" className="gap-2">
                          Ver perfil del técnico
                        </Button>
                      </Link>
                    )}
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={async () => {
                        try {
                          await aceptarCotizacionCliente.mutateAsync(cotizacionId);
                          toast({
                            title: "Cotización confirmada",
                            description:
                              "La cotización pasó a pendiente y se creó el registro de trabajo.",
                          });
                        } catch (err: unknown) {
                          toast({
                            variant: "destructive",
                            title: "Error al confirmar",
                            description:
                              err instanceof Error
                                ? err.message
                                : "No se pudo confirmar la cotización.",
                          });
                        }
                      }}
                      disabled={aceptandoCliente}
                    >
                      {aceptandoCliente ? "Confirmando..." : "Aceptar cotización"}
                    </Button>
                  </div>
                )}

                {puedeConfirmarTrabajo && cot.trabajo_id && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await confirmarTrabajo.mutateAsync({ trabajoId: cot?.trabajo_id?._id ?? "" });
                        toast({
                          title: "Trabajo confirmado",
                          description: "El trabajo se marcó como completado.",
                        });
                      } catch (err: unknown) {
                        toast({
                          variant: "destructive",
                          title: "Error al confirmar trabajo",
                          description:
                            err instanceof Error
                              ? err.message
                              : "No se pudo confirmar el trabajo.",
                        });
                      }
                    }}
                    disabled={confirmandoTrabajo}
                  >
                    {confirmandoTrabajo ? "Confirmando..." : "Confirmar trabajo realizado"}
                  </Button>
                )}
              </div>
            </Card>

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
    </div>
  );
}
