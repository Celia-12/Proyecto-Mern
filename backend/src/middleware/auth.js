const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const logger = require("../utils/logger");

/**
 * Protect routes — verifies JWT and attaches user to req
 */
const proteger = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado. Token requerido.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(decoded.id).select("-contrasena");

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: "Token inválido. Usuario no encontrado.",
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: "Cuenta desactivada.",
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    logger.error(`Error de autenticación: ${error.message}`, {
      ip: req.ip,
      path: req.path,
    });

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Token inválido." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expirado." });
    }

    res.status(500).json({ success: false, message: "Error del servidor." });
  }
};

/**
 * Restrict to specific roles
 */
const autorizar = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.tipo)) {
      logger.warn(`Acceso denegado por rol: usuario ${req.usuario._id} intentó acceder como ${roles}`, {
        userRole: req.usuario.tipo,
        required: roles,
        path: req.path,
      });
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol: ${roles.join(" o ")}.`,
      });
    }
    next();
  };
};

module.exports = { proteger, autorizar };
