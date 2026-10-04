'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/magnetic';
import { EASING } from '@/lib/motion';

const HeroScene = dynamic(() => import('@/components/three/hero-scene').then((m) => m.HeroScene), {
  ssr: false,
});

const lines = [
  { text: 'The Art of India.', gold: false },
  { text: 'The Soul of the World.', gold: true },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden grain-overlay">
      {/* Cinematic photographic backdrop (brand-crafted, local) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-potter.jpg"
          alt="An artisan shaping clay on a potter's wheel"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Darkening gradients for text legibility + cinematic mood */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />
      </div>

      {/* Atmospheric glow layers */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-radial-glow" />
      <div className="pointer-events-none absolute -left-40 top-1/3 z-[1] h-[40rem] w-[40rem] rounded-full bg-champagne-500/10 blur-[120px]" />

      {/* Subtle 3D particle layer on top of the photo */}
      <div className="pointer-events-none absolute inset-0 z-[2] opacity-60">
        <HeroScene />
      </div>

      <div className="container-wide relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASING.signature }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-1.5 text-sm backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-champagne-500" />
            <span className="text-muted-foreground">India-first · 2,400+ verified artisans</span>
          </motion.div>

          <h1 className="font-display text-display-xl font-bold leading-[1.02]">
            {lines.map((line, i) => (
              <motion.span
                key={line.text}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.15 + i * 0.18, ease: EASING.signature }}
                className="block"
              >
                {line.gold ? <span className="gold-text">{line.text}</span> : line.text}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground text-balance"
          >
            Premium handmade products crafted by artisans. Made with passion,
            delivered with pride — every object carries a story worth keeping.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.7, ease: EASING.signature }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <Link href="/discover">
                <Button variant="gold" size="lg" className="group">
                  Explore the collection
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </Magnetic>
            <Link href="/sell">
              <Button variant="outline" size="lg">
                Sell your craft
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-12 flex items-center gap-8 text-sm text-muted-foreground"
          >
            <Stat value="2.4k+" label="Artisans" />
            <div className="h-8 w-px bg-border" />
            <Stat value="48k+" label="Pieces sold" />
            <div className="h-8 w-px bg-border" />
            <Stat value="4.9★" label="Avg rating" />
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-border/70 p-1.5"
        >
          <div className="h-2 w-1 rounded-full bg-champagne-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-xl font-semibold text-foreground">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}
