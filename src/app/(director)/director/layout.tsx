import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Link from 'next/link';
import { Home, User as UserIcon, Settings, Coins, LogOut, Shield } from 'lucide-react';
import { SignOutButton } from '@/components/layout/UserNav';

export default async function DirectorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'director') {
    redirect('/login');
  }

  await connectToDatabase();
  const dbUser = await User.findById((session.user as any).id);
  if (!dbUser || dbUser.status !== 'active') {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-md w-full text-center bg-white p-6 rounded-xl border border-rose-200 shadow-sm space-y-4">
          <Shield className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-rose-950">Director Account Inactive</h2>
          <p className="text-sm text-muted-foreground">Your director account is registered but pending administrative approval. Please contact support.</p>
          <div className="flex justify-center">
            <Link href="/" className="text-xs font-semibold text-primary hover:underline">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col md:flex-row animate-in fade-in duration-300">
      {/* Director Sidebar */}
      <aside className="w-full md:w-64 bg-primary text-primary-foreground flex flex-col justify-between shrink-0 p-4">
        <div className="space-y-6">
          <div className="p-2 border-b border-primary-foreground/20">
            <h2 className="text-lg font-black tracking-wider text-white">SHAFA AGRO</h2>
            <p className="text-[10px] text-primary-foreground/70 font-semibold uppercase">Director Portal</p>
            <p className="text-xs text-primary-foreground/90 font-bold truncate mt-2">{dbUser.name}</p>
          </div>

          <nav className="space-y-1">
            <Link href="/director/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-foreground/10 transition-colors">
              <Home className="h-4 w-4" /> My Dashboard
            </Link>
            <Link href="/director/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-foreground/10 transition-colors">
              <UserIcon className="h-4 w-4" /> Profile Info
            </Link>
            <Link href="/director/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-foreground/10 transition-colors">
              <Settings className="h-4 w-4" /> Account Settings
            </Link>
            <Link href="/admin/director" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-foreground/10 transition-colors">
              <Shield className="h-4 w-4" /> Director Board
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-primary-foreground/20">
          <div className="flex items-center justify-between text-xs p-2">
            <span className="text-primary-foreground/70">Logged as {dbUser.name}</span>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto dashboard-main">
        {children}
      </main>
    </div>
  );
}
