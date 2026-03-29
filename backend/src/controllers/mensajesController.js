const Mensaje = require("../models/Mensaje");
const Cotizacion = require("../models/Cotizacion");
const logger = require("../utils/logger");

// GET /api/mensajes?cotizacion_id=xxx
const listar = async (req, res, next) => {
  try {
    const { cotizacion_id, page = 1, limit = 50 } = req.query;

    if (!cotizacion_id) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el parámetro cotizacion_id",
      });
    }

    // Verify user has access to this quote
    const cot = await Cotizacion.findById(cotizacion_id);
    if (!cot) {
      return res.status(404).json({ success: false, message: "Cotización no encontrada" });
    }

    if (
      cot.cliente_id.toString() !== req.usuario._id.toString() &&
      req.usuario.tipo !== "admin" &&
      req.usuario.tipo !== "tecnico"
    ) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [mensajes, total] = await Promise.all([
      Mensaje.find({ cotizacion_id })
        .populate("de", "nombre foto tipo")
        .populate("para", "nombre foto tipo")
        .sort("createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Mensaje.countDocuments({ cotizacion_id }),
    ]);

    // Mark all messages to this user as read
    await Mensaje.updateMany(
      { cotizacion_id, para: req.usuario._id, leido: false },
      { leido: true }
    );

    res.json({
      success: true,
      total,
      pagina: Number(page),
      paginas: Math.ceil(total / Number(limit)),
      mensajes,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/mensajes/:id
const obtenerUno = async (req, res, next) => {
  try {
    const msg = await Mensaje.findById(req.params.id)
      .populate("de", "nombre foto")
      .populate("para", "nombre foto");

    if (!msg) {
      return res.status(404).json({ success: false, message: "Mensaje no encontrado" });
    }
    res.json({ success: true, mensaje: msg });
  } catch (error) {
    next(error);
  }
};

// POST /api/mensajes
const crear = async (req, res, next) => {
  try {
    const { cotizacion_id, para, texto, tipo, adjunto_url } = req.body;

    // Verify the quote exists and sender has access
    const cot = await Cotizacion.findById(cotizacion_id);
    if (!cot) {
      return res.status(404).json({ success: false, message: "Cotización no encontrada" });
    }

    const msg = await Mensaje.create({
      cotizacion_id,
      de: req.usuario._id,
      para,
      texto,
      tipo: tipo || "texto",
      adjunto_url: adjunto_url || null,
    });

    logger.info(`MENSAJE enviado: ${msg._id} | cotizacion: ${cotizacion_id}`);
    res.status(201).json({ success: true, mensaje: msg });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/mensajes/:id/leer — mark single message as read
const marcarLeido = async (req, res, next) => {
  try {
    const msg = await Mensaje.findOneAndUpdate(
      { _id: req.params.id, para: req.usuario._id },
      { leido: true },
      { new: true }
    );
    if (!msg) {
      return res.status(404).json({ success: false, message: "Mensaje no encontrado" });
    }
    res.json({ success: true, mensaje: msg });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/mensajes/:id
const eliminar = async (req, res, next) => {
  try {
    const msg = await Mensaje.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: "Mensaje no encontrado" });
    }

    if (
      msg.de.toString() !== req.usuario._id.toString() &&
      req.usuario.tipo !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    await msg.deleteOne();
    res.json({ success: true, message: "Mensaje eliminado" });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtenerUno, crear, marcarLeido, eliminar };
