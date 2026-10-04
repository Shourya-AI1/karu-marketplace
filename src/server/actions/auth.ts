'use server';

import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signUpSchema } from '@/lib/validators';
import { sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/emails/templates';
import { logAudit } from '@/server/services/audit';

export async function signUpAction(input: { name: string; email: string; password: string }) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { ok: false as const, error: 'An account with this email already exists.' };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: 'BUYER',
    },
  });

  await logAudit({ actorId: user.id, action: 'user.signup', entity: 'User', entityId: user.id });

  const mail = welcomeEmail({ name: user.name ?? 'there' });
  await sendEmail({ to: user.email, ...mail, idempotencyKey: `welcome-${user.id}`, category: 'transactional' });

  return { ok: true as const };
}

export async function becomeSellerAction(userId: string, storeName: string) {
  const slug =
    storeName.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 6);

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { role: 'SELLER' } }),
    db.store.create({
      data: {
        ownerId: userId,
        name: storeName,
        slug,
        status: 'PENDING_REVIEW',
        kycStatus: 'NOT_SUBMITTED',
      },
    }),
  ]);

  await logAudit({ actorId: userId, action: 'store.create', entity: 'Store' });
  return { ok: true as const, slug };
}
