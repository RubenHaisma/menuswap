import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, MapPin, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Pagina niet gevonden - MenuSwap NL',
  description: 'De pagina die u zoekt bestaat niet. Ontdek restaurants en gerechten op MenuSwap NL.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pagina niet gevonden
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              De pagina die u zoekt bestaat niet of is verplaatst. 
              Geen zorgen, we helpen u graag verder!
            </p>
          </div>

          <Card className="p-8 mb-8">
            <CardContent className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Wat kunt u nu doen?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/" className="group">
                  <div className="p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all">
                    <Home className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-medium text-gray-900 mb-1">Terug naar home</h3>
                    <p className="text-sm text-gray-600">Begin opnieuw vanaf de startpagina</p>
                  </div>
                </Link>

                <Link href="/search" className="group">
                  <div className="p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all">
                    <Search className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-medium text-gray-900 mb-1">Zoek gerechten</h3>
                    <p className="text-sm text-gray-600">Vind uw favoriete gerecht</p>
                  </div>
                </Link>

                <Link href="/steden" className="group">
                  <div className="p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-medium text-gray-900 mb-1">Blader per stad</h3>
                    <p className="text-sm text-gray-600">Ontdek restaurants in uw stad</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Link href="/">
              <Button className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar home
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Zoek gerechten
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}