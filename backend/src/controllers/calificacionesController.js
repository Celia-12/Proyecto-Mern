const Calificacion = require("../models/Calificacion");
const Trabajo = require("../models/Trabajo");
const logger = require("../utils/logger");

// GET /api/calificaciones?especialista_id=xxx
const listar = async (req, res, next) => {
  try {
    const { especialista_id, tipo, page = 1, limit = 10 } = req.query;
    const filtro = {};

    if (especialista_id) filtro.especialista_id = especialista_id;
    if (tipo) filtro.tipo = tipo;

    const skip = (Number(page) - 1) * Number(limit);
    const [calificaciones, total] = await Promise.all([
      Calificacion.find(filtro)
        .populate("quien_califica", "nombre foto")
        .populate("a_quien", "nombre foto")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Calificacion.countDocuments(filtro),
    ]);

    res.json({
      success: true,
      total,
      pagina: Number(page),
      paginas: Math.ceil(total / Number(limit)),
      calificaciones,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/calificaciones/:id
const obtenerUna = async (req, res, next) => {
  try {
    const cal = await Calificacion.findById(req.params.id)
      .populate("quien_califica", "nombre foto")
      .populate("a_quien", "nombre foto");

    if (!cal) {
      return res.status(404).json({ success: false, message: "Calificación no encontrada" });
    }
    res.json({ success: true, calificacion: cal });
  } catch (error) {
    next(error);
  }
};

// POST /api/calificaciones
const crear = async (req, res, next) => {
  try {
    const { trabajo_id, a_quien, especialista_id, estrellas, comentario, tipo } = req.body;

    // Verify the job exists and belongs to this user
    const trabajo = await Trabajo.findById(trabajo_id);
    if (!trabajo) {
      return res.status(404).json({ success: false, message: "Trabajo no encontrado" });
    }

    if (trabajo.estado !== "completado") {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden calificar trabajos completados.",
      });
    }

    const cal = await Calificacion.create({
      trabajo_id,
      quien_califica: req.usuario._id,
      a_quien,
      especialista_id,
      estrellas,
      comentario,
      tipo,
    });

    // Mark job as rated
    await Trabajo.findByIdAndUpdate(trabajo_id, { calificado: true });

    logger.info(
      `CALIFICACION creada: ${cal._id} | ${estrellas} estrellas | trabajo: ${trabajo_id}`
    );
    res.status(201).json({ success: true, calificacion: cal });
  } catch (error) {
    // Duplicate key = already rated
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Ya calificaste este trabajo.",
      });
    }
    next(error);
  }
};

// PUT /api/calificaciones/:id
const actualizar = async (req, res, next) => {
  try {
    const cal = await Calificacion.findById(req.params.id);
    if (!cal) {
      return res.status(404).json({ success: false, message: "Calificación no encontrada" });
    }

    if (
      cal.quien_califica.toString() !== req.usuario._id.toString() &&
      req.usuario.tipo !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const { estrellas, comentario } = req.body;
    const actualizada = await Calificacion.findByIdAndUpdate(
      req.params.id,
      { estrellas, comentario },
      { new: true, runValidators: true }
    );

    logger.info(`CALIFICACION actualizada: ${req.params.id}`);
    res.json({ success: true, calificacion: actualizada });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/calificaciones/:id
const eliminar = async (req, res, next) => {
  try {
    const cal = await Calificacion.findById(req.params.id);
    if (!cal) {
      return res.status(404).json({ success: false, message: "Calificación no encontrada" });
    }

    if (
      cal.quien_califica.toString() !== req.usuario._id.toString() &&
      req.usuario.tipo !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    await cal.deleteOne();
    logger.info(`CALIFICACION eliminada: ${req.params.id}`);
    res.json({ success: true, message: "Calificación eliminada" });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtenerUna, crear, actualizar, eliminar };
