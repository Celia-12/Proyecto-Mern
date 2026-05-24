//esta cosa sirve para conectar mi aplicacion a mongodb 

const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/multiservicios",
      {
        serverSelectionTimeoutMS: 5000,
      }
    );
    logger.info(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error conectando a MongoDB: ${error.message}`, { stack: error.stack });
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB desconectado");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconectado");
});

module.exports = connectDB;
