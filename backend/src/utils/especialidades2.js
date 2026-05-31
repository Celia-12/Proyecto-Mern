const ESPECIALIDAD_MAP = {
  plomeria: 'Plomería',
  plomero: 'Plomería',
  plomera: 'Plomería',
  plomería: 'Plomería',
  electricidad: 'Electricidad',
  electricista: 'Electricidad',
  electricistas: 'Electricidad',
  carpinteria: 'Carpintería',
  carpintero: 'Carpintería',
  carpintería: 'Carpintería',
  cerrajeria: 'Cerrajería',
  cerrajero: 'Cerrajería',
  cerrajería: 'Cerrajería',
  'aire acondicionado': 'Aire Acondicionado',
  'aire-acondicionado': 'Aire Acondicionado',
  'aire acondicionado tecnico': 'Aire Acondicionado',
  'aire acondicionado técnico': 'Aire Acondicionado',
  'mantenimiento general': 'Mantenimiento General',
  'paneles solares': 'Paneles solares',
  paneles: 'Paneles solares',
  seguridad: 'Seguridad',
  impermeabilizacion: 'Impermeabilización',
  impermeabilización: 'Impermeabilización',
};

function normalizeEspecialidad(value) {
  if (!value) return 'Mantenimiento General';

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return ESPECIALIDAD_MAP[normalized] || value;
}

module.exports = { normalizeEspecialidad };