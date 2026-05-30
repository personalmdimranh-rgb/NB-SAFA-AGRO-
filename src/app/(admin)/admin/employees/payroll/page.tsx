'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { getEmployees, processPayroll } from '@/app/actions/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Award, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function PayrollPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = 20;
  const totalPages = Math.ceil(employees.length / pageSize) || 1;
  const paginatedEmployees = employees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Month-Year selection defaults
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2026', '2027', '2028'];
  
  const currentMonthIdx = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(months[currentMonthIdx]);
  const [selectedYear, setSelectedYear] = useState('2026');

  const loadData = async () => {
    await Promise.resolve();
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

  const handlePaySalary = async (employee: any) => {
    const { basic, allowance, deductions } = employee.salaryStructure;
    const net = basic + allowance - deductions;
    const monthYear = `${selectedMonth} ${selectedYear}`;

    const result = await Swal.fire({
      title: 'Confirm Salary Payment?',
      html: `Do you want to process salary payment for <strong>${employee.name}</strong>?<br/>Period: <strong>${monthYear}</strong><br/>Net Payout: <strong>৳${net.toLocaleString()} BDT</strong><br/><br/><span style="font-size: 11px; color:#555;">This will create an Expense Ledger Entry on the Bank balance.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #10b981)',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, release payout!'
    });

    if (!result.isConfirmed) return;

    try {
      setProcessingId(employee._id);
      await processPayroll(employee._id, monthYear);
      toast.success(`Salary payout of ৳${net.toLocaleString()} to ${employee.name} for ${monthYear} posted successfully!`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to process payroll: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Workforce Payroll Registry</h1>
        <p className="text-muted-foreground">Select processing month/year and dispatch employee salary bank disbursements</p>
      </div>

      {/* Date Selectors Card */}
      <Card className="border-primary/10 bg-white/70">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-primary">Select Payroll Period:</span>
            </div>
            <div className="flex gap-3">
              <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val || '')}>
                <SelectTrigger className="w-[180px] border-primary/10">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={(val) => setSelectedYear(val || '')}>
                <SelectTrigger className="w-[120px] border-primary/10">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Database Table */}
      <Card className="border-primary/10 bg-white/70">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Salary Disbursal Worksheet ({selectedMonth} {selectedYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading payroll records...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No employees registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee details</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-right">Basic</TableHead>
                    <TableHead className="text-right">Allowance</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right font-semibold">Net Payable</TableHead>
                    <TableHead className="text-center">Payroll Disbursal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map((emp) => {
                    const { basic, allowance, deductions } = emp.salaryStructure;
                    const net = basic + allowance - deductions;
                    return (
                      <TableRow key={emp._id}>
                        <TableCell className="font-semibold text-xs text-primary">
                          {emp.name}
                          <span className="block text-[10px] text-muted-foreground font-normal italic">{emp.phone}</span>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-zinc-600">{emp.designation}</TableCell>
                        <TableCell className="text-right text-xs">৳{basic.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs text-primary">+৳{allowance.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs text-destructive">-৳{deductions.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold text-xs text-primary">৳{net.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            disabled={processingId === emp._id}
                            onClick={() => handlePaySalary(emp)}
                            className="bg-primary hover:bg-primary/95 text-white font-bold h-7 px-3 text-xs"
                          >
                            {processingId === emp._id ? 'Processing...' : 'Disburse Salary'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (page > 1) params.set('page', String(page));
                  else params.delete('page');
                  router.push(`${pathname}?${params.toString()}`);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
