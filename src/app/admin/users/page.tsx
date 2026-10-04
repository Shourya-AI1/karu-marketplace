import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { formatDate, initials } from '@/lib/utils';
import { DashboardShell, DataTable } from '@/components/dashboard/shell';
import { ADMIN_NAV } from '@/app/admin/page';
import { SuspendUserButton } from '@/components/dashboard/admin-actions';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const metadata: Metadata = { title: 'Users · Admin' };

export default async function AdminUsers() {
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { _count: { select: { orders: true } } },
  });

  return (
    <DashboardShell title="Users" subtitle={`${users.length} most recent accounts`} nav={ADMIN_NAV}>
      <DataTable
        columns={['User', 'Role', 'Status', 'Orders', 'Joined', 'Action']}
        empty={users.length === 0}
      >
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-secondary/40">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  {u.image && <AvatarImage src={u.image} alt="" />}
                  <AvatarFallback className="text-xs">{initials(u.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{u.name ?? 'Unnamed'}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
              <Badge variant="secondary">{u.role}</Badge>
            </td>
            <td className="px-5 py-4">
              <Badge variant={u.status === 'ACTIVE' ? 'default' : 'destructive'}>{u.status}</Badge>
            </td>
            <td className="px-5 py-4">{u._count.orders}</td>
            <td className="px-5 py-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
            <td className="px-5 py-4">
              {u.status === 'ACTIVE' && u.role !== 'SUPER_ADMIN' && <SuspendUserButton userId={u.id} />}
            </td>
          </tr>
        ))}
      </DataTable>
    </DashboardShell>
  );
}
