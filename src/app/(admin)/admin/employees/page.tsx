'use client';

import React, { useEffect, useState } from 'react';
import { getEmployees, registerEmployee } from '@/app/actions/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, PlusCircle, Calendar, Briefcase, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleDownloadNiyogpatra = async (employee: any) => {
    try {
      const settingsRes = await fetch('/api/settings').then(r => r.ok ? r.json() : null).catch(() => null);
      const { generateAppointmentLetterPDF } = await import('@/lib/appointment-letter-generator');
      await generateAppointmentLetterPDF(employee, settingsRes);
      toast.success('Appointment letter downloaded successfully!');
    } catch (err: any) {
      toast.error('Failed to generate appointment letter: ' + err.message);
    }
  };

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [designation, setDesignation] = useState('');
  const [basic, setBasic] = useState('');
  const [allowance, setAllowance] = useState('0');
  const [deductions, setDeductions] = useState('0');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await getEmployees();
      setEmployees(list);
    } catch (err: any) {
      toast.error('Failed to load employees: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !designation || !basic) {
      toast.error('Name, Phone, Designation, and Basic Salary are required.');
      return;
    }

    try {
      setSubmitting(true);
      await registerEmployee({
        name,
        phone,
        address,
        designation,
        basic: parseFloat(basic),
        allowance: parseFloat(allowance) || 0,
        deductions: parseFloat(deductions) || 0,
        joiningDate,
      });

      toast.success('Employee registered successfully!');
      // Reset
      setName('');
      setPhone('');
      setAddress('');
      setDesignation('');
      setBasic('');
      setAllowance('0');
      setDeductions('0');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      loadData();
    } catch (err: any) {
      toast.error('Failed to register employee: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Employee Directory</h1>
        <p className="text-muted-foreground">Register new operational workforce and configure official payroll structures</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Registration Form */}
        <Card className="lg:col-span-4 border-primary/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
              <PlusCircle className="h-5 w-5 text-primary" /> Register Employee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Village, Thana" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Designation</label>
                <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Silage Operator" required />
              </div>

              <div className="grid grid-cols-3 gap-2 border p-2 rounded-lg bg-zinc-50/50">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Basic (BDT)</label>
                  <Input type="number" value={basic} onChange={(e) => setBasic(e.target.value)} className="h-8 text-xs border-primary/10" required />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Allowance</label>
                  <Input type="number" value={allowance} onChange={(e) => setAllowance(e.target.value)} className="h-8 text-xs border-primary/10" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Deduction</label>
                  <Input type="number" value={deductions} onChange={(e) => setDeductions(e.target.value)} className="h-8 text-xs border-primary/10" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Joining Date</label>
                <Input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required />
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/95 text-white font-semibold">
                {submitting ? 'Registering...' : 'Register Worker'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Directory List */}
        <Card className="lg:col-span-8 border-primary/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Workforce Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading directory database...</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No employees registered.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead className="text-right">Basic Salary</TableHead>
                      <TableHead className="text-right">Allowance</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right font-semibold">Net Salary</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => {
                      const { basic, allowance, deductions } = emp.salaryStructure;
                      const net = basic + allowance - deductions;
                      return (
                        <TableRow key={emp._id}>
                          <TableCell className="font-semibold text-xs text-primary">
                            {emp.name}
                            <span className="block text-[10px] text-muted-foreground font-normal italic">{emp.phone}</span>
                          </TableCell>
                          <TableCell className="text-xs font-semibold">
                            <span className="flex items-center gap-1 text-primary">
                              <Briefcase className="h-3.5 w-3.5" />
                              {emp.designation}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-xs">৳{basic.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs text-primary">+৳{allowance.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs text-destructive">-৳{deductions.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold text-xs text-primary">৳{net.toLocaleString()}</TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(emp.joiningDate).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleDownloadNiyogpatra(emp)}
                              variant="outline"
                              size="xs"
                              className="text-xs text-primary border-primary/10 hover:bg-primary/10"
                            >
                              নিয়োগপত্র
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
