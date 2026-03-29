const express = require("express");
const router = express.Router();
const { registro, login, obtenerPerfil, actualizarPerfil } = require("../controllers/authController");
const { proteger } = require("../middleware/auth");
const { validarRegistro, validarLogin } = require("../validators");
const { manejarValidacion, logTransaccion } = require("../middleware/errorHandler");

// Public routes
router.post("/registro", validarRegistro, manejarValidacion, logTransaccion("AUTH_REGISTRO"), registro);
router.post("/login",    validarLogin,    manejarValidacion, logTransaccion("AUTH_LOGIN"),    login);

// Protected routes
router.get("/perfil",  proteger, obtenerPerfil);
router.put("/perfil",  proteger, actualizarPerfil);

module.exports = router;
