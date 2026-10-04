import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Editorial side panel */}
      <div className="relative hidden overflow-hidden bg-graphite-950 lg:block grain-overlay">
        <div className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-champagne-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald/20 blur-[100px]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-1">
            <span className="font-display text-3xl font-bold tracking-tight text-white">Karu</span>
            <span className="text-champagne-500">·</span>
          </Link>
          <div>
            <blockquote className="font-display text-3xl font-medium leading-snug text-white text-balance">
              “Every object on Karu carries the fingerprint of the person who made it.”
            </blockquote>
            <p className="mt-6 text-white/50">The Karu Promise</p>
          </div>
          <p className="text-sm text-white/40">Handcrafted in India · Treasured everywhere</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 pt-28 lg:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
