'use client';

import { signOut } from 'next-auth/react';
import {
  LogOut,
  LayoutDashboard,
  Settings,
  Truck,
  Package,
  Users,
  Shield,
  Calendar,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function SignOutButton() {
  return (
    <button
      className="text-xs font-semibold hover:bg-accent hover:text-accent-foreground text-muted-foreground p-1 h-auto flex items-center transition-all cursor-pointer"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      <LogOut className="h-3.5 w-3.5 mr-1" /> Log Out
    </button>
  );
}

export function UserMenu({ user }: { user: any }) {
  const role = user?.role;

  // Define role display names
  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrator',
    manager: 'Manager',
    staff: 'Staff Operator',
    director: 'Director',
    dealer: 'Approved Dealer',
    user: 'Farmer / Customer',
    farmer: 'Farmer / Customer',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 transition-all cursor-pointer outline-none group hover:scale-105 bg-transparent p-0 border-0"
          aria-label="Account menu"
        >
          <div className="h-8 w-8 rounded-full border-2 border-primary overflow-hidden transition-all">
            <img
              src={
                user?.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`
              }
              alt={user?.name || 'User'}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="hidden sm:block text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors">
            {user?.name?.split(' ')[0]}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 mt-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex items-center gap-3 py-1">
              <div className="h-10 w-10 rounded-full border-2 border-primary/20 overflow-hidden shrink-0">
                <img
                  src={
                    user?.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`
                  }
                  alt={user?.name || 'User'}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-foreground truncate">{user?.name}</span>
                <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
                <div className="mt-1 flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full w-fit border border-primary/20">
                  <span className="text-[9px] font-black text-primary uppercase tracking-wider">
                    {roleLabels[role] || role || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />          {['super_admin', 'admin', 'manager', 'staff'].includes(role) && (user?.id || user?._id) && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/admin/users/${user.id || user._id}`} className="cursor-pointer font-semibold text-primary">
                  <span className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Profile
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {/* Super Admin Options */}
          {role === 'super_admin' && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/system-design" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /> System Design
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /> General Settings
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {/* Admin Options */}
          {role === 'admin' && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {/* Manager Options */}
          {role === 'manager' && (
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
          {role === 'staff' && (
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
          {role === 'director' && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin/director" className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" /> Director Board
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {/* Dealer Options */}
          {role === 'dealer' && (
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

          {/* Farmer / Customer (Default User or Farmer) Options */}
          {(role === 'user' || role === 'farmer') && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Customer Dashboard
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

        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
