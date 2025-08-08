'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm transition-all duration-300 ${
      isScrolled ? 'shadow-sm border-b border-gray-200' : ''
    }`}>
      <div className="container-content">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          isScrolled ? 'h-16' : 'h-20'
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">MenuSwap</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/restaurants" className="text-gray-700 hover:text-primary font-medium transition-colors relative group">
              Restaurants
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/dishes" className="text-gray-700 hover:text-primary font-medium transition-colors relative group">
              Gerechten
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/cities" className="text-gray-700 hover:text-primary font-medium transition-colors relative group">
              Steden
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-primary font-medium transition-colors relative group">
              Hoe het werkt
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Desktop Search & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="btn-ghost h-10">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="btn-ghost h-10">
                  Uitloggen
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="btn-ghost h-10">
                    Inloggen
                  </Button>
                </Link>
                <Link href="/menu/upload">
                  <Button className="btn-primary h-10 shadow-sm hover:shadow-md">
                    Menu toevoegen
                  </Button>
                </Link>
              </div>
            )}
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
            {/* Mobile Navigation Links */}
            <div className="space-y-4">
              <Link
                href="/restaurants"
                className="block text-gray-700 hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Restaurants
              </Link>
              <Link
                href="/dishes"
                className="block text-gray-700 hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Gerechten
              </Link>
              <Link
                href="/cities"
                className="block text-gray-700 hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Steden
              </Link>
              <Link
                href="/how-it-works"
                className="block text-gray-700 hover:text-primary font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Hoe het werkt
              </Link>
            </div>
            
            {/* Mobile Auth */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="outline" className="btn-secondary w-full">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    variant="ghost"
                    className="btn-ghost w-full"
                  >
                    Uitloggen
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="outline" className="btn-secondary w-full">
                      Inloggen
                    </Button>
                  </Link>
                  <Link
                    href="/menu/upload"
                    className="block w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="btn-primary w-full">
                      Menu toevoegen
                    </Button>
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