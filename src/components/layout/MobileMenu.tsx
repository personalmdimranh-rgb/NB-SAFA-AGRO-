'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MobileMenuProps {
  navItems: { href: string; label: string }[];
  categories: any[];
  session: any;
  triggerClassName?: string;
}

export function MobileMenu({ navItems, categories, session, triggerClassName }: MobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={`lg:hidden p-1.5 transition-colors outline-none ${triggerClassName || 'text-foreground hover:text-primary'}`}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r-0 pb-20 lg:pb-0">
        <div className="flex flex-col h-full bg-background font-jost">
          {/* Header */}
          <div className="flex h-14 items-center px-4 border-b">
            <Logo 
              textClassName="text-sm sm:text-base md:text-xl text-primary font-bold tracking-tight uppercase" 
              imageClassName="size-7 sm:size-8 md:size-12"
              onClick={() => setOpen(false)} 
            />
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/10' 
                      : 'text-foreground/70 hover:bg-muted hover:text-primary'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
