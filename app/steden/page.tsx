import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, TrendingUp } from 'lucide-react';
import { getCitiesWithCount } from '@/lib/api/restaurants';

export const metadata: Metadata = {
  title: 'Alle steden - MenuSwap NL',
  description: 'Ontdek restaurants en menu\'s in alle Nederlandse steden op MenuSwap. Zoek per stad en vind de beste gerechten bij jou in de buurt.',
  alternates: { canonical: 'https://menuswap.nl/steden' },
  openGraph: {
    title: 'Alle steden - MenuSwap NL',
    description: 'Ontdek restaurants en menu\'s in alle Nederlandse steden op MenuSwap.',
    type: 'website',
    locale: 'nl_NL',
    url: 'https://menuswap.nl/steden',
  },
};

export default async function CitiesPage() {
  const cities = await getCitiesWithCount();

  // Group cities by first letter
  const citiesByLetter = cities.reduce((acc, city) => {
    const firstLetter = city.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(city);
    return acc;
  }, {} as Record<string, typeof cities>);

  const letters = Object.keys(citiesByLetter).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ontdek restaurants in heel Nederland
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Doorzoek duizenden restaurants in {cities.length} Nederlandse steden. 
                Vind je favoriete gerechten en vergelijk prijzen bij jou in de buurt.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">{cities.length} steden</span>
                </div>
                <div className="flex items-center">
                  <Search className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">{cities.reduce((sum, city) => sum + city.restaurantCount, 0)} restaurants</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">Dagelijks bijgewerkt</span>
                </div>
              </div>
            </div>
          </section>

          {/* Popular Cities */}
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Populaire steden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cities
                    .sort((a, b) => b.restaurantCount - a.restaurantCount)
                    .slice(0, 12)
                    .map((city) => (
                      <Link
                        key={city.name}
                        href={`/search?city=${encodeURIComponent(city.name)}`}
                        className="block p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                              {city.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {city.restaurantCount} restaurants
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {city.restaurantCount}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* All Cities A-Z */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Alle steden A-Z</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {letters.map((letter) => (
                    <div key={letter}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
                          {letter}
                        </span>
                        {letter}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {citiesByLetter[letter]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((city) => (
                            <Link
                              key={city.name}
                              href={`/search?city=${encodeURIComponent(city.name)}`}
                              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                            >
                              <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                                {city.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {city.restaurantCount}
                              </Badge>
                            </Link>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}