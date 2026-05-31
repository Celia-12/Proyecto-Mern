const ESPECIALIDAD_MAP = {
  plomeria: 'Plomer�a',
  plomero: 'Plomer�a',
  plomera: 'Plomer�a',
  plomer�a: 'Plomer�a',
  electricidad: 'Electricidad',
  electricista: 'Electricidad',
  electricistas: 'Electricidad',
  carpinteria: 'Carpinter�a',
  carpintero: 'Carpinter�a',
  carpinter�a: 'Carpinter�a',
  cerrajeria: 'Cerrajer�a',
  cerrajero: 'Cerrajer�a',
  cerrajer�a: 'Cerrajer�a',
  'aire acondicionado': 'Aire Acondicionado',
  'aire-acondicionado': 'Aire Acondicionado',
  'aire acondicionado tecnico': 'Aire Acondicionado',
  'aire acondicionado t�cnico': 'Aire Acondicionado',
  'mantenimiento general': 'Mantenimiento General',
  'paneles solares': 'Paneles solares',
  paneles: 'Paneles solares',
  seguridad: 'Seguridad',
  impermeabilizacion: 'Impermeabilizaci�n',
  impermeabilizaci�n: 'Impermeabilizaci�n',
};

function normalizeEspecialidad(value) {
  if (!value) return 'Mantenimiento General';

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return ESPECIALIDAD_MAP[normalized] || value;
}

module.exports = { normalizeEspecialidad };
