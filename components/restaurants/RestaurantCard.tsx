import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ExternalLink, Clock, Star, Utensils } from 'lucide-react';
import { formatAddress } from '@/lib/utils/slugify';

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    city: string;
    address: string | null;
    website_url: string | null;
    verified: boolean;
  };
  showLocation?: boolean;
  className?: string;
}

export default function RestaurantCard({ 
  restaurant, 
  showLocation = true,
  className = '' 
}: RestaurantCardProps) {
  const restaurantPageUrl = `/restaurants/${restaurant.city.toLowerCase()}/${restaurant.slug}`;
  const menuUrl = `${restaurantPageUrl}/menu`;

  return (
    <Card className={`card-base group hover:-translate-y-1 transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <Link 
              href={restaurantPageUrl}
              className="block group-hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors">
                {restaurant.name}
              </h3>
            </Link>
            
            {showLocation && (
              <p className="text-gray-600 text-sm mb-3 flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                {formatAddress(restaurant.address, restaurant.city)}
              </p>
            )}

            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center">
                <Utensils className="h-4 w-4 mr-1" />
                <span>Menu beschikbaar</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Bijgewerkt vandaag</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 ml-4">
            {restaurant.verified && (
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                <Star className="h-3 w-3 mr-1" />
                Geverifieerd
              </Badge>
            )}
            
            {restaurant.website_url && (
              <a 
                href={restaurant.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gray-50/50 group-hover:bg-primary/5 transition-colors border-t border-gray-100">
        <div className="flex items-center justify-between w-full">
          <Link 
            href={restaurantPageUrl}
            className="text-primary hover:text-primary-600 font-medium text-sm transition-colors"
          >
            Bekijk restaurant →
          </Link>
          <Link 
            href={menuUrl}
            className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            Menu
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}