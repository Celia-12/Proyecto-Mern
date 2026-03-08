import { KeyRound } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="text-2xl font-bold text-foreground tracking-tight text-balance text-center">
              JWT Authentication
            </h1>
            <p className="text-sm text-muted-foreground text-center text-pretty leading-relaxed">
              Ingresa tus credenciales para generar un token JWT firmado por el servidor.
            </p>
          </div>
        </header>

        {/* Login Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg shadow-background/50">
          <LoginForm />
        </div>

        {/* Footer */}
        <footer className="text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Demo de autenticación JWT. No se almacenan datos en base de datos.
          </p>
        </footer>
      </div>
    </main>
  );
}
