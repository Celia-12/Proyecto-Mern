const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email no válido"],
    },
    contrasena: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false, // never returned in queries by default
    },
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    telefono: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Teléfono debe tener 10 dígitos"],
    },
    ciudad: {
      type: String,
      trim: true,
      default: "Monterrey",
    },
    codigo_postal: {
      type: String,
      trim: true,
      match: [/^[0-9]{5}$/, "El código postal debe tener 5 dígitos"],
    },
    foto: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
      default: null,
    },
    tipo: {
      type: String,
      enum: ["cliente", "tecnico", "admin"],
      default: "cliente",
    },
    especialidad: {
      type: String,
      enum: [
        "Plomería",
        "Electricidad",
        "Carpintería",
        "Cerrajería",
        "Aire Acondicionado",
        "Mantenimiento General",
        "Paneles solares",
        "Seguridad",
        "Impermeabilización",
      ],
      trim: true,
      default: null,
      required: function () {
        return this.tipo === "tecnico";
      },
    },
    precio_hora: {
      type: Number,
      min: [0, "El precio por visita debe ser un número positivo"],
      default: null,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash password before saving
usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("contrasena")) return next();
  const salt = await bcrypt.genSalt(12);
  this.contrasena = await bcrypt.hash(this.contrasena, salt);
  next();
});

// Compare plain password with hashed
usuarioSchema.methods.compararContrasena = async function (contrasenaPlana) {
  return bcrypt.compare(contrasenaPlana, this.contrasena);
};

// Remove sensitive fields from JSON output
usuarioSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.contrasena;
  return obj;
};

module.exports = mongoose.model("Usuario", usuarioSchema);
