import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useNuevosTrabajos } from "@/hooks/useApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, MapPin, FileText } from "lucide-react";

export default function NuevosTrabajos() {
  const { usuario } = useAuth();
  const [, navigate] = useLocation();
  const { data, isLoading, isError, error } = useNuevosTrabajos();

  useEffect(() => {
    if (usuario && usuario.tipo !== "tecnico") {
      navigate("/");
    }
  }, [usuario, navigate]);

  const trabajos = data?.cotizaciones ?? [];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Para técnicos</p>
            <h1 className="text-3xl font-bold">Nuevos trabajos</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Aquí aparecen las últimas solicitudes de los clientes que necesitan ayuda.
            </p>
          </div>
          <Link href="/perfil">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Volver al perfil
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-6">
                <Skeleton className="h-5 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Card className="p-6 text-center">
            <p className="text-base font-semibold">No se pudieron cargar los trabajos.</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : "Intenta de nuevo más tarde."}
            </p>
          </Card>
        )}

        {!isLoading && trabajos.length === 0 && (
          <Card className="p-10 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium">No hay trabajos nuevos por el momento</p>
            <p className="text-sm text-muted-foreground mt-1">
              Pide a tus clientes que publiquen una cotización para ver nuevas solicitudes.
            </p>
          </Card>
        )}

        <div className="space-y-4">
          {trabajos.map((trabajo) => (
            <Card key={trabajo._id} className="p-6 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {trabajo.categoria}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{trabajo.codigo_postal}</span>
                  </div>
                  <p className="text-lg font-semibold">{trabajo.descripcion}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {trabajo.ubicacion}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {new Date(trabajo.createdAt).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:items-end">
                  <div className="text-sm text-muted-foreground">
                    Cliente:
                    <span className="font-medium ml-1">
                      {trabajo.cliente_id?.nombre ?? "Usuario"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ciudad:
                    <span className="font-medium ml-1">
                      {trabajo.cliente_id?.ciudad ?? "No especificada"}
                    </span>
                  </div>
                  <Link href={`/cotizacion/${trabajo._id}`} className="w-full">
                    <Button size="sm" variant="outline" className="w-full">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
