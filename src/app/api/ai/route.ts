import { NextRequest, NextResponse } from 'next/server';
import {
  generateDescription,
  optimizeTitle,
  autoTag,
  summarizeReviews,
  translate,
  suggestCampaign,
  supportReply,
} from '@/lib/ai';
import { rateLimit } from '@/lib/redis';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';
  const { success } = await rateLimit(`ai:${ip}`, 30, 60);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { action, payload } = await req.json();

  // Normalize action aliases so both short and verbose names work.
  const normalized =
    {
      describe: 'describe',
      generateDescription: 'describe',
      title: 'title',
      optimizeTitle: 'title',
      tag: 'tag',
      autoTag: 'tag',
      summarize: 'summarize',
      summarizeReviews: 'summarize',
      translate: 'translate',
      campaign: 'campaign',
      suggestCampaign: 'campaign',
      support: 'support',
      supportReply: 'support',
    }[action as string] ?? action;

  // Support assistant is public; the rest require auth.
  const user = await getCurrentUser();
  if (normalized !== 'support' && !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    switch (normalized) {
      case 'describe':
        return NextResponse.json({ result: await generateDescription(payload) });
      case 'title':
        return NextResponse.json({ result: await optimizeTitle(payload.title) });
      case 'tag':
        return NextResponse.json({ result: await autoTag(payload) });
      case 'summarize':
        return NextResponse.json({ result: await summarizeReviews(payload.reviews ?? []) });
      case 'translate':
        return NextResponse.json({ result: await translate(payload.text, payload.target) });
      case 'campaign':
        return NextResponse.json({ result: await suggestCampaign(payload.theme) });
      case 'support':
        return NextResponse.json({ result: await supportReply(payload.question) });
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (e) {
    console.error('[ai:error]', e);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
