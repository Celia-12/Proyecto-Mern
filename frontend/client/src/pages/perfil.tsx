import { useAuth } from "@/context/AuthContext";
import { useCotizaciones } from "@/hooks/useApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
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
    label: "Rechazada",
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

function CotizacionCard({ cot }: { cot: Cotizacion }) {
  const config = ESTADO_CONFIG[cot.estado] ?? ESTADO_CONFIG.pendiente;
  const fecha = new Date(cot.createdAt).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
        </div>
      </div>
    </Card>
  );
}

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const { data, isLoading } = useCotizaciones();

  const cotizaciones: Cotizacion[] = data?.cotizaciones ?? [];
  const activas = cotizaciones.filter((c) =>
    ["pendiente", "en_revision", "aceptada"].includes(c.estado)
  );
  const historial = cotizaciones.filter((c) =>
    ["completada", "rechazada"].includes(c.estado)
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
              { label: "Total solicitudes", value: cotizaciones.length },
              { label: "Activas", value: activas.length },
              { label: "Completadas", value: historial.filter((c) => c.estado === "completada").length },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold">{isLoading ? "—" : value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Cotizaciones tabs */}
        <Tabs defaultValue="activas">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="activas" className="gap-1.5">
              <FileText className="w-4 h-4" />
              Activas
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
            <TabsTrigger value="cuenta" className="gap-1.5">
              <User className="w-4 h-4" />
              Mi cuenta
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

            {!isLoading && activas.length === 0 && (
              <Card className="p-10 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium">Sin solicitudes activas</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  ¿Necesitas un servicio técnico?
                </p>
                <Link href="/cotizacion">
                  <Button size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    Solicitar cotización
                  </Button>
                </Link>
              </Card>
            )}

            {!isLoading && activas.map((cot) => (
              <CotizacionCard key={cot._id} cot={cot} />
            ))}
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
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Información de la cuenta</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Nombre", value: usuario?.nombre },
                  { label: "Correo", value: usuario?.email },
                  { label: "Teléfono", value: usuario?.telefono ?? "No registrado" },
                  { label: "Ciudad", value: usuario?.ciudad ?? "No registrada" },
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
              <div className="pt-2 border-t">
                <Link href="/socios">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Ver especialistas disponibles
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
