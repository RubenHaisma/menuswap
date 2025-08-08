# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MenuSwap NL is a Next.js application that creates a searchable database of restaurant menus across the Netherlands. The platform allows users to search for dishes, compare prices, and discover restaurants while providing SEO-optimized pages for organic discovery.

## Development Commands

### Next.js Application
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

### Database Operations
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio
npx prisma studio
```

### SEO and Sitemaps
```bash
# Generate XML sitemaps
npm run sitemaps
```

### Python Scraper (menuswap-scraper/)
```bash
# Setup scraper environment
cd menuswap-scraper
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

## Architecture

### Frontend Structure
- **Next.js 15** with App Router architecture
- **TypeScript** for type safety
- **Tailwind CSS** with custom design system inspired by Opendoor
- **Radix UI components** with shadcn/ui patterns
- **Dutch language** throughout the interface

### Database Schema (Prisma + PostgreSQL)
Core entities:
- `Restaurant`: Stores restaurant data with city, slug, coordinates
- `Menu`: Tracks uploaded menus with parsing status and source type  
- `Dish`: Individual menu items with prices, descriptions, and sections
- `User`: Handles authentication and favorites
- `Favorite`: User bookmarks for restaurants/dishes
- `PriceAlert`: User-defined price monitoring

### API Architecture
- **Server Actions**: Located in `lib/api/` (dishes.ts, menus.ts, restaurants.ts)
- **REST endpoints**: `/api/search/dishes`, `/api/search/restaurants`, `/api/uploads`
- **Search functionality**: Full-text search with filtering by city, price, dietary tags

### Key Features
- **Real-time search**: Instant dish search with debounced API calls
- **SEO optimization**: Dynamic sitemaps, structured data, meta tags in Dutch
- **Menu upload**: Supports PDF, image, and URL parsing
- **Price comparison**: Displays prices consistently formatted for Dutch users (€X,XX)
- **City-based routing**: `/restaurants/[city]/[slug]/menu` pattern

### Data Processing Pipeline
The Python scraper handles:
- OpenStreetMap data seeding
- Restaurant website crawling
- Menu PDF/image parsing with OCR
- Dutch language processing for menu sections

### Styling System
- Custom Tailwind configuration with Opendoor-inspired colors
- Typography scale optimized for Dutch content
- Consistent spacing and animation patterns
- Responsive design with mobile-first approach

### File Organization
```
app/                    # Next.js app router pages
components/            # Reusable UI components
  - ui/               # shadcn/ui components
  - layout/           # Header/Footer components  
  - search/           # Search-specific components
lib/                   # Utilities and API functions
  - api/              # Database operations
  - utils/            # Helper functions (slugify, formatting)
prisma/               # Database schema
menuswap-scraper/     # Python data collection pipeline
public/sitemaps/      # Generated XML sitemaps
scripts/              # Build and maintenance scripts
```

## Development Notes

### Database Connection
Requires PostgreSQL with connection string in `.env` file as `DATABASE_URL`.

### Environment Variables
Key variables needed:
- `DATABASE_URL`: PostgreSQL connection
- `NEXT_PUBLIC_SITE_URL`: Production domain for sitemaps

### SEO Implementation
- Generates paginated sitemaps for restaurants, dishes, cities, and price-filtered searches
- Implements structured data for search engines
- Dutch-language meta tags and OpenGraph data

### Menu Processing
Menu uploads support three source types (PDF, IMAGE, URL) with status tracking through PENDING → APPROVED/REJECTED workflow.

### Search Performance
Uses database indexes on dish names, prices, and sections. Full-text search implemented with case-insensitive matching.

## Production Features

### Complete Page Structure
- **Homepage**: Landing with real-time search, statistics, and hero section
- **Search Page**: Advanced filtering with restaurants/dishes tabs
- **Restaurant Pages**: Individual restaurant landing pages with SEO
- **Restaurant Menu Pages**: Complete menu listings by section
- **Individual Dish Pages**: Detailed dish pages with similar dishes
- **Cities Page**: Alphabetical city listings with restaurant counts
- **404 Page**: Custom not-found page with navigation options

### API Endpoints
- `GET /api/stats` - Platform statistics (restaurants, dishes, cities, avg price)
- `GET /api/dishes/popular` - Popular dishes with price comparison
- `POST /api/search/dishes` - Advanced dish search with filters
- `POST /api/search/restaurants` - Restaurant search
- `GET /sitemap.xml` - Dynamic XML sitemaps for SEO

### SEO Optimization
- Dynamic meta tags and OpenGraph for all pages
- Structured data (JSON-LD) for restaurants, dishes, and breadcrumbs
- XML sitemaps generated from database content
- Robots.txt for search engine guidance
- Dutch-language optimization throughout

### Performance Optimizations
- Server-side rendering with caching
- Optimized database queries with proper indexing
- Image optimization disabled (as per config)
- Static optimization enabled
- Package imports optimized for lucide-react
- Console.log removal in production builds

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff  
- Referrer-Policy: origin-when-cross-origin

### Production Deployment
Ready for deployment with:
- Database connection via DATABASE_URL
- NEXT_PUBLIC_SITE_URL for absolute URLs
- Standalone output for containerization
- Security headers configured
- Error boundaries and loading states