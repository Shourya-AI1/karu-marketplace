import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { isStaff } from '@/lib/rbac';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?callbackUrl=/admin');
  if (!isStaff(user.role as any)) redirect('/');
  return <>{children}</>;
}
