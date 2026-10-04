import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { isSeller } from '@/lib/rbac';

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/seller');
  if (!isSeller(user.role as any)) redirect('/sell');
  return <>{children}</>;
}
