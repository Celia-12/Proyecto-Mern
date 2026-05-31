(async function(){
  try {
    const mongoose = require('mongoose');
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/proyecto-mern-dev';
    await mongoose.connect(dbUri);

    const Usuario = require('./src/models/Usuario');
    const Especialista = require('./src/models/Especialista');
    const Cotizacion = require('./src/models/Cotizacion');
    const Mensaje = require('./src/models/Mensaje');

    // Create or find users
    let cliente = await Usuario.findOne({ email: 'reopen.client@example.com' });
    if (!cliente) {
      cliente = await Usuario.create({ email: 'reopen.client@example.com', contrasena: 'secret123', nombre: 'Cliente Reopen', tipo: 'cliente' });
      console.log('Cliente creado:', cliente._id.toString());
    }

    let techA = await Usuario.findOne({ email: 'reopen.techA@example.com' });
    if (!techA) {
      techA = await Usuario.create({ email: 'reopen.techA@example.com', contrasena: 'secret123', nombre: 'Tecnico A', tipo: 'tecnico', especialidad: 'Electricidad', precio_hora: 250, codigo_postal: '64000' });
      console.log('Tecnico A creado:', techA._id.toString());
    }

    let techB = await Usuario.findOne({ email: 'reopen.techB@example.com' });
    if (!techB) {
      techB = await Usuario.create({ email: 'reopen.techB@example.com', contrasena: 'secret123', nombre: 'Tecnico B', tipo: 'tecnico', especialidad: 'Electricidad', precio_hora: 220, codigo_postal: '64000' });
      console.log('Tecnico B creado:', techB._id.toString());
    }

    // Ensure Especialista docs
    let espA = await Especialista.findOne({ usuario_id: techA._id });
    if (!espA) {
      espA = await Especialista.create({ usuario_id: techA._id, especialidad: techA.especialidad || 'Electricidad', experiencia_anos: 2, precio_hora: techA.precio_hora || 250, codigo_postal: techA.codigo_postal || '64000', activo: true });
      console.log('Especialista A creado:', espA._id.toString());
    }

    let espB = await Especialista.findOne({ usuario_id: techB._id });
    if (!espB) {
      espB = await Especialista.create({ usuario_id: techB._id, especialidad: techB.especialidad || 'Electricidad', experiencia_anos: 1, precio_hora: techB.precio_hora || 220, codigo_postal: techB.codigo_postal || '64000', activo: true });
      console.log('Especialista B creado:', espB._id.toString());
    }

    // Create public cotizacion
    const cot = await Cotizacion.create({ cliente_id: cliente._id, descripcion: 'Prueba public reopen', categoria: 'Electricidad', titulo: 'Arreglo prueba', ubicacion: 'Monterrey', codigo_postal: '64000', publica: true, estado: 'pendiente' });
    console.log('Cotizacion creada:', cot._id.toString());

    // Tech A accepts (public flow): set en_revision and assign espA, create message to client
    cot.estado = 'en_revision';
    cot.especialista_asignado = espA._id;
    await cot.save();
    const msgA = await Mensaje.create({ cotizacion_id: cot._id, de: techA._id, para: cliente._id, texto: 'Tecnico A aceptó la cotizacion (simulado).' });
    console.log('Tech A aceptó - mensaje creado:', msgA._id.toString());

    // Now simulate client reabrir action
    // Controller would create message to specialist; mimic that
    const specialistBefore = await Especialista.findById(cot.especialista_asignado).populate('usuario_id');
    // Reopen
    cot.estado = 'pendiente';
    cot.publica = true;
    cot.especialista_asignado = null;
    await cot.save();
    console.log('Cotizacion reabierta:', cot._id.toString());
    if (specialistBefore?.usuario_id) {
      const msgCancel = await Mensaje.create({ cotizacion_id: cot._id, de: cliente._id, para: specialistBefore.usuario_id._id, texto: 'El cliente canceló tu aceptación; la cotización se publicó de nuevo.' });
      console.log('Mensaje de cancelación enviado al especialista anterior:', msgCancel._id.toString());
    }

    // Check recientes (public pendientes)
    const recientes = await Cotizacion.find({ estado: 'pendiente', $or: [{ publica: true }, { publica: { $exists: false } }] });
    const found = recientes.some(r => String(r._id) === String(cot._id));
    console.log('¿Cotizacion aparece en recientes (/nuevos-trabajos)?', found);

    // Tech B accepts from recientes
    cot.estado = 'en_revision';
    cot.especialista_asignado = espB._id;
    await cot.save();
    const msgB = await Mensaje.create({ cotizacion_id: cot._id, de: techB._id, para: cliente._id, texto: 'Tecnico B aceptó la cotizacion (simulado).' });
    console.log('Tech B aceptó - mensaje creado:', msgB._id.toString());

    // Verify messages to client
    const mensajesCliente = await Mensaje.find({ cotizacion_id: cot._id, para: cliente._id }).lean();
    console.log('Mensajes al cliente para esta cotizacion:');
    mensajesCliente.forEach(m => console.log('-', m.texto));

    process.exit(0);
  } catch (err) {
    console.error('Error en verificacion:', err);
    process.exit(1);
  }
})();
