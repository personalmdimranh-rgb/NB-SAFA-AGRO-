/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  Mic,
  MicOff,
  LayoutDashboard,
  LogOut,
  Settings,
  Package,
  Truck,
  HelpCircle,
  ChevronDown,
  Shield,
  Calendar,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/mode-toggle';
import { useAppSelector } from '@/store/hooks';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { CategoryNav } from '@/components/layout/CategoryNav';
import { AIChatbot } from '@/components/layout/AIChatbot';
import { Logo } from '@/components/ui/logo';
import { useSettings } from '@/components/SettingsProvider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Swal from 'sweetalert2';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blogs' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { totalQuantity: cartCount, totalAmount } = useAppSelector((state) => state.cart);
  const settings = useSettings();

  const [categories, setCategories] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);


  useEffect(() => {
    const controller = new AbortController();
    async function fetchCats() {
      try {
        const res = await fetch('/api/categories', { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setCategories(data.filter((c: any) => c.isActive));
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error('Failed to fetch categories');
        }
      }
    }
    fetchCats();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (status === 'authenticated') {
      fetch('/api/user/profile', { signal: controller.signal })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch profile');
          return res.json();
        })
        .then(data => {
          if (isMounted) setProfile(data);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Failed to fetch profile', err);
          }
        });
    } else {
      Promise.resolve().then(() => {
        if (isMounted) {
          setProfile(null);
        }
      });
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [status]);

  // Voice Search Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore if already stopped
        }
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current = null;
      }
      setIsListening(false);
    };
  }, []);

  const mainCategories = categories.filter(c => !c.parentCategory);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleVoiceSearch = () => {
    const windowExt = window as typeof window & {
      SpeechRecognition?: new () => unknown;
      webkitSpeechRecognition?: new () => unknown;
    };
    const SpeechRecognition = windowExt.SpeechRecognition || windowExt.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      Swal.fire({
        title: 'Voice Search Unsupported',
        text: 'Voice search is not supported in your browser. Please use Google Chrome for the best experience.',
        icon: 'info',
        confirmButtonColor: '#00D1B2'
      });
      return;
    }

    if (isListening) {
      (recognitionRef.current as { stop: () => void } | null)?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new (SpeechRecognition as new () => {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onerror: ((event: { error: string }) => void) | null;
      onresult: ((event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
      start: () => void;
    })();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: { error: string }) => {
      setIsListening(false);
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable it in browser settings.');
      } else if (event.error === 'network') {
        toast.error('Network error. Please check your connection.');
      } else if (event.error === 'no-speech') {
        toast.info('No speech detected. Please try again.');
      }
    };
    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript;
      router.push(`/shop?search=${encodeURIComponent(transcript.trim())}`);
    };

    recognition.start();
  };

  return (
    <>
      {/* ── Main Header Bar ────────────────────────────────────────────── */}
      {/* Sticky on mobile, static on desktop — scrolls away on desktop so the  */}
      {/* bottom nav can then stick to the top of the viewport.                 */}
      <header className="sticky top-0 z-50 md:relative w-full bg-background border-b md:border-b-0">
        <div className="container mx-auto px-2 md:px-4">
          {/* Middle Main Row: Search | Logo | Icons */}
          <div className="flex h-14 md:h-20 items-center justify-between px-1 md:px-6 border-b border-muted/30">

            {/* Desktop Search (Left) */}
            <div className="hidden md:flex flex-1 items-center max-w-[280px]">
              <form onSubmit={handleSearch} className="relative w-full group">
                <label htmlFor="navbar-search" className="sr-only">Search products</label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  id="navbar-search"
                  type="text"
                  placeholder={isListening ? 'Listening...' : 'Search...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search products"
                  className="w-full bg-muted/40 border-none rounded-full py-2.5 pl-10 pr-10 text-xs focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title={isListening ? 'Stop listening' : 'Search by voice'}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-primary'}`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </form>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex md:hidden items-center">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle mobile menu</span>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                  <nav className="flex flex-col gap-6 mt-12 px-2">
                    <Logo onClick={() => setOpen(false)} />
                    <div className="space-y-4 pt-6 border-t font-medium tracking-tight">
                      {navItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                          <React.Fragment key={item.href}>
                            <Link
                              href={item.href}
                              className={`block px-4 py-2 rounded-xl transition-all ${isActive
                                ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20'
                                : 'hover:text-primary font-medium'
                                }`}
                              onClick={() => setOpen(false)}
                            >
                              {item.label}
                            </Link>
                            {/* Insert Categories Accordion after Home (index 0) */}
                            {index === 0 && (
                              <Accordion type="single" collapsible>
                                <AccordionItem value="cats" className="border-none">
                                  <AccordionTrigger className="py-2 hover:no-underline uppercase text-[12px] font-bold tracking-[0.2em] text-left">Categories</AccordionTrigger>
                                  <AccordionContent className="pt-2 pl-4 flex flex-col gap-3">
                                    {mainCategories.map(cat => (
                                      <Link
                                        key={cat._id}
                                        href={`/shop?category=${cat.slug}`}
                                        onClick={() => setOpen(false)}
                                        className="hover:text-primary text-[11px] font-bold uppercase tracking-[0.1em]"
                                      >
                                        {cat.name}
                                      </Link>
                                    ))}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo (Centered in desktop, Left-ish in mobile) */}
            <div className="flex items-center justify-center flex-1 md:flex-initial">
              <Logo textClassName="text-xl md:text-3xl" />
            </div>

            {/* Icons/Action Row (Right) */}
            <div className="flex items-center justify-end gap-1 flex-1 max-w-[320px]">

              {/* Theme Toggle (Left of group) */}
              <div className="hidden sm:block">
                <ModeToggle />
              </div>

              {/* AI Chatbot - Only visible if API key is set */}
              {settings?.aiConfig?.openRouterApiKey && (
                <div className="hidden sm:block">
                  <AIChatbot />
                </div>
              )}

              {/* Cart */}
              <CartDrawer>
                <div
                  className="flex items-center gap-2 group cursor-pointer hover:text-primary px-2 py-1.5 rounded-full transition-all hover:scale-110 active:scale-95"
                  aria-label="Shopping Cart"
                  role="button"
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5 stroke-[1.5]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 h-4 w-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center animate-in zoom-in">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[10px] font-bold leading-none tracking-tighter">৳{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CartDrawer>

              {/* User Account (Right end) */}
              {status === 'authenticated' && session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all cursor-pointer outline-none group hover:scale-110"
                      aria-label="Account menu"
                    >
                      <div className="h-8 w-8 rounded-full border-2 border-primary/20 overflow-hidden group-hover:border-primary transition-all">
                        <Image
                          src={session.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || 'U')}`}
                          alt={session.user?.name || 'User'}
                          className="h-full w-full object-cover"
                          width={32}
                          height={32}
                          unoptimized
                        />
                      </div>
                      <span className="hidden sm:block text-xs font-bold text-gray-700 group-hover:text-primary transition-colors">
                        {session.user?.name?.split(' ')[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>
                        <div className="flex items-center gap-3 py-1">
                          <div className="h-10 w-10 rounded-full border-2 border-primary/20 overflow-hidden shrink-0">
                            <Image
                              src={session.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || 'U')}&background=random`}
                              alt={session.user?.name || 'User'}
                              className="h-full w-full object-cover"
                              width={40}
                              height={40}
                              unoptimized
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm text-foreground truncate">{session.user?.name}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{session.user?.email}</span>
                            <div className="mt-1 flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full w-fit border border-primary/20">
                              <span className="text-[9px] font-black text-primary uppercase tracking-wider">
                                {(
                                  {
                                    super_admin: 'Super Admin',
                                    admin: 'Administrator',
                                    manager: 'Manager',
                                    staff: 'Staff Operator',
                                    director: 'Director',
                                    dealer: 'Approved Dealer',
                                    user: 'Farmer / Customer',
                                    farmer: 'Farmer / Customer',
                                  } as Record<string, string>
                                )[(session.user as any)?.role] || (session.user as any)?.role || 'User'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Role Based Navigation */}
                      {(session.user as { role?: string })?.role === 'super_admin' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/dashboard" className="cursor-pointer">
                              <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/system-design" className="cursor-pointer">
                              <Settings className="mr-2 h-4 w-4" /> Infrastructure & Marketing
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      {(session.user as { role?: string })?.role === 'admin' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/dashboard" className="cursor-pointer">
                              <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/orders" className="cursor-pointer">
                              <Truck className="mr-2 h-4 w-4" /> Manage Orders
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Manager Options */}
                      {(session.user as { role?: string })?.role === 'manager' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/dashboard" className="cursor-pointer">
                              <LayoutDashboard className="mr-2 h-4 w-4" /> Manager Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/inventory/production" className="cursor-pointer">
                              <ShoppingBag className="mr-2 h-4 w-4" /> Silage Production
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/products" className="cursor-pointer">
                              <Package className="mr-2 h-4 w-4" /> Product Catalog
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Staff Options */}
                      {(session.user as { role?: string })?.role === 'staff' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/dashboard" className="cursor-pointer">
                              <LayoutDashboard className="mr-2 h-4 w-4" /> Staff Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/employees/attendance" className="cursor-pointer">
                              <Calendar className="mr-2 h-4 w-4" /> Log Attendance
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/sales" className="cursor-pointer">
                              <Truck className="mr-2 h-4 w-4" /> Sales Ledger
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Director Options */}
                      {(session.user as { role?: string })?.role === 'director' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/director" className="cursor-pointer">
                              <LayoutDashboard className="mr-2 h-4 w-4" /> Director Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Dealer Options */}
                      {(session.user as { role?: string })?.role === 'dealer' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/dealer/dashboard" className="cursor-pointer">
                              <LayoutDashboard className="mr-2 h-4 w-4" /> Dealer Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dealer/order-new" className="cursor-pointer">
                              <Package className="mr-2 h-4 w-4" /> Order Silage
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dealer/commission" className="cursor-pointer">
                              <Users className="mr-2 h-4 w-4" /> My Commission
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* User / Farmer Options */}
                      {((session.user as { role?: string })?.role === 'user' || (session.user as { role?: string })?.role === 'farmer') && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="cursor-pointer">
                              <LayoutDashboard className="mr-2 h-4 w-4" /> My Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/track-order" className="cursor-pointer">
                              <Truck className="mr-2 h-4 w-4" /> Track Order
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: window.location.origin })} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  className="h-10 w-10 flex items-center justify-center rounded-xl transition-all cursor-pointer hover:text-primary"
                  aria-label="Log in"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* ΓöÇΓöÇ Bottom Navigation Row ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      {/* Siblings with <header> so sticky works relative to the viewport,      */}
      {/* not the parent's bounding box. Only visible on desktop (md+).         */}
      <nav className="hidden md:flex sticky top-0 z-40 w-full h-12 items-center justify-center border-b bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 flex justify-center">
          <ul className="flex items-center gap-10">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;

              return (
                <React.Fragment key={item.href}>
                  <li className="flex items-center">
                    <Link
                      href={item.href}
                      className={`text-[12px] font-bold uppercase tracking-[0.25em] transition-all px-4 py-1.5 rounded-full ${isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-foreground/70 hover:text-primary'
                        }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                  {/* Insert CategoryNav after Home (index 0) */}
                  {index === 0 && (
                    <li className="flex items-center h-full">
                      <CategoryNav />
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
