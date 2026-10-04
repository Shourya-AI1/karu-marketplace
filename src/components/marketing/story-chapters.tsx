'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Reveal } from '@/components/motion/reveal';

const CHAPTERS = [
  {
    n: '01',
    title: 'The Maker',
    body: 'Every Karu piece begins with a person — a hand that knows its craft intimately, shaped by years of practice and inherited wisdom.',
    image: '/images/hero-potter.jpg',
  },
  {
    n: '02',
    title: 'The Material',
    body: 'Clay from a riverbed. Silk from a single cocoon. Brass aged to warmth. We honour materials that have stories of their own.',
    image: '/images/silk-scarf.jpg',
  },
  {
    n: '03',
    title: 'The Object',
    body: 'What arrives at your door is not a product. It is the quiet culmination of patience, intention, and care — made to be lived with.',
    image: '/images/ceramic-vase.jpg',
  },
];

export function StoryChapters() {
  return (
    <section className="container-wide py-28">
      <Reveal className="mx-auto mb-20 max-w-2xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-champagne-500">
          The Karu Journey
        </p>
        <h2 className="text-display-lg font-bold text-balance">
          From a single pair of hands to your home.
        </h2>
      </Reveal>

      <div className="space-y-28">
        {CHAPTERS.map((c, i) => (
          <Chapter key={c.n} chapter={c} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

function Chapter({
  chapter,
  flip,
}: {
  chapter: (typeof CHAPTERS)[number];
  flip: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1, 1.12]);

  return (
    <div
      ref={ref}
      className={`grid items-center gap-12 lg:grid-cols-2 ${flip ? 'lg:[direction:rtl]' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl [direction:ltr]">
        <motion.div style={{ y, scale }} className="absolute inset-0">
          <Image src={chapter.image} alt={chapter.title} fill className="object-cover" sizes="50vw" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/40 to-transparent" />
      </div>
      <Reveal className="[direction:ltr]" variant="blur">
        <span className="font-display text-7xl font-bold text-champagne-500/20">{chapter.n}</span>
        <h3 className="mt-2 text-display-lg font-bold">{chapter.title}</h3>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{chapter.body}</p>
      </Reveal>
    </div>
  );
}
