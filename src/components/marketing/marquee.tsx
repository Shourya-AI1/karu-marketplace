const ITEMS = [
  'Blue Pottery', 'Banarasi Silk', 'Temple Jewellery', 'Terracotta',
  'Kantha Embroidery', 'Brass Diyas', 'Marble Inlay', 'Sheesham Woodcraft',
  'Block Print', 'Handloom Weaves',
];

export function CraftMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-border/60 py-6">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-12 font-display text-2xl text-muted-foreground">
            {item}
            <span className="text-champagne-500">✦</span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
