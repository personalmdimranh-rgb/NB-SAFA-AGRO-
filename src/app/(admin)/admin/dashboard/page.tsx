'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Loader2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  Users,
  Package,
  ShoppingCart,
  BadgeDollarSign,
  Leaf,
  Factory,
  Store,
  Filter,
  RefreshCw,
  ArrowRight,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { format, subDays, parseISO, isAfter, startOfToday } from 'date-fns';
import { useSession } from 'next-auth/react';
import { getLoggedEmployeeDashboardData } from '@/app/actions/employee';
import { toast } from 'sonner';

// ─── helpers ──────────────────────────────────────────────────────────────────
const tk = (n: number) =>
  '৳' + Math.round(n).toLocaleString('en-BD');

function TrendBadge({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary">
        <TrendingUp className="h-3 w-3" /> +{value}%
      </span>
    );
  if (value < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-destructive">
        <TrendingDown className="h-3 w-3" /> {value}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
      <Minus className="h-3 w-3" /> 0%
    </span>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconBg?: string;
  href?: string;
  trend?: number;
}
function KpiCard({ title, value, sub, icon: Icon, iconBg, href, trend }: KpiCardProps) {
  const content = (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default h-full">
      {/* subtle top-border accent */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-primary/60 rounded-t-lg" />
      <CardContent className="p-3 sm:p-5 flex flex-col justify-between h-full min-h-[110px] sm:min-h-[140px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 sm:p-2 rounded-xl ${iconBg || 'bg-primary/10'}`}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            {href && (
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
              {title}
            </p>
            <p className="text-sm xs:text-base sm:text-2xl font-black tracking-tight leading-none text-zinc-900 dark:text-zinc-50 whitespace-nowrap truncate">
              {value}
            </p>
          </div>
        </div>
        {sub && (
          <p className="text-[9px] sm:text-xs text-muted-foreground mt-2 leading-tight">
            {sub}
          </p>
        )}
        {trend !== undefined && (
          <div className="mt-1">
            <TrendBadge value={trend} />
          </div>
        )}
      </CardContent>
    </Card>
  );
  if (href) return <Link href={href} className="block h-full">{content}</Link>;
  return content;
}

// ─── Payment status badge ──────────────────────────────────────────────────────
function PayStatusBadge({ status }: { status: string }) {
  if (status === 'paid')
    return <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold px-2" variant="outline">Paid</Badge>;
  if (status === 'partially-paid')
    return <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-[10px] font-bold px-2" variant="outline">Partial</Badge>;
  return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-bold px-2" variant="outline">Unpaid</Badge>;
}

// ─── Mini custom chart tooltip ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg text-xs space-y-1.5">
      <p className="font-bold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground">
            {p.name === 'salesCount' ? p.value : tk(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'collected' | 'salesCount'>('revenue');

  const [staffData, setStaffData] = useState<any>(null);
  const [staffLoading, setStaffLoading] = useState(true);

  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [debouncedRange, setDebouncedRange] = useState(dateRange);

  useEffect(() => {
    if (role === 'staff') {
      getLoggedEmployeeDashboardData().then(res => {
        setStaffData(res);
        setStaffLoading(false);
      }).catch(err => {
        toast.error('Failed to load employee dashboard data: ' + err.message);
        setStaffLoading(false);
      });
    }
  }, [role]);

  if (role === 'staff') {
    if (staffLoading) {
      return (
        <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your salary tracker...</p>
        </div>
      );
    }

    if (!staffData) {
      return (
        <div className="container mx-auto p-6 text-center max-w-md mt-10">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive font-black">Employee Profile Not Found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Your account email <strong className="text-zinc-800">{session?.user?.email}</strong> is not associated with any registered employee profile in the database.
              </p>
              <p className="text-xs">
                Please contact the farm administrator or manager to register your email in the Employee Directory.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    const { employee, salaryHistory } = staffData;
    const netSalary = employee.salaryStructure.basic + employee.salaryStructure.allowance - employee.salaryStructure.deductions;

    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Employee Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {employee.name}! View your profile details and track processed salary records.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-2 border-primary/20 bg-card">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{employee.name}</CardTitle>
                  <CardDescription className="capitalize font-semibold text-primary">{employee.designation}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase">Employee ID</span>
                <span className="font-mono font-bold text-zinc-800">{employee.employeeId || '—'}</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase">Phone</span>
                <span className="font-medium text-zinc-800">{employee.phone}</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase">Email</span>
                <span className="font-medium text-zinc-800">{employee.email || '—'}</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-xs uppercase">Joining Date</span>
                <span className="font-medium text-zinc-800">{new Date(employee.joiningDate).toLocaleDateString()}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-muted-foreground block text-xs uppercase">Full Address</span>
                <span className="font-medium text-zinc-800">
                  {[employee.address, employee.thana, employee.district, employee.division].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Salary Settings Card */}
          <Card className="border-primary/20 bg-muted/20">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold text-zinc-800">Salary Structure</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-sm">
              <div className="flex justify-between items-center border-b pb-1.5">
                <span className="text-muted-foreground text-xs uppercase font-medium">Basic Salary</span>
                <span className="font-bold text-zinc-800">৳{employee.salaryStructure.basic.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-1.5">
                <span className="text-muted-foreground text-xs uppercase font-medium">Allowance</span>
                <span className="font-semibold text-green-600">+৳{employee.salaryStructure.allowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-1.5">
                <span className="text-muted-foreground text-xs uppercase font-medium">Regular Deduction</span>
                <span className="font-semibold text-destructive">-৳{employee.salaryStructure.deductions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-1.5">
                <span className="text-muted-foreground text-xs uppercase font-medium">Allowed Absents / month</span>
                <span className="font-bold text-zinc-800">{employee.allowedAbsent ?? 1} Days</span>
              </div>
              <div className="flex justify-between items-center border-b pb-1.5">
                <span className="text-muted-foreground text-xs uppercase font-medium">Absent Deduction Rate</span>
                <span className="font-bold text-destructive">৳{(employee.absentDeductionRate ?? 0).toLocaleString()} / day</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-primary font-bold text-xs uppercase">Est. Net Base Salary</span>
                <span className="font-black text-primary text-base">৳{netSalary.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekend Details Info */}
        <Card className="border-primary/20 bg-card">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-bold text-zinc-800">Your Regular Offdays (Weekend)</p>
              <p className="text-xs text-muted-foreground">Default status is set automatically on these days.</p>
            </div>
            <div className="flex gap-2">
              {(employee.weekend || ['friday']).map((day: string) => (
                <Badge key={day} className="bg-primary/10 text-primary border-primary/20 capitalize font-bold px-3 py-1 text-xs">
                  {day}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payroll History Table */}
        <Card className="border-primary/15 bg-card">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5" /> Salary &amp; Payroll Record History
            </CardTitle>
            <CardDescription className="text-xs">Your processed salary receipts and ledger logs</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {salaryHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No salary transactions found. When payroll is processed by admin, history will show here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Ledger description &amp; calculation</TableHead>
                      <TableHead className="text-right font-bold">Net Salary Disbursed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryHistory.map((tx: any) => (
                      <TableRow key={tx._id}>
                        <TableCell className="whitespace-nowrap font-medium text-xs">
                          {new Date(tx.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 font-semibold text-[10px]">
                            {tx.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-md">
                          {tx.description}
                        </TableCell>
                        <TableCell className="text-right font-black text-primary text-sm whitespace-nowrap">
                          ৳{tx.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const t = setTimeout(() => setDebouncedRange(dateRange), 500);
    return () => clearTimeout(t);
  }, [dateRange]);

  const handleDate = (key: 'from' | 'to', val: string) => {
    const d = parseISO(val);
    const today = startOfToday();
    if (isAfter(d, today)) {
      setDateRange(prev => ({ ...prev, [key]: format(today, 'yyyy-MM-dd') }));
      return;
    }
    setDateRange(prev => {
      const next = { ...prev, [key]: val };
      const from = parseISO(next.from);
      const to = parseISO(next.to);
      if (isAfter(from, to)) {
        return key === 'from' ? { ...next, to: val } : { ...next, from: val };
      }
      return next;
    });
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ from: debouncedRange.from, to: debouncedRange.to });
      const res = await fetch(`/api/admin/dashboard/stats?${q}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || `Error ${res.status}`);
      }
    } catch (e: any) {
      setError(e.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [debouncedRange]);

  // Fill gaps in chart data
  const chartData = useMemo(() => {
    if (!data?.salesChartData) return [];
    const map = new Map(data.salesChartData.map((d: any) => [d.date, d]));
    const result = [];
    const start = parseISO(dateRange.from);
    const end = parseISO(dateRange.to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = format(d, 'yyyy-MM-dd');
      result.push(map.get(key) ?? { date: key, revenue: 0, collected: 0, salesCount: 0 });
    }
    return result;
  }, [data, dateRange]);

  if (loading && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
        <div className="relative">
          <Leaf className="h-10 w-10 text-primary animate-pulse" />
          <div className="absolute -inset-2 border-2 border-primary/30 rounded-full animate-spin [animation-duration:3s]" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Loading farm data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-8 w-8" />
          <h3 className="text-xl font-bold">Dashboard Error</h3>
        </div>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const { stats, recentSales, recentTransactions, recentBatches } = data || {};

  // Chart metric config
  const metricConfig = {
    revenue:    { label: 'Sales Revenue',  color: 'var(--primary)', format: (v: number) => tk(v) },
    collected:  { label: 'Amount Collected', color: 'var(--chart-2)', format: (v: number) => tk(v) },
    salesCount: { label: 'No. of Sales',   color: 'var(--chart-3)', format: (v: number) => v.toString() },
  };

  const chartTotals = {
    revenue:    chartData.reduce((s: number, d: any) => s + (d.revenue || 0), 0),
    collected:  chartData.reduce((s: number, d: any) => s + (d.collected || 0), 0),
    salesCount: chartData.reduce((s: number, d: any) => s + (d.salesCount || 0), 0),
  };

  return (
    <div className="flex-1 space-y-7 p-4 md:p-6 pt-5">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            Farm Overview
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            NB Safa Agro — Silage Production &amp; Farm Operations Dashboard
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-muted/60 border rounded-xl px-3 py-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider shrink-0">Range</span>
            <Input
              type="date"
              className="h-7 w-full sm:w-28 border-none bg-transparent focus-visible:ring-0 text-xs p-0.5 cursor-pointer"
              value={dateRange.from}
              onChange={e => handleDate('from', e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            <span className="text-muted-foreground text-[10px]">–</span>
            <Input
              type="date"
              className="h-7 w-full sm:w-28 border-none bg-transparent focus-visible:ring-0 text-xs p-0.5 cursor-pointer"
              value={dateRange.to}
              onChange={e => handleDate('to', e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} className="h-9 gap-1.5 rounded-xl font-semibold w-full sm:w-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* ── KPI Grid (top row) ──────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Pending Orders"
          value={String(stats?.pendingOrdersCount || 0)}
          sub="Unresolved dealer & farmer orders"
          icon={Clock}
          href="/admin/sales"
        />
        <KpiCard
          title="Net Profit"
          value={tk(stats?.netProfit || 0)}
          sub={`Income ${tk(stats?.totalIncome || 0)} · Exp ${tk(stats?.totalExpenses || 0)}`}
          icon={TrendingUp}
          iconBg="bg-chart-2/10"
        />
        <KpiCard
          title="Total Dues Receivable"
          value={tk(stats?.totalDueAmount || 0)}
          sub="Dealers + Farmers outstanding"
          icon={Wallet}
          iconBg="bg-destructive/10"
          href="/admin/accounts"
        />
        <KpiCard
          title="Silage Produced"
          value={`${(stats?.totalProducedQty || 0).toLocaleString()} kg`}
          sub={`${stats?.batchCount || 0} production batches`}
          icon={Factory}
          iconBg="bg-chart-3/10"
          href="/admin/inventory/production"
        />
      </div>

      {/* ── Secondary KPIs ──────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          title="Cash Balance"
          value={tk(stats?.cashBalance || 0)}
          sub="Net cash in/out this period"
          icon={Wallet}
          iconBg="bg-chart-1/10"
          href="/admin/accounts"
        />
        <KpiCard
          title="Bank Balance"
          value={tk(stats?.bankBalance || 0)}
          sub="Net bank in/out this period"
          icon={Building2}
          iconBg="bg-chart-4/10"
          href="/admin/accounts"
        />
        <KpiCard
          title="Payable Dividends"
          value={tk(stats?.totalPendingDividends || 0)}
          sub="Declared unpaid payouts"
          icon={BadgeDollarSign}
          iconBg="bg-amber-500/10"
          href="/admin/director"
        />
        <KpiCard
          title="Active Dealers"
          value={String(stats?.activeDealers || 0)}
          sub={`${stats?.totalFarmers || 0} registered farmers`}
          icon={Store}
          iconBg="bg-chart-3/10"
          href="/admin/dealers"
        />
        <KpiCard
          title="Total Employees"
          value={String(stats?.totalEmployees || 0)}
          sub="Farm & office staff"
          icon={Users}
          iconBg="bg-chart-5/10"
          href="/admin/employees"
        />
      </div>

      {/* ── Sales Trend Chart (Full Width) ────────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-5 py-4">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Sales Performance
            </CardTitle>
            <CardDescription className="text-xs">Silage revenue &amp; collection trend</CardDescription>
          </div>
          {/* Metric tabs */}
          <div className="flex border-t sm:border-t-0 sm:border-l divide-x w-full sm:w-auto">
            {(Object.keys(metricConfig) as (keyof typeof metricConfig)[]).map(key => (
              <button
                key={key}
                data-active={activeMetric === key}
                onClick={() => setActiveMetric(key)}
                className="flex-1 sm:flex-none flex flex-col justify-center gap-0.5 px-2.5 py-2.5 sm:px-5 sm:py-3 text-left data-[active=true]:bg-muted/60 min-w-0 sm:min-w-[110px] transition-colors"
              >
                <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {metricConfig[key].label}
                </span>
                <span className="text-xs sm:text-lg font-black leading-none whitespace-nowrap">
                  {metricConfig[key].format(chartTotals[key])}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-5 px-2 sm:px-5">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={metricConfig[activeMetric].color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={metricConfig[activeMetric].color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={30}
                tick={{ fontSize: 11 }}
                tickFormatter={v => format(new Date(v), 'dd MMM')}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                dataKey={activeMetric}
                type="monotone"
                stroke={metricConfig[activeMetric].color}
                strokeWidth={2.5}
                fill="url(#grad)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Activity Cards (3 Columns) ───────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">

        {/* Recent Production Batches */}
        <Card className="flex flex-col">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <Factory className="h-4 w-4 text-primary" />
                  Production Batches
                </CardTitle>
                <CardDescription className="text-xs">Latest silage production</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 gap-1 text-xs">
                <Link href="/admin/inventory/production">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {recentBatches && recentBatches.length > 0 ? (
              <div className="divide-y max-h-[340px] overflow-y-auto">
                {recentBatches.map((batch: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">{batch.batchNumber || `Batch #${i + 1}`}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {batch.productionDate ? format(new Date(batch.productionDate), 'dd MMM yyyy') : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{batch.totalProducedQty?.toLocaleString()} kg</p>
                      <p className="text-[10px] text-muted-foreground">{tk(batch.productionCostPerUnit || 0)}/kg</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                <Package className="h-8 w-8 opacity-30" />
                <p className="text-sm">No batches in this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales / Invoices */}
        <Card className="flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  Recent Invoices
                </CardTitle>
                <CardDescription className="text-xs">Latest silage sales &amp; dealer orders</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 gap-1 text-xs">
                <Link href="/admin/sales">
                  All Sales <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {recentSales && recentSales.length > 0 ? (
              <div className="divide-y max-h-[340px] overflow-y-auto">
                {recentSales.map((sale: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${sale.buyerType === 'dealer' ? 'bg-chart-4/15' : 'bg-primary/15'}`}>
                        {sale.buyerType === 'dealer'
                          ? <Store className="h-4 w-4 text-chart-4" />
                          : <Leaf className="h-4 w-4 text-primary" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{sale.invoiceNumber || `INV-${i + 1}`}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {sale.distributionDistrict || '—'} &bull;{' '}
                          {sale.date ? format(new Date(sale.date), 'dd MMM') : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-black">{tk(sale.grandTotal || 0)}</span>
                      <PayStatusBadge status={sale.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 opacity-30" />
                <p className="text-sm">No sales in this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Ledger Transactions */}
        <Card className="flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  Ledger Activity
                </CardTitle>
                <CardDescription className="text-xs">Recent cash &amp; bank transactions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 gap-1 text-xs">
                <Link href="/admin/accounts">
                  Full Ledger <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="divide-y max-h-[340px] overflow-y-auto">
                {recentTransactions.map((tx: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${tx.type === 'income' ? 'bg-primary/15' : 'bg-destructive/15'}`}>
                        {tx.type === 'income'
                          ? <ArrowUpCircle className="h-4 w-4 text-primary" />
                          : <ArrowDownCircle className="h-4 w-4 text-destructive" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{tx.category || tx.description || '—'}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">
                          {tx.source} &bull; {tx.date ? format(new Date(tx.date), 'dd MMM') : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className={`text-sm font-black ${tx.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                        {tx.type === 'income' ? '+' : '-'}{tk(tx.amount || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                <Wallet className="h-8 w-8 opacity-30" />
                <p className="text-sm">No transactions in this period</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Quick Action Links ──────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: 'New Sale',        icon: ShoppingCart,     href: '/admin/sales/new',              bg: 'bg-primary/10' },
            { label: 'New Production',  icon: Factory,          href: '/admin/inventory/production',   bg: 'bg-chart-3/10' },
            { label: 'Add Transaction', icon: Wallet,           href: '/admin/accounts',               bg: 'bg-chart-1/10' },
            { label: 'Dealers',         icon: Store,            href: '/admin/dealers',                bg: 'bg-chart-4/10' },
            { label: 'Farmers',         icon: Leaf,             href: '/admin/farmers',                bg: 'bg-chart-2/10' },
            { label: 'Employees',       icon: Users,            href: '/admin/employees',              bg: 'bg-chart-5/10' },
          ].map(({ label, icon: Icon, href, bg }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border ${bg} p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95`}
            >
              <div className="p-2.5 rounded-xl bg-background/60 group-hover:bg-background transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
