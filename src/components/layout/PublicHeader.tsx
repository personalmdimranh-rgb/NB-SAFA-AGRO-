import React from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { UserMenu } from '@/components/layout/UserNav';
import { ModeToggle } from '@/components/mode-toggle';

interface PublicHeaderProps {
  session: any;
}

export default function PublicHeader({ session }: PublicHeaderProps) {
  return (
    <header className="bg-card text-card-foreground sticky top-0 z-50 shadow-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="text-lg font-black tracking-wider text-primary font-logo">NB SAFA AGRO</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/faq" className="text-sm font-semibold hover:text-primary transition-colors">
            FAQ
          </Link>
          <Link href="/team" className="text-sm font-semibold hover:text-primary transition-colors">
            Our Team
          </Link>

          <ModeToggle />

          {session ? (
            <UserMenu user={session.user} />
          ) : (
            <Link href="/login" className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-2 rounded-lg flex items-center gap-1 transition-all">
              <LogIn className="h-3.5 w-3.5" /> Log In / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
