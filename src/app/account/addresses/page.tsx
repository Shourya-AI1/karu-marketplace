import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Addresses' };

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/account/addresses');

  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: 'desc' } });

  return (
    <div className="container-wide pt-32">
      <h1 className="mb-10 text-display-lg font-bold">Saved Addresses</h1>
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No saved addresses. Add one during checkout.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{a.fullName}</p>
                {a.isDefault && <Badge variant="gold">Default</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{a.line1}</p>
              {a.line2 && <p className="text-sm text-muted-foreground">{a.line2}</p>}
              <p className="text-sm text-muted-foreground">{a.city}, {a.state} — {a.postalCode}</p>
              <p className="mt-2 text-sm text-muted-foreground">{a.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
