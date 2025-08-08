import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, ExternalLink, Clock, Star, Euro, ChefHat } from 'lucide-react';
import { getRestaurantBySlug } from '@/lib/api/restaurants';
import { formatPrice, formatAddress, generateSEOTitle, generateSEODescription } from '@/lib/utils/slugify';

interface PageProps {
  params: Promise<{
    city: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const restaurant = await getRestaurantBySlug(slug, city);
  
  if (!restaurant) {
    return {
      title: 'Restaurant niet gevonden - MenuSwap NL',
      description: 'Het gevraagde restaurant kon niet worden gevonden.'
    };
  }

  return {
    title: generateSEOTitle(restaurant.name, restaurant.city),
    description: generateSEODescription(restaurant.name, restaurant.city),
    openGraph: {
      title: `${restaurant.name} menu in ${restaurant.city}`,
      description: `Bekijk de volledige menukaart van ${restaurant.name} in ${restaurant.city}. Vind prijzen, gerechten en contactgegevens.`,
      type: 'website'
    }
  };
}

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { city, slug } = await params;
  const restaurant = await getRestaurantBySlug(slug, city);

  if (!restaurant) {
    notFound();
  }

  // Group dishes by section
  const dishesBySection = restaurant.dishes.reduce((acc, dish) => {
    const section = dish.section || 'Overig';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(dish);
    return acc;
  }, {} as Record<string, typeof restaurant.dishes>);

  const sections = Object.keys(dishesBySection).sort();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Header */}
        <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
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
                <a
                  href={restaurant.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </Button>
                </a>
              )}
              
              <a
                href={`/search?q=&city=${encodeURIComponent(restaurant.city)}`}
              >
                <Button className="flex items-center gap-2 bg-primary hover:bg-primary-600">
                  <ChefHat className="h-4 w-4" />
                  Meer restaurants
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Menu Content */}
        {restaurant.dishes.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Geen menu beschikbaar
              </h2>
              <p className="text-gray-600 mb-6">
                Het menu van dit restaurant is nog niet beschikbaar in onze database.
                Probeer later opnieuw of zoek naar vergelijkbare restaurants.
              </p>
              <a href={`/search?city=${encodeURIComponent(restaurant.city)}`}>
                <Button className="bg-primary hover:bg-primary-600">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Zoek andere restaurants
                </Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <Card key={section}>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    {section}
                    <Badge variant="secondary" className="ml-2">
                      {dishesBySection[section].length} gerechten
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {dishesBySection[section].map((dish, index) => (
                      <div key={dish.id}>
                        {index > 0 && <Separator className="my-4" />}
                        
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                {dish.name}
                              </h3>
                              
                              {dish.price_cents && (
                                <div className="text-lg font-bold text-green-600 flex items-center ml-4">
                                  <Euro className="h-4 w-4" />
                                  {formatPrice(dish.price_cents)}
                                </div>
                              )}
                            </div>
                            
                            {dish.description && (
                              <p className="text-gray-600 mb-3 leading-relaxed">
                                {dish.description}
                              </p>
                            )}

                            {dish.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {dish.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Restaurant Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Restaurant Informatie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Contactgegevens</h4>
                <div className="space-y-2 text-gray-600">
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
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Menu Informatie</h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Laatste update: vandaag</span>
                  </div>
                  <div className="flex items-center">
                    <ChefHat className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{restaurant.dishes.length} gerechten beschikbaar</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}