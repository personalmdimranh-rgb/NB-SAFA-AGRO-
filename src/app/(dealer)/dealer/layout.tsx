import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Dealer from '@/models/Dealer';
import Link from 'next/link';
import { Home, ShoppingBag, Receipt, Coins, LogOut, ShieldAlert } from 'lucide-react';
import { UserSidebarFooter } from '@/components/layout/UserNav';
import { Logo } from '@/components/ui/logo';

export default async function DealerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'dealer') {
    redirect('/login');
  }

  await connectToDatabase();
  const dbUser = await User.findById((session.user as any).id);
  if (!dbUser || dbUser.status !== 'active') {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-md w-full text-center bg-white p-6 rounded-xl border border-rose-200 shadow-sm space-y-4">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-rose-950">Dealer Account Inactive</h2>
          <p className="text-sm text-muted-foreground">Your dealer account is registered but pending administrative approval. Please contact support.</p>
          <div className="flex justify-center">
            <Link href="/" className="text-xs font-semibold text-primary hover:underline">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const dealerProfile = await Dealer.findOne({ userId: dbUser._id });

  return (
    <div className="min-h-screen md:h-screen bg-zinc-50/50 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
      {/* Dealer Sidebar */}
      <aside className="w-full md:w-64 md:h-full bg-primary text-primary-foreground flex flex-col justify-between shrink-0 p-4 md:overflow-y-auto">
        <div className="space-y-6">
          <div className="p-2 border-b border-primary-foreground/20 space-y-3">
            <Logo 
              textClassName="text-white text-base md:text-lg font-black tracking-tighter group-hover:text-white font-logo whitespace-nowrap" 
              imageClassName="size-8 md:size-8"
              className="text-white"
            />
            <div>
              <p className="text-[10px] text-primary-foreground/70 font-semibold uppercase">Dealer Portal</p>
              <p className="text-xs text-primary-foreground/90 font-bold truncate mt-1">{dealerProfile?.shopName || dbUser.name}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link href="/dealer/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-foreground/10 transition-colors">
              <Home className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/dealer/order-new" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-foreground/10 transition-colors">
              <ShoppingBag className="h-4 w-4" /> Place Order
            </Link>
            <Link href="/dealer/invoices" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-foreground/10 transition-colors">
              <Receipt className="h-4 w-4" /> My Invoices
            </Link>
            <Link href="/dealer/commission" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-foreground/10 transition-colors">
              <Coins className="h-4 w-4" /> Commission Wallet
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-primary-foreground/20">
          <UserSidebarFooter user={{ name: dbUser.name, image: dbUser.image }} />
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 md:h-full md:overflow-y-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
