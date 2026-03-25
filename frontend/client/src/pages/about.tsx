import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Shield,
  Clock,
  Users,
  Wrench,
  Target,
  Heart,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function About() {
  const values = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Equipo Profesional",
      description:
        "Contamos con especialistas verificados y certificados en todas las areas de servicio tecnico.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Confianza y Seguridad",
      description:
        "Todos nuestros socios pasan por un proceso de verificacion para garantizar la calidad del servicio.",
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

  const stats = [
    { value: "500+", label: "Servicios realizados" },
    { value: "50+", label: "Especialistas activos" },
    { value: "4.8", label: "Calificacion promedio" },
    { value: "98%", label: "Clientes satisfechos" },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-card border-b py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-about-title">
              Sobre Nosotros
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Conoce mas sobre nuestra mision y los valores que nos impulsan a
              ofrecer el mejor servicio tecnico de la region.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Quienes somos?
                </p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Tu plataforma de servicios tecnicos de confianza
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Somos una plataforma que conecta a clientes con los mejores especialistas
                tecnicos de la region. Nuestra mision es facilitar el acceso a servicios
                de calidad para tu hogar y oficina.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Desde nuestra fundacion, nos hemos comprometido a brindar un servicio
                excepcional, asegurandonos de que cada especialista cumpla con los mas
                altos estandares de calidad y profesionalismo.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Especialistas verificados y certificados",
                  "Proceso de cotizacion transparente",
                  "Garantia en todos los servicios",
                  "Atencion al cliente personalizada",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-md overflow-hidden">
                <img
                  src="/images/hero-bg.png"
                  alt="Equipo Multiservicios TECNICOS"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-md" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
                      <Wrench className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Multiservicios TECNICOS</p>
                      <p className="text-white/70 text-xs">Desde 2020</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <p className="text-3xl md:text-4xl font-bold text-primary-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-primary-foreground/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Nuestros Valores
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Lo que nos distingue y nos motiva cada dia
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value) => (
              <Card
                key={value.title}
                className="p-6 text-center"
                data-testid={`card-value-${value.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary">
                    {value.icon}
                  </div>
                  <h3 className="font-semibold">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Mision</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Facilitar el acceso a servicios tecnicos de calidad, conectando
                  clientes con especialistas verificados de manera rapida y segura.
                </p>
              </div>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Vision</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ser la plataforma lider en servicios tecnicos en toda la region,
                  reconocida por la calidad y confiabilidad de nuestros especialistas.
                </p>
              </div>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Compromiso</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Garantizar la satisfaccion de nuestros clientes a traves de un
                  servicio transparente, profesional y de la mas alta calidad.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Listo para empezar?
            </h2>
            <p className="text-muted-foreground">
              Solicita una cotizacion gratuita o explora nuestro directorio de
              especialistas verificados.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/cotizacion">
                <Button size="lg" data-testid="button-about-cta-quote">
                  Solicitar Cotizacion
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/socios">
                <Button variant="outline" size="lg" data-testid="button-about-cta-partners">
                  Ver Especialistas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
