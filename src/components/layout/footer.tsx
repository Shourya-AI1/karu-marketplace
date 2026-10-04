import Link from 'next/link';
import { Instagram, Twitter, Youtube } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Discover', href: '/discover' },
      { label: 'Artisans', href: '/stores' },
      { label: 'Collections', href: '/campaigns/diwali' },
      { label: 'Gift Cards', href: '/discover' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Start Selling', href: '/sell' },
      { label: 'Seller Studio', href: '/seller' },
      { label: 'Pricing', href: '/sell' },
      { label: 'Resources', href: '/sell' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Trust & Safety', href: '/about' },
      { label: 'Careers', href: '/about' },
      { label: 'Press', href: '/about' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/support' },
      { label: 'Track Order', href: '/account/orders' },
      { label: 'Returns', href: '/support' },
      { label: 'Contact', href: '/support' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-border/60 bg-secondary/30">
      <div className="grain-overlay" />
      <div className="container-wide relative py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-1">
              <span className="font-display text-3xl font-bold tracking-tight">Karu</span>
              <span className="text-champagne-500">·</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A marketplace where every object carries a story and every purchase
              supports a maker. Handcrafted in India, treasured everywhere.
            </p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 transition-colors hover:border-champagne-400/60 hover:text-champagne-500"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-medium text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Karu Marketplace. Crafted with care in Bengaluru.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-foreground">Privacy</Link>
            <Link href="/about" className="hover:text-foreground">Terms</Link>
            <span className="gold-text font-medium">UPI · Cards · Net Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
