'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getEmployees, logAttendance, getAttendanceByDate } from '@/app/actions/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardCheck,
  Calendar,
  UserCheck,
  UserX,
  Users,
  Clock,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

type AttendanceStatus = 'present' | 'absent' | 'leave';

interface AttendanceReport {
  _id: string;
  name: string;
  phone: string;
  designation: string;
  status: AttendanceStatus | null;
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});

  // Report state
  const [reportData, setReportData] = useState<AttendanceReport[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);

  const loadData = async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const list = await getEmployees();
      setEmployees(list);
      const initialMap: Record<string, AttendanceStatus> = {};
      list.forEach((emp: any) => {
        initialMap[emp._id] = 'present';
      });
      setStatusMap(initialMap);
    } catch (err: any) {
      toast.error('Failed to load employees: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = useCallback(async (d: string) => {
    try {
      setReportLoading(true);
      const data = await getAttendanceByDate(d);
      setReportData(data);
    } catch (err: any) {
      toast.error('Failed to load report: ' + err.message);
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadReport(reportDate);
  }, []);

  const handleStatusChange = (employeeId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({ ...prev, [employeeId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const records = Object.entries(statusMap).map(([employeeId, status]) => ({
      employeeId,
      status,
    }));

    if (records.length === 0) {
      toast.error('No employee records to log');
      return;
    }

    try {
      setSubmitting(true);
      await logAttendance(records, date);
      toast.success('Attendance records saved successfully!');
      setHasSubmittedOnce(true);
      // Refresh report for the submitted date
      setReportDate(date);
      await loadReport(date);
    } catch (err: any) {
      toast.error('Failed to save attendance: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Summary counts
  const presentCount = reportData.filter((r) => r.status === 'present').length;
  const absentCount = reportData.filter((r) => r.status === 'absent').length;
  const leaveCount = reportData.filter((r) => r.status === 'leave').length;
  const notLoggedCount = reportData.filter((r) => r.status === null).length;

  const getStatusBadge = (status: AttendanceStatus | null) => {
    if (!status) return <Badge variant="outline" className="text-xs text-muted-foreground border-muted">Not Logged</Badge>;
    if (status === 'present') return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs font-semibold">✓ Present</Badge>;
    if (status === 'absent') return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-xs font-semibold">✗ Absent</Badge>;
    if (status === 'leave') return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-xs font-semibold">⏸ Leave</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Daily Attendance Registry</h1>
        <p className="text-muted-foreground">Select operation date and log farm workers attendance records</p>
      </div>

      {/* ─── SUBMIT FORM ─── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-primary/10 bg-white/70">
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Attendance Ledger
            </CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-48 border-primary/10 h-9 font-semibold text-zinc-700"
                required
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading employee directory...</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No employees registered.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Details</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead className="text-center">Daily Status Selection</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => (
                      <TableRow key={emp._id}>
                        <TableCell className="font-semibold text-xs text-primary">
                          {emp.name}
                          <span className="block text-[10px] text-muted-foreground font-normal italic">{emp.phone}</span>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-zinc-600">{emp.designation}</TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <RadioGroup
                              value={statusMap[emp._id] || 'present'}
                              onValueChange={(val: any) => handleStatusChange(emp._id, val)}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-1.5 cursor-pointer">
                                <RadioGroupItem value="present" id={`present-${emp._id}`} className="text-primary border-primary/30" />
                                <Label htmlFor={`present-${emp._id}`} className="text-xs font-bold text-primary cursor-pointer">Present</Label>
                              </div>
                              <div className="flex items-center space-x-1.5 cursor-pointer">
                                <RadioGroupItem value="absent" id={`absent-${emp._id}`} className="text-destructive border-destructive/30" />
                                <Label htmlFor={`absent-${emp._id}`} className="text-xs font-bold text-destructive cursor-pointer">Absent</Label>
                              </div>
                              <div className="flex items-center space-x-1.5 cursor-pointer">
                                <RadioGroupItem value="leave" id={`leave-${emp._id}`} className="text-secondary-foreground border-secondary/30" />
                                <Label htmlFor={`leave-${emp._id}`} className="text-xs font-bold text-secondary-foreground cursor-pointer">Leave</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {employees.length > 0 && (
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-white font-bold px-6">
              {submitting ? 'Saving attendance...' : 'Submit Attendance Sheet'}
            </Button>
          </div>
        )}
      </form>

      {/* ─── ATTENDANCE REPORT SECTION ─── */}
      <div className="space-y-4">
        {/* Report Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-primary">Attendance Report</h2>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={reportDate}
              onChange={(e) => {
                setReportDate(e.target.value);
                loadReport(e.target.value);
              }}
              className="w-48 border-primary/10 h-9 font-semibold text-zinc-700"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadReport(reportDate)}
              disabled={reportLoading}
              className="border-primary/20 text-primary hover:bg-primary/5"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${reportLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {reportData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-green-100 bg-green-50/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Present</p>
                  <p className="text-2xl font-bold text-green-700">{presentCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-100 bg-red-50/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <UserX className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-red-600 font-medium">Absent</p>
                  <p className="text-2xl font-bold text-red-700">{absentCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-100 bg-amber-50/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium">On Leave</p>
                  <p className="text-2xl font-bold text-amber-700">{leaveCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-zinc-100 bg-zinc-50/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-100">
                  <Users className="h-4 w-4 text-zinc-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium">Total</p>
                  <p className="text-2xl font-bold text-zinc-700">{reportData.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Table */}
        <Card className="border-primary/10 bg-white/70">
          <CardContent className="p-0">
            {reportLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                Loading report...
              </div>
            ) : reportData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No employees found.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5">
                      <TableHead className="font-semibold text-primary pl-4">#</TableHead>
                      <TableHead className="font-semibold text-primary">Employee Name</TableHead>
                      <TableHead className="font-semibold text-primary">Phone</TableHead>
                      <TableHead className="font-semibold text-primary">Designation</TableHead>
                      <TableHead className="font-semibold text-primary text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((emp, index) => (
                      <TableRow
                        key={emp._id}
                        className={
                          emp.status === 'present'
                            ? 'bg-green-50/30'
                            : emp.status === 'absent'
                            ? 'bg-red-50/30'
                            : emp.status === 'leave'
                            ? 'bg-amber-50/30'
                            : ''
                        }
                      >
                        <TableCell className="text-xs text-muted-foreground pl-4">{index + 1}</TableCell>
                        <TableCell className="font-semibold text-sm text-zinc-800">{emp.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{emp.phone}</TableCell>
                        <TableCell className="text-xs font-medium text-zinc-600">{emp.designation}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(emp.status)}</TableCell>
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
  );
}
