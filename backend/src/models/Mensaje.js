const mongoose = require("mongoose");

const mensajeSchema = new mongoose.Schema(
  {
    cotizacion_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cotizacion",
      required: [true, "La cotización es requerida"],
    },
    de: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El remitente es requerido"],
    },
    para: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El destinatario es requerido"],
    },
    texto: {
      type: String,
      required: [true, "El texto del mensaje es requerido"],
      trim: true,
      maxlength: [1000, "El mensaje no puede exceder 1000 caracteres"],
    },
    leido: {
      type: Boolean,
      default: false,
    },
    tipo: {
      type: String,
      enum: ["texto", "imagen", "archivo"],
      default: "texto",
    },
    adjunto_url: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

mensajeSchema.index({ cotizacion_id: 1, createdAt: 1 });
mensajeSchema.index({ de: 1, para: 1 });
mensajeSchema.index({ para: 1, leido: 1 });

module.exports = mongoose.model("Mensaje", mensajeSchema);
