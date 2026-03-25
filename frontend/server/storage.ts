import {
  users, serviceCategories, specialists, quoteRequests,
  type User, type InsertUser,
  type ServiceCategory, type InsertCategory,
  type Specialist, type InsertSpecialist,
  type QuoteRequest, type InsertQuoteRequest,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCategories(): Promise<ServiceCategory[]>;
  getCategoryBySlug(slug: string): Promise<ServiceCategory | undefined>;
  createCategory(category: InsertCategory): Promise<ServiceCategory>;

  getSpecialists(): Promise<Specialist[]>;
  getSpecialistsByCategory(categoryId: string): Promise<Specialist[]>;
  getSpecialist(id: string): Promise<Specialist | undefined>;
  createSpecialist(specialist: InsertSpecialist): Promise<Specialist>;

  getQuoteRequests(): Promise<QuoteRequest[]>;
  createQuoteRequest(quote: InsertQuoteRequest): Promise<QuoteRequest>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, ServiceCategory>;
  private specialists: Map<string, Specialist>;
  private quotes: Map<string, QuoteRequest>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.specialists = new Map();
    this.quotes = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = Math.random().toString(36).substr(2, 9);
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCategories(): Promise<ServiceCategory[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<ServiceCategory | undefined> {
    return Array.from(this.categories.values()).find((c) => c.slug === slug);
  }

  async createCategory(category: InsertCategory): Promise<ServiceCategory> {
    const id = Math.random().toString(36).substr(2, 9);
    const created: ServiceCategory = { ...category, id };
    this.categories.set(id, created);
    return created;
  }

  async getSpecialists(): Promise<Specialist[]> {
    return Array.from(this.specialists.values());
  }

  async getSpecialistsByCategory(categoryId: string): Promise<Specialist[]> {
    return Array.from(this.specialists.values()).filter((s) => s.categoryId === categoryId);
  }

  async getSpecialist(id: string): Promise<Specialist | undefined> {
    return this.specialists.get(id);
  }

  async createSpecialist(specialist: InsertSpecialist): Promise<Specialist> {
    const id = Math.random().toString(36).substr(2, 9);
    const created: Specialist = {
      ...specialist,
      id,
      avatar: specialist.avatar || null,
      rating: specialist.rating || "0",
      reviewCount: specialist.reviewCount || 0,
      yearsExperience: specialist.yearsExperience || 0,
      verified: specialist.verified || false,
      available: specialist.available || true,
    };
    this.specialists.set(id, created);
    return created;
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return Array.from(this.quotes.values());
  }

  async createQuoteRequest(quote: InsertQuoteRequest): Promise<QuoteRequest> {
    const id = Math.random().toString(36).substr(2, 9);
    const created: QuoteRequest = {
      ...quote,
      id,
      status: quote.status || "pending",
    };
    this.quotes.set(id, created);
    return created;
  }
}

export const storage = new MemStorage();

// Seed data in memory
const categories: InsertCategory[] = [
  {
    name: "Plomeria",
    slug: "plomeria",
    description: "Instalacion, reparacion y mantenimiento de sistemas de agua, drenaje y gas. Destape de tuberias, reparacion de fugas y mas.",
    icon: "droplets",
    image: "/images/service-plumbing.png",
  },
  {
    name: "Electricidad",
    slug: "electricidad",
    description: "Instalaciones electricas residenciales y comerciales, reparacion de cortocircuitos, cableado y tableros electricos.",
    icon: "zap",
    image: "/images/service-electrical.png",
  },
  {
    name: "Aire Acondicionado",
    slug: "aire-acondicionado",
    description: "Instalacion, mantenimiento y reparacion de equipos de climatizacion, splits, minisplits y sistemas centrales.",
    icon: "wind",
    image: "/images/service-hvac.png",
  },
  {
    name: "Mantenimiento",
    slug: "mantenimiento",
    description: "Mantenimiento general del hogar y oficina, pintura, impermeabilizacion, limpieza profunda y remodelaciones.",
    icon: "paintbrush",
    image: "/images/service-maintenance.png",
  },
  {
    name: "Cerrajeria",
    slug: "cerrajeria",
    description: "Apertura de cerraduras, cambio de chapas, instalacion de sistemas de seguridad y cerraduras inteligentes.",
    icon: "lock",
    image: "/images/service-locksmith.png",
  },
  {
    name: "Carpinteria",
    slug: "carpinteria",
    description: "Fabricacion e instalacion de muebles a medida, closets, cocinas integrales, puertas y pisos de madera.",
    icon: "hammer",
    image: "/images/service-carpentry.png",
  },
];

(async () => {
  for (const cat of categories) {
    const category = await storage.createCategory(cat);
    
    // Create specialists for each category
    if (cat.slug === "plomeria") {
      await storage.createSpecialist({
        name: "Carlos Martinez",
        email: "carlos.martinez@correo.com",
        phone: "55 2345 6789",
        bio: "Plomero certificado con mas de 15 anos de experiencia en instalaciones residenciales y comerciales.",
        categoryId: category.id,
        specialties: ["Destape de tuberias", "Reparacion de fugas", "Instalacion de calentadores"],
        location: "Ciudad de Mexico, Zona Norte",
        rating: "4.9",
        reviewCount: 127,
        yearsExperience: 15,
        verified: true,
        available: true,
      });
    } else if (cat.slug === "electricidad") {
      await storage.createSpecialist({
        name: "Roberto Hernandez",
        email: "roberto.h@correo.com",
        phone: "55 3456 7890",
        bio: "Electricista industrial y residencial. Especialista en instalaciones de alta y baja tension.",
        categoryId: category.id,
        specialties: ["Instalacion electrica", "Cortocircuitos", "Tableros electricos"],
        location: "Ciudad de Mexico, Zona Sur",
        rating: "4.8",
        reviewCount: 98,
        yearsExperience: 12,
        verified: true,
        available: true,
      });
    }
  }
})();
