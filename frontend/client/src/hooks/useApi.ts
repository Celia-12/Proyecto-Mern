import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Especialista {
  _id: string;
  especialidad: string;
  experiencia_anos: number;
  precio_hora: number;
  calificacion_promedio: number;
  total_resenas: number;
  disponible: boolean;
  verificado: boolean;
  bio?: string;
  horario: string;
  ubicacion: string;
  usuario_id: {
    _id: string;
    nombre: string;
    email: string;
    foto?: string;
    ciudad: string;
    telefono?: string;
  };
}

export interface EspecialistasResponse {
  success: boolean;
  total: number;
  pagina: number;
  paginas: number;
  especialistas: Especialista[];
}

export function useEspecialistas(params?: {
  especialidad?: string;
  disponible?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.especialidad) query.set("especialidad", params.especialidad);
  if (params?.disponible !== undefined)
    query.set("disponible", String(params.disponible));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();

  return useQuery<EspecialistasResponse>({
    queryKey: ["especialistas", qs],
    queryFn: async () => {
      const res = await api.get(`/especialistas${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Error cargando especialistas");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

export function useEspecialista(id: string) {
  return useQuery<{ success: boolean; especialista: Especialista }>({
    queryKey: ["especialista", id],
    queryFn: async () => {
      const res = await api.get(`/especialistas/${id}`);
      if (!res.ok) throw new Error("Error cargando especialista");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCotizaciones() {
  return useQuery({
    queryKey: ["cotizaciones"],
    queryFn: async () => {
      const res = await api.get("/cotizaciones");
      if (!res.ok) throw new Error("Error cargando cotizaciones");
      return res.json();
    },
  });
}

export function useCrearCotizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      descripcion: string;
      categoria: string;
      ubicacion: string;
      fecha_preferida?: string;
    }) => {
      const res = await api.post("/cotizaciones", data);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error al enviar cotización");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cotizaciones"] });
    },
  });
}
