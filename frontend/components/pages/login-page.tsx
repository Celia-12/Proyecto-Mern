"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { LogIn, UserPlus, Mail, Lock, User, MapPin, Camera, Briefcase } from "lucide-react"

export function LoginPage({
  onLogin,
}: {
  onLogin: (type: "cliente" | "especialista") => void
}) {
  const [loginType, setLoginType] = useState<"cliente" | "especialista">("cliente")
  const [registerType, setRegisterType] = useState<"cliente" | "especialista">("cliente")

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        {}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <LogIn className="h-5 w-5 text-primary" />
              Iniciar Sesion
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Tipo:</label>
              <RadioGroup
                value={loginType}
                onValueChange={(v) => setLoginType(v as "cliente" | "especialista")}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cliente" id="login-cliente" />
                  <Label htmlFor="login-cliente" className="text-sm">Cliente</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="especialista" id="login-especialista" />
                  <Label htmlFor="login-especialista" className="text-sm">Especialista</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                Correo
              </label>
              <Input defaultValue="Periquita43@example.com" className="bg-background" />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <Lock className="h-4 w-4 text-primary" />
                Contrasena
              </label>
              <Input type="password" defaultValue="P3r143" className="bg-background" />
            </div>

            <Button
              className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => onLogin(loginType)}
            >
              Entrar
            </Button>
          </CardContent>
        </Card>

        {}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Registrarse
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Tipo:*</label>
              <RadioGroup
                value={registerType}
                onValueChange={(v) => setRegisterType(v as "cliente" | "especialista")}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cliente" id="reg-cliente" />
                  <Label htmlFor="reg-cliente" className="text-sm">Cliente</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="especialista" id="reg-especialista" />
                  <Label htmlFor="reg-especialista" className="text-sm">Especialista</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  Nombre(s)*
                </label>
                <Input className="bg-background" />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  Apellido(s)*
                </label>
                <Input className="bg-background" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                Correo*
              </label>
              <Input type="email" className="bg-background" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Direccion*
                </label>
                <Input className="bg-background" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">CP*</label>
                <Input className="bg-background" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lock className="h-4 w-4 text-primary" />
                  Contrasena*
                </label>
                <Input type="password" className="bg-background" />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lock className="h-4 w-4 text-primary" />
                  Confirmar*
                </label>
                <Input type="password" className="bg-background" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <Camera className="h-4 w-4 text-primary" />
                Foto*
              </label>
              <Input type="file" accept="image/*" className="bg-background" />
            </div>

            {registerType === "especialista" && (
              <>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Si eres especialista contesta lo siguiente:
                </p>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Especialidad tecnica
                  </label>
                  <Input className="bg-background" />
                </div>
              </>
            )}

            <Button className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Registrarse
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
