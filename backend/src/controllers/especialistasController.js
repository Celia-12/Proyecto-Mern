const Especialista = require("../models/Especialista");
const logger = require("../utils/logger");

// GET /api/especialistas
const listar = async (req, res, next) => {
  try {
    const {
      especialidad,
      disponible,
      page = 1,
      limit = 10,
      sort = "-calificacion_promedio",
    } = req.query;

    const filtro = {};
    if (especialidad) filtro.especialidad = especialidad;
    if (disponible !== undefined) filtro.disponible = disponible === "true";

    const skip = (Number(page) - 1) * Number(limit);
    const [especialistas, total] = await Promise.all([
      Especialista.find(filtro)
        .populate("usuario_id", "nombre email foto ciudad telefono")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Especialista.countDocuments(filtro),
    ]);

    res.json({
      success: true,
      total,
      pagina: Number(page),
      paginas: Math.ceil(total / Number(limit)),
      especialistas,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/especialistas/:id
const obtenerUno = async (req, res, next) => {
  try {
    const esp = await Especialista.findById(req.params.id).populate(
      "usuario_id",
      "nombre email foto ciudad telefono"
    );
    if (!esp) {
      return res.status(404).json({ success: false, message: "Especialista no encontrado" });
    }
    res.json({ success: true, especialista: esp });
  } catch (error) {
    next(error);
  }
};

// POST /api/especialistas
const crear = async (req, res, next) => {
  try {
    const existe = await Especialista.findOne({ usuario_id: req.usuario._id });
    if (existe) {
      return res.status(409).json({
        success: false,
        message: "Ya tienes un perfil de especialista registrado.",
      });
    }

    const esp = await Especialista.create({
      ...req.body,
      usuario_id: req.usuario._id,
    });

    logger.info(`ESPECIALISTA creado: ${esp._id} por usuario ${req.usuario._id}`);
    res.status(201).json({ success: true, especialista: esp });
  } catch (error) {
    next(error);
  }
};

// PUT /api/especialistas/:id
const actualizar = async (req, res, next) => {
  try {
    const esp = await Especialista.findById(req.params.id);
    if (!esp) {
      return res.status(404).json({ success: false, message: "Especialista no encontrado" });
    }

    // Only owner or admin can update
    if (
      esp.usuario_id.toString() !== req.usuario._id.toString() &&
      req.usuario.tipo !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const actualizado = await Especialista.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    logger.info(`ESPECIALISTA actualizado: ${req.params.id}`);
    res.json({ success: true, especialista: actualizado });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/especialistas/:id
const eliminar = async (req, res, next) => {
  try {
    const esp = await Especialista.findById(req.params.id);
    if (!esp) {
      return res.status(404).json({ success: false, message: "Especialista no encontrado" });
    }

    if (
      esp.usuario_id.toString() !== req.usuario._id.toString() &&
      req.usuario.tipo !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    await esp.deleteOne();
    logger.info(`ESPECIALISTA eliminado: ${req.params.id}`);
    res.json({ success: true, message: "Especialista eliminado" });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtenerUno, crear, actualizar, eliminar };
