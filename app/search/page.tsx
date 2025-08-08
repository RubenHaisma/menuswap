'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchFilters, { SearchFilters as SearchFiltersType } from '@/components/search/SearchFilters';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import DishCard from '@/components/dishes/DishCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search } from 'lucide-react';
type SearchRestaurant = {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string | null;
  website_url: string | null;
  verified: boolean;
};
import type { DishWithRestaurant } from '@/lib/api/dishes';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : null,
    section: searchParams.get('section') || '',
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    sortBy: searchParams.get('sortBy') || 'relevance'
  });

  const [restaurants, setRestaurants] = useState<SearchRestaurant[]>([]);
  const [dishes, setDishes] = useState<DishWithRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dishes');
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (currentFilters: SearchFiltersType) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const [restaurantsRes, dishesRes] = await Promise.all([
        fetch('/api/search/restaurants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: currentFilters.query,
            city: currentFilters.city === 'all' ? undefined : currentFilters.city,
            limit: 50,
          }),
        }),
        fetch('/api/search/dishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: currentFilters.query,
            city: currentFilters.city === 'all' ? undefined : currentFilters.city,
            maxPrice: currentFilters.maxPrice ?? undefined,
            section: currentFilters.section === 'all' ? undefined : currentFilters.section,
            tags: currentFilters.tags.length > 0 ? currentFilters.tags : undefined,
            sortBy: currentFilters.sortBy as any,
            limit: 100,
          }),
        }),
      ]);

      const [restaurantResults, dishResults] = await Promise.all([
        restaurantsRes.json(),
        dishesRes.json(),
      ]);

      setRestaurants(restaurantResults);
      setDishes(dishResults);

      // Set default tab based on results
      if (dishResults.length > 0) {
        setActiveTab('dishes');
      } else if (restaurantResults.length > 0) {
        setActiveTab('restaurants');
      }

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial search when component mounts
  useEffect(() => {
    if (filters.query || filters.city) {
      performSearch(filters);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    performSearch(newFilters);
  };

  const totalResults = restaurants.length + dishes.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-6 w-6 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900">
              {filters.query ? `Zoekresultaten voor "${filters.query}"` : 'Zoeken'}
            </h1>
          </div>
          
          {hasSearched && (
            <p className="text-gray-600">
              {isLoading ? 'Zoeken...' : `${totalResults} resultaten gevonden`}
              {filters.city && ` in ${filters.city}`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                <span className="ml-2 text-gray-600">Zoeken naar resultaten...</span>
              </div>
            ) : !hasSearched ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Begin met zoeken
                </h2>
                <p className="text-gray-600">
                  Voer een zoekterm in of selecteer filters om restaurants en gerechten te vinden.
                </p>
              </div>
            ) : totalResults === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Geen resultaten gevonden
                </h2>
                <p className="text-gray-600 mb-4">
                  Probeer andere zoektermen of pas uw filters aan.
                </p>
                <Button
                  onClick={() => handleFiltersChange({
                    query: '',
                    city: '',
                    maxPrice: null,
                    section: '',
                    tags: [],
                    sortBy: 'relevance'
                  })}
                  variant="outline"
                >
                  Filters wissen
                </Button>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dishes" className="relative">
                    Gerechten
                    {dishes.length > 0 && (
                      <span className="ml-2 bg-orange-100 text-orange-600 text-xs rounded-full px-2 py-0.5">
                        {dishes.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="restaurants" className="relative">
                    Restaurants
                    {restaurants.length > 0 && (
                      <span className="ml-2 bg-green-100 text-green-600 text-xs rounded-full px-2 py-0.5">
                        {restaurants.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dishes" className="mt-6">
                  {dishes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Geen gerechten gevonden voor deze zoekopdracht.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {dishes.map((dish) => (
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          showRestaurant={true}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="restaurants" className="mt-6">
                  {restaurants.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Geen restaurants gevonden voor deze zoekopdracht.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {restaurants.map((restaurant) => (
                        <RestaurantCard
                          key={restaurant.id}
                          restaurant={restaurant}
                          showLocation={true}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-2 text-gray-600">Laden...</span>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}