const mongoose = require('mongoose');
const Usuario = require('./src/models/Usuario');
const Especialista = require('./src/models/Especialista');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/multiservicios';
    await mongoose.connect(uri);
    const countTecnicos = await Usuario.countDocuments({ tipo: 'tecnico' });
    const countEsp = await Especialista.countDocuments();
    console.log('Tecnicos en Usuario:', countTecnicos);
    console.log('Especialistas en Especialista:', countEsp);
    const one = await Usuario.findOne({ tipo: 'tecnico' }).select('-contrasena');
    console.log('Ejemplo tecnico:', one ? JSON.stringify(one, null, 2) : 'ninguno');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
