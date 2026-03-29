# Multiservicios Técnicos — Frontend

Aplicación web para conectar clientes con técnicos especializados en el área metropolitana de Monterrey. Construida con React, TypeScript y Tailwind CSS.

---

## Tecnologías

| Herramienta | Uso |
|-------------|-----|
| React 18 | Librería de UI |
| TypeScript | Tipado estático |
| Vite | Bundler y servidor de desarrollo |
| Tailwind CSS | Estilos utilitarios |
| shadcn/ui | Componentes de UI |
| TanStack Query | Manejo de estado del servidor |
| Wouter | Enrutamiento |
| React Hook Form + Zod | Formularios con validación |
| Lucide React | Iconos |

---

## Instalación

### Prerrequisitos
- Node.js 18 o superior
- El backend debe estar corriendo en `http://localhost:3001`

### Pasos

```bash
# 1. Entrar a la carpeta
cd frontend

# 2. Instalar dependencias
npm install
```

Crear el archivo de variables de entorno desde CMD:

```bash
echo VITE_API_URL=http://localhost:3001/api > .env
```

```bash
# 4. Iniciar la aplicación
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Genera build de producción |
| `npm run preview` | Vista previa del build de producción |

---

## Estructura del proyecto

```
frontend/
├── .env                      ← Variables de entorno (NO subir a GitHub)
├── .env.example              ← Plantilla de variables de entorno
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── client/
    └── src/
        ├── App.tsx           ← Rutas y providers principales
        ├── main.tsx          ← Entry point
        ├── index.css         ← Estilos globales y variables CSS
        ├── context/
        │   └── AuthContext.tsx     ← Estado global de autenticación
        ├── hooks/
        │   └── useApi.ts           ← Hooks de React Query para la API
        ├── lib/
        │   ├── api.ts              ← Cliente HTTP con soporte JWT
        │   ├── queryClient.ts      ← Configuración de TanStack Query
        │   └── utils.ts            ← Utilidades
        ├── components/
        │   ├── navbar.tsx          ← Barra de navegación con auth
        │   ├── footer.tsx          ← Pie de página
        │   ├── theme-provider.tsx  ← Proveedor de tema claro/oscuro
        │   └── ui/                 ← Componentes shadcn/ui
        └── pages/
            ├── home.tsx            ← Página principal
            ├── services.tsx        ← Catálogo de servicios
            ├── partners.tsx        ← Lista de especialistas (API)
            ├── quote.tsx           ← Formulario de cotización (API)
            ├── about.tsx           ← Quiénes somos
            ├── login.tsx           ← Inicio de sesión
            ├── registro.tsx        ← Registro de cuenta
            ├── perfil.tsx          ← Dashboard del usuario
            └── not-found.tsx       ← Página 404
```

---

## Páginas y rutas

| Ruta | Página | Acceso |
|------|--------|--------|
| `/` | Inicio | Público |
| `/servicios` | Catálogo de servicios | Público |
| `/socios` | Lista de especialistas | Público |
| `/nosotros` | Quiénes somos | Público |
| `/login` | Inicio de sesión | Solo sin sesión |
| `/registro` | Crear cuenta | Solo sin sesión |
| `/cotizacion` | Solicitar cotización | **Requiere sesión** |
| `/perfil` | Dashboard del usuario | **Requiere sesión** |

Las rutas protegidas redirigen automáticamente a `/login` si el usuario no está autenticado.

---

## Autenticación

El sistema de autenticación usa JWT almacenado en `localStorage`:

- **`AuthContext`** — Context global que expone `usuario`, `login()`, `registro()`, `logout()` y `estaAutenticado`
- **`api.ts`** — Cliente HTTP que agrega automáticamente el header `Authorization: Bearer <token>` en cada petición
- Al recibir un error 401, el sistema elimina el token y cierra la sesión automáticamente

---

## Comunicación con el Backend

Toda la comunicación con el backend se hace a través del cliente HTTP en `lib/api.ts`. El frontend **nunca** accede directamente a la base de datos.

```typescript
// Ejemplo de uso
import { api } from "@/lib/api";

// GET sin autenticación
const res = await api.get("/especialistas");

// POST con autenticación (token se agrega automáticamente)
const res = await api.post("/cotizaciones", {
  descripcion: "...",
  categoria: "Plomería",
  ubicacion: "...",
});
```

Los hooks de React Query en `hooks/useApi.ts` encapsulan las llamadas más comunes:

```typescript
import { useEspecialistas, useCrearCotizacion } from "@/hooks/useApi";

// En un componente
const { data, isLoading, isError } = useEspecialistas({ disponible: true });
const crearCotizacion = useCrearCotizacion();
```

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL base de la API del backend | `http://localhost:3001/api` |

> **Importante:** El archivo `.env` no debe subirse a GitHub. El archivo `.gitignore` ya lo excluye. Usa `.env.example` como referencia.

---

## Configuración para producción

Para conectar a un backend en producción, cambia el `.env`:

```env
VITE_API_URL=https://tu-backend.com/api
```

Luego genera el build:

```bash
npm run build
```

Los archivos estáticos se generan en la carpeta `dist/`.
