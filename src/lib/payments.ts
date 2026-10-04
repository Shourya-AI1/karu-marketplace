/**
 * Razorpay payments layer with production-safe semantics.
 * - Creates orders, verifies signatures (HMAC-SHA256), handles refunds.
 * - When live keys are absent, runs in MOCK mode so the full checkout
 *   flow remains testable end-to-end locally.
 */
import crypto from 'node:crypto';

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? '';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';

export const isMockMode =
  !KEY_ID || KEY_ID.includes('local') || KEY_ID === 'rzp_test_local';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  mock?: boolean;
}

const API = 'https://api.razorpay.com/v1';

function authHeader(): string {
  return 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
}

export async function createRazorpayOrder(
  amount: number,
  currency = 'INR',
  receipt?: string
): Promise<RazorpayOrder> {
  if (isMockMode) {
    return {
      id: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
      amount,
      currency,
      status: 'created',
      mock: true,
    };
  }
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, currency, receipt, payment_capture: 1 }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed: ${res.status}`);
  return (await res.json()) as RazorpayOrder;
}

/** Verify the client-side payment signature returned by Checkout. */
export function verifyPaymentSignature(p: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  if (isMockMode) return true;
  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${p.razorpayOrderId}|${p.razorpayPaymentId}`)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(p.signature)
  );
}

/** Verify an inbound webhook signature. */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  if (isMockMode) return true;
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

export async function createRefund(
  paymentId: string,
  amount?: number
): Promise<{ id: string; status: string; mock?: boolean }> {
  if (isMockMode) {
    return {
      id: `rfnd_mock_${crypto.randomBytes(6).toString('hex')}`,
      status: 'processed',
      mock: true,
    };
  }
  const res = await fetch(`${API}/payments/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(amount ? { amount } : {}),
  });
  if (!res.ok) throw new Error(`Razorpay refund failed: ${res.status}`);
  return (await res.json()) as { id: string; status: string };
}

export function generateIdempotencyKey(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}
