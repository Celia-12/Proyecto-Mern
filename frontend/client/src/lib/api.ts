// ─── API Base URL ──────────────────────────────────────────────────────────
export const API_BASE = "http://localhost:3001/api";
export const API_ORIGIN = API_BASE.replace(/\/api$/, "");

// ─── Token management ─────────────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem("token");
export const setToken = (token: string) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

// ─── Authenticated fetch ───────────────────────────────────────────────────
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Auto-logout on 401
  if (res.status === 401) {
    removeToken();
    window.dispatchEvent(new Event("auth:logout"));
  }

  return res;
}

// ─── Convenience helpers ───────────────────────────────────────────────────
export const api = {
  get: (endpoint: string) => apiFetch(endpoint, { method: "GET" }),
  post: (endpoint: string, body: unknown) =>
    apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint: string, body: unknown) =>
    apiFetch(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: (endpoint: string, body?: unknown) =>
    apiFetch(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint: string) => apiFetch(endpoint, { method: "DELETE" }),
};
