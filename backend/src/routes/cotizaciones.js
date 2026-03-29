const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/cotizacionesController");
const { proteger } = require("../middleware/auth");
const { validarCotizacion, validarIdParam } = require("../validators");
const { manejarValidacion, logTransaccion } = require("../middleware/errorHandler");

// All cotizacion routes require auth
router.use(proteger);

router.get("/",    ctrl.listar);
router.get("/:id", validarIdParam, manejarValidacion, ctrl.obtenerUna);

router.post(
  "/",
  validarCotizacion,
  manejarValidacion,
  logTransaccion("COTIZACION_NUEVA"),
  ctrl.crear
);

router.put(
  "/:id",
  validarIdParam,
  manejarValidacion,
  ctrl.actualizar
);

router.delete(
  "/:id",
  validarIdParam,
  manejarValidacion,
  ctrl.eliminar
);

module.exports = router;
