'use client';

import React, { useEffect, useState } from 'react';
import { getEmployees, logAttendance } from '@/app/actions/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ClipboardCheck, Calendar, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendancePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance status mapping
  const [statusMap, setStatusMap] = useState<Record<string, 'present' | 'absent' | 'leave'>>({});

  const loadData = async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const list = await getEmployees();
      setEmployees(list);

      // Initialize all statuses as present
      const initialMap: Record<string, 'present' | 'absent' | 'leave'> = {};
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

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = (employeeId: string, status: 'present' | 'absent' | 'leave') => {
    setStatusMap((prev) => ({
      ...prev,
      [employeeId]: status,
    }));
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
    } catch (err: any) {
      toast.error('Failed to save attendance: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Daily Attendance Registry</h1>
        <p className="text-muted-foreground">Select operation date and log farm workers attendance records</p>
      </div>

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
    </div>
  );
}
