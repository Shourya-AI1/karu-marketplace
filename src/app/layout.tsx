import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { SmoothScroll } from '@/components/motion/smooth-scroll';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AudioController } from '@/components/audio/audio-controller';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '900'],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Karu — Handcrafted Treasures from India',
    template: '%s · Karu',
  },
  description:
    'A premium marketplace for India’s finest artisans. Discover handcrafted pottery, textiles, jewellery, and more — every piece tells a story.',
  keywords: ['artisan', 'handmade', 'marketplace', 'India', 'craft', 'pottery', 'textiles', 'jewellery'],
  authors: [{ name: 'Karu' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: APP_URL,
    siteName: 'Karu',
    title: 'Karu — Handcrafted Treasures from India',
    description: 'A premium marketplace for India’s finest artisans.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Karu Marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karu — Handcrafted Treasures from India',
    description: 'A premium marketplace for India’s finest artisans.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: APP_URL },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfbf6' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0c0d' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Providers>
          <SmoothScroll>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </SmoothScroll>
          <AudioController />
        </Providers>
      </body>
    </html>
  );
}
