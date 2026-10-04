/**
 * Email layer — Resend with graceful fallback.
 * When RESEND_API_KEY is unset, emails are logged (dev-safe) and
 * recorded as "delivered" so flows complete end-to-end without a key.
 * Transactional sends are idempotent via an in-memory dedupe set.
 */
import { Resend } from 'resend';
import { cache } from './redis';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? 'Karu <hello@karu.market>';
const resend = apiKey ? new Resend(apiKey) : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  /** Idempotency key prevents duplicate sends (e.g. on webhook retries). */
  idempotencyKey?: string;
  category?: 'transactional' | 'promotional';
}

export async function sendEmail(opts: SendEmailOptions): Promise<{
  ok: boolean;
  id?: string;
  skipped?: boolean;
}> {
  if (opts.idempotencyKey) {
    const seen = await cache.get(`email:${opts.idempotencyKey}`);
    if (seen) return { ok: true, id: seen, skipped: true };
  }

  if (!resend) {
    // Dev fallback — log instead of failing.
    console.log(
      `[email:fallback] → ${opts.to} | ${opts.subject} (${opts.category ?? 'transactional'})`
    );
    if (opts.idempotencyKey)
      await cache.set(`email:${opts.idempotencyKey}`, 'fallback', 86400);
    return { ok: true, skipped: true };
  }

  try {
    const result = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    const id = result.data?.id;
    if (opts.idempotencyKey && id)
      await cache.set(`email:${opts.idempotencyKey}`, id, 86400);
    return { ok: true, id };
  } catch (err) {
    console.error('[email:error]', err);
    return { ok: false };
  }
}
