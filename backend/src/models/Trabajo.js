const mongoose = require("mongoose");

const trabajoSchema = new mongoose.Schema(
  {
    cotizacion_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cotizacion",
      required: [true, "La cotización es requerida"],
    },
    cliente_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El cliente es requerido"],
    },
    tecnico_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Especialista",
      required: [true, "El técnico es requerido"],
    },
    estado: {
      type: String,
      enum: ["programado", "en_progreso", "pausado", "completado", "cancelado"],
      default: "programado",
    },
    fecha_inicio: {
      type: Date,
      required: [true, "La fecha de inicio es requerida"],
    },
    fecha_fin: {
      type: Date,
      default: null,
    },
    duracion_horas: {
      type: Number,
      min: 0,
      default: null,
    },
    ubicacion: {
      type: String,
      required: [true, "La ubicación es requerida"],
      trim: true,
    },
    monto: {
      type: Number,
      required: [true, "El monto es requerido"],
      min: [0, "El monto no puede ser negativo"],
    },
    descripcion_trabajo: {
      type: String,
      trim: true,
      maxlength: [2000, "La descripción no puede exceder 2000 caracteres"],
    },
    fotos_evidencia: {
      type: [String],
      default: [],
    },
    calificado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

trabajoSchema.index({ cliente_id: 1, estado: 1 });
trabajoSchema.index({ tecnico_id: 1, estado: 1 });
trabajoSchema.index({ cotizacion_id: 1 });

module.exports = mongoose.model("Trabajo", trabajoSchema);
