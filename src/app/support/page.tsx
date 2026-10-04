import type { Metadata } from 'next';
import { Mail, MessageCircle, FileText } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { SupportChat } from '@/components/support/support-chat';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with orders, payments, refunds and selling on Karu.',
};

const faqs = [
  {
    q: 'How long does shipping take?',
    a: 'Most handcrafted pieces ship within 3–5 business days. Made-to-order items show their lead time on the product page.',
  },
  {
    q: 'What is your refund policy?',
    a: 'You can request a refund within 7 days of delivery for eligible items. Refunds are processed to your original payment method within 5–7 business days.',
  },
  {
    q: 'Are payments secure?',
    a: 'Yes. All payments are processed via Razorpay with bank-grade encryption and signature verification. We never store your card details.',
  },
  {
    q: 'How do I become a seller?',
    a: 'Visit the Sell page, create your store, complete KYC verification, and start listing. Our team reviews new stores within 48 hours.',
  },
];

export default function SupportPage() {
  return (
    <div className="container-wide pt-32 pb-24">
      <Reveal className="mb-12 max-w-2xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-champagne-500">
          We're here to help
        </p>
        <h1 className="text-display-lg font-bold">Support center</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Chat with our AI assistant for instant answers, or reach our human team anytime.
        </p>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <SupportChat />

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <h2 className="mb-4 font-display font-semibold">Other ways to reach us</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-champagne-500" />
                <a href="mailto:care@karu.market" className="hover:underline">
                  care@karu.market
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-champagne-500" />
                <span className="text-muted-foreground">Live chat · 9am–9pm IST</span>
              </li>
              <li className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-champagne-500" />
                <span className="text-muted-foreground">Help articles & guides</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="mt-20">
        <h2 className="mb-8 font-display text-2xl font-semibold">Frequently asked</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border border-border/60 bg-card p-6">
              <h3 className="mb-2 font-medium">{f.q}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
