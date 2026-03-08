"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationIndicator } from "@/components/validation-indicator";
import { TokenDisplay } from "@/components/token-display";
import {
  emailRules,
  passwordRules,
  validateEmail,
  validatePassword,
} from "@/lib/validation";

interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    email: string;
    role: string;
  };
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);

  // Track if the user has interacted with each field
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const isFormValid = validateEmail(email) && validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setError("");

    if (!isFormValid) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      setAuthResponse(data);
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAuthResponse(null);
    setEmail("");
    setPassword("");
    setEmailTouched(false);
    setPasswordTouched(false);
    setError("");
  };

  if (authResponse) {
    return (
      <div className="flex flex-col gap-6">
        <TokenDisplay token={authResponse.token} email={authResponse.user.email} />
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleReset}
            className="text-sm"
          >
            Volver al Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Correo Electrónico
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            id="email"
            type="email"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailTouched(true)}
            className="pl-10 h-11 bg-secondary/50 border-border placeholder:text-muted-foreground/50 focus-visible:ring-ring"
            autoComplete="email"
            aria-describedby="email-validation"
          />
        </div>
        <div id="email-validation">
          <ValidationIndicator
            rules={emailRules}
            value={email}
            show={emailTouched}
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Contraseña
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Tu contraseña segura"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordTouched(true)}
            className="pl-10 pr-10 h-11 bg-secondary/50 border-border placeholder:text-muted-foreground/50 focus-visible:ring-ring"
            autoComplete="current-password"
            aria-describedby="password-validation"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <div id="password-validation">
          <ValidationIndicator
            rules={passwordRules}
            value={password}
            show={passwordTouched}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando Token...
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </Button>
    </form>
  );
}
