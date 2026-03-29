const mongoose = require("mongoose");

const cotizacionSchema = new mongoose.Schema(
  {
    cliente_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El cliente es requerido"],
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es requerida"],
      trim: true,
      maxlength: [1000, "La descripción no puede exceder 1000 caracteres"],
    },
    categoria: {
      type: String,
      required: [true, "La categoría es requerida"],
      enum: [
        "Plomería",
        "Electricidad",
        "Carpintería",
        "Cerrajería",
        "Aire Acondicionado",
        "Mantenimiento General",
      ],
    },
    ubicacion: {
      type: String,
      required: [true, "La ubicación es requerida"],
      trim: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "en_revision", "aceptada", "rechazada", "completada"],
      default: "pendiente",
    },
    especialistas_notificados: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Especialista",
      },
    ],
    especialista_asignado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Especialista",
      default: null,
    },
    fecha_preferida: {
      type: Date,
    },
    monto_estimado: {
      type: Number,
      min: 0,
      default: null,
    },
    monto_final: {
      type: Number,
      min: 0,
      default: null,
    },
    notas_admin: {
      type: String,
      maxlength: [500, "Las notas no pueden exceder 500 caracteres"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

cotizacionSchema.index({ cliente_id: 1, estado: 1 });
cotizacionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Cotizacion", cotizacionSchema);
