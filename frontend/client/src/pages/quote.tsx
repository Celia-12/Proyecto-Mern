import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearch, useLocation } from "wouter";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Wrench,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCrearCotizacion, useEspecialista } from "@/hooks/useApi";

const quoteSchema = z.object({
  categoria: z.string().min(1, "Selecciona una categoría de servicio"),
  descripcion: z
    .string()
    .min(10, "Describe tu necesidad con al menos 10 caracteres")
    .max(1000, "Máximo 1000 caracteres"),
  ubicacion: z.string().min(5, "Ingresa una dirección válida"),
  fecha_preferida: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const CATEGORIAS = [
  { valor: "Plomería", icono: "💧" },
  { valor: "Electricidad", icono: "⚡" },
  { valor: "Carpintería", icono: "🔨" },
  { valor: "Cerrajería", icono: "🔐" },
  { valor: "Aire Acondicionado", icono: "❄️" },
  { valor: "Mantenimiento General", icono: "🔧" },
];

export default function Quote() {
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const urlParams = new URLSearchParams(searchString);
  const { toast } = useToast();
  const { usuario } = useAuth();
  const [enviado, setEnviado] = useState(false);

  const especialistaId = urlParams.get("especialista") || "";
  const categoriaParam = urlParams.get("categoria") || "";

  const { data: espData } = useEspecialista(especialistaId);
  const especialista = espData?.especialista;

  const crearCotizacion = useCrearCotizacion();

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      categoria: categoriaParam || "",
      descripcion: "",
      ubicacion: "",
      fecha_preferida: "",
    },
  });

  const onSubmit = async (values: QuoteFormValues) => {
    try {
      await crearCotizacion.mutateAsync({
        descripcion: values.descripcion,
        categoria: values.categoria,
        ubicacion: values.ubicacion,
        fecha_preferida: values.fecha_preferida || undefined,
      });

      setEnviado(true);
      toast({
        title: "¡Cotización enviada!",
        description: "Te contactaremos en menos de 24 horas.",
      });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "No se pudo enviar la cotización",
      });
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (enviado) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-10 text-center space-y-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">¡Cotización Enviada!</h2>
            <p className="text-muted-foreground">
              Tu solicitud fue registrada correctamente. Un especialista la revisará
              y te contactaremos en menos de{" "}
              <span className="font-semibold text-foreground">24 horas</span>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setEnviado(false);
                form.reset();
              }}
            >
              Nueva cotización
            </Button>
            <Button className="flex-1" onClick={() => navigate("/")}>
              Ir al inicio
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-card border-b py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-4">
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              data-testid="text-quote-title"
            >
              Solicitar Cotización
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Completa el formulario y recibirás una cotización personalizada
              en menos de 24 horas.
            </p>

            {/* Pre-selected context chips */}
            {(especialista || categoriaParam) && (
              <div className="flex flex-wrap gap-3 pt-1">
                {especialista && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 py-1.5 px-3 text-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    {especialista.usuario_id?.nombre}
                  </Badge>
                )}
                {categoriaParam && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 py-1.5 px-3 text-sm"
                  >
                    <Wrench className="w-3.5 h-3.5 text-primary" />
                    {categoriaParam}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8">
                {/* User info banner */}
                {usuario && (
                  <Alert className="mb-6 bg-primary/5 border-primary/20">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      Enviando como{" "}
                      <span className="font-semibold">{usuario.nombre}</span> (
                      {usuario.email})
                    </AlertDescription>
                  </Alert>
                )}

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                  data-testid="form-quote"
                >
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tipo de servicio{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Select
                      onValueChange={(val) => form.setValue("categoria", val)}
                      value={form.watch("categoria")}
                    >
                      <SelectTrigger data-testid="select-service-type">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS.map((cat) => (
                          <SelectItem key={cat.valor} value={cat.valor}>
                            {cat.icono} {cat.valor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.categoria && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.categoria.message}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Dirección del servicio{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Calle, Colonia, Ciudad"
                      {...form.register("ubicacion")}
                      data-testid="input-address"
                    />
                    {form.formState.errors.ubicacion && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.ubicacion.message}
                      </p>
                    )}
                  </div>

                  {/* Preferred date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Fecha preferida{" "}
                      <span className="text-muted-foreground text-xs">(opcional)</span>
                    </label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      {...form.register("fecha_preferida")}
                      data-testid="input-preferred-date"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Descripción del problema{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      placeholder="Describe con detalle lo que necesitas reparar o instalar..."
                      rows={5}
                      {...form.register("descripcion")}
                      data-testid="input-description"
                    />
                    <div className="flex justify-between">
                      {form.formState.errors.descripcion ? (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.descripcion.message}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {form.watch("descripcion")?.length ?? 0}/1000
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={crearCotizacion.isPending}
                    data-testid="button-submit-quote"
                  >
                    {crearCotizacion.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Cotización
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Información de Contacto</h3>
                <div className="space-y-3">
                  {[
                    { icon: Phone, label: "Teléfono", value: "+52 81 1234 5678" },
                    {
                      icon: Mail,
                      label: "Correo",
                      value: "contacto@multiservicios.mx",
                    },
                    { icon: MapPin, label: "Zona de servicio", value: "Monterrey y AMM" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 text-sm">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">{label}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">¿Cómo funciona?</h3>
                <ol className="space-y-3">
                  {[
                    "Describe tu necesidad en el formulario",
                    "Un especialista revisa tu solicitud",
                    "Recibes cotización en menos de 24h",
                    "Confirma y agenda el servicio",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Respuesta rápida</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nuestros especialistas responden en menos de{" "}
                  <strong>24 horas</strong> en días hábiles.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
