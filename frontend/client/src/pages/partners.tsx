import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useSearch } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ServiceCategory, Specialist } from "@shared/schema";
import {
  Search,
  Star,
  CheckCircle,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function Partners() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const initialCategory = urlParams.get("categoria") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);

  const { data: specialists, isLoading } = useQuery<Specialist[]>({
    queryKey: ["/api/specialists"],
  });

  const { data: categories } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const filtered = useMemo(() => {
    if (!specialists) return [];
    let result = specialists;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.specialties?.some((sp) => sp.toLowerCase().includes(q))
      );
    }
    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter((s) => s.categoryId === categoryFilter);
    }
    return result;
  }, [specialists, searchQuery, categoryFilter]);

  return (
    <div className="min-h-screen">
      <section className="bg-card border-b py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-partners-title">
              Nuestros Socios
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Especialistas verificados y certificados listos para ayudarte
              con cualquier proyecto tecnico.
            </p>

            <div className="flex flex-wrap items-center gap-3 max-w-lg">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar especialistas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-partners"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No se encontraron especialistas</h3>
              <p className="text-muted-foreground text-sm">
                Intenta con otros terminos de busqueda o cambia la categoria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((specialist) => (
                <Card
                  key={specialist.id}
                  className="p-5 hover-elevate active-elevate-2 transition-all"
                  data-testid={`card-partner-${specialist.id}`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14 shrink-0">
                      <AvatarImage src={specialist.avatar || undefined} alt={specialist.name} />
                      <AvatarFallback className="text-base font-semibold bg-primary/10 text-primary">
                        {specialist.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-semibold text-sm truncate">{specialist.name}</h3>
                          {specialist.verified && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {specialist.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {specialist.yearsExperience} anos
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{specialist.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({specialist.reviewCount} resenas)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {specialist.specialties?.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Badge
                          variant={specialist.available ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {specialist.available ? "Disponible" : "Ocupado"}
                        </Badge>
                        <Link href={`/cotizacion?categoria=${categories?.find(c => c.id === specialist.categoryId)?.slug}&especialista=${specialist.id}`}>
                          <Button variant="ghost" size="sm" data-testid={`button-contact-${specialist.id}`}>
                            Contactar
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
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
