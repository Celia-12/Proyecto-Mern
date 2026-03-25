import { pgTable, text, boolean, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const serviceCategories = pgTable("service_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  image: text("image").notNull(),
});

export const specialists = pgTable("specialists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  bio: text("bio").notNull(),
  avatar: text("avatar"),
  rating: numeric("rating").notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  yearsExperience: integer("years_experience").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  available: boolean("available").notNull().default(true),
  categoryId: text("category_id").notNull(),
  specialties: text("specialties").array().notNull(),
  location: text("location").notNull(),
});

export const quoteRequests = pgTable("quote_requests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  categoryId: text("category_id").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  preferredDate: text("preferred_date").notNull(),
  status: text("status").notNull().default("pending"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCategorySchema = createInsertSchema(serviceCategories).omit({ id: true });
export const insertSpecialistSchema = createInsertSchema(specialists).omit({ id: true });
export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Specialist = typeof specialists.$inferSelect;
export type InsertSpecialist = z.infer<typeof insertSpecialistSchema>;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
