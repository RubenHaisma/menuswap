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
import { MapPin, ExternalLink, Clock, Star, ArrowRight, Euro } from 'lucide-react';
import { getRestaurantBySlug } from '@/lib/api/restaurants';
import { formatPrice, formatAddress, generateSEOTitle, generateSEODescription } from '@/lib/utils/slugify';

interface PageProps {
  params: Promise<{
    city: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, city } = await params;
  const restaurant = await getRestaurantBySlug(slug, city);

  if (!restaurant) {
    return {
      title: 'Restaurant niet gevonden - MenuSwap NL',
      description: 'Het gevraagde restaurant kon niet worden gevonden.'
    };
  }

  const title = generateSEOTitle(restaurant.name, restaurant.city);
  const description = generateSEODescription(restaurant.name, restaurant.city);
  const canonical = `https://menuswap.nl/restaurants/${encodeURIComponent(city)}/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
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

export default async function RestaurantLandingPage({ params }: PageProps) {
  const { slug, city } = await params;
  const restaurant = await getRestaurantBySlug(slug, city); 
  if (!restaurant) {
    notFound();
  }

  const canonicalUrl = `https://menuswap.nl/restaurants/${encodeURIComponent(city)}/${encodeURIComponent(slug)}`;
  const menuUrl = `${canonicalUrl}/menu`;

  const dishes = restaurant.dishes;
  const dishesWithPrice = dishes.filter((d) => d.price_cents != null);
  const popularDishes = [...dishesWithPrice]
    .sort((a, b) => (a.price_cents ?? 0) - (b.price_cents ?? 0))
    .slice(0, 12);

  const dishesBySection = dishes.reduce((acc, dish) => {
    const section = dish.section || 'Overig';
    if (!acc[section]) acc[section] = 0;
    acc[section] += 1;
    return acc;
  }, {} as Record<string, number>);

  const sections = Object.entries(dishesBySection)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const restaurantLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    url: canonicalUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: restaurant.city,
      ...(restaurant.address ? { streetAddress: restaurant.address } : {}),
      addressCountry: 'NL',
    },
    ...(restaurant.website_url ? { sameAs: [restaurant.website_url] } : {}),
    ...(dishes.length > 0 ? { hasMenu: menuUrl } : {}),
  } as const;

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
        name: restaurant.name,
        item: canonicalUrl,
      },
    ],
  } as const;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Wat zijn de prijzen bij ${restaurant.name} in ${restaurant.city}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Bekijk actuele menuprijzen van ${restaurant.name} in ${restaurant.city} op MenuSwap. Ga naar de menupagina voor alle gerechten en prijzen.`,
        },
      },
      {
        '@type': 'Question',
        name: `Waar vind ik het menu van ${restaurant.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Je vindt de volledige menukaart van ${restaurant.name} op MenuSwap via de knop "Bekijk menu".`,
        },
      },
      {
        '@type': 'Question',
        name: `Heeft ${restaurant.name} een website?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: restaurant.website_url
            ? `Ja, de website van ${restaurant.name} is ${restaurant.website_url}.`
            : `${restaurant.name} heeft geen website vermeld op dit moment.`,
        },
      },
    ],
  } as const;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Structured Data */}
      <Script
        id="ld-restaurant"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantLd) }}
      />
      <Script
        id="ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Hero */}
          <section className="bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl p-8 md:p-10 mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {restaurant.name}
                  </h1>
                  {restaurant.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Star className="h-3 w-3 mr-1" />
                      Geverifieerd
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-4">
                  Ontdek het menu, prijzen en informatie van {restaurant.name} in {restaurant.city}.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatAddress(restaurant.address, restaurant.city)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Menu bijgewerkt: vandaag</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {restaurant.website_url && (
                  <a href={restaurant.website_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Website
                    </Button>
                  </a>
                )}
                <Link href={menuUrl}>
                  <Button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
                    Bekijk menu
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Content Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Popular dishes */}
              {popularDishes.length > 0 && (
                <Card>
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-2xl text-gray-900">Populaire gerechten</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {popularDishes.map((dish, idx) => (
                        <div key={dish.id}>
                          {idx > 0 && <Separator className="my-4" />}
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 leading-tight">{dish.name}</h3>
                              {dish.description && (
                                <p className="text-gray-600 mt-1 leading-relaxed">{dish.description}</p>
                              )}
                              {dish.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {dish.tags.slice(0, 6).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs capitalize">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            {dish.price_cents != null && (
                              <div className="text-lg font-bold text-green-600 flex items-center ml-4">
                                <Euro className="h-4 w-4" />
                                {formatPrice(dish.price_cents)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SEO text block */}
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-2xl text-gray-900">
                    Menu en prijzen bij {restaurant.name} in {restaurant.city}
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none p-6">
                  <p>
                    Op deze pagina vind je alle informatie over {restaurant.name} in {restaurant.city}. Bekijk gerechten,
                    prijzen en categorieën. Met MenuSwap vergelijk je eenvoudig en snel wat er beschikbaar is.
                  </p>
                  <p>
                    Gebruik de knop "Bekijk menu" om de volledige menukaart en actuele prijzen te zien. Wij werken
                    continu aan het bijhouden en verbeteren van de menudata, zodat jij altijd een goed beeld hebt.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Categories */}
              {sections.length > 0 && (
                <Card>
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-xl text-gray-900">Categorieën</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {sections.map((s) => (
                        <Badge key={s.name} variant="secondary" className="text-xs">
                          {s.name} · {s.count}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Restaurant info */}
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-xl text-gray-900">Informatie</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3 text-gray-700">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatAddress(restaurant.address, restaurant.city)}</span>
                  </div>
                  {restaurant.website_url && (
                    <div className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2 text-gray-400" />
                      <a
                        href={restaurant.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-700 underline"
                      >
                        Website bezoeken
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Laatste update: vandaag</span>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}


