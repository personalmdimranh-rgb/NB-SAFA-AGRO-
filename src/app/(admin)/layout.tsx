import { AppSidebar } from '@/components/layout/AppSidebar';
import AdminTopbar from '@/components/layout/AdminTopbar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  const isAdmin = (session.user as any).isAdmin === true;
  const allowedRoles = ['super_admin', 'admin', 'manager', 'staff'];
  if (!allowedRoles.includes(role) && !isAdmin) {
    redirect('/');
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AdminTopbar />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 dashboard-main">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

