import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Link, useSearch } from "wouter";
import type { ServiceCategory } from "@shared/schema";
import {
  Search,
  ArrowRight,
  Droplets,
  Zap,
  Wind,
  Paintbrush,
  Lock,
  Hammer,
  Wrench,
} from "lucide-react";
import { useState, useMemo } from "react";

const categoryIcons: Record<string, React.ReactNode> = {
  plomeria: <Droplets className="w-8 h-8" />,
  electricidad: <Zap className="w-8 h-8" />,
  "aire-acondicionado": <Wind className="w-8 h-8" />,
  mantenimiento: <Paintbrush className="w-8 h-8" />,
  cerrajeria: <Lock className="w-8 h-8" />,
  carpinteria: <Hammer className="w-8 h-8" />,
};

const categoryImages: Record<string, string> = {
  plomeria: "/images/service-plumbing.png",
  electricidad: "/images/service-electrical.png",
  "aire-acondicionado": "/images/service-hvac.png",
  mantenimiento: "/images/service-maintenance.png",
  cerrajeria: "/images/service-locksmith.png",
  carpinteria: "/images/service-carpentry.png",
};

export default function Services() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const initialQuery = urlParams.get("q") || "";
  const selectedCategory = urlParams.get("categoria") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const { data: categories, isLoading } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    let filtered = categories;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter((c) => c.slug === selectedCategory);
    }
    return filtered;
  }, [categories, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen">
      <section className="bg-card border-b py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-services-title">
              Servicios
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Explora nuestra amplia gama de servicios tecnicos profesionales.
              Contamos con técnicos certificados en cada area.
            </p>

            <div className="flex items-center gap-2 max-w-md">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar servicios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-services"
                />
              </div>
            </div>

            {selectedCategory && (
              <Link href="/servicios">
                <Button variant="ghost" size="sm" data-testid="button-clear-filter">
                  Limpiar filtro
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-visible">
                  <Skeleton className="w-full h-48 rounded-t-md" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No se encontraron servicios</h3>
              <p className="text-muted-foreground text-sm">
                Intenta con otros terminos de busqueda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  className="overflow-visible hover-elevate active-elevate-2 transition-all group"
                  data-testid={`card-service-${category.slug}`}
                >
                  <div className="relative h-48 overflow-hidden rounded-t-md">
                    <img
                      src={categoryImages[category.slug] || "/images/hero-bg.png"}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-white/20 backdrop-blur-sm text-white">
                        {categoryIcons[category.slug] || <Wrench className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <Link href={`/cotizacion?categoria=${category.slug}`}>
                        <Button size="sm" data-testid={`button-quote-${category.slug}`}>
                          Cotizar
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                      <Link href={`/tecnicos?categoria=${category.slug}`}>
                        <Badge variant="secondary" className="cursor-pointer" data-testid={`badge-specialists-${category.slug}`}>
                          Ver técnicos
                        </Badge>
                      </Link>
                    </div>
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
