import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { DashboardShell } from '@/components/dashboard/shell';
import { ProductForm } from '@/components/dashboard/product-form';
import { SELLER_NAV } from '@/app/seller/page';

export const metadata: Metadata = { title: 'New Product · Seller Studio' };

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/seller/products/new');
  const store = await db.store.findUnique({ where: { ownerId: user.id } });
  if (!store) redirect('/sell');

  const categories = await db.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });

  return (
    <DashboardShell
      title="Add a new product"
      subtitle="Craft a listing that tells your story. Use AI assist to polish copy."
      nav={SELLER_NAV}
    >
      <ProductForm categories={categories} />
    </DashboardShell>
  );
}
