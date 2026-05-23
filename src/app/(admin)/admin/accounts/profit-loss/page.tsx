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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Profit & Loss Statement</h1>
        <p className="text-muted-foreground">Interactive summary of farm operational revenues and expenditures</p>
      </div>

      {/* Summary Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ৳{report.totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Silage sales and payments collected</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ৳{report.totalExpense.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Raw material, salaries, and operating expenses</p>
          </CardContent>
        </Card>

        <Card className={`border-primary/30 ${report.netProfit >= 0 ? 'bg-primary/5' : 'bg-destructive/5'} backdrop-blur-sm`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Operating Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ৳{report.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Net profit margin for the period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-md font-semibold text-primary">Revenues vs Expenditures</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {report.chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">No historical data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip formatter={(value) => value !== undefined && value !== null ? `৳${Number(value).toLocaleString()}` : ''} />
                  <Legend />
                  <Area type="monotone" dataKey="income" name="Revenues" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Expenses" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-md font-semibold text-primary">Net Profit Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {report.chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">No historical data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip formatter={(value) => value !== undefined && value !== null ? `৳${Number(value).toLocaleString()}` : ''} />
                  <Legend />
                  <Bar dataKey="profit" name="Net Profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdowns */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-md font-semibold text-primary flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Revenue Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.incomeByCategory.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs">No recorded revenues.</div>
            ) : (
              <div className="space-y-4">
                {report.incomeByCategory.map((c: any) => {
                  const percent = report.totalIncome > 0 ? (c.amount / report.totalIncome) * 100 : 0;
                  return (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{c.category}</span>
                        <span>৳{c.amount.toLocaleString()} ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-2 dark:bg-zinc-800">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-md font-semibold text-primary flex items-center gap-2">
              <Activity className="h-5 w-5 text-destructive" /> Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.expenseByCategory.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs">No recorded expenses.</div>
            ) : (
              <div className="space-y-4">
                {report.expenseByCategory.map((c: any) => {
                  const percent = report.totalExpense > 0 ? (c.amount / report.totalExpense) * 100 : 0;
                  return (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{c.category}</span>
                        <span>৳{c.amount.toLocaleString()} ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-2 dark:bg-zinc-800">
                        <div className="bg-destructive h-2 rounded-full" style={{ width: `${percent}%` }}></div>
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
