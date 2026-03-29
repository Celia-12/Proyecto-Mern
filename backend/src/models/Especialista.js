const mongoose = require("mongoose");

const especialistaSchema = new mongoose.Schema(
  {
    usuario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El usuario es requerido"],
      unique: true,
    },
    especialidad: {
      type: String,
      required: [true, "La especialidad es requerida"],
      enum: [
        "Plomería",
        "Electricidad",
        "Carpintería",
        "Cerrajería",
        "Aire Acondicionado",
        "Mantenimiento General",
      ],
    },
    especialidades_adicionales: {
      type: [String],
      default: [],
    },
    experiencia_anos: {
      type: Number,
      required: [true, "Los años de experiencia son requeridos"],
      min: [0, "La experiencia no puede ser negativa"],
      max: [50, "Valor de experiencia no válido"],
    },
    calificacion_promedio: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    total_resenas: {
      type: Number,
      default: 0,
    },
    precio_hora: {
      type: Number,
      required: [true, "El precio por hora es requerido"],
      min: [0, "El precio no puede ser negativo"],
    },
    horario: {
      type: String,
      enum: ["Matutino", "Vespertino", "Nocturno", "Todo el día"],
      default: "Todo el día",
    },
    disponible: {
      type: Boolean,
      default: true,
    },
    verificado: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      maxlength: [500, "La bio no puede exceder 500 caracteres"],
    },
    ubicacion: {
      type: String,
      default: "Monterrey, NL",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for geo/specialty searches
especialistaSchema.index({ especialidad: 1, disponible: 1 });
especialistaSchema.index({ calificacion_promedio: -1 });

module.exports = mongoose.model("Especialista", especialistaSchema);
