'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { UserMenu } from '@/components/layout/UserNav';
import { ModeToggle } from '@/components/mode-toggle';
import { Logo } from '@/components/ui/logo';
import { MobileMenu } from '@/components/layout/MobileMenu';

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

        {/* Left Side: Mobile Hamburger Drawer + Brand Logo */}
        <div className="flex items-center gap-1.5 z-10">
          <MobileMenu navItems={navItems} categories={[]} session={session} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:transform-none">
            <Logo 
              textClassName="text-sm sm:text-base md:text-xl text-primary font-bold tracking-tight uppercase" 
              imageClassName="size-7 sm:size-8 md:size-12" 
            />
          </div>
        </div>

        {/* Center: Navigation Items (Desktop only) */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold hover:text-primary transition-all relative py-1.5 ${isActive ? 'text-primary' : 'text-muted-foreground'
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
        <div className="flex items-center gap-1 md:gap-4 shrink-0 z-10">
          <ModeToggle />

          {session ? (
            <UserMenu user={session.user} />
          ) : (
            <Link 
              href="/login" 
              className="bg-transparent text-primary md:bg-primary md:text-primary-foreground md:hover:bg-primary/90 p-0 md:px-3.5 md:py-2 rounded-lg flex items-center gap-1 transition-all"
              title="Log In"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden md:inline text-xs font-bold">Log In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
