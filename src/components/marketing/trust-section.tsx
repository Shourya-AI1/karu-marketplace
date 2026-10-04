import { ShieldCheck, Truck, RotateCcw, HeartHandshake } from 'lucide-react';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/reveal';

const PILLARS = [
  { icon: ShieldCheck, title: 'Verified Artisans', body: 'Every seller is KYC-verified. You always know who made your piece.' },
  { icon: Truck, title: 'Tracked Delivery', body: 'Real-time tracking from the maker’s hands to your doorstep.' },
  { icon: RotateCcw, title: 'Easy Returns', body: '7-day hassle-free returns, with refunds processed in 3–5 days.' },
  { icon: HeartHandshake, title: 'Fair to Makers', body: 'Artisans keep more of every sale. Craft that sustains livelihoods.' },
];

export function TrustSection() {
  return (
    <section className="border-y border-border/60 bg-secondary/30">
      <div className="container-wide py-24">
        <Reveal className="mx-auto mb-16 max-w-xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-champagne-500">
            Buy with confidence
          </p>
          <h2 className="text-display-lg font-bold text-balance">
            Trust, woven into every transaction.
          </h2>
        </Reveal>
        <StaggerGroup className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <StaggerItem key={p.title}>
              <div className="group h-full rounded-2xl border border-border/60 bg-card p-7 lift">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-champagne-500/10 text-champagne-500 transition-colors group-hover:bg-champagne-500 group-hover:text-graphite-950">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
