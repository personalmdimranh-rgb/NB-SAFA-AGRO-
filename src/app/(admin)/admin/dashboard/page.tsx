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
import Link from 'next/link';
import { format, subDays, parseISO, isAfter, startOfToday } from 'date-fns';

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
      <CardContent className="pt-5 pb-4 px-5 flex flex-col gap-3 h-full">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${iconBg || 'bg-primary/10'}`}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {href && (
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
        <div className="space-y-0.5 flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-black tracking-tight leading-none">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        {trend !== undefined && <TrendBadge value={trend} />}
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'collected' | 'salesCount'>('revenue');

  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [debouncedRange, setDebouncedRange] = useState(dateRange);

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
            Shafa Agro — Silage Production &amp; Farm Operations Dashboard
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
          title="Silage Sales Revenue"
          value={tk(stats?.totalSalesRevenue || 0)}
          sub={`${stats?.salesCount || 0} invoices in period`}
          icon={BadgeDollarSign}
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
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
          <div className="flex border-t sm:border-t-0 sm:border-l divide-x overflow-x-auto no-scrollbar">
            {(Object.keys(metricConfig) as (keyof typeof metricConfig)[]).map(key => (
              <button
                key={key}
                data-active={activeMetric === key}
                onClick={() => setActiveMetric(key)}
                className="flex flex-col justify-center gap-0.5 px-5 py-3 text-left data-[active=true]:bg-muted/60 min-w-[110px] transition-colors"
              >
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {metricConfig[key].label}
                </span>
                <span className="text-lg font-black leading-none">
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
