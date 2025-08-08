'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../ui/badge';

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

  const activeFiltersCount = [
    filters.city !== 'all',
    filters.maxPrice !== null,
    filters.section !== 'all',
    filters.tags.length > 0
  ].filter(Boolean).length;

  return (
    <Card className="card-base">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
            <Filter className="h-5 w-5 text-primary" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-primary"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Minder
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Meer
                </>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-600 hover:text-red-600">
                <X className="h-4 w-4 mr-1" />
                Wissen
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Filters - Always Visible */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">Stad</Label>
            <Select value={filters.city} onValueChange={(value) => updateFilters({ city: value })}>
              <SelectTrigger className="input-field">
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
            <Label htmlFor="maxPrice" className="text-sm font-medium text-gray-700 mb-2 block">Maximale prijs</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="€0,00"
              value={filters.maxPrice || ''}
              onChange={(e) => updateFilters({ 
                maxPrice: e.target.value ? parseInt(e.target.value) : null 
              })}
              className="input-field"
            />
          </div>

          <div>
            <Label htmlFor="sortBy" className="text-sm font-medium text-gray-700 mb-2 block">Sorteren op</Label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
              <SelectTrigger className="input-field">
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
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Categorie</Label>
              <Select value={filters.section} onValueChange={(value) => updateFilters({ section: value })}>
                <SelectTrigger className="input-field">
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
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Dieetvoorkeuren</Label>
              <div className="grid grid-cols-1 gap-3">
                {DIET_TAGS.map(tag => (
                  <div key={tag} className="flex items-center space-x-3">
                    <Checkbox
                      id={tag}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                      className="border-gray-300"
                    />
                    <Label
                      htmlFor={tag}
                      className="text-sm text-gray-700 capitalize cursor-pointer"
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
        {activeFiltersCount > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {filters.city !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                  {filters.city}
                  <button
                    onClick={() => updateFilters({ city: 'all' })}
                    className="ml-2 hover:text-primary-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.maxPrice && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-success/10 text-success border border-success/20">
                  Max €{filters.maxPrice}
                  <button
                    onClick={() => updateFilters({ maxPrice: null })}
                    className="ml-2 hover:text-success-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.section !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                  {filters.section}
                  <button
                    onClick={() => updateFilters({ section: 'all' })}
                    className="ml-2 hover:text-primary-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200">
                  {tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="ml-2 hover:text-purple-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { SearchFilters }