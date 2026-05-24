import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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

export interface Calificacion {
  _id: string;
  estrellas: number;
  comentario?: string;
  createdAt: string;
  quien_califica: {
    _id: string;
    nombre: string;
    foto?: string;
  };
}

export interface CalificacionesResponse {
  success: boolean;
  total: number;
  pagina: number;
  paginas: number;
  calificaciones: Calificacion[];
}

export function useCalificaciones(params?: {
  especialista_id?: string;
  a_quien?: string;
  tipo?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.especialista_id) query.set("especialista_id", params.especialista_id);
  if (params?.a_quien) query.set("a_quien", params.a_quien);
  if (params?.tipo) query.set("tipo", params.tipo);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();

  return useQuery<CalificacionesResponse>({
    queryKey: ["calificaciones", qs],
    queryFn: async () => {
      const res = await api.get(`/calificaciones${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Error cargando calificaciones");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export interface CotizacionCliente {
  _id: string;
  nombre: string;
  email: string;
  telefono?: string;
  ciudad?: string;
}

export interface EspecialistaAsignado {
  _id: string;
  usuario_id?: {
    _id: string;
    nombre: string;
    foto?: string;
    ciudad?: string;
    telefono?: string;
  };
}

export interface TrabajoResumen {
  _id: string;
  estado: string;
  calificado: boolean;
  fecha_inicio?: string;
  monto?: number;
}

export interface Cotizacion {
  _id: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  codigo_postal: string;
  estado: string;
  createdAt: string;
  monto_estimado?: number;
  monto_final?: number;
  fecha_preferida?: string;
  imagenes?: string[];
  cliente_id: CotizacionCliente;
  especialista_asignado?: EspecialistaAsignado;
  trabajo_id?: TrabajoResumen;
}

export function useCotizaciones() {
  const { usuario } = useAuth();

  return useQuery({
    queryKey: ["cotizaciones", usuario?._id],
    queryFn: async () => {
      const res = await api.get("/cotizaciones");
      if (!res.ok) throw new Error("Error cargando cotizaciones");
      return res.json();
    },
    enabled: !!usuario,
  });
}

export function useCotizacion(id: string) {
  return useQuery<{ success: boolean; cotizacion: Cotizacion }>({
    queryKey: ["cotizacion", id],
    queryFn: async () => {
      const res = await api.get(`/cotizaciones/${id}`);
      if (!res.ok) throw new Error("Error cargando los detalles de la cotización");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCrearCotizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      descripcion: string;
      categoria: string;
      ubicacion: string;
      codigo_postal: string;
      fecha_preferida?: string;
      archivos?: File[];
    }) => {
      let res: Response;
      if (data.archivos && data.archivos.length > 0) {
        const formData = new FormData();
        formData.append("descripcion", data.descripcion);
        formData.append("categoria", data.categoria);
        formData.append("ubicacion", data.ubicacion);
        formData.append("codigo_postal", data.codigo_postal);
        if (data.fecha_preferida) {
          formData.append("fecha_preferida", data.fecha_preferida);
        }
        data.archivos.forEach((file) => formData.append("imagenes", file));
        res = await apiFetch("/cotizaciones", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await api.post("/cotizaciones", data);
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error al enviar cotización");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cotizaciones"] });
    },
  });
}

export function useCancelarCotizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cotizacionId: string) => {
      const res = await api.put(`/cotizaciones/${cotizacionId}`, { estado: "rechazada" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error cancelando cotización");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cotizaciones"] });
      qc.invalidateQueries({ queryKey: ["cotizacion"] });
    },
  });
}

export function useAceptarCotizacionPorTecnico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cotizacionId: string) => {
      const res = await api.put(`/cotizaciones/${cotizacionId}`, { accion: "aceptar" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error aceptando cotización");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cotizaciones"] });
      qc.invalidateQueries({ queryKey: ["cotizacion"] });
      qc.invalidateQueries({ queryKey: ["cotizaciones", "recientes"] });
    },
  });
}

export function useAceptarCotizacionPorCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cotizacionId: string) => {
      const res = await api.put(`/cotizaciones/${cotizacionId}`, { accion: "confirmar" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error aceptando cotización");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cotizaciones"] });
      qc.invalidateQueries({ queryKey: ["cotizacion"] });
    },
  });
}

export function useConfirmarTrabajo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ trabajoId }: { trabajoId: string }) => {
      const res = await apiFetch(`/trabajos/${trabajoId}`, {
        method: "PUT",
        body: JSON.stringify({ estado: "completado" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error confirmando trabajo");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cotizaciones"] });
      qc.invalidateQueries({ queryKey: ["cotizacion"] });
      qc.invalidateQueries({ queryKey: ["trabajos"] });
    },
  });
}

export function useCalificarTrabajo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      trabajo_id: string;
      a_quien: string;
      especialista_id: string;
      estrellas: number;
      comentario?: string;
      tipo: "cliente_a_tecnico" | "tecnico_a_cliente";
    }) => {
      const res = await api.post("/calificaciones", data);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error calificando trabajo");
      return json;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["cotizaciones"] });
      qc.invalidateQueries({ queryKey: ["calificaciones"] });
      qc.invalidateQueries({ queryKey: ["trabajos"] });
      qc.invalidateQueries({ queryKey: ["especialista", variables.especialista_id] });
    },
  });
}

export function useSubirImagenesCotizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { cotizacionId: string; files: File[] }) => {
      const formData = new FormData();
      data.files.forEach((file) => formData.append("imagenes", file));
      const res = await apiFetch(`/cotizaciones/${data.cotizacionId}/imagenes`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error subiendo imágenes");
      return json;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["cotizacion", variables.cotizacionId] });
      qc.invalidateQueries({ queryKey: ["cotizaciones"] });
      qc.invalidateQueries({ queryKey: ["cotizaciones", "recientes"] });
    },
  });
}

export function useNuevosTrabajos() {
  return useQuery({
    queryKey: ["cotizaciones", "recientes"],
    queryFn: async () => {
      const res = await api.get("/cotizaciones/recientes");
      if (!res.ok) throw new Error("Error cargando trabajos nuevos");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });
}
