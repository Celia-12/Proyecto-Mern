const { body, param } = require("express-validator");


const validarRegistro = [
  body("nombre")
    .trim()
    .notEmpty().withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres"),
  body("email")
    .trim()
    .notEmpty().withMessage("El email es requerido")
    .isEmail().withMessage("Email no válido")
    .normalizeEmail(),
  body("contrasena")
    .notEmpty().withMessage("La contraseña es requerida")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("telefono")
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{10}$/).withMessage("El teléfono debe tener 10 dígitos"),
  body("tipo")
    .optional()
    .isIn(["cliente", "tecnico"]).withMessage("Tipo inválido"),
  body("especialidad")
    .if(body("tipo").equals("tecnico"))
    .notEmpty().withMessage("La especialidad es requerida")
    .isIn([
      "Plomería",
      "Electricidad",
      "Carpintería",
      "Cerrajería",
      "Aire Acondicionado",
      "Mantenimiento General",
      "Paneles solares",
      "Seguridad",
      "Impermeabilización",
    ]).withMessage("Especialidad no válida"),
];

const validarLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("El email es requerido")
    .isEmail().withMessage("Email no válido")
    .normalizeEmail(),
  body("contrasena")
    .notEmpty().withMessage("La contraseña es requerida"),
];


const validarEspecialista = [
  body("especialidad")
    .notEmpty().withMessage("La especialidad es requerida")
    .isIn([
      "Plomería",
      "Electricidad",
      "Carpintería",
      "Cerrajería",
      "Aire Acondicionado",
      "Mantenimiento General",
      "Paneles solares",
      "Seguridad",
      "Impermeabilización",
    ])
    .withMessage("Especialidad no válida"),
  body("codigo_postal")
    .notEmpty().withMessage("El código postal es requerido")
    .matches(/^[0-9]{5}$/).withMessage("El código postal debe tener 5 dígitos"),
  body("experiencia_anos")
    .notEmpty().withMessage("Los años de experiencia son requeridos")
    .isInt({ min: 0, max: 50 }).withMessage("Experiencia debe ser entre 0 y 50 años"),
  body("precio_hora")
    .notEmpty().withMessage("El precio por hora es requerido")
    .isFloat({ min: 0 }).withMessage("El precio debe ser un número positivo"),
  body("horario")
    .optional()
    .isIn(["Matutino", "Vespertino", "Nocturno", "Todo el día"]).withMessage("Horario no válido"),
  body("bio")
    .optional()
    .isLength({ max: 500 }).withMessage("La bio no puede exceder 500 caracteres"),
];


const validarCotizacion = [
  body("titulo")
    .trim()
    .notEmpty().withMessage("El título es requerido")
    .isLength({ min: 5, max: 100 }).withMessage("El título debe tener entre 5 y 100 caracteres"),
  body("descripcion")
    .trim()
    .notEmpty().withMessage("La descripción es requerida")
    .isLength({ min: 10, max: 1000 }).withMessage("La descripción debe tener entre 10 y 1000 caracteres"),
  body("categoria")
    .trim()
    .notEmpty().withMessage("La categoría es requerida")
    .isIn([
      "Plomería",
      "Electricidad",
      "Carpintería",
      "Cerrajería",
      "Aire Acondicionado",
      "Mantenimiento General",
      "Paneles solares",
      "Seguridad",
      "Impermeabilización",
    ])
    .withMessage("Categoría no válida"),
  body("ubicacion")
    .trim()
    .notEmpty().withMessage("La ubicación es requerida"),
  body("codigo_postal")
    .trim()
    .notEmpty().withMessage("El código postal es requerido")
    .matches(/^[0-9]{5}$/).withMessage("El código postal debe tener 5 dígitos"),
  body("fecha_preferida")
    .optional()
    .isISO8601().withMessage("Fecha no válida"),
];


const validarTrabajo = [
  body("cotizacion_id")
    .notEmpty().withMessage("La cotización es requerida")
    .isMongoId().withMessage("ID de cotización no válido"),
  body("tecnico_id")
    .notEmpty().withMessage("El técnico es requerido")
    .isMongoId().withMessage("ID de técnico no válido"),
  body("fecha_inicio")
    .notEmpty().withMessage("La fecha de inicio es requerida")
    .isISO8601().withMessage("Fecha de inicio no válida"),
  body("monto")
    .notEmpty().withMessage("El monto es requerido")
    .isFloat({ min: 0 }).withMessage("El monto debe ser positivo"),
  body("ubicacion")
    .trim()
    .notEmpty().withMessage("La ubicación es requerida"),
];


const validarCalificacion = [
  body("trabajo_id")
    .notEmpty().withMessage("El trabajo es requerido")
    .isMongoId().withMessage("ID de trabajo no válido"),
  body("a_quien")
    .notEmpty().withMessage("El usuario a calificar es requerido")
    .isMongoId().withMessage("ID de usuario no válido"),
  body("especialista_id")
    .notEmpty().withMessage("El especialista es requerido")
    .isMongoId().withMessage("ID de especialista no válido"),
  body("estrellas")
    .notEmpty().withMessage("La calificación es requerida")
    .isInt({ min: 1, max: 5 }).withMessage("Las estrellas deben ser entre 1 y 5"),
  body("comentario")
    .optional()
    .isLength({ max: 500 }).withMessage("El comentario no puede exceder 500 caracteres"),
  body("tipo")
    .notEmpty().withMessage("El tipo de calificación es requerido")
    .isIn(["cliente_a_tecnico", "tecnico_a_cliente"]).withMessage("Tipo no válido"),
];


const validarMensaje = [
  body("cotizacion_id")
    .notEmpty().withMessage("La cotización es requerida")
    .isMongoId().withMessage("ID de cotización no válido"),
  body("para")
    .notEmpty().withMessage("El destinatario es requerido")
    .isMongoId().withMessage("ID de destinatario no válido"),
  body("texto")
    .trim()
    .notEmpty().withMessage("El texto del mensaje es requerido")
    .isLength({ min: 1, max: 1000 }).withMessage("El mensaje no puede exceder 1000 caracteres"),
];


const validarIdParam = [
  param("id")
    .isMongoId().withMessage("ID no válido"),
];

module.exports = {
  validarRegistro,
  validarLogin,
  validarEspecialista,
  validarCotizacion,
  validarTrabajo,
  validarCalificacion,
  validarMensaje,
  validarIdParam,
};
