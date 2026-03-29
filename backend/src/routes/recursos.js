const express = require("express");
const router = express.Router();

// ─── TRABAJOS ──────────────────────────────────────────────────────────────
const trabajosCtrl = require("../controllers/trabajosController");
const { validarTrabajo, validarIdParam } = require("../validators");
const { manejarValidacion, logTransaccion } = require("../middleware/errorHandler");
const { proteger, autorizar } = require("../middleware/auth");

const trabajosRouter = express.Router();
trabajosRouter.use(proteger);

trabajosRouter.get("/",    trabajosCtrl.listar);
trabajosRouter.get("/:id", validarIdParam, manejarValidacion, trabajosCtrl.obtenerUno);
trabajosRouter.post(
  "/",
  validarTrabajo,
  manejarValidacion,
  logTransaccion("TRABAJO_NUEVO"),
  trabajosCtrl.crear
);
trabajosRouter.put("/:id",    validarIdParam, manejarValidacion, trabajosCtrl.actualizar);
trabajosRouter.delete("/:id", validarIdParam, manejarValidacion, autorizar("admin"), trabajosCtrl.eliminar);

// ─── CALIFICACIONES ────────────────────────────────────────────────────────
const calCtrl = require("../controllers/calificacionesController");
const { validarCalificacion } = require("../validators");

const calificacionesRouter = express.Router();

calificacionesRouter.get("/",    calCtrl.listar);      // public — show ratings on specialist page
calificacionesRouter.get("/:id", validarIdParam, manejarValidacion, calCtrl.obtenerUna);

calificacionesRouter.post(
  "/",
  proteger,
  validarCalificacion,
  manejarValidacion,
  logTransaccion("CALIFICACION_NUEVA"),
  calCtrl.crear
);
calificacionesRouter.put(
  "/:id",
  proteger,
  validarIdParam,
  manejarValidacion,
  calCtrl.actualizar
);
calificacionesRouter.delete(
  "/:id",
  proteger,
  validarIdParam,
  manejarValidacion,
  calCtrl.eliminar
);

// ─── MENSAJES ──────────────────────────────────────────────────────────────
const msgCtrl = require("../controllers/mensajesController");
const { validarMensaje } = require("../validators");

const mensajesRouter = express.Router();
mensajesRouter.use(proteger);

mensajesRouter.get("/",         msgCtrl.listar);
mensajesRouter.get("/:id",      validarIdParam, manejarValidacion, msgCtrl.obtenerUno);
mensajesRouter.post("/",        validarMensaje, manejarValidacion, msgCtrl.crear);
mensajesRouter.patch("/:id/leer", validarIdParam, manejarValidacion, msgCtrl.marcarLeido);
mensajesRouter.delete("/:id",   validarIdParam, manejarValidacion, msgCtrl.eliminar);

module.exports = { trabajosRouter, calificacionesRouter, mensajesRouter };
