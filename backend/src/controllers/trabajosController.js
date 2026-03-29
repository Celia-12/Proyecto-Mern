const Trabajo = require("../models/Trabajo");
const Cotizacion = require("../models/Cotizacion");
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
      const Especialista = require("../models/Especialista");
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

    if (
      trabajo.cliente_id.toString() !== req.usuario._id.toString() &&
      req.usuario.tipo !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const actualizado = await Trabajo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

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
