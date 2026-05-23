'use client';

import React, { useEffect, useState } from 'react';
import { getDirectorSummary, logInvestment, releaseDividends, createResolution, getResolutions } from '@/app/actions/director';
import { getDealers } from '@/app/actions/dealer'; // just to fetch users with role='director'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Coins, PlusCircle, Shield, Award, Send, Users, Notebook } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function DirectorPanelPage() {
  const [summary, setSummary] = useState<any>(null);
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [directors, setDirectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingInvestment, setSubmittingInvestment] = useState(false);
  const [submittingDividend, setSubmittingDividend] = useState(false);
  const [submittingResolution, setSubmittingResolution] = useState(false);

  // Investment Form
  const [directorId, setDirectorId] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [equitySharePercentage, setEquitySharePercentage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [notes, setNotes] = useState('');

  // Dividend Form
  const [dividendPool, setDividendPool] = useState('');

  // Board Resolution Form
  const [resTitle, setResTitle] = useState('');
  const [resContent, setResContent] = useState('');
  const [resFileUrl, setResFileUrl] = useState('');
  const [resMeetingDate, setResMeetingDate] = useState('');
  const [resAgenda, setResAgenda] = useState('');
  const [resAttendees, setResAttendees] = useState('');

  const loadData = async () => {
    await Promise.resolve(); // Defer state updates to avoid synchronous setState warning in useEffect
    try {
      setLoading(true);
      const [sum, resList] = await Promise.all([
        getDirectorSummary(),
        getResolutions()
      ]);
      setSummary(sum);
      setResolutions(resList);

      // Fetch user lists to extract users with role: director
      const response = await fetch('/api/admin/users'); // Or direct query, let's fetch director list
      if (response.ok) {
        const users = await response.json();
        setDirectors(users.filter((u: any) => u.role === 'director'));
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
    if (!directorId || !investmentAmount || !equitySharePercentage) {
      toast.error('Director, Amount, and Equity Share percentage are required');
      return;
    }

    try {
      setSubmittingInvestment(true);
      await logInvestment({
        directorId,
        investmentAmount: parseFloat(investmentAmount),
        equitySharePercentage: parseFloat(equitySharePercentage),
        paymentMethod,
        notes,
      });

      toast.success('Investment logged and equity registered successfully!');
      setInvestmentAmount('');
      setEquitySharePercentage('');
      setNotes('');
      loadData();
    } catch (err: any) {
      toast.error('Failed to log investment: ' + err.message);
    } finally {
      setSubmittingInvestment(false);
    }
  };

  const handleReleaseDividends = async (e: React.FormEvent) => {
    e.preventDefault();
    const pool = parseFloat(dividendPool);
    if (isNaN(pool) || pool <= 0) {
      toast.error('Please enter a valid dividend pool amount');
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Release Dividend Pool?',
      html: `Do you want to distribute a total dividend pool of <strong>৳${pool.toLocaleString()} BDT</strong> among directors relative to their registered equity shares?<br/><br/><span style="font-size:11px; color:#c2410c;">This will register an Expense Ledger Entry on the Bank balance.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #10b981)',
      confirmButtonText: 'Yes, release dividends'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmittingDividend(true);
      const res = await releaseDividends(pool);
      if (res.success) {
        const payoutsStr = res.payouts.map(p => `${p.directorName}: ৳${p.amount.toLocaleString()} (${p.equity}% equity)`).join('<br/>');
        Swal.fire({
          title: 'Dividends Distributed!',
          html: `<div style="text-align:left; font-size:12px;">${payoutsStr}</div>`,
          icon: 'success'
        });
        setDividendPool('');
        loadData();
      }
    } catch (err: any) {
      toast.error('Failed to distribute dividends: ' + err.message);
    } finally {
      setSubmittingDividend(false);
    }
  };

  const handleCreateResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle || !resContent) {
      toast.error('Resolution Title and Content are required');
      return;
    }

    try {
      setSubmittingResolution(true);
      await createResolution(
        resTitle,
        resContent,
        resFileUrl || undefined,
        resMeetingDate || undefined,
        resAgenda || undefined,
        resAttendees || undefined
      );
      toast.success('Board notice posted successfully!');
      setResTitle('');
      setResContent('');
      setResFileUrl('');
      setResMeetingDate('');
      setResAgenda('');
      setResAttendees('');
      loadData();
    } catch (err: any) {
      toast.error('Failed to post notice: ' + err.message);
    } finally {
      setSubmittingResolution(false);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Directors Panel & Equity Board</h1>
        <p className="text-muted-foreground">Monitor capitalization investments, release dividends, and record board resolutions</p>
      </div>

      {/* Summary Widget */}
      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 border-border bg-card/70">
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

        {/* Investment Form */}
        <Card className="md:col-span-4 border-border bg-card/70">
          <CardHeader>
            <CardTitle className="text-md font-bold text-primary flex items-center gap-1.5">
              <PlusCircle className="h-4.5 w-4.5 text-primary" /> Log Capital Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogInvestment} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-primary block mb-0.5">Select Director</label>
                <Select value={directorId} onValueChange={(val: any) => setDirectorId(val || '')}>
                  <SelectTrigger className="border-border h-9">
                    <SelectValue placeholder="Choose Director..." />
                  </SelectTrigger>
                  <SelectContent>
                    {directors.map((d) => (
                      <SelectItem key={d._id} value={d._id}>{d.name} ({d.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-primary block mb-0.5">Amount (BDT)</label>
                  <Input type="number" value={investmentAmount} onChange={(e) => setInvestmentAmount(e.target.value)} placeholder="0.00" className="border-border h-9" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-primary block mb-0.5">Equity Share %</label>
                  <Input type="number" step="0.01" value={equitySharePercentage} onChange={(e) => setEquitySharePercentage(e.target.value)} placeholder="e.g. 10.0" className="border-border h-9" />
                </div>
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
          </CardContent>
        </Card>
      </div>

      {/* Dividend Release & Notice Board */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-border bg-card/70">
            <CardHeader>
              <CardTitle className="text-md font-bold text-primary flex items-center gap-1.5">
                <Coins className="h-4.5 w-4.5 text-primary" /> Distribute Dividend Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReleaseDividends} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-primary block mb-1">Total Dividend Pool (BDT)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={dividendPool}
                      onChange={(e) => setDividendPool(e.target.value)}
                      className="border-border"
                      required
                    />
                    <Button type="submit" disabled={submittingDividend} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold whitespace-nowrap">
                      {submittingDividend ? 'Releasing...' : 'Distribute Pool'}
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  * Payouts are computed automatically matching each director's active share percentage.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Resolutions list */}
          <Card className="border-border bg-card/70">
            <CardHeader>
              <CardTitle className="text-md font-bold text-primary flex items-center gap-1.5">
                <Notebook className="h-4.5 w-4.5 text-primary" /> Board Resolutions Noticeboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
              {resolutions.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-6">No notices posted.</div>
              ) : (
                resolutions.map((res) => (
                  <div key={res._id} className="p-3 border rounded-lg bg-muted/50 space-y-2 border-border">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-primary">{res.title}</h4>
                      <span className="text-[9px] text-muted-foreground font-semibold">
                        Posted: {new Date(res.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{res.content}</p>
                    
                    {res.meetingDate && (
                      <div className="text-[10px] text-primary font-semibold bg-primary/10 p-1.5 rounded">
                        <strong>Meeting Date:</strong> {new Date(res.meetingDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    {res.agenda && (
                      <div className="text-[10px] text-muted-foreground border-l-2 border-primary pl-2">
                        <strong>Agenda:</strong> {res.agenda}
                      </div>
                    )}

                    {res.attendees && (
                      <div className="text-[10px] text-muted-foreground border-l-2 border-accent pl-2">
                        <strong>Attendees:</strong> {res.attendees}
                      </div>
                    )}

                    {res.fileUrl && (
                      <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary font-bold hover:underline block">
                        Download Board Minute Attachment
                      </a>
                    )}
                    <span className="block text-[9px] text-muted-foreground text-right italic">
                      Posted by: {res.recordedBy?.name || 'Admin'}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Board Resolution Poster */}
        <Card className="border-border bg-card/70">
          <CardHeader>
            <CardTitle className="text-md font-bold text-primary flex items-center gap-1.5">
              <Notebook className="h-4.5 w-4.5 text-primary" /> Create Resolution & Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateResolution} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-primary block mb-1">Notice / Resolution Title</label>
                <Input value={resTitle} onChange={(e) => setResTitle(e.target.value)} placeholder="e.g. Annual General Board Meeting Q3" required className="border-border" />
              </div>

              <div>
                <label className="text-xs font-semibold text-primary block mb-1">Content / Board Minute Summary</label>
                <Textarea value={resContent} onChange={(e) => setResContent(e.target.value)} placeholder="Enter details..." required className="border-border h-28" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-primary block mb-1">Meeting Date (Optional)</label>
                  <Input type="date" value={resMeetingDate} onChange={(e) => setResMeetingDate(e.target.value)} className="border-border" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary block mb-1">Document Attachment Link (Optional)</label>
                  <Input value={resFileUrl} onChange={(e) => setResFileUrl(e.target.value)} placeholder="e.g. https://shafaagro.com/docs/resolution-q3.pdf" className="border-border" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-primary block mb-1">Agenda (Optional)</label>
                <Input value={resAgenda} onChange={(e) => setResAgenda(e.target.value)} placeholder="e.g. Capitalization, Maize procurement" className="border-border" />
              </div>

              <div>
                <label className="text-xs font-semibold text-primary block mb-1">Attendees (Optional)</label>
                <Input value={resAttendees} onChange={(e) => setResAttendees(e.target.value)} placeholder="e.g. Imtiaz, Imran, Karim" className="border-border" />
              </div>

              <Button type="submit" disabled={submittingResolution} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {submittingResolution ? 'Posting...' : 'Post Resolution'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
