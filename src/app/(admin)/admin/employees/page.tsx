/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { getEmployees, registerEmployee, updateEmployee, deleteEmployee, processPayroll } from '@/app/actions/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, PlusCircle, Calendar, Briefcase, MoreVertical, Edit, Trash2, FileText, BanknoteIcon } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Create form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [designation, setDesignation] = useState('');
  const [basic, setBasic] = useState('');
  const [allowance, setAllowance] = useState('0');
  const [deductions, setDeductions] = useState('0');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit modal states
  const [editOpen, setEditOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editBasic, setEditBasic] = useState('');
  const [editAllowance, setEditAllowance] = useState('0');
  const [editDeductions, setEditDeductions] = useState('0');
  const [editJoiningDate, setEditJoiningDate] = useState('');
  const [updating, setUpdating] = useState(false);

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
        name, phone, address, designation,
        basic: parseFloat(basic),
        allowance: parseFloat(allowance) || 0,
        deductions: parseFloat(deductions) || 0,
        joiningDate,
      });

      toast.success('Employee registered successfully!');
      setName(''); setPhone(''); setAddress(''); setDesignation('');
      setBasic(''); setAllowance('0'); setDeductions('0');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      loadData();
    } catch (err: any) {
      toast.error('Failed to register employee: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (emp: any) => {
    setEditEmp(emp);
    setEditName(emp.name);
    setEditPhone(emp.phone);
    setEditAddress(emp.address || '');
    setEditDesignation(emp.designation);
    setEditBasic(String(emp.salaryStructure.basic));
    setEditAllowance(String(emp.salaryStructure.allowance));
    setEditDeductions(String(emp.salaryStructure.deductions));
    setEditJoiningDate(new Date(emp.joiningDate).toISOString().split('T')[0]);
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editPhone || !editDesignation || !editBasic) {
      toast.error('Name, Phone, Designation, and Basic Salary are required.');
      return;
    }
    try {
      setUpdating(true);
      await updateEmployee(editEmp._id, {
        name: editName,
        phone: editPhone,
        address: editAddress,
        designation: editDesignation,
        basic: parseFloat(editBasic),
        allowance: parseFloat(editAllowance) || 0,
        deductions: parseFloat(editDeductions) || 0,
        joiningDate: editJoiningDate,
      });
      toast.success('Employee updated successfully!');
      setEditOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update employee');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (emp: any) => {
    const result = await Swal.fire({
      title: 'Remove Employee?',
      html: `<p class="text-sm text-gray-600">This will permanently remove <strong>${emp.name}</strong> (${emp.designation}) from the workforce database.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove!',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteEmployee(emp._id);
      toast.success(`${emp.name} removed from workforce.`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete employee');
    }
  };

  const handleProcessPayroll = async (emp: any) => {
    const now = new Date();
    const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const net = emp.salaryStructure.basic + emp.salaryStructure.allowance - emp.salaryStructure.deductions;

    const result = await Swal.fire({
      title: 'Process Monthly Payroll?',
      html: `<p class="text-sm text-gray-600">Pay <strong>৳${net.toLocaleString()}</strong> to <strong>${emp.name}</strong> for <strong>${monthYear}</strong>?<br/>This will be logged as an expense in the ledger.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #10b981)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Confirm Payment',
    });
    if (!result.isConfirmed) return;

    try {
      const res = await processPayroll(emp._id, monthYear);
      if (res.success) {
        toast.success(`Payroll of ৳${res.amount.toLocaleString()} processed for ${emp.name}!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Payroll failed');
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
        <Card className="lg:col-span-4 border-primary/10 bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
              <PlusCircle className="h-5 w-5 text-primary" /> Register Employee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required className="border-primary/20" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required className="border-primary/20" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Village, Thana" className="border-primary/20" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Designation</label>
                <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Silage Operator" required className="border-primary/20" />
              </div>

              <div className="grid grid-cols-3 gap-2 border p-2 rounded-lg bg-muted/50">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Basic (BDT)</label>
                  <Input type="number" value={basic} onChange={(e) => setBasic(e.target.value)} className="h-8 text-xs border-primary/20" required />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Allowance</label>
                  <Input type="number" value={allowance} onChange={(e) => setAllowance(e.target.value)} className="h-8 text-xs border-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Deduction</label>
                  <Input type="number" value={deductions} onChange={(e) => setDeductions(e.target.value)} className="h-8 text-xs border-primary/20" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Joining Date</label>
                <Input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required className="border-primary/20" />
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {submitting ? 'Registering...' : 'Register Worker'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Directory List */}
        <Card className="lg:col-span-8 border-primary/10 bg-card/70">
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
                      <TableHead className="w-[40px]">#</TableHead>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead className="text-right">Basic</TableHead>
                      <TableHead className="text-right">Allowance</TableHead>
                      <TableHead className="text-right">Deduction</TableHead>
                      <TableHead className="text-right font-semibold">Net Salary</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-center w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp, index) => {
                      const { basic, allowance, deductions } = emp.salaryStructure;
                      const net = basic + allowance - deductions;
                      return (
                        <TableRow key={emp._id}>
                          <TableCell className="text-xs text-muted-foreground font-medium">{index + 1}</TableCell>
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
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted" id={`emp-action-${emp._id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem className="cursor-pointer text-xs gap-2" onClick={() => handleOpenEdit(emp)}>
                                  <Edit className="h-3.5 w-3.5 text-primary" />
                                  <span>Edit Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-xs gap-2" onClick={() => handleDownloadNiyogpatra(emp)}>
                                  <FileText className="h-3.5 w-3.5 text-primary" />
                                  <span>নিয়োগপত্র</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-xs gap-2" onClick={() => handleProcessPayroll(emp)}>
                                  <BanknoteIcon className="h-3.5 w-3.5 text-primary" />
                                  <span>Process Payroll</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                  onClick={() => handleDelete(emp)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Remove</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* Edit Employee Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Edit className="h-5 w-5" /> Edit Employee Profile
            </DialogTitle>
          </DialogHeader>
          {editEmp && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Full Name</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} required className="border-primary/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Phone</label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required className="border-primary/20" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Designation</label>
                <Input value={editDesignation} onChange={(e) => setEditDesignation(e.target.value)} required className="border-primary/20" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Address</label>
                <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="border-primary/20" />
              </div>
              <div className="grid grid-cols-3 gap-2 border p-2 rounded-lg bg-muted/50">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Basic (BDT)</label>
                  <Input type="number" value={editBasic} onChange={(e) => setEditBasic(e.target.value)} className="h-8 text-xs border-primary/20" required />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Allowance</label>
                  <Input type="number" value={editAllowance} onChange={(e) => setEditAllowance(e.target.value)} className="h-8 text-xs border-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Deduction</label>
                  <Input type="number" value={editDeductions} onChange={(e) => setEditDeductions(e.target.value)} className="h-8 text-xs border-primary/20" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Joining Date</label>
                <Input type="date" value={editJoiningDate} onChange={(e) => setEditJoiningDate(e.target.value)} className="border-primary/20" />
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={updating} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
