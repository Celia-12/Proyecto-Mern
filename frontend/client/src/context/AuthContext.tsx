import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, setToken, removeToken, getToken } from "@/lib/api";

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  tipo: "cliente" | "tecnico" | "admin";
  foto?: string;
  telefono?: string;
  ciudad?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  login: (email: string, contrasena: string) => Promise<void>;
  registro: (datos: RegistroDatos) => Promise<void>;
  logout: () => void;
  estaAutenticado: boolean;
}

interface RegistroDatos {
  nombre: string;
  email: string;
  contrasena: string;
  telefono?: string;
  tipo?: "cliente" | "tecnico";
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      cargarPerfil();
    } else {
      setCargando(false);
    }
  }, []);

  // Listen for auto-logout events
  useEffect(() => {
    const handleLogout = () => {
      setUsuario(null);
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const cargarPerfil = async () => {
    try {
      const res = await api.get("/auth/perfil");
      if (res.ok) {
        const data = await res.json();
        setUsuario(data.usuario);
      } else {
        removeToken();
      }
    } catch {
      removeToken();
    } finally {
      setCargando(false);
    }
  };

  const login = async (email: string, contrasena: string) => {
    const res = await api.post("/auth/login", { email, contrasena });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
    setToken(data.token);
    setUsuario(data.usuario);
  };

  const registro = async (datos: RegistroDatos) => {
    const res = await api.post("/auth/registro", datos);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al registrarse");
    setToken(data.token);
    setUsuario(data.usuario);
  };

  const logout = () => {
    removeToken();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        login,
        registro,
        logout,
        estaAutenticado: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
