const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const ctrl = require("../controllers/cotizacionesController");
const { proteger } = require("../middleware/auth");
const { validarCotizacion, validarIdParam } = require("../validators");
const { manejarValidacion, logTransaccion } = require("../middleware/errorHandler");

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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// All cotizacion routes require auth
router.use(proteger);

router.get("/",    ctrl.listar);
router.get("/recientes", ctrl.recientes);
router.get("/:id", validarIdParam, manejarValidacion, ctrl.obtenerUna);

router.post(
  "/",
  upload.array("imagenes", 6),
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

router.post(
  "/:id/imagenes",
  validarIdParam,
  manejarValidacion,
  upload.array("imagenes", 6),
  ctrl.subirImagenes
);

router.delete(
  "/:id",
  validarIdParam,
  manejarValidacion,
  ctrl.eliminar
);

module.exports = router;
