const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/especialistasController");
const { proteger, autorizar } = require("../middleware/auth");
const { validarEspecialista, validarIdParam } = require("../validators");
const { manejarValidacion } = require("../middleware/errorHandler");

// Public
router.get("/",    ctrl.listar);
router.get("/:id", validarIdParam, manejarValidacion, ctrl.obtenerUno);

// Protected — only technicians can create their profile
router.post(
  "/",
  proteger,
  autorizar("tecnico", "admin"),
  validarEspecialista,
  manejarValidacion,
  ctrl.crear
);

router.put(
  "/:id",
  proteger,
  validarIdParam,
  validarEspecialista,
  manejarValidacion,
  ctrl.actualizar
);

router.delete(
  "/:id",
  proteger,
  validarIdParam,
  manejarValidacion,
  ctrl.eliminar
);

module.exports = router;
