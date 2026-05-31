const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/especialistasController");
const { proteger, autorizar } = require("../middleware/auth");
const { validarEspecialista, validarIdParam } = require("../validators");
const { manejarValidacion } = require("../middleware/errorHandler");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

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

router.post(
  "/:id/imagenes",
  proteger,
  validarIdParam,
  manejarValidacion,
  upload.array("imagenes", 8),
  ctrl.subirImagenes
);

module.exports = router;
