const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const Especialista = require("../models/Especialista");
const logger = require("../utils/logger");

//se genera un token JWT para autenticar al usuario, crea un JWT que contiene el id del usuario y vence segun JWT_EXPIRES_IN, que por defecto es 7 días. Este token se envía al cliente para que lo use en futuras solicitudes autenticadas.
const generarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/auth/registro
const registro = async (req, res, next) => {
  try {
    const { nombre, email, contrasena, telefono, tipo, ciudad, especialidad, precio_hora, bio } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una cuenta con ese email.",
      });
    }

    const usuario = await Usuario.create({
      nombre,
      email,
      contrasena,
      telefono,
      tipo: tipo || "cliente",
      ciudad,
      especialidad: tipo === "tecnico" ? especialidad : undefined,
      precio_hora: tipo === "tecnico" ? precio_hora : undefined,
      bio,
    });

    const token = generarToken(usuario._id);

    logger.info(`REGISTRO nuevo usuario: ${usuario._id} (${usuario.email})`);

    res.status(201).json({
      success: true,
      message: "Cuenta creada exitosamente",
      token,
      usuario,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, contrasena } = req.body;

    const usuario = await Usuario.findOne({ email }).select("+contrasena");
    if (!usuario || !(await usuario.compararContrasena(contrasena))) {
      logger.warn(`LOGIN fallido para email: ${email}`, { ip: req.ip });
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas.",
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: "Cuenta desactivada. Contacta soporte.",
      });
    }

    const token = generarToken(usuario._id);

    logger.info(`LOGIN exitoso: ${usuario._id} (${usuario.email})`);

    // Remove password from response
    usuario.contrasena = undefined;

    res.json({
      success: true,
      message: "Sesión iniciada",
      token,
      usuario,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/perfil
const obtenerPerfil = async (req, res) => {
  res.json({ success: true, usuario: req.usuario });
};

// PUT /api/auth/perfil
const actualizarPerfil = async (req, res, next) => {
  try {
    const { nombre, telefono, ciudad, foto, bio, codigo_postal, precio_hora } = req.body;
    const updates = { nombre, telefono, ciudad, foto, bio, codigo_postal, precio_hora };
    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });
    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario._id,
      updates,
      { new: true, runValidators: true }
    );

    // If the user has an Especialista profile, keep shared fields in sync.
    const especialistaUpdates = {};
    if (precio_hora !== undefined) especialistaUpdates.precio_hora = precio_hora;
    if (bio !== undefined) especialistaUpdates.bio = bio;
    if (Object.keys(especialistaUpdates).length > 0) {
      await Especialista.findOneAndUpdate(
        { usuario_id: req.usuario._id },
        especialistaUpdates,
        { new: true, runValidators: true }
      );
    }

    logger.info(`PERFIL actualizado: ${req.usuario._id}`);
    res.json({ success: true, usuario });
  } catch (error) {
    next(error);
  }
};

module.exports = { registro, login, obtenerPerfil, actualizarPerfil };
