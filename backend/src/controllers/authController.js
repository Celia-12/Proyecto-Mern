const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const logger = require("../utils/logger");

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
    logger.info(`PERFIL actualizado: ${req.usuario._id}`);
    res.json({ success: true, usuario });
  } catch (error) {
    next(error);
  }
};

module.exports = { registro, login, obtenerPerfil, actualizarPerfil };
