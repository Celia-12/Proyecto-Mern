import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearch } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { insertQuoteRequestSchema } from "@shared/schema";
import { Send, CheckCircle, Phone, Mail, MapPin, CreditCard, ShieldCheck, Wrench } from "lucide-react";
import { z } from "zod";

const quoteFormSchema = insertQuoteRequestSchema.extend({
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientEmail: z.string().email("Ingresa un correo electronico valido"),
  clientPhone: z.string().min(10, "Ingresa un numero de telefono valido"),
  description: z.string().min(10, "Describe tu necesidad con al menos 10 caracteres"),
  address: z.string().min(5, "Ingresa una direccion valida"),
  categoryId: z.string().min(1, "Selecciona una categoria de servicio"),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

const STATIC_CATEGORIES = [
  { id: "1", name: "Plomeria", slug: "plomeria" },
  { id: "2", name: "Electricidad", slug: "electricidad" },
  { id: "3", name: "Aire Acondicionado", slug: "aire-acondicionado" },
  { id: "4", name: "Mantenimiento", slug: "mantenimiento" },
  { id: "5", name: "Cerrajeria", slug: "cerrajeria" },
  { id: "6", name: "Carpinteria", slug: "carpinteria" },
];

const STATIC_SPECIALISTS = [
  { id: "s1", name: "Carlos Martinez", avatar: null },
  { id: "s2", name: "Roberto Hernandez", avatar: null },
];

export default function Quote() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const { toast } = useToast();
  const [showPayment, setShowPayment] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"form" | "success">("form");

  const preselectedCategory = urlParams.get("categoria");
  const preselectedSpecialist = urlParams.get("especialista");
  
  const matchedCategory = STATIC_CATEGORIES.find((c) => c.slug === preselectedCategory);
  const matchedSpecialist = STATIC_SPECIALISTS.find((s) => s.id === preselectedSpecialist);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      categoryId: matchedCategory?.id || "",
      description: "",
      address: "",
      preferredDate: "",
    },
  });

  useEffect(() => {
    if (matchedCategory && !form.getValues("categoryId")) {
      form.setValue("categoryId", matchedCategory.id);
    }
  }, [matchedCategory, form]);

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaymentStep("success");
      toast({
        title: "Pago exitoso",
        description: "Tu reserva ha sido confirmada.",
      });
    }, 1500);
  };

  const handleClosePayment = () => {
    setShowPayment(false);
    setPaymentStep("form");
    form.reset();
  };

  return (
    <div className="min-h-screen">
      <section className="bg-card border-b py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-quote-title">
                Solicitar Cotizacion
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Completa el formulario y recibiras una cotizacion personalizada
                en menos de 24 horas.
              </p>
            </div>

            {(matchedCategory || matchedSpecialist) && (
              <div className="flex flex-wrap gap-4 pt-2">
                {matchedCategory && (
                  <Card className="flex items-center gap-3 p-3 bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-primary/60 leading-none mb-1">Servicio seleccionado</p>
                      <p className="font-semibold text-sm">{matchedCategory.name}</p>
                    </div>
                  </Card>
                )}
                {matchedSpecialist && (
                  <Card className="flex items-center gap-3 p-3 bg-primary/5 border-primary/20">
                    <Avatar className="w-10 h-10 border border-primary/20">
                      <AvatarImage src={matchedSpecialist.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {matchedSpecialist.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-primary/60 leading-none mb-1">Especialista asignado</p>
                      <p className="font-semibold text-sm">{matchedSpecialist.name}</p>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8 relative overflow-hidden">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowPayment(true);
                  }}
                  className="space-y-6"
                  data-testid="form-quote"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nombre completo</label>
                      <Input placeholder="Juan Perez" {...form.register("clientName")} data-testid="input-client-name" />
                      {form.formState.errors.clientName && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.clientName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Correo electronico</label>
                      <Input type="email" placeholder="juan@ejemplo.com" {...form.register("clientEmail")} data-testid="input-client-email" />
                      {form.formState.errors.clientEmail && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.clientEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Telefono</label>
                      <Input placeholder="55 1234 5678" {...form.register("clientPhone")} data-testid="input-client-phone" />
                      {form.formState.errors.clientPhone && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.clientPhone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Tipo de servicio</label>
                      <Select 
                        onValueChange={(val) => form.setValue("categoryId", val)} 
                        value={form.watch("categoryId")}
                      >
                        <SelectTrigger data-testid="select-service-type">
                          <SelectValue placeholder="Selecciona un servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATIC_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.categoryId && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.categoryId.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Direccion del servicio</label>
                    <Input placeholder="Calle, Colonia, Ciudad" {...form.register("address")} data-testid="input-address" />
                    {form.formState.errors.address && (
                      <p className="text-sm font-medium text-destructive">{form.formState.errors.address.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Fecha preferida (opcional)</label>
                    <Input type="date" {...form.register("preferredDate")} data-testid="input-preferred-date" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Descripcion del servicio</label>
                    <Textarea placeholder="Describe lo que necesitas..." rows={4} {...form.register("description")} data-testid="input-description" />
                    {form.formState.errors.description && (
                      <p className="text-sm font-medium text-destructive">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    data-testid="button-submit-quote"
                    onClick={() => setShowPayment(true)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Cotizacion
                  </Button>
                </form>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Informacion de Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Telefono</p>
                      <p className="font-medium">+52 55 1234 5678</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Correo</p>
                      <p className="font-medium">contacto@multiservicios.mx</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Ubicacion</p>
                      <p className="font-medium">Ciudad de Mexico</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">Proceso de Cotizacion</h3>
                <ol className="space-y-3">
                  {[
                    "Completa el formulario con tus datos",
                    "Un especialista revisara tu solicitud",
                    "Recibe tu cotizacion personalizada",
                    "Confirma y agenda el servicio",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-[425px]">
          {paymentStep === "form" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Confirmar Reserva
                </DialogTitle>
                <DialogDescription>
                  Para confirmar tu solicitud, se requiere un pago de deposito de $200 MXN que se descontara del total.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Numero de Tarjeta</label>
                  <Input placeholder="0000 0000 0000 0000" disabled={isPaying} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Expira</label>
                    <Input placeholder="MM/YY" disabled={isPaying} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">CVV</label>
                    <Input placeholder="123" type="password" disabled={isPaying} />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Pago seguro encriptado de 256 bits
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPayment(false)} disabled={isPaying}>
                  Pagar despues
                </Button>
                <Button onClick={handlePayment} disabled={isPaying}>
                  {isPaying ? "Procesando..." : "Pagar $200 MXN"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">¡Reserva Confirmada!</DialogTitle>
                <DialogDescription className="text-center">
                  Tu pago ha sido procesado con exito. Un especialista te contactara en breve para confirmar la hora exacta.
                </DialogDescription>
              </DialogHeader>
              <Button className="w-full" onClick={handleClosePayment}>
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
