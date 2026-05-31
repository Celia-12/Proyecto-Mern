const mongoose = require('mongoose');
const { Types } = mongoose;
const Especialista = require('./src/models/Especialista');
const { normalizeEspecialidad } = require('./src/utils/especialidades2');

(async () => {
  try {
    const inputs = ['Carpintero', 'cerrajero', 'plomeria', 'Aire Acondicionado Técnico', 'impermeabilizacion', 'plomería'];
    for (const input of inputs) {
      const normalized = normalizeEspecialidad(input);
      console.log(`${input} -> ${normalized}`);
      const doc = new Especialista({
        usuario_id: new Types.ObjectId(),
        especialidad: normalized,
        experiencia_anos: 1,
        precio_hora: 100,
        codigo_postal: '64000',
      });
      await doc.validate();
      console.log('  valid as Especialista');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
