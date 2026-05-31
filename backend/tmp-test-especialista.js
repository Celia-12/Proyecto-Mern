const mongoose = require('mongoose');
const Usuario = require('./src/models/Usuario');
const { obtenerOCrearEspecialistaDesdeUsuario } = require('./src/controllers/especialistasController');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/multiservicios');
    const usuarios = await Usuario.find({ tipo: 'tecnico' }).select('-contrasena');
    for (const usuario of usuarios) {
      console.log('Probando usuario:', usuario._id, usuario.especialidad);
      const esp = await obtenerOCrearEspecialistaDesdeUsuario(usuario);
      console.log('Resultado:', esp ? esp.especialidad : 'null');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
