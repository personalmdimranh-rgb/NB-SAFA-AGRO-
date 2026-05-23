import React from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { Shield, Users, LogIn, Mail, Phone, MapPin } from 'lucide-react';
import { SignOutButton } from '@/components/layout/UserNav';

import { ModeToggle } from '@/components/mode-toggle';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Dynamic Theme Header Navigation */}
      <header className="bg-card text-card-foreground sticky top-0 z-50 shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-primary font-logo">NB SAFA AGRO</span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Silage Production Farm</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">
              Home
            </Link>
            
            <ModeToggle />
            
            {session ? (
              <>
                {['super_admin', 'admin', 'manager', 'staff'].includes((session.user as any).role) && (
                  <Link href="/admin/dashboard" className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all">
                    <Shield className="h-3.5 w-3.5" /> Office Admin
                  </Link>
                )}
                {(session.user as any).role === 'dealer' && (
                  <Link href="/dealer/dashboard" className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all">
                    <Users className="h-3.5 w-3.5" /> Dealer Panel
                  </Link>
                )}
                {(session.user as any).role === 'director' && (
                  <Link href="/admin/director" className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all">
                    <Shield className="h-3.5 w-3.5" /> Director Board
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Hi, {session.user?.name?.split(' ')[0]}</span>
                  <SignOutButton />
                </div>
              </>
            ) : (
              <Link href="/login" className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-2 rounded-lg flex items-center gap-1 transition-all">
                <LogIn className="h-3.5 w-3.5" /> Log In / Register
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Dynamic Theme Footer */}
      <footer className="bg-card text-card-foreground border-t border-border py-10 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-foreground font-extrabold text-lg font-logo">NB SAFA AGRO</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Premium high-starch corn silage producer in Bogura, Bangladesh. Formulated for maximum dairy milk yields and healthy livestock weight gain.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-foreground font-bold text-sm">Quick Navigation</h4>
            <div className="flex flex-col space-y-1.5 text-xs text-muted-foreground">
              <Link href="/login" className="hover:text-primary hover:underline">Office Management Login</Link>
              <Link href="/login" className="hover:text-primary hover:underline">Dealer Register Portal</Link>
              <Link href="/" className="hover:text-primary hover:underline">Products & Nutritional Stats</Link>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="text-foreground font-bold text-sm">Contact Address</h4>
            <div className="space-y-2 text-muted-foreground">
              <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> Bogura Sadar, Bogura, Bangladesh</p>
              <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary" /> +880 1700-000000</p>
              <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary" /> sales@shafaagro.com</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 text-center text-[10px] text-muted-foreground border-t border-border mt-8 pt-4">
          &copy; {new Date().getFullYear()} NB Safa Agro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
