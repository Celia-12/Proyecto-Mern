# Multiservicios TECNICOS

## Overview
A service marketplace platform that connects clients with verified technical specialists for home and office services. Built with React + Express + PostgreSQL.

## Recent Changes
- 2026-02-13: Initial MVP built with service categories, specialist directory, quote request form, and informational pages

## User Preferences
- Spanish-language UI (Mexican market)
- Professional blue color scheme
- Clean, modern design

## Project Architecture

### Frontend (client/src/)
- **Pages**: Home, Services, Partners, Quote, About (in pages/)
- **Components**: Navbar, Footer, ThemeProvider (in components/)
- **Routing**: wouter
- **Data fetching**: TanStack React Query
- **UI**: Shadcn components + Tailwind CSS
- **Theme**: Light/Dark mode with ThemeProvider

### Backend (server/)
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: DatabaseStorage class implementing IStorage interface
- **Seed**: Auto-seeds on startup if empty (server/seed.ts)

### Database Schema (shared/schema.ts)
- **service_categories**: name, slug, description, icon, image
- **specialists**: name, email, phone, bio, rating, verified, categoryId, specialties, location
- **quote_requests**: client info, categoryId, description, address, preferred date, status

### API Endpoints
- GET /api/categories - List service categories
- GET /api/categories/:slug - Get category by slug
- GET /api/specialists - List all specialists
- GET /api/specialists/:id - Get specialist by ID
- POST /api/quotes - Submit a quote request
