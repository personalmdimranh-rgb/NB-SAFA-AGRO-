'use server';

import connectToDatabase from '@/lib/db';
import Employee from '@/models/Employee';
import LedgerTransaction from '@/models/LedgerTransaction';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function registerEmployee(data: {
  name: string;
  phone: string;
  address?: string;
  designation: string;
  basic: number;
  allowance: number;
  deductions: number;
  joiningDate?: string;
}) {
  const session = await auth();
  if (!session || !['super_admin', 'admin', 'manager'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const employee = new Employee({
    name: data.name,
    phone: data.phone,
    address: data.address,
    designation: data.designation,
    salaryStructure: {
      basic: data.basic,
      allowance: data.allowance,
      deductions: data.deductions,
    },
    joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
    attendanceRecords: [],
    workReports: [],
  });

  await employee.save();
  revalidatePath('/admin/employees');
  return { success: true, employee: JSON.parse(JSON.stringify(employee)) };
}

export async function logAttendance(records: { employeeId: string; status: 'present' | 'absent' | 'leave' }[], dateStr: string) {
  const session = await auth();
  if (!session || !['super_admin', 'admin', 'manager', 'staff'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const targetDate = new Date(dateStr);
  // Normalize date to start of day
  targetDate.setUTCHours(0, 0, 0, 0);

  for (const record of records) {
    const employee = await Employee.findById(record.employeeId);
    if (employee) {
      // Filter out existing record for the same day
      employee.attendanceRecords = employee.attendanceRecords.filter((att) => {
        const attDate = new Date(att.date);
        attDate.setUTCHours(0, 0, 0, 0);
        return attDate.getTime() !== targetDate.getTime();
      });

      employee.attendanceRecords.push({
        date: targetDate,
        status: record.status,
      });

      await employee.save();
    }
  }

  revalidatePath('/admin/employees');
  return { success: true };
}

export async function logWorkReport(employeeId: string, taskPerformed: string, dateStr?: string) {
  const session = await auth();
  if (!session || !['super_admin', 'admin', 'manager', 'staff'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error('Employee not found');

  employee.workReports.push({
    date: dateStr ? new Date(dateStr) : new Date(),
    taskPerformed,
  });

  await employee.save();
  revalidatePath('/admin/employees');
  return { success: true };
}

export async function processPayroll(employeeId: string, monthYearStr: string) {
  const session = await auth();
  if (!session || !['super_admin', 'admin', 'manager'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error('Employee not found');

  const { basic, allowance, deductions } = employee.salaryStructure;
  const netSalary = basic + allowance - deductions;

  // Record payroll expense
  const ledgerTx = new LedgerTransaction({
    date: new Date(),
    type: 'expense',
    source: 'bank', // salaries paid from bank
    category: 'Salary',
    amount: netSalary,
    description: `Salary paid to ${employee.name} (${employee.designation}) for ${monthYearStr}. Basic: ${basic}, Allowance: ${allowance}, Deductions: ${deductions}.`,
    recordedBy: (session.user as any).id,
  });

  await ledgerTx.save();

  revalidatePath('/admin/employees');
  revalidatePath('/admin/accounts');

  return { success: true, amount: netSalary };
}

export async function getEmployees() {
  await connectToDatabase();
  const employees = await Employee.find().sort({ joiningDate: -1 });
  return JSON.parse(JSON.stringify(employees));
}
