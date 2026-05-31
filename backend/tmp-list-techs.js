const mongoose = require('mongoose');
const Usuario = require('./src/models/Usuario');
(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/multiservicios';
    await mongoose.connect(uri);
    const usuarios = await Usuario.find({ tipo: 'tecnico' }).select('nombre especialidad codigo_postal activo precio_hora');
    console.log('Tecnicos list:');
    usuarios.forEach(u => console.log(JSON.stringify(u.toObject(), null, 2)));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
