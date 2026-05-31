'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { UserMenu } from '@/components/layout/UserNav';
import { ModeToggle } from '@/components/mode-toggle';

interface PublicHeaderProps {
  session: any;
}

export default function PublicHeader({ session }: PublicHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Our Team', href: '/team' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-card text-card-foreground sticky top-0 z-50 shadow-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between relative">
        
        {/* Left Side: Brand Logo */}
        <Link href="/" className="flex flex-col shrink-0">
          <span className="text-lg font-black tracking-wider text-primary font-logo">NB SAFA AGRO</span>
        </Link>

        {/* Center: Navigation Items */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold hover:text-primary transition-all relative py-1.5 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Mode Toggle & Auth */}
        <div className="flex items-center gap-4 shrink-0">
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
      
      {/* Mobile Nav Bar */}
      <div className="md:hidden border-t border-border/50 py-2 bg-card">
        <div className="flex justify-around items-center px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-bold transition-all relative py-1 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
