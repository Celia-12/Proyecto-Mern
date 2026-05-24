import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wrench, Eye, EyeOff, Loader2 } from "lucide-react";

const TECNICOS = [
  "Plomero",
  "Electricista",
  "Técnico en aire acondicionado",
  "Carpintero",
  "Albañil",
  "Pintor",
  "Cerrajero",
  "Paneles solares",
  "Seguridad",
  "Impermeabilización",
];

export default function Registro() {
  const [, navigate] = useLocation();
  const { registro } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    contrasena: "",
    confirmar: "",
    telefono: "",
    tipo: "cliente" as "cliente" | "tecnico",
    especialidad: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.contrasena !== form.confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (form.tipo === "tecnico" && !form.especialidad) {
      setError("Selecciona el tipo de técnico");
      return;
    }

    setLoading(true);
    try {
      await registro({
        nombre: form.nombre,
        email: form.email,
        contrasena: form.contrasena,
        telefono: form.telefono.trim() || undefined,
        tipo: form.tipo,
        especialidad: form.tipo === "tecnico" ? form.especialidad : undefined,
      });
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Cuenta</h1>
          <p className="text-muted-foreground text-sm">
            Únete a la comunidad de servicios técnicos
          </p>
        </div>

        <Card className="shadow-lg border-0 ring-1 ring-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Registro</CardTitle>
            <CardDescription>Completa tus datos para comenzar</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  placeholder="Tu nombre completo"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (opcional)</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="Tu número de teléfono"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de cuenta</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      tipo: v as "cliente" | "tecnico",
                      especialidad: v === "cliente" ? "" : form.especialidad,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente — Busco servicios</SelectItem>
                    <SelectItem value="tecnico">Técnico — Ofrezco servicios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.tipo === "tecnico" && (
                <div className="space-y-2">
                  <Label>Tipo de técnico</Label>
                  <Select
                    value={form.especialidad}
                    onValueChange={(v) => setForm({ ...form, especialidad: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {TECNICOS.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="contrasena">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="contrasena"
                    type={mostrarPass ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={form.contrasena}
                    onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPass(!mostrarPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mostrarPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmar">Confirmar contraseña</Label>
                <Input
                  id="confirmar"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={form.confirmar}
                  onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
