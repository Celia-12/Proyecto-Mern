require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./utils/database");
const logger = require("./utils/logger");
const { manejadorErrores } = require("./middleware/errorHandler");

// Routes
const authRoutes = require("./routes/auth");
const especialistasRoutes = require("./routes/especialistas");
const cotizacionesRoutes = require("./routes/cotizaciones");
const { trabajosRouter, calificacionesRouter, mensajesRouter } = require("./routes/recursos");

// ─── App setup ─────────────────────────────────────────────────────────────
const app = express();

// Connect to MongoDB
connectDB();

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: "*",
  credentials: false,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// HTTP request logging via Morgan → Winston
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",           authRoutes);
app.use("/api/especialistas",  especialistasRoutes);
app.use("/api/cotizaciones",   cotizacionesRoutes);
app.use("/api/trabajos",       trabajosRouter);
app.use("/api/calificaciones", calificacionesRouter);
app.use("/api/mensajes",       mensajesRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global error handler (must be last) ──────────────────────────────────
app.use(manejadorErrores);

// ─── Start server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📄 Ambiente: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
