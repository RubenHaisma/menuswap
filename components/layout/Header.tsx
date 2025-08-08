'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, User, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MenuSwap NL</span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Zoek restaurant, gerecht, of stad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/restaurants" className="text-gray-700 hover:text-orange-600 font-medium">
              Restaurants
            </Link>
            <Link href="/dishes" className="text-gray-700 hover:text-orange-600 font-medium">
              Gerechten
            </Link>
            <Link href="/cities" className="text-gray-700 hover:text-orange-600 font-medium">
              Steden
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/favorites">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Uitloggen
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Inloggen</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    Registreren
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden py-3 border-t">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Zoek restaurant, gerecht, of stad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <Link
              href="/restaurants"
              className="block py-2 text-gray-700 hover:text-orange-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Restaurants
            </Link>
            <Link
              href="/dishes"
              className="block py-2 text-gray-700 hover:text-orange-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Gerechten
            </Link>
            <Link
              href="/cities"
              className="block py-2 text-gray-700 hover:text-orange-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Steden
            </Link>
            
            <div className="border-t pt-2">
              {user ? (
                <>
                  <Link
                    href="/favorites"
                    className="block py-2 text-gray-700 hover:text-orange-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Favorieten
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-gray-700 hover:text-orange-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block py-2 text-gray-700 hover:text-orange-600 font-medium w-full text-left"
                  >
                    Uitloggen
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block py-2 text-gray-700 hover:text-orange-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inloggen
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block py-2 text-orange-600 hover:text-orange-700 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registreren
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}