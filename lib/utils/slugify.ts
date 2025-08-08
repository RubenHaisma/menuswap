export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function formatAddress(address: string | null, city: string): string {
  if (!address) return city;
  return `${address}, ${city}`;
}

export function generateSEOTitle(restaurant: string, city: string, dish?: string): string {
  if (dish) {
    return `${dish} bij ${restaurant} in ${city} - MenuSwap NL`;
  }
  return `${restaurant} menu in ${city} - MenuSwap NL`;
}

export function generateSEODescription(restaurant: string, city: string, dish?: string): string {
  if (dish) {
    return `Bekijk ${dish} bij ${restaurant} in ${city}. Vergelijk prijzen en vind de beste gerechten bij restaurants in Nederland.`;
  }
  return `Bekijk de volledige menukaart van ${restaurant} in ${city}. Vind prijzen, gerechten en contactgegevens.`;
}