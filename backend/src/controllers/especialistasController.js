const Especialista = require("../models/Especialista");
const Usuario = require("../models/Usuario");
const logger = require("../utils/logger");
const { normalizeEspecialidad } = require("../utils/especialidades2");

function mapUsuarioToEspecialista(usuario) {
  return {
    _id: usuario._id,
    especialidad: normalizeEspecialidad(usuario.especialidad || "Mantenimiento General"),
    experiencia_anos: usuario.experiencia_anos || 0,
    precio_hora: usuario.precio_hora || 0,
    calificacion_promedio: usuario.calificacion_promedio ?? undefined,
    total_resenas: usuario.total_resenas ?? undefined,
    disponible: usuario.activo !== false,
    verificado: usuario.activo !== false,
    bio: usuario.bio || "",
    horario: usuario.horario || "",
    ubicacion: usuario.ciudad || "",
    usuario_id: {
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      foto: usuario.foto,
      ciudad: usuario.ciudad,
      telefono: usuario.telefono,
    },
  };
}

async function obtenerOCrearEspecialistaDesdeUsuario(usuario) {
  let esp = await Especialista.findOne({ usuario_id: usuario._id }).populate(
    "usuario_id",
    "nombre email foto ciudad telefono"
  );

  if (!esp) {
    const especialidad = normalizeEspecialidad(usuario.especialidad);
    try {
      esp = await Especialista.create({
        usuario_id: usuario._id,
        especialidad,
        experiencia_anos: usuario.experiencia_anos || 0,
        precio_hora: usuario.precio_hora || 0,
        codigo_postal: usuario.codigo_postal || "00000",
        ubicacion: usuario.ciudad || "",
        bio: usuario.bio || "",
        horario: usuario.horario || "",
        disponible: usuario.activo !== false,
        verificado: usuario.activo !== false,
      });
      await esp.populate("usuario_id", "nombre email foto ciudad telefono");
    } catch (error) {
      logger.warn(
        `No se pudo crear Especialista para usuario ${usuario._id}: ${error.message}`
      );
      return mapUsuarioToEspecialista(usuario);
    }
  }

  return esp;
}

// GET /api/especialistas
const listar = async (req, res, next) => {
  try {
    const {
      especialidad,
      usuario_id,
      page = 1,
      limit = 10,
      sort = "-calificacion_promedio",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build filter for usuarios collection
    const usuarioFiltro = { tipo: "tecnico", activo: true };
    if (especialidad) usuarioFiltro.especialidad = normalizeEspecialidad(especialidad);
    if (usuario_id) usuarioFiltro._id = usuario_id;

    // Fetch all matching technicians from Usuario collection
    const [usuarios, usuariosTotal] = await Promise.all([
      Usuario.find(usuarioFiltro)
        .select("-contrasena")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Usuario.countDocuments(usuarioFiltro),
    ]);

    // Map usuarios to especialista docs, creating missing perfiles
    const especialistas = await Promise.all(
      usuarios.map(async (usuario) => {
        try {
          return await obtenerOCrearEspecialistaDesdeUsuario(usuario);
        } catch (err) {
          logger.warn(`Error creando perfil de especialista para usuario ${usuario._id}: ${err.message}`);
          return null;
        }
      })
    );

    res.json({
      success: true,
      total: usuariosTotal,
      pagina: Number(page),
      paginas: Math.ceil(usuariosTotal / Number(limit)),
      especialistas: especialistas.filter(Boolean),
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

    if (esp) {
      return res.json({ success: true, especialista: esp });
    }

    const usuario = await Usuario.findById(req.params.id).select("-contrasena");
    if (!usuario || usuario.tipo !== "tecnico") {
      return res.status(404).json({ success: false, message: "Especialista no encontrado" });
    }

    res.json({ success: true, especialista: mapUsuarioToEspecialista(usuario) });
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

// POST /api/especialistas/:id/imagenes
const subirImagenes = async (req, res, next) => {
  try {
    const esp = await Especialista.findById(req.params.id);
    if (!esp) {
      return res.status(404).json({ success: false, message: "Especialista no encontrado" });
    }

    // only owner or admin can upload images
    if (esp.usuario_id.toString() !== req.usuario._id.toString() && req.usuario.tipo !== "admin") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No se recibieron archivos" });
    }

    const imagenes = req.files.map((file) => `/uploads/${file.filename}`);
    esp.imagenes = [...new Set([...(esp.imagenes || []), ...imagenes])];
    await esp.save();
    await esp.populate("usuario_id", "nombre email foto ciudad telefono");

    res.json({ success: true, especialista: esp });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtenerUno, crear, actualizar, eliminar, subirImagenes };
