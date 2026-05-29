import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  CheckCircle,
  MapPin,
  Clock,
  ArrowRight,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { useEspecialistas } from "@/hooks/useApi";
import { normalizeText, mapQueryToCanonical, matchesField } from "@/lib/search";

const ESPECIALIDADES = [
  "Plomería",
  "Electricidad",
  "Aire Acondicionado",
  "Carpintería",
  "Mantenimiento General",
  "Cerrajería",
  "Paneles solares",
  "Seguridad",
  "Impermeabilización",
];

const SPECIALTY_ICONS: Record<string, string> = {
  "Plomería": "💧",
  "Electricidad": "⚡",
  "Carpintería": "🔨",
  "Cerrajería": "🔐",
  "Aire Acondicionado": "❄️",
  "Mantenimiento General": "🧱",
  "Paneles solares": "☀️",
  "Seguridad": "🛡️",
  "Impermeabilización": "🌧️",
};

function EspecialistaSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-9 w-full mt-4" />
    </Card>
  );
}

export default function Tecnicos() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const initialCategory = urlParams.get("categoria") || "all";
  const initialSearchQuery = urlParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);

  const { data, isLoading, isError, refetch } = useEspecialistas({ limit: 100 });
  const especialistas = data?.especialistas?.filter((esp) => esp.usuario_id) ?? [];

  const filtered = useMemo(() => {
    let result = especialistas;
      if (searchQuery) {
        const q = searchQuery;
        result = result.filter((s) => {
          const nameMatch = normalizeText(s.usuario_id?.nombre ?? "").includes(normalizeText(q));
          const specialtyMatch = matchesField(s.especialidad ?? "", q);
          const locationMatch = normalizeText(s.ubicacion ?? "").includes(normalizeText(q));
          return nameMatch || specialtyMatch || locationMatch;
        });
      }
    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter((s) => s.especialidad === categoryFilter);
    }
    return result;
  }, [especialistas, searchQuery, categoryFilter]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-card border-b py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              data-testid="text-tecnicos-title"
            >
              Nuestros Técnicos
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Técnicos verificados y certificados listos para ayudarte con
              cualquier proyecto en el área metropolitana de Monterrey.
            </p>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 max-w-xl pt-2">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar técnicos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-tecnicos"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas las especialidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las especialidades</SelectItem>
                  {ESPECIALIDADES.map((esp) => (
                    <SelectItem key={esp} value={esp}>
                      {SPECIALTY_ICONS[esp]} {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats bar */}
          {!isLoading && !isError && (
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-muted-foreground">
                {filtered.length === 0
                  ? "Sin resultados"
                  : `${filtered.length} técnico${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
              </p>
              {(searchQuery || categoryFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/50" />
              <p className="text-muted-foreground">
                No se pudo cargar la lista de técnicos.
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Intentar de nuevo
              </Button>
            </div>
          )}

          {/* Skeleton loading */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <EspecialistaSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <Wrench className="w-12 h-12 text-muted-foreground/30" />
              <p className="font-medium">Sin técnicos para tu búsqueda</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Intenta cambiar los filtros o busca otra especialidad.
              </p>
            </div>
          )}

          {/* Specialist cards */}
          {!isLoading && !isError && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((esp) => (
                <Card
                  key={esp._id}
                  className="p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
                  data-testid={`card-specialist-${esp._id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="w-14 h-14 border-2 border-border">
                        <AvatarImage src={esp.usuario_id?.foto ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {esp.usuario_id?.nombre
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) ?? "??"}
                        </AvatarFallback>
                      </Avatar>
                      {esp.verificado && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                          <CheckCircle className="w-4 h-4 text-primary fill-primary/20" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold truncate">
                          {esp.usuario_id?.nombre ?? "Técnico"}
                        </h3>
                        <Badge
                          variant={esp.disponible ? "default" : "secondary"}
                          className="shrink-0 text-xs"
                        >
                          {esp.disponible ? "Disponible" : "Ocupado"}
                        </Badge>
                      </div>

                      <p className="text-sm text-primary font-medium mt-0.5">
                        {SPECIALTY_ICONS[esp.especialidad]} {esp.especialidad}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">
                          {(esp.calificacion_promedio ?? 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({esp.total_resenas ?? 0} reseñas)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {esp.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {esp.bio}
                    </p>
                  )}

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {esp.ubicacion}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {esp.experiencia_anos} años exp.
                    </div>
                    <Badge variant="outline" className="text-xs">
                      ${esp.precio_hora} por visita
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-2 border-t">
                    <Link
                      href={`/tecnico/${esp._id}`}
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full gap-1">
                        Ver perfil
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
