import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Euro, Star, ArrowRight } from 'lucide-react';
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
  const dishUrl = `/dish/${encodeURIComponent(dish.restaurant.city)}/${encodeURIComponent(dish.slug)}`;
  const restaurantUrl = `/restaurants/${encodeURIComponent(dish.restaurant.city)}/${encodeURIComponent(dish.restaurant.slug)}/menu`;

  return (
    <Card className={`card-base group hover:-translate-y-1 transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <Link 
              href={dishUrl}
              className="block group-hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors">
                {dish.name}
              </h3>
            </Link>
            
            {dish.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                {dish.description}
              </p>
            )}

            {showRestaurant && (
              <Link 
                href={restaurantUrl}
                className="text-gray-500 text-sm flex items-center hover:text-primary transition-colors group/restaurant"
              >
                <MapPin className="h-3 w-3 mr-1 group-hover/restaurant:text-primary transition-colors" />
                <span className="font-medium">{dish.restaurant.name}</span>
                <span className="mx-1">•</span>
                <span>{dish.restaurant.city}</span>
              </Link>
            )}
          </div>

          {dish.price_cents && (
            <div className="ml-4 text-right">
              <div className="text-xl font-bold text-primary flex items-center">
                <Euro className="h-4 w-4" />
                {formatPrice(dish.price_cents)}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
            {dish.section}
          </Badge>
          {dish.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs capitalize bg-primary/10 text-primary border-0">
              {tag}
            </Badge>
          ))}
          {dish.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-0">
              +{dish.tags.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gray-50/50 group-hover:bg-primary/5 transition-colors flex justify-between items-center border-t border-gray-100">
        <Link 
          href={dishUrl}
          className="text-primary hover:text-primary-600 font-medium text-sm transition-colors"
        >
          Details bekijken →
        </Link>
        
        <Link 
          href={restaurantUrl}
          className="text-gray-600 hover:text-primary font-medium text-sm transition-colors"
        >
          Restaurant →
        </Link>
      </CardFooter>
    </Card>
  );
}