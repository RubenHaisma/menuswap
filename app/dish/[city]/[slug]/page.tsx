import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, ExternalLink, Clock, Star, Euro, ArrowLeft, Search } from 'lucide-react';
import { getDishBySlug, getSimilarDishes } from '@/lib/api/dishes';
import { formatPrice } from '@/lib/utils/slugify';
import DishCard from '@/components/dishes/DishCard';

interface PageProps {
  params: Promise<{
    city: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, city } = await params;
  const dish = await getDishBySlug(slug, city);

  if (!dish) {
    return {
      title: 'Gerecht niet gevonden - MenuSwap NL',
      description: 'Het gevraagde gerecht kon niet worden gevonden.'
    };
  }

  const title = `${dish.name} - ${dish.restaurant.name} in ${dish.restaurant.city} | MenuSwap NL`;
  const description = `${dish.name} bij ${dish.restaurant.name} in ${dish.restaurant.city}. ${dish.price_cents ? `Prijs: ${formatPrice(dish.price_cents)}. ` : ''}${dish.description || 'Bekijk menu en bestel online.'}`;
  const canonical = `https://menuswap.nl/dish/${encodeURIComponent(city)}/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'nl_NL',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function DishPage({ params }: PageProps) {
  const { slug, city } = await params;
  const [dish, similarDishes] = await Promise.all([
    getDishBySlug(slug, city),
    getSimilarDishes(slug, city, 6)
  ]);

  if (!dish) {
    notFound();
  }

  const canonicalUrl = `https://menuswap.nl/dish/${encodeURIComponent(city)}/${encodeURIComponent(slug)}`;
  const restaurantUrl = `/restaurants/${encodeURIComponent(dish.restaurant.city)}/${encodeURIComponent(dish.restaurant.slug)}`;
  const menuUrl = `${restaurantUrl}/menu`;

  const dishLd = {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: dish.name,
    description: dish.description || `${dish.name} bij ${dish.restaurant.name}`,
    ...(dish.price_cents ? {
      offers: {
        '@type': 'Offer',
        price: (dish.price_cents / 100).toFixed(2),
        priceCurrency: 'EUR',
      }
    } : {}),
    partOf: {
      '@type': 'Menu',
      name: `Menu van ${dish.restaurant.name}`,
      url: `https://menuswap.nl${menuUrl}`,
    },
    provider: {
      '@type': 'Restaurant',
      name: dish.restaurant.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: dish.restaurant.city,
        ...(dish.restaurant.address ? { streetAddress: dish.restaurant.address } : {}),
        addressCountry: 'NL',
      },
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://menuswap.nl',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Zoeken',
        item: 'https://menuswap.nl/search',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: dish.restaurant.name,
        item: `https://menuswap.nl${restaurantUrl}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: dish.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Structured Data */}
      <Script
        id="ld-dish"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dishLd) }}
      />
      <Script
        id="ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-primary">Zoeken</Link>
            <span>/</span>
            <Link href={restaurantUrl} className="hover:text-primary">{dish.restaurant.name}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{dish.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Dish Header */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 mb-8">
                <Link 
                  href="/search" 
                  className="inline-flex items-center text-primary hover:text-primary-600 mb-4 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug naar zoeken
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {dish.name}
                    </h1>
                    
                    {dish.description && (
                      <p className="text-lg text-gray-600 leading-relaxed mb-6">
                        {dish.description}
                      </p>
                    )}

                    {/* Tags */}
                    {dish.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                          {dish.section}
                        </Badge>
                        {dish.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="capitalize">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Restaurant Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600">
                      <Link 
                        href={restaurantUrl}
                        className="flex items-center hover:text-primary transition-colors group"
                      >
                        <MapPin className="h-4 w-4 mr-2 group-hover:text-primary" />
                        <span className="font-medium">{dish.restaurant.name}</span>
                        <span className="mx-2">•</span>
                        <span>{dish.restaurant.city}</span>
                      </Link>
                    </div>
                  </div>

                  {/* Price */}
                  {dish.price_cents && (
                    <div className="text-center md:text-right">
                      <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center md:justify-end">
                        <Euro className="h-8 w-8" />
                        {formatPrice(dish.price_cents)}
                      </div>
                      <p className="text-gray-600 text-sm">Actuele prijs</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Restaurant Card */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Bestellen bij {dish.restaurant.name}</span>
                    <Badge className="bg-green-100 text-green-800">
                      <Star className="h-3 w-3 mr-1" />
                      Geverifieerd
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{dish.restaurant.address || dish.restaurant.city}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Menu bijgewerkt: vandaag</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex gap-3">
                      <Link href={menuUrl} className="flex-1">
                        <Button className="w-full bg-primary hover:bg-primary-600">
                          Bekijk volledige menu
                        </Button>
                      </Link>
                      <Link href={restaurantUrl}>
                        <Button variant="outline">
                          Restaurant info
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Quick Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Zoek vergelijkbare gerechten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/search?q=${encodeURIComponent(dish.name)}`}>
                    <Button variant="outline" className="w-full">
                      Zoek "{dish.name}" elders
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Similar Dishes */}
              {similarDishes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vergelijkbare gerechten</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {similarDishes.map((similarDish) => (
                      <div key={similarDish.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <Link 
                          href={`/dish/${encodeURIComponent(similarDish.restaurant.city)}/${encodeURIComponent(similarDish.slug)}`}
                          className="block"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-gray-900 truncate hover:text-primary transition-colors">
                                {similarDish.name}
                              </h4>
                              <p className="text-sm text-gray-600 truncate">
                                {similarDish.restaurant.name} • {similarDish.restaurant.city}
                              </p>
                            </div>
                            {similarDish.price_cents && (
                              <div className="text-sm font-semibold text-primary whitespace-nowrap">
                                {formatPrice(similarDish.price_cents)}
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}