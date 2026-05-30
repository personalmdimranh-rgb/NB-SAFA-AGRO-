/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User as UserIcon,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  ShoppingBag,
  CreditCard,
  Building2,
  Banknote,
  TrendingUp,
  Loader2,
  Shield,
  Users,
  Beef,
  ClipboardList,
  Star,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700 border-purple-200',
  admin:       'bg-blue-100 text-blue-700 border-blue-200',
  manager:     'bg-indigo-100 text-indigo-700 border-indigo-200',
  dealer:      'bg-amber-100 text-amber-700 border-amber-200',
  director:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  staff:       'bg-cyan-100 text-cyan-700 border-cyan-200',
  farmer:      'bg-lime-100 text-lime-700 border-lime-200',
  distributor: 'bg-orange-100 text-orange-700 border-orange-200',
  user:        'bg-slate-100 text-slate-600 border-slate-200',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  super_admin: <Shield className="h-5 w-5" />,
  admin:       <Shield className="h-5 w-5" />,
  manager:     <ClipboardList className="h-5 w-5" />,
  dealer:      <Building2 className="h-5 w-5" />,
  director:    <Star className="h-5 w-5" />,
  staff:       <Briefcase className="h-5 w-5" />,
  farmer:      <Beef className="h-5 w-5" />,
  distributor: <TrendingUp className="h-5 w-5" />,
  user:        <UserIcon className="h-5 w-5" />,
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/60 transition-colors">
      <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-sm">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-4 rounded-2xl border ${color} gap-1`}>
      <div className="mb-1">{icon}</div>
      <p className="text-xl font-black">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(setData)
      .catch(() => toast.error('Failed to load user profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-muted-foreground font-semibold">User not found.</p>
        <Button onClick={() => router.back()} className="mt-4 gap-2" variant="outline">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const { user, extra, orderSummary } = data;
  const role = user.role as string;
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS['user'];
  const roleIcon = ROLE_ICONS[role] || <UserIcon className="h-5 w-5" />;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2 text-muted-foreground hover:text-primary -ml-2"
        id="back-to-users"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Button>

      {/* ── Hero Header ── */}
      <div className="relative rounded-3xl overflow-hidden border bg-card shadow-sm">
        {/* Color band top */}
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />

        <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-2xl border-4 border-background shadow-xl overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`;
                }}
              />
            ) : (
              <UserIcon className="h-10 w-10 text-primary" />
            )}
          </div>

          {/* Name & role */}
          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
              <Badge className={`capitalize flex items-center gap-1.5 font-bold text-xs border ${roleColor}`}>
                {roleIcon} {role.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold tracking-wider">
                ID: {String(user._id).slice(-6).toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">{user.email}</p>
          </div>

          {/* Status badge */}
          <div className="pb-1">
            <Badge className={user.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 font-bold' : 'bg-red-100 text-red-700 border-red-200 font-bold'}>
              {user.status === 'active' ? '● Active' : '● Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column: contact */}
        <div className="space-y-4 md:col-span-1">
          <Card className="border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                <Phone className="h-4 w-4" /> Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={user.email} />
              <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={user.phone || 'N/A'} />
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
              <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Last Active" value={user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'} />
            </CardContent>
          </Card>
        </div>

        {/* Right column: role-specific info */}
        <div className="md:col-span-2 space-y-6">

          {/* ── DEALER Panel ── */}
          {role === 'dealer' && extra?.dealer && (
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Dealer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={<Banknote className="h-5 w-5 text-amber-600" />} label="Commission/Bag" value={`৳${extra.dealer.commissionRate}`} color="bg-amber-50 border-amber-200 text-amber-700" />
                  <StatCard icon={<CreditCard className="h-5 w-5 text-primary" />} label="Wallet" value={`৳${(extra.dealer.commissionWallet || 0).toLocaleString()}`} color="bg-primary/5 border-primary/20 text-primary" />
                  <StatCard icon={<TrendingUp className="h-5 w-5 text-blue-600" />} label="Credit Limit" value={`৳${(extra.dealer.creditLimit || 0).toLocaleString()}`} color="bg-blue-50 border-blue-200 text-blue-700" />
                  <StatCard icon={<ShoppingBag className="h-5 w-5 text-rose-600" />} label="Dues" value={`৳${(extra.dealer.currentDues || 0).toLocaleString()}`} color={`${extra.dealer.currentDues > extra.dealer.creditLimit ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Shop Name" value={extra.dealer.shopName || 'N/A'} />
                  <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="District" value={extra.dealer.address?.district || 'N/A'} />
                </div>
                {extra.dealer.tradeLicense && (
                  <InfoRow icon={<ClipboardList className="h-3.5 w-3.5" />} label="Trade License" value={extra.dealer.tradeLicense} />
                )}
                {extra.dealer.nidNumber && (
                  <InfoRow icon={<Shield className="h-3.5 w-3.5" />} label="NID Number" value={extra.dealer.nidNumber} />
                )}
              </CardContent>
            </Card>
          )}

          {/* ── DIRECTOR Panel ── */}
          {role === 'director' && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                  <Star className="h-4 w-4" /> Director Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={<Banknote className="h-5 w-5 text-emerald-600" />} label="Total Investment" value="৳—" color="bg-emerald-50 border-emerald-200 text-emerald-700" />
                  <StatCard icon={<TrendingUp className="h-5 w-5 text-emerald-600" />} label="Equity Share" value="—%" color="bg-emerald-50 border-emerald-200 text-emerald-700" />
                  <StatCard icon={<CreditCard className="h-5 w-5 text-primary" />} label="Dividends" value="৳—" color="bg-primary/5 border-primary/20 text-primary" />
                  <StatCard icon={<Star className="h-5 w-5 text-amber-600" />} label="Director Since" value={new Date(user.createdAt).toLocaleDateString()} color="bg-amber-50 border-amber-200 text-amber-700" />
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">Full investment history available in the Director Panel.</p>
              </CardContent>
            </Card>
          )}

          {/* ── STAFF / MANAGER Panel ── */}
          {(role === 'staff' || role === 'manager') && extra?.employee && (
            <Card className="border-cyan-200 bg-cyan-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-cyan-700 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Employee Record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard icon={<Banknote className="h-5 w-5 text-cyan-600" />} label="Basic Salary" value={`৳${extra.employee.salaryStructure?.basic?.toLocaleString() || 0}`} color="bg-cyan-50 border-cyan-200 text-cyan-700" />
                  <StatCard icon={<TrendingUp className="h-5 w-5 text-emerald-600" />} label="Allowance" value={`+৳${extra.employee.salaryStructure?.allowance?.toLocaleString() || 0}`} color="bg-emerald-50 border-emerald-200 text-emerald-700" />
                  <StatCard icon={<CreditCard className="h-5 w-5 text-rose-600" />} label="Deduction" value={`-৳${extra.employee.salaryStructure?.deductions?.toLocaleString() || 0}`} color="bg-rose-50 border-rose-200 text-rose-700" />
                </div>
                <InfoRow icon={<Briefcase className="h-3.5 w-3.5" />} label="Designation" value={extra.employee.designation || 'N/A'} />
                <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Joining Date" value={extra.employee.joiningDate ? new Date(extra.employee.joiningDate).toLocaleDateString() : 'N/A'} />
              </CardContent>
            </Card>
          )}

          {/* ── FARMER Panel ── */}
          {role === 'farmer' && (
            <Card className="border-lime-200 bg-lime-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-lime-700 flex items-center gap-2">
                  <Beef className="h-4 w-4" /> Farmer Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={<Beef className="h-5 w-5 text-lime-600" />} label="Total Orders" value={orderSummary.totalOrders} color="bg-lime-50 border-lime-200 text-lime-700" />
                  <StatCard icon={<CreditCard className="h-5 w-5 text-primary" />} label="Total Spent" value={`৳${orderSummary.totalSpent.toLocaleString()}`} color="bg-primary/5 border-primary/20 text-primary" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── DISTRIBUTOR Panel ── */}
          {role === 'distributor' && (
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-orange-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Distributor Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={<ShoppingBag className="h-5 w-5 text-orange-600" />} label="Distribution Zone" value="—" color="bg-orange-50 border-orange-200 text-orange-700" />
                  <StatCard icon={<TrendingUp className="h-5 w-5 text-primary" />} label="Total Sales" value="৳—" color="bg-primary/5 border-primary/20 text-primary" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── ADMIN / SUPER_ADMIN Panel ── */}
          {(role === 'admin' || role === 'super_admin') && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-blue-700 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Admin Privileges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={<Shield className="h-5 w-5 text-blue-600" />} label="Access Level" value={role === 'super_admin' ? 'Super Admin' : 'Admin'} color="bg-blue-50 border-blue-200 text-blue-700" />
                  <StatCard icon={<Users className="h-5 w-5 text-blue-600" />} label="Account Since" value={new Date(user.createdAt).toLocaleDateString()} color="bg-blue-50 border-blue-200 text-blue-700" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Regular USER Panel ── */}
          {role === 'user' && (
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Purchase History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={<ShoppingBag className="h-5 w-5 text-slate-600" />} label="Total Orders" value={orderSummary.totalOrders} color="bg-slate-50 border-slate-200 text-slate-700" />
                  <StatCard icon={<CreditCard className="h-5 w-5 text-primary" />} label="Total Spent" value={`৳${orderSummary.totalSpent.toLocaleString()}`} color="bg-primary/5 border-primary/20 text-primary" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
