"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useEffect, useMemo, useState } from 'react';
import { formatPrice } from '@/lib/utils/slugify';

export default function HomePage() {
  // Instant search state (client)
  const [term, setTerm] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<
    { id: string; name: string; slug: string; price_cents: number | null; restaurant: { city: string } }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mobile filters toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Rotating placeholder to guide search intent
  const placeholders = [
    'Pizza Margherita',
    'Sushi in Rotterdam',
    'Vegan burger',
    'Pasta carbonara',
    'Pad Thai',
    'Biryani in Amsterdam',
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((idx) => (idx + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Debounce
  const debounced = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (fn: () => void, delay = 250) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(fn, delay);
    };
  }, []);

  useEffect(() => {
    if (!term) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    debounced(async () => {
      try {
        const res = await fetch('/api/search/dishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: term, city: city || undefined, sortBy: 'price_asc', limit: 10 }),
        });
        const data = await res.json();
        setResults(data);
      } catch (e) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, [term, city, debounced]);

  const submitSearch = () => {
    const params = new URLSearchParams();
    if (term) params.set('q', term);
    if (city) params.set('city', city);
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Focused Hero */}
      <section className="relative overflow-hidden">
        {/* Soft animated background blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl animate-blob" />
          <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-green-300/30 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/3 -right-24 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              Vind het perfecte gerecht, snel
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600">
              Doorzoek menu's van duizenden restaurants. Alles draait om je zoekopdracht.
            </p>

            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              className="mt-8"
            >
              <div className="mx-auto flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    aria-label="Zoek gerecht of restaurant"
                    type="search"
                    placeholder={`Bijv. ${placeholders[placeholderIndex]}`}
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="pl-12 h-14 text-base md:text-lg border-2 border-gray-200 focus-visible:ring-4 focus-visible:ring-orange-200 focus:border-orange-500 transition-all shadow-sm"
                  />
                </div>

                {/* City (advanced) */}
                <div className="sm:w-56">
                  <div className="block sm:hidden">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-14 border-2"
                      onClick={() => setShowAdvanced((v) => !v)}
                    >
                      {showAdvanced ? 'Verberg filters' : 'Filters'}
                    </Button>
                  </div>
                  <div className={`sm:block ${showAdvanced ? 'block' : 'hidden'}`}>
                    <Input
                      aria-label="Stad (optioneel)"
                      placeholder="Stad (optioneel)"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-14 border-2 border-gray-200 focus-visible:ring-4 focus-visible:ring-orange-200 focus:border-orange-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-6 bg-orange-600 hover:bg-orange-700 text-white text-base md:text-lg shadow-sm"
                >
                  Zoeken
                </Button>
              </div>
            </form>

            {/* Instant result list: dish, city, price */}
            {term && (
              <div className="mt-3 text-left">
                <div className="bg-white/90 backdrop-blur border rounded-xl shadow-md overflow-hidden">
                  <div className="max-h-80 overflow-y-auto divide-y">
                    {isSearching && results.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500">Zoeken…</div>
                    ) : results.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500">Geen resultaten gevonden</div>
                    ) : (
                      results.map((r) => (
                        <Link
                          key={r.id}
                          href={`/search?q=${encodeURIComponent(term)}${city ? `&city=${encodeURIComponent(city)}` : ''}`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-orange-50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate font-medium">{r.name}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 truncate">{r.restaurant.city}</span>
                          </div>
                          {r.price_cents != null && (
                            <div className="text-green-600 font-semibold">
                              {formatPrice(r.price_cents)}
                            </div>
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Popular quick searches */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['Pizza Amsterdam', 'Sushi Rotterdam', 'Pasta Utrecht', 'Burger Den Haag'].map((q) => (
                <Link
                  key={q}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:border-orange-400 hover:text-orange-700 transition-colors"
                >
                  {q}
                </Link>
              ))}
            </div>

            {/* Lightweight stats for trust */}
            <div className="mt-10 grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
              <div>
                <div className="text-xl font-semibold text-orange-600">25k+</div>
                Gerechten
              </div>
              <div>
                <div className="text-xl font-semibold text-green-600">2.5k+</div>
                Restaurants
              </div>
              <div>
                <div className="text-xl font-semibold text-blue-600">100+</div>
                Steden
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}