import AdminShell from '@/components/admin/AdminShell';
export const metadata = { title: { absolute: 'Admin' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default function AdminLayout({ children }) { return <AdminShell>{children}</AdminShell>; }
