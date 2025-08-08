import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MenuSwap NL - Ontdek de beste menu\'s in Nederland',
  description: 'Zoek, vergelijk en ontdek duizenden gerechten van restaurants door heel Nederland. Vind precies wat je zoekt voor elke gelegenheid en elk budget.',
  keywords: 'restaurant, menu, eten, Nederland, gerechten, prijzen, reviews',
  openGraph: {
    title: 'MenuSwap NL - Ontdek de beste menu\'s in Nederland',
    description: 'Zoek, vergelijk en ontdek duizenden gerechten van restaurants door heel Nederland.',
    type: 'website',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenuSwap NL - Ontdek de beste menu\'s in Nederland',
    description: 'Zoek, vergelijk en ontdek duizenden gerechten van restaurants door heel Nederland.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'MenuSwap NL',
              url: 'https://menuswap.nl',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://menuswap.nl/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}