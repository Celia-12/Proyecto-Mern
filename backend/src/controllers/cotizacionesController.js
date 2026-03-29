const Cotizacion = require("../models/Cotizacion");
const logger = require("../utils/logger");

// GET /api/cotizaciones
const listar = async (req, res, next) => {
  try {
    const { estado, page = 1, limit = 10 } = req.query;
    const filtro = {};

    // Clients see only their own, admins see all
    if (req.usuario.tipo === "cliente") {
      filtro.cliente_id = req.usuario._id;
    }
    if (estado) filtro.estado = estado;

    const skip = (Number(page) - 1) * Number(limit);
    const [cotizaciones, total] = await Promise.all([
      Cotizacion.find(filtro)
        .populate("cliente_id", "nombre email telefono")
        .populate("especialista_asignado")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Cotizacion.countDocuments(filtro),
    ]);

    res.json({
      success: true,
      total,
      pagina: Number(page),
      paginas: Math.ceil(total / Number(limit)),
      cotizaciones,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/cotizaciones/:id
const obtenerUna = async (req, res, next) => {
  try {
    const cot = await Cotizacion.findById(req.params.id)
      .populate("cliente_id", "nombre email telefono")
      .populate("especialistas_notificados")
      .populate("especialista_asignado");

    if (!cot) {
      return res.status(404).json({ success: false, message: "Cotización no encontrada" });
    }

    // Only owner or admin
    if (
      cot.cliente_id._id.toString() !== req.usuario._id.toString() &&
      req.usuario.tipo !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    res.json({ success: true, cotizacion: cot });
  } catch (error) {
    next(error);
  }
};

// POST /api/cotizaciones
const crear = async (req, res, next) => {
  try {
    const cot = await Cotizacion.create({
      ...req.body,
      cliente_id: req.usuario._id,
      estado: "pendiente",
    });

    logger.info(`COTIZACION creada: ${cot._id} por cliente ${req.usuario._id}`);
    res.status(201).json({ success: true, cotizacion: cot });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cotizaciones/:id
const actualizar = async (req, res, next) => {
  try {
    const cot = await Cotizacion.findById(req.params.id);
    if (!cot) {
      return res.status(404).json({ success: false, message: "Cotización no encontrada" });
    }

    if (
      cot.cliente_id.toString() !== req.usuario._id.toString() &&
      req.usuario.tipo !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    // Clients can only cancel; admins can change any field
    const camposPermitidos =
      req.usuario.tipo === "admin"
        ? req.body
        : { estado: req.body.estado === "rechazada" ? "rechazada" : undefined };

    const actualizada = await Cotizacion.findByIdAndUpdate(
      req.params.id,
      camposPermitidos,
      { new: true, runValidators: true }
    );

    logger.info(`COTIZACION actualizada: ${req.params.id} -> estado: ${actualizada.estado}`);
    res.json({ success: true, cotizacion: actualizada });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cotizaciones/:id
const eliminar = async (req, res, next) => {
  try {
    const cot = await Cotizacion.findById(req.params.id);
    if (!cot) {
      return res.status(404).json({ success: false, message: "Cotización no encontrada" });
    }

    if (
      cot.cliente_id.toString() !== req.usuario._id.toString() &&
      req.usuario.tipo !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    if (!["pendiente", "rechazada"].includes(cot.estado)) {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden eliminar cotizaciones pendientes o rechazadas.",
      });
    }

    await cot.deleteOne();
    logger.info(`COTIZACION eliminada: ${req.params.id}`);
    res.json({ success: true, message: "Cotización eliminada" });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtenerUna, crear, actualizar, eliminar };
