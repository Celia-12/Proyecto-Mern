(async function(){
  try {
    const mongoose = require('mongoose');
    const path = require('path');
    const config = require('./src/utils/database');
    // connect using existing database util if available, otherwise default
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/proyecto-mern-dev';
    await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const Cotizacion = require('./src/models/Cotizacion');
    const Usuario = require('./src/models/Usuario');
    const Especialista = require('./src/models/Especialista');
    const Trabajo = require('./src/models/Trabajo');
    const Mensaje = require('./src/models/Mensaje');

    // Find a private cotizacion that is pendiente or en_revision
    const cot = await Cotizacion.findOne({ publica: false, estado: { $in: ['pendiente','en_revision'] } }).lean();
    if (!cot) {
      console.log('No hay cotizaciones privadas en estado pendiente/en_revision para probar.');
      process.exit(0);
    }
    console.log('Usando cotizacion:', cot._id.toString());

    // find a tecnico user to act as acceptor
    const tecnico = await Usuario.findOne({ tipo: 'tecnico' }).lean();
    if (!tecnico) {
      console.log('No hay tecnicos en la BD para probar.');
      process.exit(0);
    }
    console.log('Usando tecnico:', tecnico._id.toString());

    // find or create Especialista for this tecnico
    let esp = await Especialista.findOne({ usuario: tecnico._id });
    if (!esp) {
      esp = await Especialista.create({ usuario: tecnico._id, especialidad: tecnico.especialidad || 'General', activo: true });
      console.log('Especialista creado:', esp._id.toString());
    }

    // Simulate acceptance: create Trabajo and Mensaje as controller does
    const fechaInicio = cot.fecha_preferida ? new Date(cot.fecha_preferida) : new Date();
    const trabajo = await Trabajo.create({
      cotizacion_id: cot._id,
      cliente_id: cot.cliente_id,
      tecnico_id: esp._id,
      fecha_inicio: fechaInicio,
      monto: cot.monto_estimado ?? 0,
      ubicacion: cot.ubicacion,
      descripcion_trabajo: cot.descripcion,
      estado: 'programado'
    });

    await Cotizacion.findByIdAndUpdate(cot._id, { estado: 'aceptada', especialista_asignado: esp._id, trabajo_id: trabajo._id });

    const mensaje = await Mensaje.create({
      cotizacion_id: cot._id,
      de: tecnico._id,
      para: cot.cliente_id,
      texto: `Prueba: el técnico ha aceptado y se creó trabajo ${trabajo._id}`
    });

    console.log('Trabajo creado:', trabajo._id.toString());
    console.log('Mensaje creado:', mensaje._id.toString());

    process.exit(0);
  } catch (err) {
    console.error('Error en script de prueba:', err);
    process.exit(1);
  }
})();
