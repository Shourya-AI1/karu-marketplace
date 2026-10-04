import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  slugify,
  truncate,
  parseTags,
  initials,
  clamp,
  absoluteUrl,
} from '@/lib/utils';

describe('formatPrice', () => {
  it('converts paise to rupees with currency symbol', () => {
    const out = formatPrice(149900);
    expect(out).toContain('1,499');
    expect(out).toMatch(/₹|INR/);
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toMatch(/0/);
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Hand Thrown Bowl')).toBe('hand-thrown-bowl');
  });
  it('strips special characters', () => {
    expect(slugify('Mitti & Co.!')).toBe('mitti-co');
  });
});

describe('truncate', () => {
  it('truncates long strings with ellipsis', () => {
    expect(truncate('abcdefgh', 4)).toBe('abcd…');
  });
  it('leaves short strings intact', () => {
    expect(truncate('abc', 10)).toBe('abc');
  });
});

describe('parseTags', () => {
  it('splits and trims', () => {
    expect(parseTags('a, b ,c')).toEqual(['a', 'b', 'c']);
  });
  it('returns empty array for null', () => {
    expect(parseTags(null)).toEqual([]);
  });
});

describe('initials', () => {
  it('returns up to two uppercase initials', () => {
    expect(initials('Meera Devi')).toBe('MD');
  });
  it('falls back to K when empty', () => {
    expect(initials(null)).toBe('K');
  });
});

describe('clamp', () => {
  it('clamps within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe('absoluteUrl', () => {
  it('prefixes a base URL', () => {
    expect(absoluteUrl('/discover')).toMatch(/\/discover$/);
  });
});
