export function normalizeText(input = "") {
  return String(input)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .trim();
}

const SYNONYMS: Record<string, string> = {
  // Plomería
  plomero: "plomeria",
  plomeros: "plomeria",
  plomeria: "plomeria",
  // Electricidad / Electricista
  electricidad: "electricidad",
  electricista: "electricidad",
  electricistas: "electricidad",
  // Aire acondicionado
  "aire acondicionado": "aire acondicionado",
  "aire-acondicionado": "aire acondicionado",
  "aire acondicionado técnico": "aire acondicionado",
  "tecnico aire": "aire acondicionado",
  // Carpintería
  carpinteria: "carpinteria",
  carpintero: "carpinteria",
  carpinteros: "carpinteria",
  // Mantenimiento General
  mantenimiento: "mantenimiento general",
  "mantenimiento general": "mantenimiento general",
  albañil: "mantenimiento general",
  pintor: "mantenimiento general",
  // Cerrajería
  cerrajero: "cerrajeria",
  cerrajeria: "cerrajeria",
  // Paneles solares
  paneles: "paneles solares",
  "paneles solares": "paneles solares",
  solar: "paneles solares",
  // Seguridad
  seguridad: "seguridad",
  // Impermeabilización
  impermeabilizacion: "impermeabilizacion",
  impermeabilización: "impermeabilizacion",
  impermeabilizador: "impermeabilizacion",
};

export function mapQueryToCanonical(q: string) {
  const n = normalizeText(q);
  return SYNONYMS[n] ?? n;
}

export function matchesField(field = "", query = "") {
  const nf = normalizeText(field);
  const mq = mapQueryToCanonical(query);
  if (!mq) return nf.includes("");
  if (nf.includes(mq)) return true;
  if (mq.includes(nf)) return true;
  return false;
}
