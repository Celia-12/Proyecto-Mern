const mongoose = require("mongoose");

const calificacionSchema = new mongoose.Schema(
  {
    trabajo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trabajo",
      required: [true, "El trabajo es requerido"],
    },
    quien_califica: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El calificador es requerido"],
    },
    a_quien: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: [true, "El calificado es requerido"],
    },
    especialista_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Especialista",
      required: [true, "El especialista es requerido"],
    },
    estrellas: {
      type: Number,
      required: [true, "La calificación es requerida"],
      min: [1, "Mínimo 1 estrella"],
      max: [5, "Máximo 5 estrellas"],
    },
    comentario: {
      type: String,
      trim: true,
      maxlength: [500, "El comentario no puede exceder 500 caracteres"],
    },
    tipo: {
      type: String,
      enum: ["cliente_a_tecnico", "tecnico_a_cliente"],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// A user can only leave one review per job
calificacionSchema.index(
  { trabajo_id: 1, quien_califica: 1 },
  { unique: true }
);
calificacionSchema.index({ especialista_id: 1 });

// After saving a review, update the specialist's average rating
calificacionSchema.post("save", async function () {
  try {
    const Especialista = mongoose.model("Especialista");
    const stats = await mongoose.model("Calificacion").aggregate([
      {
        $match: {
          especialista_id: this.especialista_id,
          tipo: "cliente_a_tecnico",
        },
      },
      {
        $group: {
          _id: "$especialista_id",
          promedio: { $avg: "$estrellas" },
          total: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Especialista.findByIdAndUpdate(this.especialista_id, {
        calificacion_promedio: Math.round(stats[0].promedio * 10) / 10,
        total_resenas: stats[0].total,
      });
    }
  } catch (err) {
    // Non-critical, log but don't throw
    console.error("Error actualizando calificación promedio:", err);
  }
});

module.exports = mongoose.model("Calificacion", calificacionSchema);
