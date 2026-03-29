# Multiservicios Técnicos — Backend API

API RESTful para la plataforma de servicios técnicos en el área metropolitana de Monterrey. Construida con Node.js, Express y MongoDB.

---

## Tecnologías

| Herramienta | Versión | Uso |
|-------------|---------|-----|
| Node.js | 18+ | Runtime |
| Express | 4.x | Framework HTTP |
| Mongoose | 8.x | ORM para MongoDB |
| JSON Web Token | 9.x | Autenticación |
| bcryptjs | 2.x | Hash de contraseñas |
| express-validator | 7.x | Validación de datos |
| Winston | 3.x | Sistema de logging |
| Morgan | 1.x | Logging de peticiones HTTP |

---

## Instalación

### Prerrequisitos
- Node.js 18 o superior
- MongoDB instalado localmente **o** una URI de MongoDB Atlas

### Pasos

```bash
# 1. Entrar a la carpeta
cd backend

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/multiservicios
JWT_SECRET=MultiserviciosTecnicos2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
# 4. Poblar la base de datos con datos de prueba
npm run seed

# 5. Iniciar el servidor
npm run dev
```

El servidor estará disponible en: `http://localhost:3001`
Para ver su estado: `http://localhost:3001/api/health`

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor con nodemon (recarga automática) |
| `npm start` | Inicia servidor en producción |
| `npm run seed` | Pobla la BD con datos de prueba |

---

## Estructura del proyecto

```
backend/
├── .env.example              ← Plantilla de variables de entorno
├── package.json
├── README.md
├── logs/                     ← Archivos de log (generados en runtime)
│   ├── combined.log
│   ├── error.log
│   ├── transactions.log
│   └── exceptions.log
└── src/
    ├── index.js              ← Entry point, configuración Express
    ├── models/               ← Esquemas Mongoose (ORM)
    │   ├── Usuario.js
    │   ├── Especialista.js
    │   ├── Cotizacion.js
    │   ├── Trabajo.js
    │   ├── Calificacion.js
    │   └── Mensaje.js
    ├── controllers/          ← Lógica de negocio
    │   ├── authController.js
    │   ├── especialistasController.js
    │   ├── cotizacionesController.js
    │   ├── trabajosController.js
    │   ├── calificacionesController.js
    │   └── mensajesController.js
    ├── routes/               ← Definición de endpoints
    │   ├── auth.js
    │   ├── especialistas.js
    │   ├── cotizaciones.js
    │   └── recursos.js
    ├── middleware/
    │   ├── auth.js           ← Verificación JWT
    │   └── errorHandler.js   ← Manejo global de errores
    ├── validators/
    │   └── index.js          ← Reglas de validación por recurso
    ├── utils/
    │   ├── database.js       ← Conexión a MongoDB
    │   └── logger.js         ← Configuración Winston
    └── scripts/
        └── seed.js           ← Datos de prueba
```

---

## Base de datos — 6 Colecciones

```
usuarios
  ├── especialistas  (usuario_id → usuarios)
  ├── cotizaciones   (cliente_id → usuarios)
  │     ├── trabajos      (cotizacion_id, cliente_id, tecnico_id)
  │     │     └── calificaciones  (trabajo_id, quien_califica, a_quien)
  │     └── mensajes      (cotizacion_id, de, para)
  └── calificaciones (quien_califica, a_quien → usuarios)
```

### usuarios
Almacena clientes, técnicos y administradores. Las contraseñas se hashean con bcrypt (12 rounds) antes de guardarse.

### especialistas
Perfil técnico vinculado a un usuario de tipo `tecnico`. Incluye especialidad, precio por hora, calificación promedio (actualizada automáticamente por un hook post-save en calificaciones) y disponibilidad.

### cotizaciones
Solicitudes de servicio creadas por los clientes. Flujo de estados: `pendiente → en_revision → aceptada → completada` o `rechazada`.

### trabajos
Registro del trabajo acordado entre cliente y técnico. Se crea cuando se acepta una cotización y se actualiza conforme avanza el servicio.

### calificaciones
Reseñas bidireccionales (cliente califica técnico y viceversa). Cada usuario puede calificar una vez por trabajo. Al guardar, un hook automático recalcula el promedio del especialista.

### mensajes
Chat por cotización entre cliente y técnico. Incluye estado de lectura por mensaje.

---

## Endpoints de la API

### Auth — público
```
POST   /api/auth/registro     Crear cuenta
POST   /api/auth/login        Iniciar sesión → devuelve JWT
```

### Auth — protegido (requiere token)
```
GET    /api/auth/perfil       Ver perfil del usuario autenticado
PUT    /api/auth/perfil       Actualizar perfil
```

### Especialistas
```
GET    /api/especialistas            Listar (público, con filtros)
GET    /api/especialistas/:id        Ver uno (público)
POST   /api/especialistas            Crear (requiere rol técnico)
PUT    /api/especialistas/:id        Actualizar (dueño o admin)
DELETE /api/especialistas/:id        Eliminar (dueño o admin)
```

Filtros disponibles en GET /api/especialistas:
- `?especialidad=Plomería`
- `?disponible=true`
- `?page=1&limit=10`

### Cotizaciones — todas protegidas
```
GET    /api/cotizaciones             Listar propias (admin ve todas)
GET    /api/cotizaciones/:id         Ver una
POST   /api/cotizaciones             Crear nueva
PUT    /api/cotizaciones/:id         Actualizar estado
DELETE /api/cotizaciones/:id         Eliminar (solo si está pendiente)
```

### Trabajos — todos protegidos
```
GET    /api/trabajos                 Listar propios
GET    /api/trabajos/:id             Ver uno
POST   /api/trabajos                 Crear
PUT    /api/trabajos/:id             Actualizar estado
DELETE /api/trabajos/:id             Eliminar (solo admin)
```

### Calificaciones
```
GET    /api/calificaciones           Listar (público, filtrar por especialista_id)
GET    /api/calificaciones/:id       Ver una (público)
POST   /api/calificaciones           Crear (protegido)
PUT    /api/calificaciones/:id       Actualizar (dueño)
DELETE /api/calificaciones/:id       Eliminar (dueño o admin)
```

### Mensajes — todos protegidos
```
GET    /api/mensajes?cotizacion_id=  Listar por cotización
GET    /api/mensajes/:id             Ver uno
POST   /api/mensajes                 Enviar mensaje
PATCH  /api/mensajes/:id/leer        Marcar como leído
DELETE /api/mensajes/:id             Eliminar
```

### Utilidad
```
GET    /api/health                   Estado del servidor (público)
```

---

## Autenticación

Todos los endpoints protegidos requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene al hacer login o registro y tiene una expiración configurable (por defecto 7 días).

---

## Validaciones

Todas las operaciones de escritura (POST, PUT) son validadas en el backend con `express-validator`, independientemente de las validaciones del frontend. Las validaciones incluyen:

- Longitudes mínimas y máximas de texto
- Formato de email
- Formato de teléfono (10 dígitos)
- Fechas en formato ISO 8601
- Valores de enums (especialidad, estado, tipo de usuario)
- IDs de MongoDB válidos

---

## Logging

Los logs se escriben automáticamente en la carpeta `logs/`:

| Archivo | Contenido |
|---------|-----------|
| `combined.log` | Todas las peticiones HTTP y eventos informativos |
| `error.log` | Solo errores (status 500+) con stack trace |
| `transactions.log` | Transacciones críticas: login, registro, nuevas cotizaciones |
| `exceptions.log` | Excepciones no capturadas del proceso Node.js |

---

## Cuentas de prueba (después de ejecutar el seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@multiservicios.mx | admin123456 |
| Cliente | cliente@demo.com | demo123456 |
| Cliente | maria@demo.com | demo123456 |
| Cliente | luis@demo.com | demo123456 |
| Técnico | carlos@multiservicios.mx | tecnico123456 |
| Técnico | roberto@multiservicios.mx | tecnico123456 |
| Técnico | miguel@multiservicios.mx | tecnico123456 |
| Técnico | juan@multiservicios.mx | tecnico123456 |
| Técnico | fernando@multiservicios.mx | tecnico123456 |
| Técnico | alejandro@multiservicios.mx | tecnico123456 |

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3001` |
| `MONGODB_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/multiservicios` |
| `JWT_SECRET` | Clave secreta para firmar tokens | `mi_clave_secreta_larga` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:3000` |

> **Importante:** Nunca subas el archivo `.env` a GitHub. El archivo `.gitignore` ya lo excluye.
