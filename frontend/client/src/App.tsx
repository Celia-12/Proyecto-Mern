import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Partners from "@/pages/partners";
import Quote from "@/pages/quote";
import About from "@/pages/about";
import Login from "@/pages/login";
import Registro from "@/pages/registro";
import Perfil from "@/pages/perfil";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

// Redirect to /login if not authenticated
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { estaAutenticado, cargando } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!cargando && !estaAutenticado) {
      navigate("/login");
    }
  }, [cargando, estaAutenticado, navigate]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!estaAutenticado) return null;
  return <Component />;
}

// Redirect to / if already authenticated (for login/registro pages)
function PublicOnlyRoute({ component: Component }: { component: React.ComponentType }) {
  const { estaAutenticado, cargando } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!cargando && estaAutenticado) {
      navigate("/");
    }
  }, [cargando, estaAutenticado, navigate]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (estaAutenticado) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/servicios" component={Services} />
      <Route path="/socios" component={Partners} />
      <Route path="/nosotros" component={About} />

      {/* Public-only routes (redirect if logged in) */}
      <Route path="/login">
        {() => <PublicOnlyRoute component={Login} />}
      </Route>
      <Route path="/registro">
        {() => <PublicOnlyRoute component={Registro} />}
      </Route>

      {/* Protected routes */}
      <Route path="/cotizacion">
        {() => <ProtectedRoute component={Quote} />}
      </Route>
      <Route path="/perfil">
        {() => <ProtectedRoute component={Perfil} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
