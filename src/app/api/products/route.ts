import { NextRequest, NextResponse } from 'next/server';
import { listProducts } from '@/server/services/products';
import { rateLimit } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';
  const { success } = await rateLimit(`products:${ip}`, 120, 60);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const sp = req.nextUrl.searchParams;
  const result = await listProducts({
    q: sp.get('q') ?? undefined,
    category: sp.get('category') ?? undefined,
    minPrice: sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined,
    maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
    sort: (sp.get('sort') as any) ?? 'relevance',
    page: sp.get('page') ? Number(sp.get('page')) : 1,
  });

  return NextResponse.json(result);
}
