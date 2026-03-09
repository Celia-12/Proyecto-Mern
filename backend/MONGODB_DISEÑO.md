# MULTISERVICIOS TECNICOS - BD

Una plataforma para que clientes encuentren técnicos en monterrey y su area metropolitana.

## 6 colecciones

### 1. usuarios

Guarda clientes y técnicos

```
{
  _id: auto,
  email: "abundis@gmail.com",
  contraseña: "123456",
  nombre: "Eduardo",
  edad: 15,
  ciudad: "Monterrey",
  teléfono: "8120000000",
  foto: "url_imagen.jpg",
  tipo: "cliente"
}
```

---

### 2. especialistas

Info del técnico

```
{
  _id: auto,
  usuario_id: id,
  especialidad: "Plomería",
  experiencia: 5,
  calificacion: 4.5,
  precio: 500,
  horario: "Matutino",
  disponible: true
}
```

Especialidades: Plomería, Electricidad, Carpintería, Cerrajería, Mantenimiento de aires, Mantenimiento general

---

### 3. cotizaciones

Solicitudes del cliente

```
{
  _id: auto,
  cliente_id: id,
  descripcion: "Reparar la coladera",
  ubicacion: "Calle Principal 123",
  estado: "en proceso",
  especialistas_id: [id1, id2, id3],
  fecha: Date,
  total: 5000
}
```

---

### 4. trabajos

El trabajo entre cliente y técnico

```
{
  _id: auto,
  cotizacion_id: id,
  cliente_id: id,
  tecnico_id: id,
  estado: "programado",
  fecha_inicio: Date,
  fecha_fin: Date,
  ubicacion: "Calle Principal 123",
  monto: 1500,
  descripcion: "Se repararon las válvulas",
  foto: "url_foto.jpg"
}
```

---

### 5. calificaciones

Las reseñas

```
{
  _id: auto,
  trabajo_id: id,
  quien_califica: id,
  a_quien: id,
  estrellas: 5,
  comentario: "Muy buen trabajo",
  fecha: Date
}
```

---

### 6. mensajes

El chat

```
{
  _id: auto,
  cotizacion_id: id,
  de: id,
  para: id,
  texto: "¿Puedes venir mañana?",
  leido: false,
  fecha: Date
}
```

---

## Relaciones entre colecciones

```
usuarios
  ├─ especialistas (por usuario_id)
  ├─ cotizaciones (por cliente_id)
  ├─ trabajos (por cliente_id o tecnico_id)
  ├─ calificaciones (por quien_califica o a_quien)
  └─ mensajes (por de o para)

cotizaciones
  ├─ trabajos (por cotizacion_id)
  ├─ especialistas (referencia en especialistas_id)
  └─ mensajes (por cotizacion_id)

trabajos
  ├─ calificaciones (por trabajo_id)
  └─ cotizaciones (por cotizacion_id)

especialistas
  └─ usuarios (por usuario_id)

mensajes
  └─ cotizaciones (por cotizacion_id)

calificaciones
  └─ trabajos (por trabajo_id)
```

---

## Qué hace cada pantalla

| Pantalla | Usa de BD |
|----------|-----------|
| Login | Lee/escribe usuarios |
| Servicios | Nada |
| Socios | Lee especialistas y calificaciones |
| Cotización | Lee especialistas, escribe cotizaciones y mensajes |
| Perfil Cliente | Lee trabajos y calificaciones |
| Perfil Especialista | Lee trabajos |
| Quiénes Somos | Nada |

---

## Un flujo típico

```
1. Cliente se registra en usuarios
2. Busca técnicos
3. Crea cotización
4. Envían mensajes
5. Se deja calificación en calificaciones
```

---

## Notas

- Cada documento se crea automáticamente con un _id
- Las fechas se guardan con Date
- Los IDs se usan para conectar colecciones
