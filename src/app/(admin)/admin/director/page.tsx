'use client';

import React, { useEffect, useState } from 'react';
import { logInvestment, releaseDividends, approveDividendPayout } from '@/app/actions/director';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Coins, PlusCircle, Shield, Award, Send, Users, Notebook } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';

export default function DirectorPanelPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isReadOnly = ['manager', 'staff', 'director'].includes(role);
  const canPostResolution = ['super_admin', 'admin', 'director'].includes(role);

  const [summary, setSummary] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [directors, setDirectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingInvestment, setSubmittingInvestment] = useState(false);
  const [submittingDividend, setSubmittingDividend] = useState(false);
  const [isInvestmentOpen, setIsInvestmentOpen] = useState(false);

  // Investment Form
  const [directorId, setDirectorId] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentDate, setInvestmentDate] = useState('');
  const [equitySharePercentage, setEquitySharePercentage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [notes, setNotes] = useState('');

  // Dividend & Retained Earnings Form
  const [declaredProfit, setDeclaredProfit] = useState('');
  const [payoutPercentage, setPayoutPercentage] = useState('70');

  const loadData = async () => {
    await Promise.resolve();
    try {
      setLoading(true);

      // Use API routes — never call Server Actions from useEffect
      const [summaryRes, payoutsRes, usersRes] = await Promise.all([
        fetch('/api/admin/director'),
        fetch('/api/admin/director/dividends'),
        fetch('/api/admin/users?role=director&limit=100'),
      ]);

      if (!summaryRes.ok) {
        const err = await summaryRes.json();
        throw new Error(err.message || 'Failed to load director summary');
      }
      if (!payoutsRes.ok) {
        const err = await payoutsRes.json();
        throw new Error(err.message || 'Failed to load dividend payouts');
      }

      const sum = await summaryRes.json();
      const payoutList = await payoutsRes.json();
      setSummary(sum);
      setPayouts(payoutList);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        // API returns plain array when no `page` param, or {users:[]} when paginated
        setDirectors(Array.isArray(usersData) ? usersData : (usersData.users || []));
      }
    } catch (err: any) {
      toast.error('Failed to load director data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directorId || !investmentAmount) {
      toast.error('Director and Amount are required');
      return;
    }
    const amt = parseFloat(investmentAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Investment amount must be a positive number');
      return;
    }

    try {
      setSubmittingInvestment(true);
      await logInvestment({
        directorId,
        investmentAmount: parseFloat(investmentAmount),
        equitySharePercentage: 0,
        paymentMethod,
        notes,
        date: investmentDate || undefined,
      });

      toast.success('Investment logged and equity registered successfully!');
      setInvestmentAmount('');
      setInvestmentDate('');
      setNotes('');
      setIsInvestmentOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Failed to log investment: ' + err.message);
    } finally {
      setSubmittingInvestment(false);
    }
  };

  const handleReleaseDividends = async (e: React.FormEvent) => {
    e.preventDefault();
    const profit = parseFloat(declaredProfit);
    const pct = parseFloat(payoutPercentage);
    if (isNaN(profit) || profit <= 0) {
      toast.error('Please enter a valid profit pool amount');
      return;
    }
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error('Payout percentage must be between 0% and 100%');
      return;
    }

    const pool = (profit * pct) / 100;
    const retained = profit - pool;

    const confirmResult = await Swal.fire({
      title: 'Declare Profit Distribution?',
      html: `Do you want to declare a profit pool of <strong>৳${profit.toLocaleString()} BDT</strong>?<br/><br/>
             • Distribute to Directors: <strong>৳${pool.toLocaleString()} BDT (${pct}%)</strong><br/>
             • Retain in Reserves: <strong>৳${retained.toLocaleString()} BDT (${100 - pct}%)</strong><br/><br/>
             <span style="font-size:11px; color:#c2410c;">This will register an Expense Ledger Entry on the Bank balance for the distributed portion.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #10b981)',
      confirmButtonText: 'Yes, distribute and retain'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmittingDividend(true);
      const res = await releaseDividends(profit, pct);
      if (res.success) {
        const payoutsStr = res.payouts.length > 0
          ? res.payouts.map((p: any) => `${p.directorName}: ৳${p.amount.toLocaleString()} (${p.equity}% equity)`).join('<br/>')
          : 'None (No directors eligible)';
        Swal.fire({
          title: 'Profit Distributed!',
          html: `<div style="text-align:left; font-size:12px;">
                   <strong>Payouts:</strong><br/>${payoutsStr}<br/><br/>
                   <strong>Retained Earnings:</strong> ৳${res.retainedAmount.toLocaleString()} BDT (${100 - pct}% kept in reserve + any undistributed portions)
                 </div>`,
          icon: 'success'
        });
        setDeclaredProfit('');
        loadData();
      }
    } catch (err: any) {
      toast.error('Failed to distribute profit: ' + err.message);
    } finally {
      setSubmittingDividend(false);
    }
  };

  const handleReleasePayout = async (id: string) => {
    const confirmResult = await Swal.fire({
      title: 'Release Dividend Payout?',
      text: 'This will approve the payout, deduct the BDT amount from the bank ledger, and mark it as released.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #10b981)',
      confirmButtonText: 'Yes, release now'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const res = await approveDividendPayout(id);
      if (res.success) {
        toast.success('Dividend payout released and ledger updated!');
        loadData();
      }
    } catch (err: any) {
      toast.error('Failed to release payout: ' + err.message);
    }
  };


  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading Director Board Portal...</div>;
  }

  // Prep Chart Data
  const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--primary)'];
  const chartData = summary?.directorDetails
    ?.filter((d: any) => d.equity > 0)
    ?.map((d: any) => ({
      name: d.name,
      value: d.equity,
    })) || [];

  const parsedDeclared = parseFloat(declaredProfit) || 0;
  const parsedPercentage = parseFloat(payoutPercentage) || 0;
  const distributeAmount = (parsedDeclared * parsedPercentage) / 100;
  const retainedAmount = parsedDeclared - distributeAmount;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Directors Panel & Equity Board</h1>
          <p className="text-muted-foreground">Monitor capitalization investments, release dividends, and record board resolutions</p>
        </div>
        {!isReadOnly && (
          <Dialog open={isInvestmentOpen} onOpenChange={setIsInvestmentOpen}>
            <DialogTrigger render={
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1.5 self-start sm:self-auto">
                <PlusCircle className="h-4.5 w-4.5" /> Log Capital Investment
              </Button>
            } />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-md font-bold text-primary flex items-center gap-1.5">
                  <PlusCircle className="h-4.5 w-4.5 text-primary" /> Log Capital Investment
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLogInvestment} className="space-y-4 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-primary block mb-0.5">Select Director</label>
                  {directors.length === 0 ? (
                    <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/40 text-xs text-muted-foreground">
                      No directors registered yet —{' '}
                      <a href="/admin/director/list" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
                        Add Director first
                      </a>
                    </div>
                  ) : (
                    <Select value={directorId} onValueChange={(val) => setDirectorId(val || '')}>
                      <SelectTrigger className="border-border h-9">
                        <span className={directorId ? 'text-foreground' : 'text-muted-foreground'}>
                          {directorId ? (directors.find((d) => d._id === directorId)?.name || directorId) : 'Choose Director...'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {directors.map((d) => (
                          <SelectItem key={d._id} value={d._id}>
                            {d.name} <span className="text-muted-foreground text-xs">({d.email})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-primary block mb-0.5">Amount (BDT)</label>
                  <Input type="number" value={investmentAmount} onChange={(e) => setInvestmentAmount(e.target.value)} placeholder="0.00" className="border-border h-9" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-primary block mb-0.5">Date of Investment</label>
                  <Input type="date" value={investmentDate} onChange={(e) => setInvestmentDate(e.target.value)} className="border-border h-9" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-primary block mb-0.5">Investment Method</label>
                  <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val || 'bank')}>
                    <SelectTrigger className="border-border h-9">
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash Contribution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-primary block mb-0.5">Notes/Memos</label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Phase 2 expansion fund" className="border-border h-9" />
                </div>

                <Button type="submit" disabled={submittingInvestment} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  {submittingInvestment ? 'Logging Capital...' : 'Log Capitalization'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Retained Earnings & Profits visual stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Cumulative Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">৳{summary?.profitBeforeDividends?.toLocaleString() || 0}</div>
            <p className="text-[10px] text-muted-foreground">Net operating profit before any dividend payouts</p>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Dividends Distributed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">৳{summary?.totalDividends?.toLocaleString() || 0}</div>
            <p className="text-[10px] text-muted-foreground">Payouts released to farm directors</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Retained Earnings (Reserves)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">৳{summary?.retainedEarnings?.toLocaleString() || 0}</div>
            <p className="text-[10px] text-muted-foreground">Reinvested profit kept in company reserves</p>
          </CardContent>
        </Card>
      </div>

      {summary?.profitBeforeDividends > 0 && (
        <Card className="border-border bg-card/70 p-4">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-1.5">
            <span>Dividend Distribution Ratio</span>
            <span>Retained Earnings Ratio</span>
          </div>
          <div className="w-full h-3 rounded-full bg-muted overflow-hidden flex">
            <div 
              style={{ width: `${(summary.totalDividends / summary.profitBeforeDividends) * 100}%` }} 
              className="bg-primary h-full transition-all duration-500"
              title={`Distributed: ${((summary.totalDividends / summary.profitBeforeDividends) * 100).toFixed(1)}%`}
            />
            <div 
              style={{ width: `${(summary.retainedEarnings / summary.profitBeforeDividends) * 100}%` }} 
              className="bg-emerald-600 h-full transition-all duration-500"
              title={`Retained: ${((summary.retainedEarnings / summary.profitBeforeDividends) * 100).toFixed(1)}%`}
            />
          </div>
          <div className="flex gap-4 mt-2 justify-center text-[10px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Distributed: {((summary.totalDividends / summary.profitBeforeDividends) * 100).toFixed(1)}%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Retained: {((summary.retainedEarnings / summary.profitBeforeDividends) * 100).toFixed(1)}%</span>
          </div>
        </Card>
      )}

      {/* Summary Widget */}
      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-12 border-border bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary">Capitalization & Equity Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 items-center">
            <div>
              <div className="text-sm text-muted-foreground">Total Paid-up Equity Investment</div>
              <div className="text-3xl font-black text-primary my-1">
                ৳{summary?.totalInvestmentsSum?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">Registered operational capital pool from directors</p>
              
              <div className="mt-6 space-y-3">
                {summary?.directorDetails?.map((d: any, idx: number) => (
                  <div key={d.email} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[idx % chartColors.length] }}></span>
                      {d.name}
                    </span>
                    <span className="text-muted-foreground font-semibold">
                      ৳{d.invested.toLocaleString()} ({d.equity.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[250px] flex items-center justify-center">
              {chartData.length === 0 ? (
                <div className="text-xs text-muted-foreground">No registered shares to graph.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}% Share`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dividend Release & Payout History */}
      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-12">
          {!isReadOnly && (
            <Card className="border-border bg-card/70 h-full">
              <CardHeader>
                <CardTitle className="text-md font-bold text-primary flex items-center gap-1.5">
                  <Coins className="h-4.5 w-4.5 text-primary" /> Distribute Profit Pool
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleReleaseDividends} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">Declared Profit Pool (BDT)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={declaredProfit}
                      onChange={(e) => setDeclaredProfit(e.target.value)}
                      className="border-border"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">Payout Percentage (%)</label>
                    <div className="flex gap-4 items-center">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={payoutPercentage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPayoutPercentage(val);
                        }}
                        className="border-border w-24 h-9"
                        required
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={payoutPercentage || '0'}
                        onChange={(e) => setPayoutPercentage(e.target.value)}
                        className="flex-1 accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg space-y-1.5 text-xs border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Distributing Payout:</span>
                      <span className="font-bold text-primary">৳{distributeAmount.toLocaleString()} BDT ({payoutPercentage}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Retained in Reserve:</span>
                      <span className="font-bold text-emerald-600">৳{retainedAmount.toLocaleString()} BDT ({100 - parsedPercentage}%)</span>
                    </div>
                  </div>

                  <Button type="submit" disabled={submittingDividend} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold whitespace-nowrap">
                    {submittingDividend ? 'Releasing...' : 'Declare & Distribute Pool'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-12">
          {/* Dividend Payout History */}
          <Card className="border-border bg-card/70 h-full">
            <CardHeader>
              <CardTitle className="text-md font-bold text-primary flex items-center gap-1.5">
                <Coins className="h-4.5 w-4.5 text-primary" /> Dividend Payout History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
              {payouts.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-6">No dividend payouts recorded.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] font-bold uppercase">Date</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase">Details</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase">Status</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-right">Amount</TableHead>
                        {!isReadOnly && <TableHead className="text-[10px] font-bold uppercase text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell className="text-[10px] whitespace-nowrap font-medium">
                            {new Date(p.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-[10px] text-muted-foreground max-w-[220px] truncate" title={p.description}>
                            {p.description}
                          </TableCell>
                          <TableCell className="text-[10px] font-medium">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              p.status === 'released' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {p.status || 'released'}
                            </span>
                          </TableCell>
                          <TableCell className="text-[10px] font-bold text-primary text-right">
                            ৳{p.amount.toLocaleString()}
                          </TableCell>
                          {!isReadOnly && (
                            <TableCell className="text-right">
                              {p.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  className="h-6 text-[9px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-2"
                                  onClick={() => handleReleasePayout(p._id)}
                                >
                                  Release Payout
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
