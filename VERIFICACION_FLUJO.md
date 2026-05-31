# Verificación del Flujo de Cotizaciones - MERN

## Resumen Ejecutivo
El proyecto está **parcialmente implementado**. Hay un **problema crítico** en el flujo de rechazo de solicitudes de técnicos: **falta la interfaz de usuario para que el cliente rechace la solicitud del técnico**.

---

## ✅ Funcionalidades CORRECTAMENTE Implementadas

### 1. **Usuarios y Técnicos con Roles Diferenciados**
- ✅ Modelo `Usuario` con campo `tipo` ("cliente" o "tecnico")
- ✅ Modelo `Especialista` vinculado a cada técnico
- ✅ Perfiles personales vs públicos

### 2. **Cotizaciones Públicas Visibles en `/nuevos-trabajos`**
- ✅ Endpoint `/api/cotizaciones/recientes` obtiene cotizaciones públicas pendientes
- ✅ Filtro: `estado: "pendiente"` + `publica: true`
- ✅ Solo visible para técnicos (`usuario.tipo === "tecnico"`)
- ✅ Muestra datos del cliente, categoría, ubicación

### 3. **Técnicos Pueden Aceptar/Rechazar Cotizaciones**
- ✅ Botón "Aceptar cotización" en `/nuevos-trabajos`
- ✅ Botón "Rechazar" en `/cotizacion/:id` (ambos disponibles)
- ✅ Endpoint PUT `/api/cotizaciones/:id` con `accion: "aceptar"` o `accion: "rechazar"`
- ✅ Estado cambia a `"en_revision"` (aceptada) o `"rechazada"` (rechazada)

### 4. **Chat Entre Técnico y Cliente**
- ✅ Modelo `Mensaje` con campos: `cotizacion_id`, `de`, `para`, `texto`, `leido`
- ✅ Componente de chat en `/cotizacion/:id`
- ✅ Notificaciones del sistema (aceptación, rechazo, confirmación)
- ✅ Funciona después de que técnico acepta (estado `"en_revision"`)

### 5. **Confirmación Mutua de Terminación**
- ✅ Técnico marca como "pendiente_confirmacion" con botón "Terminar cotización"
- ✅ Cliente confirma como "completado" o "inconcluso"
- ✅ Estados de Trabajo: `programado` → `pendiente_confirmacion` → `completado`/`inconcluso`
- ✅ Mensajes de notificación en cada paso

### 6. **Calificaciones**
- ✅ Modelo `Calificacion` implementado
- ✅ Cliente puede calificar después de `estado: "completada"`
- ✅ Campos: `estrellas` (1-5), `comentario`, `tipo: "cliente_a_tecnico"`

### 7. **Creación de Cotización Pública**
- ✅ Cliente puede crear cotización en `/solicitar-cotizacion`
- ✅ Si no especifica técnico específico → `publica: true`
- ✅ Si especifica técnico → `publica: false` (solicitud directa)

---

## ❌ PROBLEMA CRÍTICO: Rechazo de Solicitud de Técnico

### El Problema
Cuando un técnico acepta una cotización (`estado: "en_revision"`), el cliente **NO TIENE FORMA DE RECHAZAR** la solicitud.

#### Situación:
1. Cliente crea cotización pública
2. Técnico la acepta → `estado: "en_revision"`
3. Cliente quiere rechazar la solicitud del técnico...
   - **NO hay botón en la interfaz para hacerlo** ❌
   - El código backend soporta `accion: "reabrir"`, pero no hay UI

### Código Backend (EXISTE pero NO se usa)
**Archivo:** `backend/src/controllers/cotizacionesController.js` (líneas 372-380)
```javascript
} else if (req.body.accion === "reabrir") {
    if (!["en_revision", "aceptada"].includes(cot.estado) || cot.trabajo_id) {
      return res.status(400).json({
        success: false,
        message: "Solo se puede reabrir una cotización que está en revisión o aceptada sin trabajo.",
      });
    }
    camposPermitidos = {
      estado: "pendiente",
      publica: true,
      especialista_asignado: null,
    };
}
```

### Código Frontend (FALTA)
**Archivo:** `frontend/client/src/pages/cotizacion-detalle.tsx`
- **Línea 79-82:** Técnico tiene botones "Aceptar trabajo" y "Rechazar cotización"
- **FALTA:** Cliente no tiene botón para rechazar la solicitud del técnico cuando `estado === "en_revision"`

### Consecuencia
**El flujo que mencionaste:**
> Cuando se rechaza la solicitud del tecnico, la cotización vuelve a estar visible en /nuevos-trabajos

**NO funciona completamente** porque:
- El cliente no puede rechazar la solicitud
- La cotización se queda en estado `"en_revision"` indefinidamente
- No vuelve a aparecer en `/nuevos-trabajos` para que otros técnicos la vean

---

## 📋 Casos de Uso Según el Flujo Especificado

### ✅ Caso 1: Cotización Pública → Técnico Acepta → Cliente Confirma
1. Cliente crea cotización pública
2. Técnico ve en `/nuevos-trabajos`
3. Técnico acepta → `estado: "en_revision"`
4. Cliente confirma → `estado: "aceptada"`, se crea `Trabajo`
5. Técnico marca como realizado → `estado: "pendiente_confirmacion"`
6. Cliente confirma como completado → `estado: "completada"`
7. Cliente califica → Rating guardado

### ❌ Caso 2: Cotización Pública → Técnico Acepta → Cliente Rechaza (INCOMPLETO)
1. Cliente crea cotización pública
2. Técnico ve en `/nuevos-trabajos`
3. Técnico acepta → `estado: "en_revision"`
4. **Cliente quiere rechazar... SIN INTERFAZ** ❌
   - El backend puede si se envía `accion: "reabrir"`
   - Pero no hay botón en `/cotizacion/:id`

### ✅ Caso 3: Cotización Pública → Técnico Rechaza
1. Cliente crea cotización pública
2. Técnico la rechaza → `estado: "rechazada"`
3. Cotización desaparece de `/nuevos-trabajos` ✅
4. **PERO:** No se reactiva para que otros técnicos la vean
   - Debería: `estado: "pendiente"` para que vuelva a aparecer

---

## 🔧 Problemas de Diseño Identificados

### Problema 1: Estados Confusos
**Estados de Cotización:**
- `pendiente` - Inicial
- `en_revision` - Técnico aceptó, esperando confirmación de cliente
- `aceptada` - Cliente confirmó
- `pendiente_confirmacion` - Trabajo realizado, esperando confirmación
- `rechazada` - Rechazada
- `completada` - Completada
- `inconclusa` - Marcada como inconclusa

**Problema:** `"aceptada"` e `"en_revision"` tienen significados similares. Sería más claro:
- `"pendiente"` - Inicial
- `"tecnico_aceptó"` - Técnico aceptó, esperando cliente
- `"aceptada"` - Cliente confirmó
- etc.

### Problema 2: No hay Reactivación de Cotización Rechazada
Cuando un técnico rechaza una cotización:
- `estado` cambia a `"rechazada"`
- `publica` sigue siendo `true`
- Pero `/api/cotizaciones/recientes` filtra por `estado: "pendiente"`
- **Resultado:** La cotización desaparece y otros técnicos no la ven

**Debería hacer:**
```javascript
// Cuando técnico rechaza:
estado: "pendiente",  // Vuelve a ser visible
publica: true,         // Sigue siendo pública
especialista_asignado: null
```

### Problema 3: No hay Diferencia entre Solicitud Directa y Pública Rechazada
- **Cotización pública:** visible en `/nuevos-trabajos`
- **Solicitud directa a técnico:** `publica: false`
- **Si técnico rechaza solicitud directa:** debería notificar al cliente, pero no reactivarse

---

## 🎯 Recomendaciones de Corrección

### Corrección 1: Agregar Botón de Rechazo del Cliente
**Archivo:** `frontend/client/src/pages/cotizacion-detalle.tsx`

Después de línea 82, agregar:
```typescript
{usuario?.tipo === "cliente" && ["en_revision", "aceptada"].includes(cot?.estado ?? "") && (
  <Button
    size="sm"
    variant="destructive"
    onClick={async () => {
      try {
        await reabrirCotizacion.mutateAsync(cotizacionId);
        toast({
          title: "Solicitud rechazada",
          description: "La solicitud del técnico fue rechazada y la cotización vuelve a ser pública.",
        });
      } catch (err: unknown) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err instanceof Error ? err.message : "No se pudo rechazar la solicitud.",
        });
      }
    }}
    disabled={/* loading states */}
  >
    Rechazar solicitud del técnico
  </Button>
)}
```

Y agregar hook en `useApi.ts`:
```typescript
export function useRea brirCotizacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cotizacionId: string) => {
      const res = await api.put(`/cotizaciones/${cotizacionId}`, { accion: "reabrir" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error reabriendo cotización");
      return json;
    },
    onSuccess: (_data, cotizacionId) => {
      qc.invalidateQueries({ queryKey: ["cotizaciones"] });
      qc.invalidateQueries({ queryKey: ["cotizacion", cotizacionId] });
      qc.invalidateQueries({ queryKey: ["cotizaciones", "recientes"] });
    },
  });
}
```

### Corrección 2: Reactivar Cotización Cuando Técnico Rechaza
**Archivo:** `backend/src/controllers/cotizacionesController.js`

Cambiar línea ~346:
```javascript
// ANTES:
if (req.body.accion === "rechazar") {
  camposPermitidos = { estado: "rechazada" };
}

// DESPUÉS:
if (req.body.accion === "rechazar") {
  // Distinguir entre solicitud directa y pública
  if (cot.publica) {
    // Si es pública, reactivar para otros técnicos
    camposPermitidos = {
      estado: "pendiente",
      publica: true,
      especialista_asignado: null,
    };
  } else {
    // Si es solicitud directa, marcar como rechazada
    camposPermitidos = { estado: "rechazada" };
  }
}
```

---

## 📊 Matriz de Verificación

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| Usuarios y técnicos | ✅ | Roles implementados |
| Cotización pública | ✅ | Visible en `/nuevos-trabajos` |
| Técnico acepta | ✅ | Botón y lógica funcionan |
| Técnico rechaza | ✅ | Botón existe en `/cotizacion/:id` |
| Cliente rechaza solicitud | ❌ | **NO hay botón en UI** |
| Chat tecnico-cliente | ✅ | Implementado correctamente |
| Confirmación mutua | ✅ | Técnico → Cliente confirmación |
| Calificación | ✅ | Disponible después de completada |
| Reactivación en nuevos-trabajos | ⚠️ | Parcial (no reactivar en rechazo) |

---

## Archivos Clave Revisados

### Backend
- ✅ `/backend/src/controllers/cotizacionesController.js` - Lógica de cotizaciones
- ✅ `/backend/src/controllers/trabajosController.js` - Estados del trabajo
- ✅ `/backend/src/models/Cotizacion.js` - Esquema
- ✅ `/backend/src/routes/cotizaciones.js` - Endpoints

### Frontend
- ✅ `/frontend/client/src/pages/nuevos-trabajos.tsx` - Lista pública
- ✅ `/frontend/client/src/pages/cotizacion-detalle.tsx` - Detalle y acciones
- ✅ `/frontend/client/src/pages/solicitar-cotizacion.tsx` - Crear cotización
- ✅ `/frontend/client/src/hooks/useApi.ts` - Mutations y queries

---

## Conclusión

El proyecto **funciona en su mayoría**, pero tiene **un flujo incompleto** crítico:

### El cliente NO puede rechazar una solicitud de técnico después de que este la acepta.

Esto rompe el ciclo de vida esperado de una cotización pública donde:
1. Múltiples técnicos pueden verla
2. Un técnico la acepta
3. Si el cliente no quiere, debería poder rechazarla
4. Otros técnicos deberían verla de nuevo

**Acción recomendada:** Implementar el botón "Rechazar solicitud" en el frontend y ajustar la lógica de rechazo en el backend para reactivar cotizaciones públicas rechazadas.
