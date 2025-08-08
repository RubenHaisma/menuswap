import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ExternalLink, Clock, Star } from 'lucide-react';
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
  const restaurantUrl = `/restaurant/${restaurant.city.toLowerCase()}/${restaurant.slug}/menu`;

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link 
              href={restaurantUrl}
              className="block hover:text-orange-600 transition-colors"
            >
              <h3 className="font-semibold text-lg leading-tight group-hover:text-orange-600 transition-colors">
                {restaurant.name}
              </h3>
            </Link>
            
            {showLocation && (
              <p className="text-gray-600 text-sm mt-1 flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                {formatAddress(restaurant.address, restaurant.city)}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            {restaurant.verified && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Geverifieerd
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Menu bijgewerkt vandaag</span>
          </div>
          
          {restaurant.website_url && (
            <a 
              href={restaurant.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Website
            </a>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 bg-gray-50 group-hover:bg-orange-50 transition-colors">
        <Link 
          href={restaurantUrl}
          className="text-orange-600 hover:text-orange-700 font-medium text-sm w-full text-center"
        >
          Bekijk menu →
        </Link>
      </CardFooter>
    </Card>
  );
}