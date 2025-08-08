import { Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container-content">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">MenuSwap</span>
              </div>
              <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
                Ontdek en vergelijk menu's van restaurants door heel Nederland. 
                Vind de beste gerechten, vergelijk prijzen en ontdek nieuwe favorieten.
              </p>
              
              {/* Newsletter */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Blijf op de hoogte</h4>
                <div className="flex space-x-2 max-w-sm">
                  <input
                    type="email"
                    placeholder="Je e-mailadres"
                    className="input-field"
                  />
                  <Button className="btn-primary">
                    <Mail className="h-4 w-4 mr-2" />
                    Inschrijven
                  </Button>
                </div>
              </div>
            </div>

            {/* Navigatie */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Navigatie</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                </li>
                <li>
                  <Link href="/search" className="hover:text-primary transition-colors">Zoeken</Link>
                </li>
                <li>
                  <Link href="/restaurants" className="hover:text-primary transition-colors">Restaurants</Link>
                </li>
                <li>
                  <Link href="/over" className="hover:text-primary transition-colors">Over ons</Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                </li>
              </ul>
            </div>

            {/* Voor restaurants */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Voor restaurants</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <Link href="/claim" className="hover:text-primary transition-colors">Claim je restaurant</Link>
                </li>
                <li>
                  <Link href="/toevoegen" className="hover:text-primary transition-colors">Restaurant toevoegen</Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary transition-colors">Prijzen</Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-primary transition-colors">Veelgestelde vragen</Link>
                </li>
              </ul>
            </div>

            {/* Juridisch */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Juridisch</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">Privacybeleid</Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">Gebruiksvoorwaarden</Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-primary transition-colors">Cookiebeleid</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="border-t border-gray-100 pt-8 pb-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} MenuSwap. Alle rechten voorbehouden.
          </div>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Voorwaarden</Link>
            <a href="mailto:info@menuswap.nl" className="hover:text-primary transition-colors">info@menuswap.nl</a>
          </div>
        </div>
      </div>
    </footer>
  );
}