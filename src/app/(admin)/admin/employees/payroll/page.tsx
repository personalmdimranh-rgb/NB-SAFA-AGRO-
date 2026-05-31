'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { getEmployees, processPayroll, processBulkPayroll } from '@/app/actions/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Calendar, CheckCheck, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function PayrollPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Bulk select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = 20;
  const totalPages = Math.ceil(employees.length / pageSize) || 1;
  const paginatedEmployees = employees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Month-Year selection defaults
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = [String(currentYear - 1), String(currentYear), String(currentYear + 1), String(currentYear + 2)];

  const currentMonthIdx = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(months[currentMonthIdx]);
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const monthYear = `${selectedMonth} ${selectedYear}`;

  // Clear selections when month/year changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [selectedMonth, selectedYear]);

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

  // Helper: check if an employee is already paid for selected month
  const isPaid = (emp: any) => {
    return Array.isArray(emp.paidMonths) && emp.paidMonths.includes(monthYear);
  };

  // Eligible = not yet paid for this month
  const eligibleEmployees = paginatedEmployees.filter((emp) => !isPaid(emp));

  // Checkbox helpers
  const allEligibleSelected =
    eligibleEmployees.length > 0 &&
    eligibleEmployees.every((emp) => selectedIds.has(emp._id));

  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allEligibleSelected) {
      // Deselect all eligible on current page
      const next = new Set(selectedIds);
      eligibleEmployees.forEach((emp) => next.delete(emp._id));
      setSelectedIds(next);
    } else {
      // Select all eligible on current page
      const next = new Set(selectedIds);
      eligibleEmployees.forEach((emp) => next.add(emp._id));
      setSelectedIds(next);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Individual disburse
  const handlePaySalary = async (employee: any) => {
    if (isPaid(employee)) return;

    const { basic, allowance, deductions } = employee.salaryStructure;
    const net = basic + allowance - deductions;

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

  // Bulk disburse
  const handleBulkDisburse = async () => {
    if (selectedIds.size === 0) return;

    const selectedEmps = employees.filter((emp) => selectedIds.has(emp._id));
    const totalNet = selectedEmps.reduce((sum, emp) => {
      const { basic, allowance, deductions } = emp.salaryStructure;
      return sum + Math.max(0, basic + allowance - deductions);
    }, 0);

    const result = await Swal.fire({
      title: 'Bulk Salary Disbursement?',
      html: `
        <div style="text-align:left; font-size:13px; margin-top:8px;">
          <strong>Period:</strong> ${monthYear}<br/>
          <strong>Employees:</strong> ${selectedEmps.length} selected<br/>
          <strong>Total Payout:</strong> ৳${totalNet.toLocaleString()} BDT<br/><br/>
          <div style="max-height:120px; overflow-y:auto; background:#f9fafb; border-radius:6px; padding:8px;">
            ${selectedEmps.map(emp => {
              const net = Math.max(0, emp.salaryStructure.basic + emp.salaryStructure.allowance - emp.salaryStructure.deductions);
              return `<div style="display:flex; justify-content:space-between; padding:2px 0; border-bottom:1px solid #e5e7eb;">
                <span>${emp.name}</span><span style="color:#059669; font-weight:600;">৳${net.toLocaleString()}</span>
              </div>`;
            }).join('')}
          </div>
          <br/><span style="font-size:11px; color:#555;">All entries will be posted to Bank Expense Ledger.</span>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #10b981)',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, disburse all ${selectedEmps.length}!`,
      width: 480,
    });

    if (!result.isConfirmed) return;

    try {
      setBulkProcessing(true);
      const res = await processBulkPayroll(Array.from(selectedIds), monthYear);

      const paid = res.results.filter((r: any) => !r.skipped);
      const skipped = res.results.filter((r: any) => r.skipped);
      const totalPaid = paid.reduce((sum: number, r: any) => sum + r.amount, 0);

      let msg = `✅ ${paid.length} salary disbursed (৳${totalPaid.toLocaleString()})`;
      if (skipped.length > 0) msg += ` | ⚠️ ${skipped.length} skipped`;
      toast.success(msg);

      setSelectedIds(new Set());
      loadData();
    } catch (err: any) {
      toast.error('Bulk disbursal failed: ' + err.message);
    } finally {
      setBulkProcessing(false);
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

      {/* Payroll Table Card */}
      <Card className="border-primary/10 bg-white/70">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Salary Disbursal Worksheet ({monthYear})
            </CardTitle>

            {/* Bulk Action Bar */}
            {someSelected && (
              <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
                <span className="text-xs font-semibold text-primary">
                  {selectedIds.size} selected
                </span>
                <Button
                  size="sm"
                  disabled={bulkProcessing}
                  onClick={handleBulkDisburse}
                  className="bg-primary hover:bg-primary/90 text-white font-bold h-8 px-4 text-xs gap-2"
                >
                  {bulkProcessing ? (
                    <><Loader2 className="h-3 w-3 animate-spin" /> Processing...</>
                  ) : (
                    <><CheckCheck className="h-3 w-3" /> Disburse Selected ({selectedIds.size})</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds(new Set())}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
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
                    {/* Select All checkbox */}
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allEligibleSelected && eligibleEmployees.length > 0}
                        onCheckedChange={toggleSelectAll}
                        disabled={eligibleEmployees.length === 0}
                        aria-label="Select all eligible employees"
                      />
                    </TableHead>
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
                    const net = Math.max(0, basic + allowance - deductions);
                    const alreadyPaid = isPaid(emp);
                    const isProcessing = processingId === emp._id;
                    const isSelected = selectedIds.has(emp._id);

                    return (
                      <TableRow
                        key={emp._id}
                        className={
                          alreadyPaid
                            ? 'bg-green-50/60 opacity-75'
                            : isSelected
                            ? 'bg-primary/5'
                            : ''
                        }
                      >
                        {/* Row checkbox */}
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            disabled={alreadyPaid || isProcessing}
                            onCheckedChange={() => toggleSelect(emp._id)}
                            aria-label={`Select ${emp.name}`}
                          />
                        </TableCell>

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
                          {alreadyPaid ? (
                            <Badge
                              variant="outline"
                              className="border-green-500 text-green-600 bg-green-50 text-[10px] gap-1 px-2 py-1 font-semibold"
                            >
                              <AlertCircle className="h-3 w-3" />
                              Paid · {monthYear}
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              disabled={isProcessing || bulkProcessing}
                              onClick={() => handlePaySalary(emp)}
                              className="bg-primary hover:bg-primary/95 text-white font-bold h-7 px-3 text-xs"
                            >
                              {isProcessing ? (
                                <><Loader2 className="h-3 w-3 animate-spin mr-1" />Processing...</>
                              ) : (
                                'Disburse Salary'
                              )}
                            </Button>
                          )}
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
