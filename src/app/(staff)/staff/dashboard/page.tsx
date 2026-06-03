'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getLoggedEmployeeDashboardData } from '@/app/actions/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User as UserIcon, 
  Briefcase, 
  Calendar as CalendarIcon, 
  DollarSign, 
  FileText, 
  RefreshCw, 
  Clock, 
  UserCheck, 
  UserX, 
  FileDown, 
  Info,
  CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return { start: firstDay, end: today };
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getLoggedEmployeeDashboardData();
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      loadData();
    }
  }, [session?.user?.email]);

  const handleDownloadNiyogpatra = async () => {
    if (!data?.employee) return;
    try {
      setDownloading(true);
      const settingsRes = await fetch('/api/settings').then(r => r.ok ? r.json() : null).catch(() => null);
      const { generateAppointmentLetterPDF } = await import('@/lib/appointment-letter-generator');
      await generateAppointmentLetterPDF(data.employee, settingsRes);
      toast.success('Appointment letter downloaded successfully!');
    } catch (err: any) {
      toast.error('Failed to generate appointment letter: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading your employee portal...</div>;
  }

  if (!data || !data.employee) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Info className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-zinc-950">Employee Profile Missing</h2>
        <p className="text-sm text-muted-foreground">Your user account is not linked to any registered employee profile. Please contact the administrator with your email address: <strong className="font-semibold text-zinc-800">{session?.user?.email}</strong></p>
      </div>
    );
  }

  const { employee, salaryHistory } = data;
  const { basic = 0, allowance = 0, deductions = 0 } = employee.salaryStructure || {};
  const grossSalary = basic + allowance;
  const standardNetSalary = basic + allowance - deductions;

  // 1. Calculate Current Month Live Estimate with dynamic defaults
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
  const currentMonthStr = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const currentMonthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0));
  const currentMonthEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

  const joining = employee.joiningDate ? new Date(employee.joiningDate) : new Date();
  const joiningDateUTC = new Date(Date.UTC(joining.getFullYear(), joining.getMonth(), joining.getDate(), 0, 0, 0, 0));

  const existingRecordsMap = new Map<string, string>();
  (employee.attendanceRecords || []).forEach((r: any) => {
    const d = new Date(r.date);
    const dateStr = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    existingRecordsMap.set(dateStr, r.status);
  });

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const weekendDays = employee.weekend || ['friday'];

  // Calculate Current Month stats for overview cards
  const mTrackingStart = joiningDateUTC > currentMonthStart ? joiningDateUTC : currentMonthStart;
  const mTrackingEnd = today < currentMonthEnd ? today : new Date(Date.UTC(currentMonthEnd.getFullYear(), currentMonthEnd.getMonth(), currentMonthEnd.getDate(), 0, 0, 0, 0));
  
  let mPresent = 0;
  let mAbsent = 0;
  let mLeave = 0;
  for (let d = new Date(mTrackingStart); d <= mTrackingEnd; d.setUTCDate(d.getUTCDate() + 1)) {
    const dateStr = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    const status = existingRecordsMap.get(dateStr);
    if (status) {
      if (status === 'present') mPresent++;
      else if (status === 'absent') mAbsent++;
      else if (status === 'leave') mLeave++;
    } else {
      const dayOfWeek = dayNames[d.getUTCDay()];
      if (weekendDays.includes(dayOfWeek)) mLeave++;
      else mPresent++;
    }
  }

  let attendanceDeduction = 0;
  const allowed = employee.allowedAbsent ?? 1;
  const rate = employee.absentDeductionRate ?? 0;
  if (mAbsent > allowed) {
    attendanceDeduction = (mAbsent - allowed) * rate;
  }
  const currentMonthEstimatedNet = Math.max(0, standardNetSalary - attendanceDeduction);

  // 2. Parse Deductions description helper
  const parseDeductions = (description: string) => {
    const match = description.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
  };

  // 3. Overall Attendance Stats
  const mTotalDays = mPresent + mAbsent;
  const attendanceRate = mTotalDays > 0 ? Math.round((mPresent / mTotalDays) * 100) : 100;

  // Calculate Filtered Stats based on dateRange (for custom selector card)
  const filterStart = new Date(dateRange.start + 'T00:00:00Z');
  const filterEnd = new Date(dateRange.end + 'T23:59:59Z');
  const fTrackingStart = joiningDateUTC > filterStart ? joiningDateUTC : filterStart;
  const fTrackingEnd = today < filterEnd ? today : filterEnd;

  let presentCount = 0;
  let absentsCount = 0;
  let leaveCount = 0;
  for (let d = new Date(fTrackingStart); d <= fTrackingEnd; d.setUTCDate(d.getUTCDate() + 1)) {
    const dateStr = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    const status = existingRecordsMap.get(dateStr);
    if (status) {
      if (status === 'present') presentCount++;
      else if (status === 'absent') absentsCount++;
      else if (status === 'leave') leaveCount++;
    } else {
      const dayOfWeek = dayNames[d.getUTCDay()];
      if (weekendDays.includes(dayOfWeek)) leaveCount++;
      else presentCount++;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Welcome, {employee.name}!</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Briefcase className="h-4 w-4 text-primary" /> {employee.designation} · ID: <span className="font-bold">{employee.employeeId}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleDownloadNiyogpatra} disabled={downloading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 shadow-md flex items-center gap-1.5 text-xs">
            <FileDown className="h-4 w-4" />
            {downloading ? 'Downloading...' : 'নিয়োগপত্র (Appointment)'}
          </Button>
          <Button onClick={loadData} size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 h-9">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="border-primary/15 bg-white/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">Gross Monthly</CardTitle>
            <DollarSign className="h-4 w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-xl font-extrabold text-zinc-900">
              ৳{grossSalary.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Basic + Allowances</p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-white/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">Deductions</CardTitle>
            <Info className="h-4 w-4 text-destructive shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-xl font-extrabold text-destructive">
              -৳{deductions.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Standard monthly cuts</p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-white/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">Attendance Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600 shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-xl font-extrabold text-green-700">
              {attendanceRate}%
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Presents / logged days</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary truncate">Current Month Estimate</CardTitle>
            <DollarSign className="h-4 w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-xl font-extrabold text-primary">
              ৳{currentMonthEstimatedNet.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Estimated payout for {currentMonthStr}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Structure */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-primary/10 shadow-sm bg-white/60">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-1.5">
                <UserIcon className="h-4 w-4" /> Personal & Joining Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Joining Date:</span>
                <span className="font-semibold text-zinc-900">{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Phone Number:</span>
                <span className="font-semibold text-zinc-950 font-mono">{employee.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-semibold text-zinc-800 text-right">{employee.address || '—'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Salary details card */}
          <Card className="border-primary/10 shadow-sm bg-white/60">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" /> Salary Structure Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Basic Pay:</span>
                <span className="font-bold text-zinc-900">৳{basic.toLocaleString()} BDT</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Allowances:</span>
                <span className="font-bold text-green-700">+৳{allowance.toLocaleString()} BDT</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Fixed Deductions:</span>
                <span className="font-bold text-destructive">-৳{deductions.toLocaleString()} BDT</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm text-primary">
                <span>Standard Monthly Net:</span>
                <span>৳{standardNetSalary.toLocaleString()} BDT</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance & Salary logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Month Attendance Summary */}
          <Card className="border-primary/10 shadow-sm bg-white/60">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-primary/5">
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> Attendance Summary &amp; History
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground whitespace-nowrap">From:</span>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="border border-primary/20 rounded px-2 py-1 text-xs bg-white text-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground whitespace-nowrap">To:</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="border border-primary/20 rounded px-2 py-1 text-xs bg-white text-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-[11px] text-muted-foreground mb-3">
                Showing records from <span className="font-semibold text-zinc-800">{new Date(dateRange.start).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span> to <span className="font-semibold text-zinc-800">{new Date(dateRange.end).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-green-50/50 border border-green-100 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-green-600 uppercase">Present</p>
                  <p className="text-lg font-black text-green-700 mt-0.5">{presentCount}</p>
                </div>
                <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-rose-600 uppercase">Absent</p>
                  <p className="text-lg font-black text-rose-700 mt-0.5">{absentsCount}</p>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-amber-600 uppercase">Leave</p>
                  <p className="text-lg font-black text-amber-700 mt-0.5">{leaveCount}</p>
                </div>
              </div>

              {/* Show warning about absent penalty if any */}
              {mAbsent > allowed && (
                <div className="flex items-start gap-2 bg-rose-50/80 border border-rose-100 rounded-lg p-3 text-xs text-rose-800">
                  <Info className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Absent Penalty Warning:</span> You have logged <strong className="font-black">{mAbsent} absents</strong> this month, exceeding your allowed threshold of <strong className="font-bold">{allowed} day</strong>. An attendance penalty of <strong>৳{((mAbsent - allowed) * rate).toLocaleString()} BDT</strong> (৳{rate}/day) will be deducted from your payout.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Salary History & Deductions */}
          <Card className="border-primary/10 shadow-sm bg-white/60">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Monthly Salary Ledger & Disbursal History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {salaryHistory.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">No salary payments disbursed yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Ledger Source</TableHead>
                      <TableHead>Breakdown &amp; Deduction Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryHistory.map((tx: any) => {
                      const breakdown = parseDeductions(tx.description);
                      const isDeducted = tx.amount < standardNetSalary;
                      return (
                        <TableRow key={tx._id}>
                          <TableCell className="pl-4 font-semibold text-xs whitespace-nowrap">
                            {new Date(tx.date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="font-bold text-xs text-primary">
                            ৳{tx.amount.toLocaleString()} BDT
                          </TableCell>
                          <TableCell className="text-[10px] font-bold uppercase text-zinc-500">
                            {tx.source}
                          </TableCell>
                          <TableCell className="text-xs">
                            {breakdown ? (
                              <div className="space-y-1">
                                <Badge variant="outline" className={`text-[10px] ${isDeducted ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                  {isDeducted ? 'Deductions Applied' : 'Full Disbursal'}
                                </Badge>
                                <span className="block text-[10px] text-muted-foreground leading-normal max-w-sm">
                                  {breakdown}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">No details parsed</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
