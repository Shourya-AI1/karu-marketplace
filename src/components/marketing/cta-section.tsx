import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/magnetic';

export function CtaSection() {
  return (
    <section className="container-wide py-28">
      <Reveal variant="blur">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-graphite-950 px-8 py-24 text-center grain-overlay">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-champagne-500/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-emerald/20 blur-[100px]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-display-lg font-bold text-white text-balance">
              Are you a maker? Your craft deserves a global stage.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-white/60">
              Open your storefront in minutes. Keep more of every sale. Reach buyers who value the handmade.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Magnetic>
                <Link href="/sell">
                  <Button variant="gold" size="lg" className="group">
                    Start selling
                    <ArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </Magnetic>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
