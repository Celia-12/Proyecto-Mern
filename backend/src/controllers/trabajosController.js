const Trabajo = require("../models/Trabajo");
const Cotizacion = require("../models/Cotizacion");
const Especialista = require("../models/Especialista");
const Mensaje = require("../models/Mensaje");
const logger = require("../utils/logger");

// GET /api/trabajos
const listar = async (req, res, next) => {
  try {
    const { estado, page = 1, limit = 10 } = req.query;
    const filtro = {};

    if (req.usuario.tipo === "cliente") {
      filtro.cliente_id = req.usuario._id;
    } else if (req.usuario.tipo === "tecnico") {
      // find the specialist profile linked to this user
      const esp = await Especialista.findOne({ usuario_id: req.usuario._id });
      if (esp) filtro.tecnico_id = esp._id;
    }

    if (estado) filtro.estado = estado;

    const skip = (Number(page) - 1) * Number(limit);
    const [trabajos, total] = await Promise.all([
      Trabajo.find(filtro)
        .populate("cliente_id", "nombre email telefono")
        .populate({ path: "tecnico_id", populate: { path: "usuario_id", select: "nombre foto" } })
        .populate("cotizacion_id", "descripcion categoria")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Trabajo.countDocuments(filtro),
    ]);

    res.json({
      success: true,
      total,
      pagina: Number(page),
      paginas: Math.ceil(total / Number(limit)),
      trabajos,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/trabajos/:id
const obtenerUno = async (req, res, next) => {
  try {
    const trabajo = await Trabajo.findById(req.params.id)
      .populate("cliente_id", "nombre email telefono")
      .populate({ path: "tecnico_id", populate: { path: "usuario_id", select: "nombre foto" } })
      .populate("cotizacion_id");

    if (!trabajo) {
      return res.status(404).json({ success: false, message: "Trabajo no encontrado" });
    }

    res.json({ success: true, trabajo });
  } catch (error) {
    next(error);
  }
};

// POST /api/trabajos
const crear = async (req, res, next) => {
  try {
    const { cotizacion_id, tecnico_id, fecha_inicio, monto, ubicacion, descripcion_trabajo } = req.body;

    // Update the related quote to accepted
    await Cotizacion.findByIdAndUpdate(cotizacion_id, {
      estado: "aceptada",
      especialista_asignado: tecnico_id,
    });

    const trabajo = await Trabajo.create({
      cotizacion_id,
      cliente_id: req.usuario._id,
      tecnico_id,
      fecha_inicio,
      monto,
      ubicacion,
      descripcion_trabajo,
      estado: "programado",
    });

    logger.info(`TRABAJO creado: ${trabajo._id} | cotizacion: ${cotizacion_id} | monto: $${monto}`);
    res.status(201).json({ success: true, trabajo });
  } catch (error) {
    next(error);
  }
};

// PUT /api/trabajos/:id
const actualizar = async (req, res, next) => {
  try {
    const trabajo = await Trabajo.findById(req.params.id);
    if (!trabajo) {
      return res.status(404).json({ success: false, message: "Trabajo no encontrado" });
    }

    const esCliente = trabajo.cliente_id.toString() === req.usuario._id.toString();
    let esTecnico = false;
    let especialista = null;

    if (req.usuario.tipo === "tecnico") {
      especialista = await Especialista.findOne({ usuario_id: req.usuario._id });
      esTecnico = especialista && trabajo.tecnico_id.toString() === especialista._id.toString();
    }

    if (!esCliente && !esTecnico && req.usuario.tipo !== "admin") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const updateData = { ...req.body };
    const requestedEstado = req.body.estado;

    if (requestedEstado === "pendiente_confirmacion") {
      if (!esTecnico && req.usuario.tipo !== "admin") {
        return res.status(403).json({ success: false, message: "Solo el técnico puede reportar el trabajo como realizado." });
      }
      if (!["programado", "en_progreso"].includes(trabajo.estado)) {
        return res.status(400).json({ success: false, message: "El trabajo debe estar en programación o en curso para poder marcarlo como listo." });
      }
    }

    if (requestedEstado === "completado" || requestedEstado === "inconcluso") {
      if (!esCliente && req.usuario.tipo !== "admin") {
        return res.status(403).json({ success: false, message: "Solo el cliente puede confirmar la finalización del trabajo." });
      }
      if (trabajo.estado !== "pendiente_confirmacion") {
        return res.status(400).json({ success: false, message: "Solo se puede confirmar o marcar como inconcluso un trabajo que ya fue reportado como realizado." });
      }

      const finishingDate = new Date();
      updateData.fecha_fin = trabajo.fecha_fin || finishingDate;
      if (!trabajo.duracion_horas) {
        const startedAt = new Date(trabajo.fecha_inicio);
        if (!Number.isNaN(startedAt.getTime())) {
          const diffHours = (finishingDate - startedAt) / (1000 * 60 * 60);
          if (diffHours >= 0) {
            updateData.duracion_horas = Math.round(diffHours * 100) / 100;
          }
        }
      }
    }

    const actualizado = await Trabajo.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (requestedEstado === "pendiente_confirmacion") {
      await Cotizacion.findByIdAndUpdate(trabajo.cotizacion_id, {
        estado: "pendiente_confirmacion",
        especialista_asignado: trabajo.tecnico_id,
      });
    }

    if (requestedEstado === "completado") {
      await Cotizacion.findByIdAndUpdate(trabajo.cotizacion_id, {
        estado: "completada",
        especialista_asignado: trabajo.tecnico_id,
      });
    }

    if (requestedEstado === "inconcluso") {
      await Cotizacion.findByIdAndUpdate(trabajo.cotizacion_id, {
        estado: "inconclusa",
        especialista_asignado: trabajo.tecnico_id,
      });
    }

    if (requestedEstado === "pendiente_confirmacion") {
      await Mensaje.create({
        cotizacion_id: trabajo.cotizacion_id,
        de: req.usuario._id,
        para: trabajo.cliente_id,
        texto: "El técnico ha marcado el trabajo como realizado. Confirma si la cotización y el trabajo se completaron correctamente.",
      });
    }

    if (requestedEstado === "completado" || requestedEstado === "inconcluso") {
      const especialistaAsignado = await Especialista.findById(trabajo.tecnico_id);
      if (especialistaAsignado?.usuario_id) {
        await Mensaje.create({
          cotizacion_id: trabajo.cotizacion_id,
          de: req.usuario._id,
          para: especialistaAsignado.usuario_id,
          texto:
            requestedEstado === "completado"
              ? "El cliente ha confirmado que el trabajo se completó. Gracias por tu servicio."
              : "El cliente ha marcado el trabajo como inconcluso. Revisa los detalles y contacta al cliente."
        });
      }
    }

    logger.info(`TRABAJO actualizado: ${req.params.id} -> estado: ${actualizado.estado}`);
    res.json({ success: true, trabajo: actualizado });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trabajos/:id  (admin only)
const eliminar = async (req, res, next) => {
  try {
    const trabajo = await Trabajo.findById(req.params.id);
    if (!trabajo) {
      return res.status(404).json({ success: false, message: "Trabajo no encontrado" });
    }

    await trabajo.deleteOne();
    logger.info(`TRABAJO eliminado: ${req.params.id}`);
    res.json({ success: true, message: "Trabajo eliminado" });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtenerUno, crear, actualizar, eliminar };
