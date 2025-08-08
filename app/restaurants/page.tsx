import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import { searchRestaurants } from '@/lib/api/restaurants';

export const metadata: Metadata = {
  title: 'Restaurants in Nederland - MenuSwap NL',
  description: 'Ontdek populaire restaurants met beschikbare menu\'s op MenuSwap. Zoek per stad en bekijk prijzen en gerechten.',
  alternates: { canonical: 'https://menuswap.nl/restaurants' },
  openGraph: {
    title: 'Restaurants in Nederland - MenuSwap NL',
    description: 'Ontdek populaire restaurants met beschikbare menu\'s op MenuSwap.',
    type: 'website',
    locale: 'nl_NL',
    url: 'https://menuswap.nl/restaurants',
  },
};

export default async function RestaurantsOverviewPage() {
  const restaurants = await searchRestaurants({ limit: 60 });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <section className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Populaire restaurants</h1>
            <p className="text-gray-600 mt-2">Blader door een selectie van geverifieerde restaurants door heel Nederland.</p>
          </section>

          {restaurants.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Geen restaurants gevonden</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Er zijn nog geen populaire restaurants beschikbaar.</p>
              </CardContent>
            </Card>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </section>
          )}

          <section className="mt-12 text-center">
            <Link href="/search" className="text-primary hover:text-primary-600 font-medium">Gerechten zoeken →</Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}


