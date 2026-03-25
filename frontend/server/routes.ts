import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteRequestSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/categories/:slug", async (req, res) => {
    const category = await storage.getCategoryBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ message: "Categoria no encontrada" });
    }
    res.json(category);
  });

  app.get("/api/specialists", async (_req, res) => {
    const allSpecialists = await storage.getSpecialists();
    res.json(allSpecialists);
  });

  app.get("/api/specialists/:id", async (req, res) => {
    const specialist = await storage.getSpecialist(req.params.id);
    if (!specialist) {
      return res.status(404).json({ message: "Especialista no encontrado" });
    }
    res.json(specialist);
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const validated = insertQuoteRequestSchema.parse(req.body);
      const quote = await storage.createQuoteRequest(validated);
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Datos invalidos", errors: error.errors });
      }
      throw error;
    }
  });

  return httpServer;
}
