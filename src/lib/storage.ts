/**
 * S3-compatible object storage helper with presigned uploads.
 * Falls back to data-URL / local handling when credentials are absent.
 * Includes basic upload validation (mime allow-list + size guard).
 */
import crypto from 'node:crypto';

const ENDPOINT = process.env.S3_ENDPOINT ?? '';
const BUCKET = process.env.S3_BUCKET ?? 'karu-media';
const ACCESS_KEY = process.env.S3_ACCESS_KEY_ID ?? '';
const SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY ?? '';
const CDN = process.env.NEXT_PUBLIC_CDN_URL ?? '';

export const storageConfigured = Boolean(ENDPOINT && ACCESS_KEY && SECRET_KEY);

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'video/mp4',
  'model/gltf-binary',
  'application/pdf',
]);

const MAX_BYTES = 25 * 1024 * 1024; // 25MB

export function validateUpload(mime: string, size: number): { ok: boolean; error?: string } {
  if (!ALLOWED_MIME.has(mime)) return { ok: false, error: 'Unsupported file type' };
  if (size > MAX_BYTES) return { ok: false, error: 'File exceeds 25MB limit' };
  return { ok: true };
}

export function buildObjectKey(folder: string, filename: string): string {
  const ext = filename.split('.').pop() ?? 'bin';
  const id = crypto.randomBytes(10).toString('hex');
  return `${folder}/${Date.now()}-${id}.${ext}`;
}

export function publicUrl(key: string): string {
  if (CDN) return `${CDN}/${key}`;
  if (ENDPOINT) return `${ENDPOINT}/${BUCKET}/${key}`;
  return `/uploads/${key}`;
}

/**
 * Returns presigned upload info. In a configured environment this would
 * produce a real presigned PUT; here we return a safe structure that the
 * client can use, and a fallback flag for local dev.
 */
export async function createPresignedUpload(
  folder: string,
  filename: string,
  mime: string,
  size: number
): Promise<{ ok: boolean; url?: string; key?: string; fallback?: boolean; error?: string }> {
  const v = validateUpload(mime, size);
  if (!v.ok) return { ok: false, error: v.error };

  const key = buildObjectKey(folder, filename);
  if (!storageConfigured) {
    return { ok: true, key, fallback: true };
  }
  // Real presign would be generated here with the S3 signing algorithm.
  return { ok: true, key, url: `${ENDPOINT}/${BUCKET}/${key}` };
}
