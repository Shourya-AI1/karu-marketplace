import { describe, it, expect } from 'vitest';
import {
  isMockMode,
  verifyPaymentSignature,
  verifyWebhookSignature,
  generateIdempotencyKey,
} from '@/lib/payments';

describe('payments mock mode (local dev)', () => {
  it('runs in mock mode with the local test key', () => {
    // .env sets RAZORPAY_KEY_ID="rzp_test_local" which triggers mock mode.
    expect(isMockMode).toBe(true);
  });

  it('accepts any signature in mock mode', () => {
    expect(
      verifyPaymentSignature({
        razorpayOrderId: 'order_x',
        razorpayPaymentId: 'pay_y',
        signature: 'whatever',
      })
    ).toBe(true);
  });

  it('accepts any webhook signature in mock mode', () => {
    expect(verifyWebhookSignature('{}', 'sig')).toBe(true);
  });
});

describe('generateIdempotencyKey', () => {
  it('produces unique prefixed keys', () => {
    const a = generateIdempotencyKey('order');
    const b = generateIdempotencyKey('order');
    expect(a).not.toBe(b);
    expect(a.startsWith('order')).toBe(true);
  });
});
