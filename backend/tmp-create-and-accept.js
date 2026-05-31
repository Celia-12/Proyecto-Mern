(async function(){
  try {
    const mongoose = require('mongoose');
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/proyecto-mern-dev';
    await mongoose.connect(dbUri);

    const Usuario = require('./src/models/Usuario');
    const Cotizacion = require('./src/models/Cotizacion');
    const Especialista = require('./src/models/Especialista');
    const Trabajo = require('./src/models/Trabajo');
    const Mensaje = require('./src/models/Mensaje');

    // Ensure there's a cliente
    let cliente = await Usuario.findOne({ tipo: 'cliente' });
    if (!cliente) {
      cliente = await Usuario.create({ email: 'cliente.test@example.com', contrasena: 'secret123', nombre: 'Cliente Test' });
      console.log('Cliente creado:', cliente._id.toString());
    }

    // Ensure there's a tecnico
    let tecnico = await Usuario.findOne({ tipo: 'tecnico' });
    if (!tecnico) {
      tecnico = await Usuario.create({ email: 'tecnico.test@example.com', contrasena: 'secret123', nombre: 'Tecnico Test', tipo: 'tecnico', especialidad: 'Mantenimiento General', precio_hora: 200 });
      console.log('Tecnico creado:', tecnico._id.toString());
    }

    // Create Especialista for tecnico if missing (use required fields)
    let esp = await Especialista.findOne({ usuario_id: tecnico._id });
    if (!esp) {
      esp = await Especialista.create({
        usuario_id: tecnico._id,
        especialidad: tecnico.especialidad || 'Mantenimiento General',
        experiencia_anos: 1,
        precio_hora: tecnico.precio_hora || 200,
        codigo_postal: '64000',
        activo: true,
      });
      console.log('Especialista creado:', esp._id.toString());
    }

    // Create a private cotizacion
    const cot = await Cotizacion.create({
      cliente_id: cliente._id,
      descripcion: 'Prueba - limpiar y mantenimiento general',
      categoria: 'Mantenimiento General',
      titulo: 'Mantenimiento general prueba',
      ubicacion: 'Monterrey',
      codigo_postal: '64000',
      publica: false,
      estado: 'pendiente'
    });
    console.log('Cotizacion creada:', cot._id.toString());

    // Simulate technician acceptance (controller flow)
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
      texto: `El técnico ha aceptado tu solicitud y se creó el trabajo ${trabajo._id}.`,
    });

    console.log('Trabajo creado:', trabajo._id.toString());
    console.log('Mensaje creado:', mensaje._id.toString());
    const cotActualizada = await Cotizacion.findById(cot._id).lean();
    console.log('Cotizacion actualizada estado:', cotActualizada.estado, 'trabajo_id:', cotActualizada.trabajo_id);

    process.exit(0);
  } catch (err) {
    console.error('Error en script:', err);
    process.exit(1);
  }
})();
