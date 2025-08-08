import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MenuSwap NL - Ontdek de beste menu\'s in Nederland',
  description: 'Zoek, vergelijk en ontdek duizenden gerechten van restaurants door heel Nederland. Vind precies wat je zoekt voor elke gelegenheid en elk budget.',
  keywords: 'restaurant, menu, eten, Nederland, gerechten, prijzen, reviews',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/favicon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/favicon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-256x256.png', sizes: '256x256', type: 'image/png' },
      { url: '/favicon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/favicon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
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