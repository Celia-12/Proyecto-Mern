import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  useCotizaciones,
  useCancelarCotizacion,
  useAceptarCotizacionPorCliente,
  useConfirmarTrabajo,
  useCalificarTrabajo,
} from "@/hooks/useApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  MapPin,
  Calendar,
  Star,
} from "lucide-react";

interface Cotizacion {
  _id: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  estado: string;
  createdAt: string;
  monto_estimado?: number;
  monto_final?: number;
  especialista_asignado?: {
    _id: string;
    usuario_id?: {
      _id: string;
      nombre: string;
      foto?: string;
      ciudad?: string;
      telefono?: string;
    };
  };
  trabajo_id?: {
    _id: string;
    estado: string;
    calificado: boolean;
    fecha_inicio?: string;
    monto?: number;
  };
}

const ESTADO_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  pendiente: {
    label: "Pendiente",
    variant: "secondary",
    icon: <Clock className="w-3 h-3" />,
  },
  en_revision: {
    label: "En revisión",
    variant: "default",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  aceptada: {
    label: "Aceptada",
    variant: "default",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  completada: {
    label: "Completada",
    variant: "outline",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  rechazada: {
    label: "Cancelada por el cliente",
    variant: "destructive",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const CATEGORIA_EMOJIS: Record<string, string> = {
  "Plomería": "💧",
  "Electricidad": "⚡",
  "Carpintería": "🔨",
  "Cerrajería": "🔐",
  "Aire Acondicionado": "❄️",
  "Mantenimiento General": "🔧",
};

function CotizacionCard({
  cot,
  onCancel,
  canceling,
  detailHref,
  actions,
}: {
  cot: Cotizacion;
  onCancel?: () => void;
  canceling?: boolean;
  detailHref?: string;
  actions?: React.ReactNode;
}) {
  const config = ESTADO_CONFIG[cot.estado] ?? ESTADO_CONFIG.pendiente;
  const fecha = new Date(cot.createdAt).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const puedeCancelar = ["pendiente", "en_revision"].includes(cot.estado);

  return (
    <Card className="p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{CATEGORIA_EMOJIS[cot.categoria] ?? "🔧"}</span>
            <span className="font-medium">{cot.categoria}</span>
            <Badge variant={config.variant} className="gap-1 text-xs ml-auto shrink-0">
              {config.icon}
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{cot.descripcion}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {cot.ubicacion}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {fecha}
            </span>
            {(cot.monto_estimado || cot.monto_final) && (
              <span className="font-medium text-foreground">
                ${(cot.monto_final ?? cot.monto_estimado)?.toLocaleString("es-MX")} MXN
              </span>
            )}
          </div>
          {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
        </div>
        <div className="flex items-center gap-2">
          {detailHref && (
            <Link href={detailHref}>
              <Button size="sm" variant="outline" className="whitespace-nowrap">
                Ver detalles
              </Button>
            </Link>
          )}
          {onCancel && puedeCancelar && (
            <Button size="sm" variant="outline" onClick={onCancel} disabled={canceling}>
              {canceling ? "Cancelando..." : "Cancelar"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Perfil() {
  const { usuario, actualizarPerfil, logout } = useAuth();
  const { data, isLoading } = useCotizaciones();
  const cancelarCotizacion = useCancelarCotizacion();
  const aceptarCotizacionCliente = useAceptarCotizacionPorCliente();
  const confirmarTrabajo = useConfirmarTrabajo();
  const calificarTrabajo = useCalificarTrabajo();
  const cancelando = cancelarCotizacion.status === "pending";
  const aceptandoCliente = aceptarCotizacionCliente.status === "pending";
  const confirmandoTrabajo = confirmarTrabajo.status === "pending";
  const calificando = calificarTrabajo.status === "pending";
  const { toast } = useToast();
  const [cotizacionACancelar, setCotizacionACancelar] = useState<Cotizacion | null>(null);
  const [cotizacionAConfirmar, setCotizacionAConfirmar] = useState<Cotizacion | null>(null);
  const [cotizacionACalificar, setCotizacionACalificar] = useState<Cotizacion | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingEstrellas, setRatingEstrellas] = useState(5);
  const [ratingComentario, setRatingComentario] = useState("");
  const [bioDraft, setBioDraft] = useState(usuario?.bio ?? "");
  const [postalDraft, setPostalDraft] = useState(usuario?.codigo_postal ?? "");
  const [precioVisitaDraft, setPrecioVisitaDraft] = useState(
    usuario?.precio_hora?.toString() ?? ""
  );
  const [guardandoBio, setGuardandoBio] = useState(false);
  const [guardandoPostal, setGuardandoPostal] = useState(false);
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);

  const esTecnico = usuario?.tipo === "tecnico";
  const cotizaciones: Cotizacion[] = data?.cotizaciones ?? [];

  useEffect(() => {
    setBioDraft(usuario?.bio ?? "");
    setPostalDraft(usuario?.codigo_postal ?? "");
    setPrecioVisitaDraft(usuario?.precio_hora?.toString() ?? "");
  }, [usuario?.bio, usuario?.codigo_postal, usuario?.precio_hora]);
  const notificaciones = cotizaciones.filter((c) => c.estado === "en_revision");
  const activas = cotizaciones.filter((c) =>
    esTecnico
      ? ["aceptada"].includes(c.estado)
      : ["pendiente", "en_revision", "aceptada"].includes(c.estado)
  );
  const historial = cotizaciones.filter((c) =>
    esTecnico ? ["completada"].includes(c.estado) : ["completada", "rechazada"].includes(c.estado)
  );

  const initials =
    usuario?.nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Profile header card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-border">
              <AvatarImage src={usuario?.foto ?? undefined} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{usuario?.nombre}</h1>
                <Badge variant="outline" className="capitalize">
                  {usuario?.tipo}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{usuario?.email}</p>
              {usuario?.tipo === "tecnico" && usuario?.especialidad && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Oficio: <span className="font-semibold">{usuario.especialidad}</span>
                </p>
              )}
              {usuario?.ciudad && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {usuario.ciudad}
                </p>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <Link href="/cotizacion">
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Nueva cotización
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-destructive hover:text-destructive"
              >
                Salir
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            {[
              {
                label: "Total solicitudes",
                value: esTecnico ? activas.length + historial.length : cotizaciones.length,
              },
              {
                label: esTecnico ? "Aceptadas" : "Activas",
                value: activas.length,
              },
              { label: "Completadas", value: historial.filter((c) => c.estado === "completada").length },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold">{isLoading ? "—" : value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Información de la cuenta</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Nombre", value: usuario?.nombre },
                  { label: "Correo", value: usuario?.email },
                  { label: "Teléfono", value: usuario?.telefono ?? "No registrado" },
                  { label: "Ciudad", value: usuario?.ciudad ?? "No registrada" },
                  { label: "Código postal", value: usuario?.codigo_postal ?? "No registrado" },
                  ...(esTecnico
                    ? [{ label: "Precio por visita", value: usuario?.precio_hora ? `$${usuario.precio_hora}` : "No registrado" }]
                    : []),
                  { label: "Tipo de cuenta", value: usuario?.tipo },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <p className="text-muted-foreground text-xs uppercase font-medium tracking-wide">
                      {label}
                    </p>
                    <p className="capitalize">{value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <p className="text-muted-foreground text-xs uppercase font-medium tracking-wide">
                  Código postal
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <Input
                    value={postalDraft}
                    onChange={(event) => setPostalDraft(event.target.value)}
                    placeholder="Ej. 64000"
                    inputMode="numeric"
                    maxLength={5}
                    className="max-w-sm"
                  />
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (!/^[0-9]{5}$/.test(postalDraft)) {
                        toast({
                          variant: "destructive",
                          title: "Código postal no válido",
                          description: "Ingresa un código postal de 5 dígitos.",
                        });
                        return;
                      }

                      setGuardandoPostal(true);
                      try {
                        await actualizarPerfil({ codigo_postal: postalDraft });
                        toast({
                          title: "Código postal actualizado",
                          description: "Tu perfil se ha guardado correctamente.",
                        });
                      } catch (err: unknown) {
                        toast({
                          variant: "destructive",
                          title: "Error al guardar",
                          description:
                            err instanceof Error
                              ? err.message
                              : "No se pudo actualizar el código postal.",
                        });
                      } finally {
                        setGuardandoPostal(false);
                      }
                    }}
                    disabled={guardandoPostal}
                  >
                    {guardandoPostal ? "Guardando..." : "Guardar código postal"}
                  </Button>
                </div>
              </div>

              {esTecnico && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-muted-foreground text-xs uppercase font-medium tracking-wide">
                    Precio por visita
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={precioVisitaDraft}
                      onChange={(event) => setPrecioVisitaDraft(event.target.value)}
                      placeholder="Ej. 550"
                      className="max-w-sm"
                    />
                    <Button
                      size="sm"
                      onClick={async () => {
                        const valor = Number(precioVisitaDraft);
                        if (Number.isNaN(valor) || valor < 0) {
                          toast({
                            variant: "destructive",
                            title: "Precio inválido",
                            description: "Ingresa un monto válido para la visita.",
                          });
                          return;
                        }

                        setGuardandoPrecio(true);
                        try {
                          await actualizarPerfil({ precio_hora: valor });
                          toast({
                            title: "Precio actualizado",
                            description: "Tu precio por visita se guardó correctamente.",
                          });
                        } catch (err: unknown) {
                          toast({
                            variant: "destructive",
                            title: "Error al guardar",
                            description:
                              err instanceof Error
                                ? err.message
                                : "No se pudo actualizar el precio por visita.",
                          });
                        } finally {
                          setGuardandoPrecio(false);
                        }
                      }}
                      disabled={guardandoPrecio}
                    >
                      {guardandoPrecio ? "Guardando..." : "Guardar precio"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <p className="text-muted-foreground text-xs uppercase font-medium tracking-wide">
                  Descripción
                </p>
                {esTecnico ? (
                  <div className="space-y-3">
                    <Textarea
                      value={bioDraft}
                      onChange={(event) => setBioDraft(event.target.value)}
                      placeholder="Resumen de tu experiencia, habilidades o cualquier información que quieras compartir con los clientes."
                      className="min-h-[120px]"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          setGuardandoBio(true);
                          try {
                            await actualizarPerfil({ bio: bioDraft });
                            toast({
                              title: "Descripción actualizada",
                              description: "Tu perfil se ha guardado correctamente.",
                            });
                          } catch (err: unknown) {
                            toast({
                              variant: "destructive",
                              title: "Error al guardar",
                              description:
                                err instanceof Error
                                  ? err.message
                                  : "No se pudo actualizar la descripción.",
                            });
                          } finally {
                            setGuardandoBio(false);
                          }
                        }}
                        disabled={guardandoBio}
                      >
                        {guardandoBio ? "Guardando..." : "Guardar descripción"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBioDraft(usuario?.bio ?? "")}
                      >
                        Restablecer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {usuario?.bio ?? "Sin descripción agregada."}
                  </p>
                )}
              </div>

              
            </Card>

        {/* Cotizaciones tabs */}
        <Tabs defaultValue="activas">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="activas" className="gap-1.5">
              <FileText className="w-4 h-4" />
              Cotizaciones Activas
              {activas.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
                  {activas.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="historial" className="gap-1.5">
              <Clock className="w-4 h-4" />
              Historial
            </TabsTrigger>
            
          </TabsList>

          {/* Activas */}
          <TabsContent value="activas" className="mt-4 space-y-3">
            {isLoading &&
              Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-32" />
                </Card>
              ))}

            {!isLoading && notificaciones.length > 0 && (
              <Card className="p-5 border border-amber-200 bg-amber-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
                  <div>
                    <p className="font-semibold">Tienes solicitudes que esperan tu aprobación</p>
                    <p className="text-sm text-muted-foreground">
                      Un técnico aceptó tu solicitud. Revisa su perfil y confirma la cotización para que el trabajo pueda empezar.
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {notificaciones.map((cot) => (
                    <Card key={cot._id} className="p-4 bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{cot.categoria}</p>
                          <p className="font-medium">{cot.descripcion}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {cot.especialista_asignado?.usuario_id && (
                            <Link href={`/tecnico/${cot.especialista_asignado._id}`}>
                              <Button size="sm" variant="outline">
                                Ver perfil del técnico
                              </Button>
                            </Link>
                          )}
                          <Button
                            size="sm"
                            onClick={async () => {
                              setCotizacionAConfirmar(cot);
                              try {
                                await aceptarCotizacionCliente.mutateAsync(cot._id);
                                toast({
                                  title: "Cotización confirmada",
                                  description: "El trabajo pasó a estado pendiente y se creó el registro de trabajo.",
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
                            disabled={aceptandoCliente}
                          >
                            {aceptandoCliente ? "Confirmando..." : "Aceptar cotización"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {!isLoading && activas.length === 0 && (
              <Card className="p-10 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium">Sin solicitudes activas</p>
              </Card>
            )}

            {!isLoading && activas.map((cot) => {
              const puedeConfirmarTrabajo = cot.estado === "aceptada" && cot.trabajo_id?.estado !== "completado";
              const puedeCalificar = cot.trabajo_id?.estado === "completado" && !cot.trabajo_id.calificado;
              return (
                <CotizacionCard
                  key={cot._id}
                  cot={cot}
                  detailHref={`/cotizacion/${cot._id}`}
                  onCancel={() => {
                    setCotizacionACancelar(cot);
                    setCancelDialogOpen(true);
                  }}
                  canceling={cancelando}
                  actions={
                    <>
                      {puedeConfirmarTrabajo && cot.trabajo_id && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            try {
                              await confirmarTrabajo.mutateAsync({ trabajoId: cot.trabajo_id!._id });
                              toast({
                                title: "Trabajo confirmado",
                                description: "Marca como completado para poder calificar al técnico.",
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
                          disabled={confirmandoTrabajo}
                        >
                          {confirmandoTrabajo ? "Confirmando..." : "Confirmar trabajo realizado"}
                        </Button>
                      )}
                      {puedeCalificar && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCotizacionACalificar(cot);
                            setRatingDialogOpen(true);
                          }}
                        >
                          Calificar técnico
                        </Button>
                      )}
                    </>
                  }
                />
              );
            })}
          </TabsContent>

          {/* Historial */}
          <TabsContent value="historial" className="mt-4 space-y-3">
            {!isLoading && historial.length === 0 && (
              <Card className="p-10 text-center">
                <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium">Sin historial todavía</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Aquí aparecerán tus servicios completados.
                </p>
              </Card>
            )}
            {!isLoading && historial.map((cot) => (
              <CotizacionCard key={cot._id} cot={cot} />
            ))}
          </TabsContent>

          {/* Account info */}
          <TabsContent value="cuenta" className="mt-4">
            
          </TabsContent>
        </Tabs>

        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar cotización</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro que quieres cancelar la cotización de{' '}
                <span className="font-semibold">{cotizacionACancelar?.categoria}</span>{' '}
                para <span className="font-semibold">{cotizacionACancelar?.ubicacion}</span>?
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setCancelDialogOpen(false)}
                disabled={cancelando}
              >
                Volver
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!cotizacionACancelar) return;
                  try {
                    await cancelarCotizacion.mutateAsync(cotizacionACancelar._id);
                    toast({
                      title: "Cotización cancelada",
                      description: "Tu solicitud fue cancelada correctamente.",
                    });
                  } catch (err: unknown) {
                    toast({
                      variant: "destructive",
                      title: "Error al cancelar",
                      description:
                        err instanceof Error
                          ? err.message
                          : "No se pudo cancelar la cotización.",
                    });
                  } finally {
                    setCancelDialogOpen(false);
                    setCotizacionACancelar(null);
                  }
                }}
              >
                {cancelando ? "Cancelando..." : "Confirmar cancelación"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Calificar al técnico</AlertDialogTitle>
              <AlertDialogDescription>
                Déjale una reseña al técnico una vez que el trabajo esté completado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Estrellas</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((valor) => (
                    <Button
                      key={valor}
                      size="sm"
                      variant={ratingEstrellas === valor ? "secondary" : "outline"}
                      onClick={() => setRatingEstrellas(valor)}
                    >
                      {valor} <Star className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Comentario</p>
                <Textarea
                  value={ratingComentario}
                  onChange={(event) => setRatingComentario(event.target.value)}
                  placeholder="Escribe tu opinión sobre el trabajo"
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setRatingDialogOpen(false);
                  setCotizacionACalificar(null);
                }}
                disabled={calificando}
              >
                Volver
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!cotizacionACalificar?.trabajo_id || !cotizacionACalificar.especialista_asignado?.usuario_id) {
                    return;
                  }

                  try {
                    await calificarTrabajo.mutateAsync({
                      trabajo_id: cotizacionACalificar.trabajo_id._id,
                      a_quien: cotizacionACalificar.especialista_asignado.usuario_id._id,
                      especialista_id: cotizacionACalificar.especialista_asignado._id,
                      estrellas: ratingEstrellas,
                      comentario: ratingComentario,
                      tipo: "cliente_a_tecnico",
                    });
                    toast({
                      title: "Técnico calificado",
                      description: "Gracias por compartir tu experiencia.",
                    });
                  } catch (err: unknown) {
                    toast({
                      variant: "destructive",
                      title: "No se pudo calificar",
                      description:
                        err instanceof Error
                          ? err.message
                          : "Intenta de nuevo más tarde.",
                    });
                  } finally {
                    setRatingDialogOpen(false);
                    setCotizacionACalificar(null);
                    setRatingComentario("");
                    setRatingEstrellas(5);
                  }
                }}
                disabled={calificando}
              >
                {calificando ? "Enviando..." : "Enviar calificación"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
