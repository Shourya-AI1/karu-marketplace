import type { Metadata } from 'next';
import { Sparkles, TrendingUp, ShieldCheck, Globe, Wallet, Camera } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { isSeller } from '@/lib/rbac';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/reveal';
import { BecomeSellerForm } from '@/components/marketing/become-seller-form';

export const metadata: Metadata = {
  title: 'Sell on Karu',
  description: 'Turn your craft into a thriving business. Join thousands of verified Indian artisans.',
};

const benefits = [
  { icon: Wallet, title: 'Fair, transparent fees', body: 'Keep more of what you earn with low commissions and fast payouts in INR.' },
  { icon: Globe, title: 'Global reach', body: 'List once and reach buyers across India and the world with built-in localization.' },
  { icon: Sparkles, title: 'AI-powered listings', body: 'Auto-generate descriptions, tags and translations so you can focus on making.' },
  { icon: ShieldCheck, title: 'Verified trust', body: 'Earn a verified badge through KYC and build buyer confidence from day one.' },
  { icon: TrendingUp, title: 'Growth analytics', body: 'Understand what sells with a clean dashboard built for makers, not spreadsheets.' },
  { icon: Camera, title: 'Story-first storefront', body: 'A cinematic storefront that puts your craft and heritage at the center.' },
];

export default async function SellPage() {
  const user = await getCurrentUser();
  const seller = user ? isSeller(user.role as any) : false;

  return (
    <div className="pt-32">
      <section className="container-wide">
        <Reveal className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-champagne-500">
            For makers & studios
          </p>
          <h1 className="text-display-xl font-bold leading-[1.05]">
            Turn your craft into a <span className="gold-text">business</span>.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Karu gives independent artisans and small businesses a premium home to sell,
            tell their story, and grow — with payments, logistics and AI tooling built in.
          </p>
          <div className="mt-10">
            <BecomeSellerForm userId={user?.id ?? null} isSeller={seller} />
          </div>
        </Reveal>
      </section>

      <section className="container-wide mt-24 pb-24">
        <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <StaggerItem key={b.title}>
              <div className="h-full rounded-2xl border border-border/60 bg-card p-8 lift">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-champagne-500/10 text-champagne-500">
                  <b.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </div>
  );
}
