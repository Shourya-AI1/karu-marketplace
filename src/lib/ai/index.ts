/**
 * AI feature layer. Uses OpenAI when OPENAI_API_KEY is present,
 * otherwise falls back to deterministic local heuristics so every
 * AI feature works (degraded but functional) without external calls.
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY ?? '';
export const aiLive = Boolean(OPENAI_KEY);

async function chat(system: string, user: string, max = 400): Promise<string | null> {
  if (!aiLive) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: max,
        temperature: 0.7,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

// ── Product description generator ─────────────────────────────
export async function generateDescription(input: {
  title: string;
  materials?: string;
  craftType?: string;
}): Promise<string> {
  const live = await chat(
    'You are a luxury artisan-marketplace copywriter. Write evocative, trustworthy product descriptions.',
    `Write a 2-sentence premium product description for "${input.title}", crafted from ${input.materials ?? 'fine materials'}${input.craftType ? `, a ${input.craftType} craft` : ''}.`
  );
  if (live) return live;
  return `Each ${input.title} is handcrafted from ${input.materials ?? 'carefully chosen materials'}, carrying the quiet mark of the maker's hand. A piece designed to be lived with, not merely owned — slow-made for those who notice the difference.`;
}

// ── Title optimizer ───────────────────────────────────────────
export async function optimizeTitle(title: string): Promise<string> {
  const live = await chat(
    'You optimize marketplace product titles for clarity and search. Keep under 70 chars.',
    `Improve this title: "${title}"`
  );
  if (live) return live;
  const cleaned = title.replace(/\s+/g, ' ').trim();
  return cleaned.length > 70 ? cleaned.slice(0, 67) + '…' : cleaned;
}

// ── Auto tagging ──────────────────────────────────────────────
const TAG_DICTIONARY = [
  'handmade', 'artisan', 'sustainable', 'eco-friendly', 'gift', 'wedding',
  'diwali', 'festive', 'minimal', 'traditional', 'modern', 'luxury',
  'home-decor', 'jewellery', 'textile', 'pottery', 'wood', 'brass',
  'silk', 'cotton', 'organic', 'limited-edition', 'custom',
];
export async function autoTag(input: { title: string; description: string }): Promise<string[]> {
  const live = await chat(
    'Extract 5 lowercase comma-separated product tags.',
    `${input.title}. ${input.description}`,
    60
  );
  if (live) return live.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 8);
  const text = `${input.title} ${input.description}`.toLowerCase();
  const found = TAG_DICTIONARY.filter((t) => text.includes(t.split('-')[0]));
  return (found.length ? found : ['handmade', 'artisan', 'gift']).slice(0, 8);
}

// ── Review summary ────────────────────────────────────────────
export async function summarizeReviews(reviews: string[]): Promise<string> {
  if (reviews.length === 0) return 'No reviews yet — be the first to share your experience.';
  const live = await chat(
    'Summarize customer reviews in 1 balanced sentence.',
    reviews.slice(0, 30).join('\n'),
    120
  );
  if (live) return live;
  const positive = reviews.filter((r) => /love|great|beautiful|excellent|perfect|amazing/i.test(r)).length;
  const ratio = positive / reviews.length;
  if (ratio > 0.7) return `Customers consistently praise the craftsmanship and quality across ${reviews.length} reviews.`;
  if (ratio > 0.4) return `Mostly positive feedback across ${reviews.length} reviews, with appreciation for the handmade detail.`;
  return `Mixed feedback across ${reviews.length} reviews — read on for details.`;
}

// ── Translation ───────────────────────────────────────────────
export async function translate(text: string, target: string): Promise<string> {
  const live = await chat(
    `Translate to ${target}. Return only the translation.`,
    text,
    400
  );
  return live ?? text; // fallback: identity (no destructive change)
}

// ── Campaign suggestions ──────────────────────────────────────
export async function suggestCampaign(theme: string): Promise<{ headline: string; copy: string }> {
  const live = await chat(
    'You are a brand campaign strategist for an artisan marketplace.',
    `Suggest a headline and one-line copy for a "${theme}" seasonal campaign. Format: HEADLINE|COPY`,
    100
  );
  if (live && live.includes('|')) {
    const [headline, copy] = live.split('|');
    return { headline: headline.trim(), copy: copy.trim() };
  }
  const presets: Record<string, { headline: string; copy: string }> = {
    diwali: { headline: 'Light, Made by Hand', copy: 'Illuminate Diwali with treasures crafted in earnest.' },
    holi: { headline: 'Colour, Reimagined', copy: 'A riot of handmade hues for the season of joy.' },
    christmas: { headline: 'Gifts with a Soul', copy: 'Wrap warmth this winter in artisan craft.' },
    wedding: { headline: 'Vows, Honoured in Craft', copy: 'Heirloom-worthy pieces for the day that lasts forever.' },
  };
  return presets[theme.toLowerCase()] ?? { headline: 'Crafted for the Moment', copy: 'Discover pieces made to be remembered.' };
}

// ── Customer support assistant ────────────────────────────────
export async function supportReply(question: string): Promise<string> {
  const live = await chat(
    'You are Karu support. Be warm, concise, and helpful. Karu sells handmade artisan goods, ships across India, accepts UPI/cards, and offers refunds within 7 days.',
    question,
    200
  );
  if (live) return live;
  if (/refund|return/i.test(question))
    return 'We offer hassle-free returns within 7 days of delivery. Head to Account → Orders to start a return, and your refund processes in 3–5 business days.';
  if (/ship|deliver|track/i.test(question))
    return 'Orders ship within the artisan’s lead time (shown on each product) and you’ll get tracking by email. Track anytime under Account → Orders.';
  if (/payment|pay|upi|card/i.test(question))
    return 'We accept UPI, cards, net banking, and wallets via Razorpay — all secured end-to-end.';
  return 'Thanks for reaching out! A member of the Karu team will follow up shortly. For urgent help, reply with your order number.';
}
