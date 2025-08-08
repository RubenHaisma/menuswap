# MenuSwap NL – Business Plan & Execution Roadmap

## 1. Overview
MenuSwap NL is a searchable database of restaurant menus in the Netherlands. It lets users search for dishes, prices, and dietary options across restaurants. Restaurants can upload and manage their menus, and all data is SEO-optimized for organic discovery.

---

## 2. Business Plan Summary

### Problem
- Menus are scattered in PDFs, images, or buried on social media.
- Diners can’t easily compare dishes or prices across restaurants.
- Restaurants lose discoverability when menus aren’t indexed.

### Solution
- Aggregate menus in a single searchable platform.
- Normalize menu data for dish-level search.
- Generate SEO-friendly pages for every restaurant, dish, and collection.

### Target Market
- Dutch consumers, tourists, food bloggers.
- Restaurants (25,000+ in NL with online menus).
- Food delivery apps & market researchers (API clients).

### Monetization
1. **Restaurant Pro (€19/mo)** – Featured listings, analytics, priority updates.
2. **Diner Pro (€5/mo)** – Save favorites, price-drop alerts.
3. **API (€99–499/mo)** – Menu data for businesses.
4. **Sponsored Lists (€100–500/month)** – Brand exposure.

---

## 3. Execution Phases

### Phase 0 – Scope & Data Seeding (Week 1)
- Target cities: Amsterdam, Rotterdam, Utrecht, Den Haag, Eindhoven.
- Pull restaurant info from OpenStreetMap & Google Places API.
- Build seed database of 10–20k venues with website URLs.

### Phase 1 – Menu Crawling & Parsing (Weeks 1–2)
- Crawl restaurant websites politely (respect robots.txt).
- Detect menu URLs using Dutch keywords (`menukaart`, `menu`, `kaart`).
- Parse:
  - PDFs → PyMuPDF/pdfplumber.
  - Images → Tesseract OCR (Dutch-trained).
  - HTML → DOM parsing with price regex.

### Phase 2 – Data Normalization (Weeks 2–3)
- Standardize prices (comma decimal → dot decimal).
- Identify sections (Voorgerechten, Hoofdgerechten, Nagerechten, Dranken).
- Store structured JSON in Postgres.

### Phase 3 – MVP Launch (Weeks 4–6)
- Next.js + Tailwind frontend.
- Search by dish, price, diet, and city.
- Restaurant pages with menus and SEO URLs.
- Auto-generated lists (“Best X under €Y in [city]”).
- Menu upload with preview + manual edit.

### Phase 4 – Growth Flywheel (Months 2–12)
- SEO-first content expansion:
  - Dish pages.
  - City hubs.
  - Monthly “menu price index”.
- Outreach to restaurants for claiming pages.
- Crowdsourced menu uploads from diners.

### Phase 5 – Monetization Rollout (Month 6+)
- Launch Restaurant Pro & Diner Pro subscriptions.
- Release API for business clients.
- Sell sponsored placements in top lists.

---

## 4. Tech Stack
- **Frontend:** Next.js, TailwindCSS.
- **Backend:** Node.js/Express or Next.js API routes.
- **Database:** PostgreSQL.
- **Storage:** S3 for original menus.
- **Parsing:** PyMuPDF, pdfplumber, Tesseract OCR (Dutch), HTML parsing.
- **Deployment:** Vercel + Railway/Render.

---

## 5. Roadmap

| Month | Milestone |
|-------|-----------|
| 1     | Seed data, build crawler, parsing pipeline. |
| 2     | Normalize data, build MVP UI, test uploads. |
| 3     | Launch NL MVP in 5 cities. |
| 4–6   | SEO growth, restaurant outreach. |
| 6+    | Monetization & API. |
| 12    | Cover all NL cities, start BE/DE expansion. |

---

## 6. Vision
Start with the Netherlands, perfect the ingestion & SEO flywheel, then expand to Europe and beyond. Long-term: become the **global menu database** powering restaurant discovery, delivery apps, and food market analytics.

