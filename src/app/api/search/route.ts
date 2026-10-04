import { NextRequest, NextResponse } from 'next/server';
import { semanticSearch, autosuggest, getTrendingSearches } from '@/server/services/search';
import { rateLimit } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';
  const { success } = await rateLimit(`search:${ip}`, 90, 60);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const sp = req.nextUrl.searchParams;
  const q = sp.get('q')?.trim() ?? '';
  const mode = sp.get('mode') ?? 'full';

  if (mode === 'suggest') {
    const [suggestions, trending] = await Promise.all([autosuggest(q), getTrendingSearches()]);
    return NextResponse.json({ suggestions, trending });
  }

  if (!q) return NextResponse.json({ items: [], total: 0 });
  const result = await semanticSearch(q, { page: sp.get('page') ? Number(sp.get('page')) : 1 });
  return NextResponse.json(result);
}
