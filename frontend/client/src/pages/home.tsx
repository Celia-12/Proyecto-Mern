import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useCotizaciones, useEspecialistas, useAceptarCotizacionPorTecnico, useRechazarCotizacionPorTecnico, useConfirmarTrabajo } from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ServiceCategory, Specialist } from "@shared/schema";
import type { Cotizacion } from "@/hooks/useApi";
import {
  Search,
  Shield,
  Clock,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Droplets,
  Zap,
  Wind,
  Paintbrush,
  Lock,
  Hammer,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

const categoryIcons: Record<string, React.ReactNode> = {
  plomeria: <Droplets className="w-6 h-6" />,
  electricidad: <Zap className="w-6 h-6" />,
  "aire-acondicionado": <Wind className="w-6 h-6" />,
  mantenimiento: <Paintbrush className="w-6 h-6" />,
  cerrajeria: <Lock className="w-6 h-6" />,
  carpinteria: <Hammer className="w-6 h-6" />,
};

const TECHNICIAN_TRADES: { label: string; icon: React.ReactNode }[] = [
  { label: "Plomería", icon: <Droplets className="w-6 h-6" /> },
  { label: "Electricidad", icon: <Zap className="w-6 h-6" /> },
  { label: "Aire Acondicionado", icon: <Wind className="w-6 h-6" /> },
  { label: "Carpintería", icon: <Hammer className="w-6 h-6" /> },
  { label: "Cerrajería", icon: <Lock className="w-6 h-6" /> },
  { label: "Mantenimiento General", icon: <Paintbrush className="w-6 h-6" /> },
];

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative overflow-hidden" data-testid="section-hero">
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-2xl space-y-6">
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
            Técnicos verificados
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Multiservicios{" "}
            <span className="text-primary">TECNICOS</span>
          </h1>

          <p className="text-lg text-white/80 leading-relaxed max-w-lg">
            Busca técnicos, mándales una cotización, habla con ellos y entre ustedes se arreglan. Sin intermediarios, sin comisiones, sin complicaciones.
            Servicios de calidad para tu hogar y oficina.
          </p>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-md p-1.0 max-w-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                type="search"
                placeholder="¿Qué técnico buscas? ejemplo: plomería, electricidad, carpintería..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-transparent border-0 text-white placeholder:text-white/50 focus-visible:ring-0"
                data-testid="input-hero-search"
              />
            </div>
            <Link href={searchQuery ? `/tecnicos?q=${encodeURIComponent(searchQuery)}` : "/tecnicos"}>
              <Button data-testid="button-hero-search">
                Buscar
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Técnicos verificados</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Servicio garantizado</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span>Respuesta rapida</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeNotifications() {
  const { usuario } = useAuth();
  const { data } = useCotizaciones();
  const { toast } = useToast();
  const confirmarTrabajo = useConfirmarTrabajo();
  const aceptarCotizacionTecnico = useAceptarCotizacionPorTecnico();
  const rechazarCotizacionTecnico = useRechazarCotizacionPorTecnico();
  const { data: especialistaData } = useEspecialistas(
    usuario?.tipo === "tecnico" && usuario?._id ? { usuario_id: usuario._id } : undefined
  );
  const especialistaId = especialistaData?.especialistas?.[0]?._id;

  if (!usuario || !data?.cotizaciones) {
    return null;
  }

  const cotizaciones = data.cotizaciones;

  if (usuario.tipo === "cliente") {
    const cotizacionesAprobacion = cotizaciones.filter((cot: Cotizacion) => cot.estado === "en_revision");
    const cotizacionesConfirmacion = cotizaciones.filter(
      (cot: Cotizacion) => cot.estado === "pendiente_confirmacion"
    );
    const confirmandoTrabajo = confirmarTrabajo.status === "pending";

    if (cotizacionesAprobacion.length === 0 && cotizacionesConfirmacion.length === 0) {
      return null;
    }

    return (
      <section className="py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {cotizacionesAprobacion.length > 0 && (
            <Card className="p-5 border border-amber-200 bg-amber-50">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
                  <div>
                    <p className="font-semibold">Tienes solicitudes que esperan tu aprobación</p>
                    <p className="text-sm text-muted-foreground">
                      Un técnico aceptó tu solicitud. Revisa tu perfil para confirmar la cotización y que el trabajo pueda empezar.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {cotizacionesAprobacion.map((cot: Cotizacion) => {
                    const profileHref = cot.especialista_asignado?._id
                      ? `/tecnico/${cot.especialista_asignado._id}`
                      : `/cotizacion/${cot._id}`;
                    return (
                      <div key={cot._id} className="rounded-xl border border-border bg-white p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">{cot.categoria}</p>
                            <p className="font-medium">{cot.titulo}</p>
                          </div>
                          <Link href={profileHref}>
                            <Button size="sm" variant="outline">
                              Ver perfil del técnico
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {cotizacionesConfirmacion.length > 0 && (
            <Card className="p-5 border border-amber-200 bg-amber-50">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
                  <div>
                    <p className="font-semibold">Tu técnico marcó el trabajo como realizado</p>
                    <p className="text-sm text-muted-foreground">
                      Revisa tu perfil y confirma si la cotización y el trabajo se completaron correctamente.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {cotizacionesConfirmacion.map((cot: Cotizacion) => (
                    <div key={cot._id} className="rounded-xl border border-border bg-white p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{cot.categoria}</p>
                          <p className="font-medium">{cot.titulo}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              if (!cot.trabajo_id?._id) return;
                              try {
                                await confirmarTrabajo.mutateAsync({ trabajoId: cot.trabajo_id._id, estado: "completado" });
                                toast({
                                  title: "Cotización terminada",
                                  description: "El trabajo se marcó como completado y podrás calificar al técnico.",
                                });
                              } catch (err: unknown) {
                                toast({
                                  variant: "destructive",
                                  title: "No se pudo terminar la cotización",
                                  description: err instanceof Error ? err.message : "Intenta de nuevo más tarde.",
                                });
                              }
                            }}
                            disabled={confirmandoTrabajo}
                          >
                            {confirmandoTrabajo ? "Procesando..." : "Terminar cotización"}
                          </Button>
                          <Link href={`/cotizacion/${cot._id}`}>
                            <Button size="sm" variant="outline">
                              Ver detalles
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>
    );
  }

  if (usuario.tipo === "tecnico") {
    const cotizacionesDirectas = especialistaId
      ? cotizaciones.filter(
          (cot: Cotizacion) =>
            cot.estado === "pendiente" &&
            cot.especialistas_notificados?.includes(especialistaId)
        )
      : [];

    const cotizacionesAsignadas = cotizaciones.filter(
      (cot: Cotizacion) => cot.estado === "aceptada"
    );

    if (cotizacionesDirectas.length === 0 && cotizacionesAsignadas.length === 0) {
      return null;
    }

    return (
      <section className="py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {cotizacionesDirectas.length > 0 && (
            <Card className="p-5 border border-blue-200 bg-blue-50">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold">Tienes nuevas solicitudes de cotización</p>
                    <p className="text-sm text-muted-foreground">
                      Un cliente te pidió una cotización específicamente. Revísala y acepta si te interesa.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {cotizacionesDirectas.map((cot: Cotizacion) => (
                    <div key={cot._id} className="rounded-xl border border-border bg-white p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{cot.categoria}</p>
                          <p className="font-medium">{cot.titulo}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/cotizacion/${cot._id}`}>
                            <Button size="sm" variant="outline">
                              Ver solicitud
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              try {
                                await aceptarCotizacionTecnico.mutateAsync(cot._id);
                                toast({
                                  title: "Solicitud aceptada",
                                  description: "La cotización fue aceptada y el cliente será notificado.",
                                });
                              } catch (err: unknown) {
                                toast({
                                  variant: "destructive",
                                  title: "No se pudo aceptar",
                                  description: err instanceof Error ? err.message : "Intenta de nuevo más tarde.",
                                });
                              }
                            }}
                            disabled={aceptarCotizacionTecnico.status === "pending"}
                          >
                            Aceptar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              try {
                                await rechazarCotizacionTecnico.mutateAsync(cot._id);
                                toast({
                                  title: "Solicitud rechazada",
                                  description: "La cotización fue rechazada y el cliente será notificado.",
                                });
                              } catch (err: unknown) {
                                toast({
                                  variant: "destructive",
                                  title: "No se pudo rechazar",
                                  description: err instanceof Error ? err.message : "Intenta de nuevo más tarde.",
                                });
                              }
                            }}
                            disabled={rechazarCotizacionTecnico.status === "pending"}
                          >
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {cotizacionesAsignadas.length > 0 && (
            <Card className="p-5 border border-amber-200 bg-amber-50">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
                  <div>
                    <p className="font-semibold">Tienes trabajos listos para confirmar</p>
                    <p className="text-sm text-muted-foreground">
                      Un cliente ya aceptó la cotización. Cuando termines el trabajo, confírmalo para que el cliente pueda calificarte.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {cotizacionesAsignadas.map((cot: Cotizacion) => (
                    <div key={cot._id} className="rounded-xl border border-border bg-white p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{cot.categoria}</p>
                          <p className="font-medium">{cot.titulo}</p>
                        </div>
                        <Link href={`/cotizacion/${cot._id}`}>
                          <Button size="sm" variant="outline">
                            Ver detalles
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>
    );
  }

  return null;
}

function CategoriesSection() {
  const { data: categories, isLoading } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <section className="py-16 md:py-20" data-testid="section-categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex flex-col items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-md" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </Card>
              ))
            : categories?.map((category) => (
                <Link key={category.id} href={`/tecnicos?categoria=${category.slug}`}>
                  <Card
                    className="p-6 cursor-pointer hover-elevate active-elevate-2 transition-all"
                    data-testid={`card-category-${category.slug}`}
                  >
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary">
                        {categoryIcons[category.slug] || <Wrench className="w-6 h-6" />}
                      </div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                  </Card>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}

function TradesSection() {
  return (
    <section className="py-16 md:py-20 bg-slate-50" data-testid="section-trades">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Oficios de nuestros técnicos
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Elige un oficio y encuentra técnicos especializados rápidamente.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TECHNICIAN_TRADES.map((trade) => (
            <Link key={trade.label} href={`/tecnicos?q=${encodeURIComponent(trade.label)}`}>
              <Card className="p-6 cursor-pointer hover-elevate active-elevate-2 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                    {trade.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{trade.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      Buscar técnicos de {trade.label.toLowerCase()}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSpecialists() {
  const { data: specialists, isLoading } = useQuery<Specialist[]>({
    queryKey: ["/api/specialists"],
  });

  const featured = specialists?.slice(0, 4);

  return (
    <section className="py-16 md:py-20 bg-card" data-testid="section-specialists">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Técnicos Destacados
            </h2>
            <p className="text-muted-foreground max-w-md">
              Profesionales verificados con las mejores calificaciones
            </p>
          </div>
          <Link href="/tecnicos">
            <Button variant="outline" data-testid="button-view-all-specialists">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <div className="flex flex-col items-center gap-3">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </Card>
              ))
            : featured?.map((specialist) => (
                <Card
                  key={specialist.id}
                  className="p-5 hover-elevate active-elevate-2 transition-all"
                  data-testid={`card-specialist-${specialist.id}`}
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={specialist.avatar || undefined} alt={specialist.name} />
                      <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                        {specialist.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <h3 className="font-semibold text-sm">{specialist.name}</h3>
                        {specialist.verified && (
                          <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{specialist.location}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{specialist.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({specialist.reviewCount})
                      </span>
                    </div>

                    <div className="pt-4 w-full">
                      <Link href={`/cotizacion?especialista=${specialist.id}`}>
                        <Button className="w-full" size="sm">
                          Cotizar ahora
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
        </div>
      </div>
    </section>
  );
}

function WhyUsSection() {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Equipo Profesional",
      description:
        "Contamos con técnicos verificados y certificados en todas las areas de servicio tecnico.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Confianza y Seguridad",
      description:
        "Todos nuestros técnicos pasan por un proceso de verificacion para garantizar la calidad del servicio.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Atencion Rapida",
      description:
        "Ofrecemos servicios de emergencia y programados para adaptarnos a tus necesidades.",
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: "Servicios Completos",
      description:
        "Desde plomeria hasta mantenimiento general, cubrimos todas las necesidades de tu hogar.",
    },
  ];

  return (
    <section className="py-16 md:py-20" data-testid="section-why-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Por que elegirnos?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Tu satisfaccion es nuestra prioridad
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="p-6 text-center"
              data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-16 md:py-20 bg-primary" data-testid="section-cta">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-tight">
            Necesitas un técnico?
          </h2>
          <p className="text-primary-foreground/80 leading-relaxed">
            Solicita una cotizacion gratuita y recibe respuesta en menos de 24 horas.
            Nuestros técnicos estan listos para ayudarte.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/cotizacion">
              <Button variant="secondary" size="lg" data-testid="button-cta-quote">
                Solicitar Cotizacion
              </Button>
            </Link>
            <Link href="/tecnicos">
              <Button variant="outline" size="lg" className="text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="button-cta-specialists">
                Ver técnicos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <HeroSection />
      <HomeNotifications />
      <TradesSection />
      <CategoriesSection />
      <FeaturedSpecialists />
      <WhyUsSection />
      <CtaSection />
    </div>
  );
}
