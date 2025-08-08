"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Clock, Star, TrendingUp, Users, Award, ChefHat, Utensils, Heart } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useEffect, useMemo, useState } from 'react';
import { formatPrice } from '@/lib/utils/slugify';

export default function HomePage() {
  // Instant search state (client)
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<
    { id: string; name: string; slug: string; price_cents: number | null; restaurant: { city: string } }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

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
          body: JSON.stringify({ query: term, sortBy: 'price_asc', limit: 6 }),
        });
        const data = await res.json();
        setResults(data);
      } catch (e) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, [term, debounced]);

  const submitSearch = () => {
    const params = new URLSearchParams();
    if (term) params.set('q', term);
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero Section - Opendoor Style */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
          {/* Subtle background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-float" />
          </div>

          <div className="relative container-content section-spacing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Hero Content */}
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <h1 className="text-display font-semibold text-gray-900 tracking-tight">
                    Vind het perfecte gerecht,{' '}
                    <span className="text-primary">snel en simpel</span>
                  </h1>
                  <p className="text-body-lg text-gray-600 max-w-lg">
                    Doorzoek menu's van duizenden restaurants in Nederland. 
                    Vergelijk prijzen en ontdek nieuwe favorieten.
                  </p>
                </div>

                {/* Search Form - The Star */}
                <div className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitSearch();
                    }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        aria-label="Zoek gerecht of restaurant"
                        type="search"
                        placeholder={`Bijv. ${placeholders[placeholderIndex]}`}
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="input-field pl-12 h-14 text-lg shadow-sm border-2 focus:shadow-md"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="btn-primary w-full h-14 text-lg shadow-md hover:shadow-lg"
                    >
                      Zoek gerechten
                    </Button>
                  </form>

                  {/* Instant Results */}
                  {term && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden animate-slide-up">
                      <div className="max-h-80 overflow-y-auto">
                        {isSearching && results.length === 0 ? (
                          <div className="px-4 py-3 text-gray-500 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                            Zoeken…
                          </div>
                        ) : results.length === 0 ? (
                          <div className="px-4 py-3 text-gray-500">Geen resultaten gevonden</div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {results.map((r) => (
                              <Link
                                key={r.id}
                                href={`/search?q=${encodeURIComponent(term)}`}
                                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-2 h-2 bg-primary rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                  <div className="min-w-0">
                                    <span className="font-medium text-gray-900 truncate block">{r.name}</span>
                                    <span className="text-sm text-gray-500 truncate block">{r.restaurant.city}</span>
                                  </div>
                                </div>
                                {r.price_cents != null && (
                                  <div className="text-primary font-semibold">
                                    {formatPrice(r.price_cents)}
                                  </div>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>4.8/5 sterren</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>50k+ gebruikers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Gratis te gebruiken</span>
                  </div>
                </div>
              </div>

              {/* Right: Hero Image/Illustration */}
              <div className="relative animate-fade-in">
                <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 lg:p-12">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Mock restaurant cards */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-full h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-3"></div>
                        <h4 className="font-medium text-gray-900 text-sm">Pizza Margherita</h4>
                        <p className="text-xs text-gray-500">Bella Vista</p>
                        <p className="text-primary font-semibold text-sm">€12,50</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-full h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-3"></div>
                        <h4 className="font-medium text-gray-900 text-sm">Sushi Set</h4>
                        <p className="text-xs text-gray-500">Tokyo Garden</p>
                        <p className="text-primary font-semibold text-sm">€18,90</p>
                      </div>
                    </div>
                    <div className="space-y-4 mt-8">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-full h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-3"></div>
                        <h4 className="font-medium text-gray-900 text-sm">Pad Thai</h4>
                        <p className="text-xs text-gray-500">Thai Palace</p>
                        <p className="text-primary font-semibold text-sm">€14,75</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-full h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-lg mb-3"></div>
                        <h4 className="font-medium text-gray-900 text-sm">Burger Deluxe</h4>
                        <p className="text-xs text-gray-500">Grill House</p>
                        <p className="text-primary font-semibold text-sm">€16,50</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full animate-float"></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-primary/60 rounded-full animate-pulse-slow"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section-spacing bg-white">
          <div className="container-content">
            <div className="text-center mb-16">
              <h2 className="text-h2 font-semibold text-gray-900 mb-4">
                Waarom MenuSwap?
              </h2>
              <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
                Ontdek waarom duizenden mensen MenuSwap gebruiken om hun perfecte maaltijd te vinden
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-h4 font-semibold text-gray-900 mb-3">
                  Zoek overal
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Doorzoek duizenden menu's van restaurants door heel Nederland in één keer
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-h4 font-semibold text-gray-900 mb-3">
                  Vergelijk prijzen
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Zie direct waar je favoriete gerecht het goedkoopst is en bespaar geld
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-h4 font-semibold text-gray-900 mb-3">
                  Ontdek nieuws
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Vind nieuwe restaurants en gerechten die perfect bij jouw smaak passen
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="section-spacing gradient-bg">
          <div className="container-content">
            <div className="text-center mb-16">
              <h2 className="text-h2 font-semibold text-gray-900 mb-4">
                Zo werkt het
              </h2>
              <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
                In drie simpele stappen vind je jouw perfecte maaltijd
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
                </div>
                <h3 className="text-h4 font-semibold text-gray-900 mb-3">
                  Zoek je gerecht
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Typ wat je wilt eten in de zoekbalk. Van pizza tot sushi, we hebben alles.
                </p>
              </div>

              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
                </div>
                <h3 className="text-h4 font-semibold text-gray-900 mb-3">
                  Vergelijk opties
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Bekijk prijzen, locaties en beoordelingen van verschillende restaurants.
                </p>
              </div>

              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                </div>
                <h3 className="text-h4 font-semibold text-gray-900 mb-3">
                  Geniet van je maaltijd
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Ga naar het restaurant of bestel online. Smakelijk eten!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section-spacing bg-white">
          <div className="container-content">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">25k+</div>
                <div className="text-gray-600">Gerechten</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">2.5k+</div>
                <div className="text-gray-600">Restaurants</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <div className="text-gray-600">Steden</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50k+</div>
                <div className="text-gray-600">Gebruikers</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        {/* <section className="gradient-primary">
          <div className="container-content py-16">
            <div className="text-center text-white">
              <h2 className="text-h2 font-semibold mb-4">
                Klaar om je perfecte gerecht te vinden?
              </h2>
              <p className="text-body-lg mb-8 opacity-90">
                Begin nu met zoeken en ontdek duizenden gerechten
              </p>
              <Link href="/search">
                <Button className="bg-white text-primary hover:bg-gray-50 h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all">
                  Start met zoeken
                </Button>
              </Link>
            </div>
          </div>
        </section> */}
      </main>

      <Footer />
    </div>
  );
}