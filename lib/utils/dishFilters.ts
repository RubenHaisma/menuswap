// Utility to sanitize and filter noisy dish data coming from OCR/ingestion

type DishLike = {
  name: string;
  description: string | null;
  section: string;
  tags: string[];
};

function normalize(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (combining marks)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const bannedNameExacts = new Set<string>([
  'pizza',
  'pizzas',
  'pizze',
  'pizza s', // catches pizza's and pizza’s after punctuation removal
  'pizza s 30cm',
  'pizza s 30 cm',
  'pizza s medium',
  'pizza s met vlees',
  'nieuw pizza s',
  'pizza',
  'calzone',
  'calzones',
  'pasta',
  'dranken',
  'featured items',
  'populaire producten',
  'our starters antipasti',
  'pizze pizza s',
]);

const noiseTokens = [
  /\buitverkocht\b/gi,
  /\bop\s+voorraad\b/gi,
  /\bkies\b/gi,
  /\b0\s+op\s+voorraad\b/gi,
  /\bmaandag\s*pizza\s*dag\b/gi,
  /\bwoensdag\s*pizza\s*dag\b/gi,
  /\bnieuw:?\b/gi,
  /\b(populair|populaire producten)\b/gi,
];

const currencyOrPricePattern = /€\s?\d{1,3}(?:[.,]\d{2})?/g;

function cleanField(text: string): string {
  let t = text;
  // If price markers exist, keep only before the first price to avoid concatenated price trails
  const firstPrice = t.search(currencyOrPricePattern);
  if (firstPrice > 0) {
    t = t.slice(0, firstPrice);
  }
  // Drop currency-like leftovers
  t = t.replace(currencyOrPricePattern, ' ');
  // Remove stock/noise tokens
  for (const re of noiseTokens) t = t.replace(re, ' ');
  // Collapse duplicate name repetition like "Pizza Margherita Pizza Margherita"
  t = t.replace(/\b(\w[\w\s]{2,}?)\s+\1\b/gi, '$1');
  // Normalize whitespace and trim punctuation
  t = t.replace(/[•\-–—]+/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/[.,;:]+$/g, '').trim();
  return t;
}

export function sanitizeDishFields(dish: DishLike): { name: string; description: string | null } {
  const cleanedName = cleanField(dish.name);
  const cleanedDesc = dish.description ? cleanField(dish.description) : null;
  return { name: cleanedName, description: cleanedDesc };
}

function isGenericCategoryName(name: string): boolean {
  const n = normalize(name);
  if (bannedNameExacts.has(n)) return true;
  // Category heuristics
  if (/^(pizza|pizzas|pizze|calzone|calzones|pasta|dranken)\b/.test(n)) {
    // Names that are exactly or almost exactly category headers
    if (n.length <= 24) return true;
  }
  // e.g., "pizza s medium", "pizza s 30cm"
  if (/^pizza s(\s|$)/.test(n)) return true;
  return false;
}

export function isDishAllowed(dish: DishLike, query?: string): boolean {
  const name = dish.name ?? '';
  const desc = dish.description ?? '';

  // Exclude very long concatenations or with multiple price blobs
  if (name.length > 120) return false;

  // Exclude if name contains multiple repeated noise tokens
  const noiseHits = noiseTokens.reduce((acc, re) => acc + ((name.match(re) || []).length + (desc.match(re) || []).length), 0);
  if (noiseHits >= 2) return false;

  // Exclude generic category headers
  if (isGenericCategoryName(name)) return false;

  // If query present, require at least one token to match name/section/tags/description
  if (query && query.trim().length > 0) {
    const qn = normalize(query);
    const qTerms = qn.split(' ').filter(Boolean);
    const hay = normalize([name, dish.section, dish.tags.join(' '), desc].join(' '));
    const anyTokenInDish = qTerms.some((t) => hay.includes(t));
    if (!anyTokenInDish) return false;
  }

  // Exclude names that are too short after cleaning
  if (normalize(name).length < 2) return false;

  return true;
}


