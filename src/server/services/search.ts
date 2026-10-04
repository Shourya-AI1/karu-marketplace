import { db } from '@/lib/db';
import { cached } from '@/lib/redis';
import { listProducts } from './products';
import { track } from './audit';

/** Levenshtein distance for typo tolerance. */
function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return dp[m][n];
}

export async function semanticSearch(query: string, opts: { page?: number } = {}) {
  await track('search', { metadata: { query } });

  let result = await listProducts({ q: query, page: opts.page, sort: 'relevance' });

  // Typo-tolerance fallback: if no results, find nearest token.
  if (result.total === 0 && query.length > 3) {
    const corrected = await suggestCorrection(query);
    if (corrected && corrected !== query) {
      result = await listProducts({ q: corrected, page: opts.page, sort: 'relevance' });
      return { ...result, corrected };
    }
  }
  return result;
}

export async function autosuggest(prefix: string, limit = 6): Promise<string[]> {
  if (prefix.length < 2) return getTrendingSearches();
  const products = await db.product.findMany({
    where: {
      status: 'ACTIVE',
      OR: [{ title: { contains: prefix } }, { tags: { contains: prefix.toLowerCase() } }],
    },
    select: { title: true },
    take: limit,
  });
  return products.map((p) => p.title);
}

async function suggestCorrection(query: string): Promise<string | null> {
  const vocab = await cached('search:vocab', 300, async () => {
    const products = await db.product.findMany({ select: { title: true, tags: true }, take: 500 });
    const words = new Set<string>();
    for (const p of products) {
      p.title.toLowerCase().split(/\s+/).forEach((w) => w.length > 2 && words.add(w));
      p.tags.split(',').forEach((t) => t.trim() && words.add(t.trim()));
    }
    return [...words];
  });
  const q = query.toLowerCase();
  let best: { word: string; dist: number } | null = null;
  for (const word of vocab) {
    const d = editDistance(q, word);
    if (d <= 2 && (!best || d < best.dist)) best = { word, dist: d };
  }
  return best?.word ?? null;
}

export async function getTrendingSearches(): Promise<string[]> {
  return cached('search:trending', 120, async () => {
    const events = await db.analyticsEvent.findMany({
      where: { type: 'search' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const counts = new Map<string, number>();
    for (const e of events) {
      try {
        const q = JSON.parse(e.metadata ?? '{}').query as string;
        if (q) counts.set(q.toLowerCase(), (counts.get(q.toLowerCase()) ?? 0) + 1);
      } catch {}
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([q]) => q);
    return top.length
      ? top
      : ['handwoven scarf', 'brass diya', 'blue pottery', 'wooden toys', 'silk saree', 'terracotta'];
  });
}

export async function getFacets() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
  });
  return { categories };
}
