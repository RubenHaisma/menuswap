'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  query: string;
  city: string;
  maxPrice: number | null;
  section: string;
  tags: string[];
  sortBy: string;
}

const DIET_TAGS = [
  'vegetarisch',
  'veganistisch',
  'glutenvrij',
  'lactosevrij',
  'halal',
  'kosher',
];

const SECTIONS = [
  'Voorgerechten',
  'Hoofdgerechten',
  'Nagerechten',
  'Dranken',
  'Bijgerechten',
  'Salades',
  'Pizza',
  'Pasta',
];

const MAJOR_CITIES = [
  'Amsterdam',
  'Rotterdam',
  'Den Haag',
  'Utrecht',
  'Eindhoven',
  'Tilburg',
  'Groningen',
  'Almere',
  'Breda',
  'Nijmegen',
];

export default function SearchFilters({ onFiltersChange, initialFilters }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialFilters?.query || '',
    city: initialFilters?.city || 'all',
    maxPrice: initialFilters?.maxPrice || null,
    section: initialFilters?.section || 'all',
    tags: initialFilters?.tags || [],
    sortBy: initialFilters?.sortBy || 'relevance'
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const clearFilters = () => {
    const cleared = {
      query: '',
      city: 'all',
      maxPrice: null,
      section: 'all',
      tags: [],
      sortBy: 'relevance'
    };
    setFilters(cleared);
    onFiltersChange(cleared);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Inklappen' : 'Meer filters'}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Wissen
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">Stad</Label>
            <Select value={filters.city} onValueChange={(value) => updateFilters({ city: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer stad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle steden</SelectItem>
                {MAJOR_CITIES.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxPrice">Max. prijs</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="€0,00"
              value={filters.maxPrice || ''}
              onChange={(e) => updateFilters({ 
                maxPrice: e.target.value ? parseInt(e.target.value) : null 
              })}
            />
          </div>

          <div>
            <Label htmlFor="sortBy">Sorteren op</Label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevantie</SelectItem>
                <SelectItem value="price_asc">Prijs: laag naar hoog</SelectItem>
                <SelectItem value="price_desc">Prijs: hoog naar laag</SelectItem>
                <SelectItem value="name">Alfabetisch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label>Categorie</Label>
              <Select value={filters.section} onValueChange={(value) => updateFilters({ section: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle categorieën</SelectItem>
                  {SECTIONS.map(section => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Dieetvoorkeuren</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {DIET_TAGS.map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    />
                    <Label
                      htmlFor={tag}
                      className="text-sm font-normal capitalize"
                    >
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(filters.city !== 'all' || filters.maxPrice || filters.section !== 'all' || filters.tags.length > 0) && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {filters.city !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                {filters.city}
                <button
                  onClick={() => updateFilters({ city: 'all' })}
                  className="ml-1 hover:text-orange-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.maxPrice && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Max €{filters.maxPrice}
                <button
                  onClick={() => updateFilters({ maxPrice: null })}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.section !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {filters.section}
                <button
                  onClick={() => updateFilters({ section: 'all' })}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { SearchFilters }