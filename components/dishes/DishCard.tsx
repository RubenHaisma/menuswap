import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, Euro } from 'lucide-react';
import { formatPrice } from '@/lib/utils/slugify';

interface DishCardProps {
  dish: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price_cents: number | null;
    section: string;
    tags: string[];
    restaurant: {
      id: string;
      name: string;
      slug: string;
      city: string;
      address: string | null;
    };
  };
  showRestaurant?: boolean;
  className?: string;
}

export default function DishCard({ 
  dish, 
  showRestaurant = true,
  className = '' 
}: DishCardProps) {
  const dishUrl = `/dish/${dish.restaurant.city.toLowerCase()}/${dish.slug}`;
  const restaurantUrl = `/restaurant/${dish.restaurant.city.toLowerCase()}/${dish.restaurant.slug}/menu`;

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link 
              href={dishUrl}
              className="block hover:text-orange-600 transition-colors"
            >
              <h3 className="font-semibold text-lg leading-tight group-hover:text-orange-600 transition-colors">
                {dish.name}
              </h3>
            </Link>
            
            {dish.description && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {dish.description}
              </p>
            )}

            {showRestaurant && (
              <Link 
                href={restaurantUrl}
                className="text-gray-500 text-sm mt-2 flex items-center hover:text-orange-600 transition-colors"
              >
                <MapPin className="h-3 w-3 mr-1" />
                {dish.restaurant.name} • {dish.restaurant.city}
              </Link>
            )}
          </div>

          {dish.price_cents && (
            <div className="text-right">
              <div className="text-lg font-bold text-green-600 flex items-center">
                <Euro className="h-4 w-4" />
                {formatPrice(dish.price_cents)}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {dish.section}
          </Badge>
          {dish.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs capitalize">
              {tag}
            </Badge>
          ))}
          {dish.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{dish.tags.length - 3} meer
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 bg-gray-50 group-hover:bg-orange-50 transition-colors flex justify-between items-center">
        <Link 
          href={dishUrl}
          className="text-orange-600 hover:text-orange-700 font-medium text-sm"
        >
          Details bekijken →
        </Link>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}