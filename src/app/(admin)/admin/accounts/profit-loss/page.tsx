'use client';

import React, { useEffect, useState } from 'react';
import { getProfitLossReport } from '@/app/actions/accounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { Activity, ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfitLossPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProfitLossReport();
        setReport(data);
      } catch (err: any) {
        toast.error('Failed to load P&L Report: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Generating financial statements...</div>;
  }

  if (!report) {
    return <div className="text-center py-20 text-rose-500">Failed to render statement.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary font-heading">Financial Statement</h1>
          <p className="text-muted-foreground mt-1">Interactive overview of Shafa Agro's operational revenues, expenses, and net margins</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-muted px-3 py-1.5 rounded-full border border-border self-start md:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-muted-foreground">Live Data Ledger</span>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border border-primary/20 bg-card/60 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-primary/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Gross Revenue</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary tracking-tight">
              ৳{report.totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Silage sales and payments collected</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-destructive/20 bg-card/60 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-destructive/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Total Expenses</CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-destructive tracking-tight">
              ৳{report.totalExpense.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Raw materials, salaries, and operations</p>
          </CardContent>
        </Card>

        <Card className={`relative overflow-hidden border ${report.netProfit >= 0 ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'} shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-5 -mt-5"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Net Operating Income</CardTitle>
            <div className={`p-2 rounded-lg ${report.netProfit >= 0 ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black tracking-tight ${report.netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ৳{report.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Net profit margin for the period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border bg-card/60 shadow-sm backdrop-blur-md">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-bold text-primary">Revenues vs Expenditures</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pt-6">
            {report.chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No historical data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground/60" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground/60" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip 
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value) => value !== undefined && value !== null ? `৳${Number(value).toLocaleString()}` : ''} 
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="income" name="Revenues" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/60 shadow-sm backdrop-blur-md">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-bold text-primary">Net Profit Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pt-6">
            {report.chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No historical data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground/60" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground/60" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip 
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value) => value !== undefined && value !== null ? `৳${Number(value).toLocaleString()}` : ''} 
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="profit" name="Net Profit" fill="var(--color-primary, #10b981)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdowns */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border bg-card/60 shadow-sm backdrop-blur-md">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Revenue Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {report.incomeByCategory.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">No recorded revenues.</div>
            ) : (
              <div className="space-y-4">
                {report.incomeByCategory.map((c: any) => {
                  const percent = report.totalIncome > 0 ? (c.amount / report.totalIncome) * 100 : 0;
                  return (
                    <div key={c.category} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-foreground">{c.category}</span>
                        <span className="font-semibold text-primary">৳{c.amount.toLocaleString()} ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/60 shadow-sm backdrop-blur-md">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
              <Activity className="h-5 w-5 text-destructive" /> Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {report.expenseByCategory.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">No recorded expenses.</div>
            ) : (
              <div className="space-y-4">
                {report.expenseByCategory.map((c: any) => {
                  const percent = report.totalExpense > 0 ? (c.amount / report.totalExpense) * 100 : 0;
                  return (
                    <div key={c.category} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-foreground">{c.category}</span>
                        <span className="font-semibold text-destructive">৳{c.amount.toLocaleString()} ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-destructive h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
