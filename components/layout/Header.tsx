'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm transition-all duration-300 ${
      isScrolled ? 'shadow-sm border-b border-gray-200' : ''
    }`}>
      <div className="container-content">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          isScrolled ? 'h-16' : 'h-20'
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 overflow-hidden">
              <img 
                src="/favicon-192x192.png" 
                alt="MenuSwap Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">MenuSwap</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/restaurants" className="text-gray-700 hover:text-primary font-medium transition-colors relative group">
              Restaurants
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/search" className="text-gray-700 hover:text-primary font-medium transition-colors relative group">
              Zoeken
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/steden" className="text-gray-700 hover:text-primary font-medium transition-colors relative group">
              Steden
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Desktop Search & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Zoek gerechten..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 h-10"
                />
              </div>
            </form>
            <Link href="/search">
              <Button className="btn-primary h-10 shadow-sm hover:shadow-md">
                Uitgebreid zoeken
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden btn-ghost h-10 w-10 p-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200">
          <div className="container-content py-6 space-y-6">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Zoek gerechten..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <Button type="submit" className="w-full btn-primary">
                Zoeken
              </Button>
            </form>

            {/* Mobile Navigation Links */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <Link
                href="/restaurants"
                className="block text-gray-700 hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Restaurants
              </Link>
              <Link
                href="/search"
                className="block text-gray-700 hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Uitgebreid zoeken
              </Link>
              <Link
                href="/steden"
                className="block text-gray-700 hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Steden
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}