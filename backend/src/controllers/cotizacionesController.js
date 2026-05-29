const Cotizacion = require("../models/Cotizacion");
const Especialista = require("../models/Especialista");
const Trabajo = require("../models/Trabajo");
const Mensaje = require("../models/Mensaje");
const logger = require("../utils/logger");

// GET /api/cotizaciones
const listar = async (req, res, next) => {
  try {
    const { estado, page = 1, limit = 10 } = req.query;
    const filtro = {};

    // Clients see only their own quotes, technicians see only assigned quotes,
    // admins can see all quotes.
    if (req.usuario.tipo === "cliente") {
      filtro.cliente_id = req.usuario._id;
    } else if (req.usuario.tipo === "tecnico") {
      const esp = await Especialista.findOne({ usuario_id: req.usuario._id });
      if (esp) {
        // Show quotes where technician is assigned OR notified
        filtro.$or = [
          { especialista_asignado: esp._id },
          { especialistas_notificados: esp._id }
        ];
      } else {
        filtro.especialista_asignado = null;
      }
    }
    if (estado) filtro.estado = estado;

    const skip = (Number(page) - 1) * Number(limit);
    const [cotizaciones, total] = await Promise.all([
      Cotizacion.find(filtro)
        .populate("cliente_id", "nombre email telefono")
        .populate({ path: "especialista_asignado", populate: { path: "usuario_id", select: "nombre foto ciudad telefono" } })
        .populate({ path: "trabajo_id", populate: { path: "tecnico_id", populate: { path: "usuario_id", select: "nombre foto" } } })
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

// GET /api/cotizaciones/recientes
const recientes = async (req, res, next) => {
  try {
    if (req.usuario.tipo !== "tecnico") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Include general quotes (not targeted) AND those that specifically
    // notified this technician (size === 1 but contains this specialist id).
    const esp = await Especialista.findOne({ usuario_id: req.usuario._id });

    const baseFilter = { estado: "pendiente" };

    let findFilter;
    if (esp) {
      findFilter = {
        ...baseFilter,
        $or: [
          { especialistas_notificados: esp._id },
          { $expr: { $gt: [{ $size: "$especialistas_notificados" }, 1] } },
        ],
      };
    } else {
      // If we don't have an Especialista record for this user, fall back to
      // showing only general quotes (more than 1 notified specialist).
      findFilter = {
        ...baseFilter,
        $expr: { $gt: [{ $size: "$especialistas_notificados" }, 1] },
      };
    }

    const [cotizaciones, total] = await Promise.all([
      Cotizacion.find(findFilter)
        .populate("cliente_id", "nombre email telefono ciudad")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Cotizacion.countDocuments(findFilter),
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
      .populate({ path: "especialista_asignado", populate: { path: "usuario_id", select: "nombre foto ciudad telefono" } })
      .populate({ path: "trabajo_id", populate: { path: "tecnico_id", populate: { path: "usuario_id", select: "nombre foto" } } });

    if (!cot) {
      return res.status(404).json({ success: false, message: "Cotización no encontrada" });
    }

    // Owner, admin or any technician may view quote details
    if (
      cot.cliente_id._id.toString() !== req.usuario._id.toString() &&
      req.usuario.tipo !== "admin" &&
      req.usuario.tipo !== "tecnico"
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
    const { cliente_id, estado, ...cotizacionData } = req.body;
    const imagenes = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const oficioPorCategoria = {
      "Plomería": "Plomería",
      "Electricidad": "Electricidad",
      "Carpintería": "Carpintería",
      "Cerrajería": "Cerrajería",
      "Aire Acondicionado": "Aire Acondicionado",
      "Técnico en aire acondicionado": "Aire Acondicionado",
      "Mantenimiento General": "Mantenimiento General",
      "Paneles solares": "Paneles solares",
      "Seguridad": "Seguridad",
      "Impermeabilización": "Impermeabilización",
    };

    const especialidadBuscada = oficioPorCategoria[cotizacionData.categoria] || cotizacionData.categoria;
    const especialistas = await Especialista.find({
      especialidad: especialidadBuscada,
      codigo_postal: cotizacionData.codigo_postal,
      disponible: true,
    });

    let notificados = especialistas.map((esp) => esp._id);

    // If the client explicitly selected a specialist, prefer notifying only that one
    if (cotizacionData.especialista_id) {
      try {
        const espSeleccionado = await Especialista.findById(cotizacionData.especialista_id);
        if (espSeleccionado) {
          notificados = [espSeleccionado._id];
        }
      } catch (err) {
        // ignore and fallback to the general list
      }
    }

    const cot = await Cotizacion.create({
      ...cotizacionData,
      cliente_id: req.usuario._id,
      estado: "pendiente",
      especialistas_notificados: notificados,
      imagenes,
    });

    logger.info(`COTIZACION creada: ${cot._id} por cliente ${req.usuario._id}`);
    logger.info(`Notificados ${notificados.length} especialistas: ${notificados.join(", ")}`);

    // If the client selected a specific specialist, create a direct message notification
    if (cotizacionData.especialista_id) {
      try {
        const esp = await Especialista.findById(cotizacionData.especialista_id).populate("usuario_id");
        if (esp?.usuario_id) {
          await Mensaje.create({
            cotizacion_id: cot._id,
            de: req.usuario._id,
            para: esp.usuario_id._id,
            texto: `El cliente te solicitó una cotización para: ${cot.titulo || "(sin título)"}. Revisa la solicitud en la plataforma.`,
          });
          logger.info(`Notificación (mensaje) enviada a especialista ${esp._id}`);
        }
      } catch (err) {
        logger.warn(`No se pudo crear mensaje de notificación al especialista: ${err.message}`);
      }
    }

    res.status(201).json({ success: true, cotizacion: cot });
  } catch (error) {
    next(error);
  }
};

// POST /api/cotizaciones/:id/imagenes
const subirImagenes = async (req, res, next) => {
  try {
    const cot = await Cotizacion.findById(req.params.id);
    if (!cot) {
      return res.status(404).json({ success: false, message: "Cotización no encontrada" });
    }

    if (cot.cliente_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No se recibieron imágenes" });
    }

    const imagenes = req.files.map((file) => `/uploads/${file.filename}`);
    cot.imagenes = [...new Set([...(cot.imagenes || []), ...imagenes])];
    await cot.save();

    res.json({ success: true, cotizacion: cot });
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

    let camposPermitidos;

    if (req.usuario.tipo === "admin") {
      camposPermitidos = req.body;
    } else if (req.usuario.tipo === "tecnico") {
      if (!["aceptar", "rechazar"].includes(req.body.accion)) {
        return res.status(400).json({
          success: false,
          message: "Acción no válida para técnico.",
        });
      }

      if (cot.estado !== "pendiente") {
        return res.status(400).json({
          success: false,
          message: "Solo se pueden gestionar cotizaciones pendientes.",
        });
      }

      let esp = await Especialista.findOne({ usuario_id: req.usuario._id });
      if (!esp) {
        const especialidadMap = {
          "Plomería": "Plomería",
          "Electricidad": "Electricidad",
          "Aire Acondicionado": "Aire Acondicionado",
          "Carpintería": "Carpintería",
          "Mantenimiento General": "Mantenimiento General",
          "Cerrajería": "Cerrajería",
          "Paneles solares": "Paneles solares",
          "Seguridad": "Seguridad",
          "Impermeabilización": "Impermeabilización",
        };

        const especialidad = especialidadMap[req.usuario.especialidad] || "Mantenimiento General";

        esp = await Especialista.create({
          usuario_id: req.usuario._id,
          especialidad,
          experiencia_anos: req.usuario.experiencia_anos ?? 0,
          precio_hora: req.usuario.precio_hora ?? 0,
          codigo_postal: req.usuario.codigo_postal ?? "00000",
          ubicacion: req.usuario.ciudad || "Monterrey, NL",
          bio: req.usuario.bio || "",
          horario: req.usuario.horario || "Todo el día",
          disponible: true,
          verificado: req.usuario.activo !== false,
        });

        logger.info(`ESPECIALISTA auto-creado para técnico ${req.usuario._id} como ${esp._id}`);
      }

      if (req.body.accion === "rechazar") {
        camposPermitidos = { estado: "rechazada" };
      } else {
        camposPermitidos = {
          estado: "en_revision",
          especialista_asignado: esp._id,
        };
      }
    } else {
      // Cliente
      if (req.body.estado === "rechazada") {
        if (!["pendiente", "en_revision"].includes(cot.estado)) {
          return res.status(400).json({
            success: false,
            message: "Solo se pueden cancelar cotizaciones pendientes o en revisión.",
          });
        }

        camposPermitidos = { estado: "rechazada" };
      } else if (req.body.accion === "confirmar") {
        if (cot.cliente_id.toString() !== req.usuario._id.toString()) {
          return res.status(403).json({ success: false, message: "No autorizado" });
        }

        if (cot.estado !== "en_revision") {
          return res.status(400).json({
            success: false,
            message: "Solo se puede confirmar una cotización que ya fue aceptada por un técnico.",
          });
        }

        if (!cot.especialista_asignado) {
          return res.status(400).json({
            success: false,
            message: "No hay un técnico asignado para esta cotización.",
          });
        }

        const fechaInicio = cot.fecha_preferida ? new Date(cot.fecha_preferida) : new Date();
        const trabajo = await Trabajo.create({
          cotizacion_id: cot._id,
          cliente_id: req.usuario._id,
          tecnico_id: cot.especialista_asignado,
          fecha_inicio: fechaInicio,
          monto: cot.monto_estimado ?? 0,
          ubicacion: cot.ubicacion,
          descripcion_trabajo: cot.descripcion,
          estado: "programado",
        });

        camposPermitidos = {
          estado: "aceptada",
          trabajo_id: trabajo._id,
        };
      } else {
        return res.status(400).json({
          success: false,
          message: "Solo se puede cancelar o confirmar la cotización.",
        });
      }
    }

    const actualizada = await Cotizacion.findByIdAndUpdate(
      req.params.id,
      camposPermitidos,
      { new: true, runValidators: true }
    )
      .populate("cliente_id", "nombre email telefono")
      .populate({ path: "especialista_asignado", populate: { path: "usuario_id", select: "nombre foto ciudad telefono" } })
      .populate({ path: "trabajo_id", populate: { path: "tecnico_id", populate: { path: "usuario_id", select: "nombre foto" } } });

    if (req.usuario.tipo === "tecnico" && req.body.accion === "aceptar") {
      await Mensaje.create({
        cotizacion_id: cot._id,
        de: req.usuario._id,
        para: cot.cliente_id,
        texto: "El técnico ha aceptado tu cotización. La cotización está en proceso y ahora puedes confirmarla para continuar.",
      });
    }

    if (req.usuario.tipo === "tecnico" && req.body.accion === "rechazar") {
      await Mensaje.create({
        cotizacion_id: cot._id,
        de: req.usuario._id,
        para: cot.cliente_id,
        texto: "El técnico ha rechazado tu cotización. Puedes solicitar otro técnico o enviar una nueva solicitud.",
      });
    }

    if (req.body.accion === "confirmar") {
      const especialista = await Especialista.findById(cot.especialista_asignado);
      if (especialista?.usuario_id) {
        await Mensaje.create({
          cotizacion_id: cot._id,
          de: req.usuario._id,
          para: especialista.usuario_id,
          texto: "El cliente ha confirmado tu cotización. El trabajo está en proceso y pronto podrás marcarlo como realizado.",
        });
      }
    }

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

module.exports = { listar, recientes, obtenerUna, crear, actualizar, eliminar, subirImagenes };
