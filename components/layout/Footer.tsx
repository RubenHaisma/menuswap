import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <span className="text-xl font-bold">MenuSwap NL</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Ontdek en vergelijk menu's van restaurants door heel Nederland. 
              Vind de beste gerechten, vergelijk prijzen en ontdek nieuwe favorieten.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                Instagram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Verkennen</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/restaurants" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/dishes" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Gerechten
                </Link>
              </li>
              <li>
                <Link href="/cities" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Steden
                </Link>
              </li>
              <li>
                <Link href="/best" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Beste Gerechten
                </Link>
              </li>
            </ul>
          </div>

          {/* For Restaurants */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Voor Restaurants</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/restaurant/add" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Restaurant Toevoegen
                </Link>
              </li>
              <li>
                <Link href="/menu/upload" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Menu Uploaden
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Hulp
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 MenuSwap NL. Alle rechten voorbehouden.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
              Privacybeleid
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
              Algemene Voorwaarden
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-orange-400 text-sm transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}