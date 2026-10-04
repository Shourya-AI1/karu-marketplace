import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Leaf, Globe, Users } from 'lucide-react';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Karu',
  description: 'Karu is a premium marketplace championing India\'s artisans and small businesses.',
};

const values = [
  { icon: Heart, title: 'Craft first', body: 'We celebrate the human hand. Every piece carries the maker\'s story, technique and heritage.' },
  { icon: Users, title: 'Fair to makers', body: 'Low fees, fast payouts and tools that help artisans build sustainable businesses.' },
  { icon: Leaf, title: 'Made to last', body: 'We favour durable, thoughtfully made goods over disposable mass production.' },
  { icon: Globe, title: 'India to the world', body: 'We bring India\'s extraordinary craft traditions to a global, discerning audience.' },
];

const stats = [
  { value: '12,000+', label: 'verified artisans' },
  { value: '28', label: 'states & UTs' },
  { value: '180+', label: 'craft traditions' },
  { value: '4.9★', label: 'avg. buyer rating' },
];

export default function AboutPage() {
  return (
    <div className="pt-32">
      <section className="container-wide">
        <Reveal className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-champagne-500">
            Our story
          </p>
          <h1 className="text-display-xl font-bold leading-[1.05]">
            Where craft meets <span className="gold-text">commerce</span>.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Karu began with a simple belief: the people who make beautiful things by hand
            deserve a beautiful place to sell them. We're building a marketplace that honours
            the maker, delights the buyer, and keeps India's craft traditions alive and thriving.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 rounded-3xl border border-border/60 bg-card p-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl font-bold gold-text">{s.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-wide mt-24">
        <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <StaggerItem key={v.title}>
              <div className="h-full rounded-2xl border border-border/60 bg-card p-8 lift">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-champagne-500/10 text-champagne-500">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="container-wide my-24">
        <Reveal className="flex flex-col items-center rounded-3xl border border-champagne-400/20 bg-gradient-to-br from-champagne-500/5 to-transparent p-14 text-center">
          <h2 className="text-display-md font-bold">Join the movement</h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Whether you make or you buy, you're part of keeping craft alive.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/discover">
              <Button size="lg">Explore the collection</Button>
            </Link>
            <Link href="/sell">
              <Button size="lg" variant="outline">
                Become a seller
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
