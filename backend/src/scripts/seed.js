/**
 * SEEDER — Datos de ejemplo para Multiservicios Técnicos
 * Uso: node src/scripts/seed.js
 *
 * Crea:
 *  - 1 admin
 *  - 3 clientes de prueba
 *  - 6 técnicos (uno por especialidad)
 *  - 6 perfiles de especialista
 *  - 8 cotizaciones en distintos estados
 *  - 4 trabajos
 *  - 4 calificaciones
 *  - 4 mensajes de chat
 */
require("dotenv").config();
const mongoose = require("mongoose");

const Usuario      = require("../models/Usuario");
const Especialista = require("../models/Especialista");
const Cotizacion   = require("../models/Cotizacion");
const Trabajo      = require("../models/Trabajo");
const Calificacion = require("../models/Calificacion");
const Mensaje      = require("../models/Mensaje");

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/multiservicios";

// ─── Datos base ───────────────────────────────────────────────────────────

const TECNICOS = [
  {
    nombre: "Carlos Martínez",
    email: "carlos@multiservicios.mx",
    telefono: "8111234567",
    ciudad: "Monterrey",
    especialidad: "Plomería",
    experiencia_anos: 8,
    precio_hora: 350,
    bio: "Especialista en instalaciones hidráulicas, detección de fugas y reparaciones de emergencia. Atiendo toda el área metropolitana de Monterrey las 24 horas.",
    calificacion_promedio: 4.8,
    total_resenas: 47,
    horario: "Todo el día",
  },
  {
    nombre: "Roberto Hernández",
    email: "roberto@multiservicios.mx",
    telefono: "8112345678",
    ciudad: "San Nicolás de los Garza",
    especialidad: "Electricidad",
    experiencia_anos: 12,
    precio_hora: 400,
    bio: "Ingeniero eléctrico con experiencia en instalaciones residenciales y comerciales. Certificado por la CFE. Instalación de contactos, tableros y sistemas de iluminación.",
    calificacion_promedio: 4.9,
    total_resenas: 83,
    horario: "Matutino",
  },
  {
    nombre: "Miguel Ángel Garza",
    email: "miguel@multiservicios.mx",
    telefono: "8113456789",
    ciudad: "Guadalupe",
    especialidad: "Aire Acondicionado",
    experiencia_anos: 6,
    precio_hora: 500,
    bio: "Técnico certificado en sistemas Carrier, LG y Samsung. Instalación, mantenimiento preventivo y reparación de minisplits y equipos de ventana.",
    calificacion_promedio: 4.7,
    total_resenas: 31,
    horario: "Vespertino",
  },
  {
    nombre: "Juan Carlos López",
    email: "juan@multiservicios.mx",
    telefono: "8114567890",
    ciudad: "Apodaca",
    especialidad: "Carpintería",
    experiencia_anos: 15,
    precio_hora: 300,
    bio: "Fabricación de muebles a medida, puertas, closets y remodelaciones. Trabajo con madera sólida, MDF y triplay. Más de 15 años de experiencia.",
    calificacion_promedio: 4.6,
    total_resenas: 58,
    horario: "Todo el día",
  },
  {
    nombre: "Fernando Reyes",
    email: "fernando@multiservicios.mx",
    telefono: "8115678901",
    ciudad: "Santa Catarina",
    especialidad: "Cerrajería",
    experiencia_anos: 10,
    precio_hora: 280,
    bio: "Apertura de autos y domicilios sin daño, cambio de chapas, instalación de cerraduras de seguridad y sistemas electrónicos de acceso.",
    calificacion_promedio: 4.9,
    total_resenas: 102,
    horario: "Todo el día",
  },
  {
    nombre: "Alejandro Torres",
    email: "alejandro@multiservicios.mx",
    telefono: "8116789012",
    ciudad: "Monterrey",
    especialidad: "Mantenimiento General",
    experiencia_anos: 7,
    precio_hora: 250,
    bio: "Mantenimiento preventivo y correctivo del hogar: pintura, impermeabilización, pisos, plafones y trabajos menores de albañilería.",
    calificacion_promedio: 4.5,
    total_resenas: 26,
    horario: "Matutino",
  },
];

const CLIENTES = [
  { nombre: "Eduardo Abundis",  email: "cliente@demo.com", telefono: "8120000001", ciudad: "Monterrey" },
  { nombre: "María García",     email: "maria@demo.com",   telefono: "8120000002", ciudad: "San Pedro Garza García" },
  { nombre: "Luis Ramírez",     email: "luis@demo.com",    telefono: "8120000003", ciudad: "Apodaca" },
];

// ─── Seed ─────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(URI);
    console.log("\n🔌 Conectado a MongoDB:", URI);

    // Limpiar todo
    await Promise.all([
      Usuario.deleteMany({}),
      Especialista.deleteMany({}),
      Cotizacion.deleteMany({}),
      Trabajo.deleteMany({}),
      Calificacion.deleteMany({}),
      Mensaje.deleteMany({}),
    ]);
    console.log("🗑️  Colecciones limpiadas\n");

    // ── Admin ──────────────────────────────────────────────────────────
    await Usuario.create({
      nombre: "Admin Multiservicios",
      email: "admin@multiservicios.mx",
      contrasena: "admin123456",
      tipo: "admin",
      ciudad: "Monterrey",
      telefono: "8110000000",
    });
    console.log("👑 Admin creado");

    // ── Clientes ───────────────────────────────────────────────────────
    const clientesCreados = [];
    for (const c of CLIENTES) {
      const u = await Usuario.create({ ...c, contrasena: "demo123456", tipo: "cliente" });
      clientesCreados.push(u);
    }
    console.log("👤 3 clientes creados");

    // ── Técnicos + Especialistas ───────────────────────────────────────
    const especialistasCreados = [];
    const usuariosTecnicos = [];
    for (const t of TECNICOS) {
      const u = await Usuario.create({
        nombre: t.nombre,
        email: t.email,
        telefono: t.telefono,
        ciudad: t.ciudad,
        contrasena: "tecnico123456",
        tipo: "tecnico",
      });
      const esp = await Especialista.create({
        usuario_id: u._id,
        especialidad: t.especialidad,
        experiencia_anos: t.experiencia_anos,
        precio_hora: t.precio_hora,
        bio: t.bio,
        calificacion_promedio: t.calificacion_promedio,
        total_resenas: t.total_resenas,
        horario: t.horario,
        disponible: true,
        verificado: true,
        ubicacion: `${t.ciudad}, NL`,
      });
      especialistasCreados.push(esp);
      usuariosTecnicos.push(u);
    }
    console.log("🔧 6 técnicos y especialistas creados");

    // ── Cotizaciones ───────────────────────────────────────────────────
    const cotizaciones = await Cotizacion.create([
      {
        cliente_id: clientesCreados[0]._id,
        descripcion: "Tengo una fuga debajo del fregadero de la cocina, el tubo de desagüe está goteando constantemente y está mojando el mueble de abajo.",
        categoria: "Plomería",
        ubicacion: "Calle Hidalgo 1234, Col. Centro, Monterrey",
        estado: "completada",
        especialista_asignado: especialistasCreados[0]._id,
        monto_estimado: 800,
        monto_final: 750,
        fecha_preferida: new Date("2025-02-10"),
      },
      {
        cliente_id: clientesCreados[0]._id,
        descripcion: "Necesito instalar tres contactos dobles nuevos en la sala y revisar el tablero eléctrico porque se van los breakers seguido.",
        categoria: "Electricidad",
        ubicacion: "Av. Constitución 567, Col. Obispado, Monterrey",
        estado: "pendiente",
        monto_estimado: 1200,
      },
      {
        cliente_id: clientesCreados[1]._id,
        descripcion: "El minisplit de la recámara principal no enfría bien, hace un ruido extraño y gotea agua al interior del cuarto.",
        categoria: "Aire Acondicionado",
        ubicacion: "Av. Vasconcelos 890, San Pedro Garza García",
        estado: "aceptada",
        especialista_asignado: especialistasCreados[2]._id,
        monto_estimado: 1500,
        fecha_preferida: new Date("2025-03-15"),
      },
      {
        cliente_id: clientesCreados[1]._id,
        descripcion: "Quiero un closet de madera a medida para la recámara de mi hijo, con cajones y espacio para colgar ropa. El cuarto mide 3x4 metros.",
        categoria: "Carpintería",
        ubicacion: "Av. Vasconcelos 890, San Pedro Garza García",
        estado: "completada",
        especialista_asignado: especialistasCreados[3]._id,
        monto_estimado: 8000,
        monto_final: 7500,
        fecha_preferida: new Date("2025-01-20"),
      },
      {
        cliente_id: clientesCreados[2]._id,
        descripcion: "Se me olvidaron las llaves adentro del carro, un Nissan Versa 2020. Necesito que lo abran sin dañar la cerradura.",
        categoria: "Cerrajería",
        ubicacion: "Blvd. Fresno 345, Col. Hacienda Los Morales, Apodaca",
        estado: "completada",
        especialista_asignado: especialistasCreados[4]._id,
        monto_estimado: 400,
        monto_final: 400,
      },
      {
        cliente_id: clientesCreados[2]._id,
        descripcion: "Necesito pintar la sala y el comedor, son aproximadamente 40m². Las paredes tienen algunos hoyos que hay que rellenar primero.",
        categoria: "Mantenimiento General",
        ubicacion: "Blvd. Fresno 345, Col. Hacienda Los Morales, Apodaca",
        estado: "en_revision",
        monto_estimado: 3500,
      },
      {
        cliente_id: clientesCreados[0]._id,
        descripcion: "El calentador de agua no enciende, es un Bosch de paso. Creo que es el piloto o el termostato.",
        categoria: "Plomería",
        ubicacion: "Calle Hidalgo 1234, Col. Centro, Monterrey",
        estado: "pendiente",
      },
      {
        cliente_id: clientesCreados[1]._id,
        descripcion: "Quiero cambiar las chapas de la casa por unas de seguridad. Son 3 puertas: entrada principal, cochera y jardín.",
        categoria: "Cerrajería",
        ubicacion: "Av. Vasconcelos 890, San Pedro Garza García",
        estado: "rechazada",
        notas_admin: "Especialista no disponible en la zona en esa fecha.",
      },
    ]);
    console.log("📋 8 cotizaciones creadas");

    // ── Trabajos ───────────────────────────────────────────────────────
    const trabajos = await Trabajo.create([
      {
        cotizacion_id: cotizaciones[0]._id,
        cliente_id: clientesCreados[0]._id,
        tecnico_id: especialistasCreados[0]._id,
        estado: "completado",
        fecha_inicio: new Date("2025-02-10T10:00:00"),
        fecha_fin: new Date("2025-02-10T12:30:00"),
        duracion_horas: 2.5,
        ubicacion: "Calle Hidalgo 1234, Col. Centro, Monterrey",
        monto: 750,
        descripcion_trabajo: "Se reemplazó el sifón del fregadero y la manguera de conexión. Se verificó que no existan más fugas en todo el sistema.",
        calificado: true,
      },
      {
        cotizacion_id: cotizaciones[3]._id,
        cliente_id: clientesCreados[1]._id,
        tecnico_id: especialistasCreados[3]._id,
        estado: "completado",
        fecha_inicio: new Date("2025-01-22T09:00:00"),
        fecha_fin: new Date("2025-01-24T17:00:00"),
        duracion_horas: 16,
        ubicacion: "Av. Vasconcelos 890, San Pedro Garza García",
        monto: 7500,
        descripcion_trabajo: "Fabricación e instalación de closet en MDF enchapado con 6 cajones, barra para ropa y 4 repisas. Jaladeras de acero inoxidable.",
        calificado: true,
      },
      {
        cotizacion_id: cotizaciones[4]._id,
        cliente_id: clientesCreados[2]._id,
        tecnico_id: especialistasCreados[4]._id,
        estado: "completado",
        fecha_inicio: new Date("2025-02-28T14:00:00"),
        fecha_fin: new Date("2025-02-28T14:45:00"),
        duracion_horas: 0.75,
        ubicacion: "Blvd. Fresno 345, Apodaca",
        monto: 400,
        descripcion_trabajo: "Apertura de Nissan Versa 2020 sin daño. Tiempo de respuesta: 20 minutos.",
        calificado: true,
      },
      {
        cotizacion_id: cotizaciones[2]._id,
        cliente_id: clientesCreados[1]._id,
        tecnico_id: especialistasCreados[2]._id,
        estado: "en_progreso",
        fecha_inicio: new Date("2025-03-15T11:00:00"),
        ubicacion: "Av. Vasconcelos 890, San Pedro Garza García",
        monto: 1500,
        descripcion_trabajo: "En proceso: limpieza de filtros y revisión de gas refrigerante.",
        calificado: false,
      },
    ]);
    console.log("🔨 4 trabajos creados");

    // ── Calificaciones ─────────────────────────────────────────────────
    await Calificacion.create([
      {
        trabajo_id: trabajos[0]._id,
        quien_califica: clientesCreados[0]._id,
        a_quien: usuariosTecnicos[0]._id,
        especialista_id: especialistasCreados[0]._id,
        estrellas: 5,
        comentario: "Excelente servicio, llegó puntual y resolvió el problema rápidamente. Muy limpio y profesional. 100% recomendado.",
        tipo: "cliente_a_tecnico",
      },
      {
        trabajo_id: trabajos[1]._id,
        quien_califica: clientesCreados[1]._id,
        a_quien: usuariosTecnicos[3]._id,
        especialista_id: especialistasCreados[3]._id,
        estrellas: 5,
        comentario: "El closet quedó espectacular, exactamente como lo pedí. Calidad de primera. Vale cada peso.",
        tipo: "cliente_a_tecnico",
      },
      {
        trabajo_id: trabajos[2]._id,
        quien_califica: clientesCreados[2]._id,
        a_quien: usuariosTecnicos[4]._id,
        especialista_id: especialistasCreados[4]._id,
        estrellas: 5,
        comentario: "Llegó en 20 minutos y abrió el carro en 2 minutos sin ningún daño. Muy profesional.",
        tipo: "cliente_a_tecnico",
      },
      {
        trabajo_id: trabajos[0]._id,
        quien_califica: usuariosTecnicos[0]._id,
        a_quien: clientesCreados[0]._id,
        especialista_id: especialistasCreados[0]._id,
        estrellas: 5,
        comentario: "Cliente amable, tenía el espacio listo para trabajar. Sin contratiempos.",
        tipo: "tecnico_a_cliente",
      },
    ]);
    console.log("⭐ 4 calificaciones creadas");

    // ── Mensajes ───────────────────────────────────────────────────────
    await Mensaje.create([
      {
        cotizacion_id: cotizaciones[2]._id,
        de: clientesCreados[1]._id,
        para: usuariosTecnicos[2]._id,
        texto: "Hola, buenos días. ¿Podría venir el sábado en la mañana para revisar el minisplit?",
        leido: true,
      },
      {
        cotizacion_id: cotizaciones[2]._id,
        de: usuariosTecnicos[2]._id,
        para: clientesCreados[1]._id,
        texto: "Buenos días, claro que sí. Puedo estar a las 10 AM el sábado. ¿Le queda bien?",
        leido: true,
      },
      {
        cotizacion_id: cotizaciones[2]._id,
        de: clientesCreados[1]._id,
        para: usuariosTecnicos[2]._id,
        texto: "Perfecto, a las 10 AM está bien. La dirección es Av. Vasconcelos 890, San Pedro.",
        leido: true,
      },
      {
        cotizacion_id: cotizaciones[2]._id,
        de: usuariosTecnicos[2]._id,
        para: clientesCreados[1]._id,
        texto: "Anotado. Llevaré materiales para revisión de gas y limpieza de filtros. Hasta el sábado.",
        leido: false,
      },
    ]);
    console.log("💬 4 mensajes creados");

    // ── Resumen final ──────────────────────────────────────────────────
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("  ✅  SEED COMPLETADO");
    console.log("═══════════════════════════════════════════════════════");
    console.log("  ADMIN");
    console.log("    admin@multiservicios.mx       admin123456");
    console.log("");
    console.log("  CLIENTES");
    console.log("    cliente@demo.com              demo123456");
    console.log("    maria@demo.com                demo123456");
    console.log("    luis@demo.com                 demo123456");
    console.log("");
    console.log("  TÉCNICOS  (contraseña: tecnico123456)");
    console.log("    carlos@multiservicios.mx      Plomería");
    console.log("    roberto@multiservicios.mx     Electricidad");
    console.log("    miguel@multiservicios.mx      Aire Acondicionado");
    console.log("    juan@multiservicios.mx        Carpintería");
    console.log("    fernando@multiservicios.mx    Cerrajería");
    console.log("    alejandro@multiservicios.mx   Mantenimiento General");
    console.log("═══════════════════════════════════════════════════════\n");

  } catch (err) {
    console.error("\n❌ Error en seed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada.");
  }
}

seed();
