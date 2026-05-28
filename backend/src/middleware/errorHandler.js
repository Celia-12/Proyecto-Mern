const logger = require("../utils/logger");

/**
 * Handle express-validator validation errors
 */
const manejarValidacion = (req, res, next) => {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map((e) => ({
      campo: e.path,
      mensaje: e.msg,
      valor: e.value,
    }));

    return res.status(422).json({
      success: false,
      message: validationErrors[0]?.mensaje || "Error de validación",
      errores: validationErrors,
    });
  }
  next();
};

/**
 * Global error handler — logs all errors to file
 */
const manejadorErrores = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Error interno del servidor";

  // Mongoose duplicate key
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    message = `El valor del campo '${campo}' ya existe.`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errores = Object.values(err.errors).map((e) => e.message);
    message = errores.join(". ");
    statusCode = 422;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    message = `ID inválido: ${err.value}`;
    statusCode = 400;
  }

  // Log critical errors
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message}`, {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.usuario?._id,
      stack: err.stack,
    });
  } else {
    logger.warn(`[${statusCode}] ${message}`, {
      method: req.method,
      path: req.path,
      userId: req.usuario?._id,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Log critical transactions (auth, payments, etc.)
 */
const logTransaccion = (tipo) => (req, res, next) => {
  logger.info(`TRANSACCION [${tipo}]`, {
    userId: req.usuario?._id,
    ip: req.ip,
    body: tipo === "AUTH" ? { email: req.body.email } : req.body,
  });
  next();
};

module.exports = { manejarValidacion, manejadorErrores, logTransaccion };
