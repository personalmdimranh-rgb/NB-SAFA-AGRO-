'use server';

import connectToDatabase from '@/lib/db';
import Employee from '@/models/Employee';
import LedgerTransaction from '@/models/LedgerTransaction';
import User from '@/models/User';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function registerEmployee(data: {
  name: string;
  phone: string;
  email?: string;
  employeeId: string;
  division?: string;
  district?: string;
  thana?: string;
  address?: string;
  designation: string;
  basic: number;
  allowance: number;
  deductions: number;
  weekend?: string[];
  allowedAbsent?: number;
  absentDeductionRate?: number;
  joiningDate?: string;
}) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const employee = new Employee({
    name: data.name,
    phone: data.phone,
    email: data.email || '',
    employeeId: data.employeeId,
    division: data.division || '',
    district: data.district || '',
    thana: data.thana || '',
    address: data.address || '',
    designation: data.designation,
    salaryStructure: {
      basic: data.basic,
      allowance: data.allowance,
      deductions: data.deductions,
    },
    weekend: data.weekend || ['friday'],
    allowedAbsent: data.allowedAbsent ?? 1,
    absentDeductionRate: data.absentDeductionRate ?? 0,
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
  if (!session || !['super_admin', 'admin', 'staff'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const targetDate = new Date(dateStr);
  targetDate.setUTCHours(0, 0, 0, 0);

  for (const record of records) {
    const employee = await Employee.findById(record.employeeId);
    if (employee) {
      const filtered = (employee.attendanceRecords || []).filter((att) => {
        if (!att.date) return false;
        const attDate = new Date(att.date);
        attDate.setUTCHours(0, 0, 0, 0);
        return attDate.getTime() !== targetDate.getTime();
      });

      employee.attendanceRecords = filtered;
      employee.attendanceRecords.push({
        date: targetDate,
        status: record.status,
      });
      employee.markModified('attendanceRecords');

      await employee.save();
    }
  }

  revalidatePath('/admin/employees');
  return { success: true };
}

export async function logWorkReport(employeeId: string, taskPerformed: string, dateStr?: string) {
  const session = await auth();
  if (!session || !['super_admin', 'admin', 'staff'].includes((session.user as any).role)) {
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
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const dbUser = await User.findById((session.user as any).id);
  if (!dbUser) throw new Error('Logged-in administrator user record not found in database');

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error('Employee not found');

  // --- Duplicate payment guard ---
  if (employee.paidMonths && employee.paidMonths.includes(monthYearStr)) {
    throw new Error(`Salary for ${monthYearStr} has already been disbursed to ${employee.name}.`);
  }

  const { basic, allowance, deductions } = employee.salaryStructure;

  // Calculate attendance deduction
  const [monthName, yearStr] = monthYearStr.split(' ');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIdx = monthNames.indexOf(monthName);
  if (monthIdx === -1) {
    throw new Error('Invalid month name specified');
  }
  const year = parseInt(yearStr);
  if (isNaN(year) || year < 2000 || year > 2100) {
    throw new Error('Invalid year specified');
  }
  const startDate = new Date(Date.UTC(year, monthIdx, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, monthIdx + 1, 0, 23, 59, 59, 999));

  const absentsCount = employee.attendanceRecords.filter((record: any) => {
    const d = new Date(record.date);
    return d >= startDate && d <= endDate && record.status === 'absent';
  }).length;

  let attendanceDeduction = 0;
  const allowed = employee.allowedAbsent ?? 1;
  const rate = employee.absentDeductionRate ?? 0;
  if (absentsCount > allowed) {
    attendanceDeduction = (absentsCount - allowed) * rate;
  }

  const totalDeductions = deductions + attendanceDeduction;
  const netSalary = Math.max(0, basic + allowance - totalDeductions);

  // Record payroll expense
  const ledgerTx = new LedgerTransaction({
    date: new Date(),
    type: 'expense',
    source: 'bank',
    category: 'Salary',
    amount: netSalary,
    description: `Salary paid to ${employee.name} (${employee.designation}) for ${monthYearStr}. Basic: ${basic}, Allowance: ${allowance}, Deductions: ${totalDeductions} (Base: ${deductions}, Attendance Penalty: ${attendanceDeduction} for ${absentsCount} total absents, allowed: ${allowed}).`,
    recordedBy: dbUser._id,
  });

  await ledgerTx.save();

  // Mark this month as paid
  employee.paidMonths = [...(employee.paidMonths || []), monthYearStr];
  employee.markModified('paidMonths');
  await employee.save();

  revalidatePath('/admin/employees');
  revalidatePath('/admin/accounts');

  return { success: true, amount: netSalary };
}

export async function processBulkPayroll(employeeIds: string[], monthYearStr: string) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const dbUser = await User.findById((session.user as any).id);
  if (!dbUser) throw new Error('Logged-in administrator user record not found in database');

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [monthName, yearStr] = monthYearStr.split(' ');
  const monthIdx = monthNames.indexOf(monthName);
  if (monthIdx === -1) throw new Error('Invalid month name specified');
  const year = parseInt(yearStr);
  if (isNaN(year) || year < 2000 || year > 2100) throw new Error('Invalid year specified');

  const startDate = new Date(Date.UTC(year, monthIdx, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, monthIdx + 1, 0, 23, 59, 59, 999));

  const results: { employeeId: string; name: string; amount: number; skipped?: boolean; reason?: string }[] = [];

  for (const employeeId of employeeIds) {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      results.push({ employeeId, name: 'Unknown', amount: 0, skipped: true, reason: 'Employee not found' });
      continue;
    }

    // Skip already paid
    if (employee.paidMonths && employee.paidMonths.includes(monthYearStr)) {
      results.push({ employeeId, name: employee.name, amount: 0, skipped: true, reason: 'Already paid this month' });
      continue;
    }

    const { basic, allowance, deductions } = employee.salaryStructure;

    const absentsCount = employee.attendanceRecords.filter((record: any) => {
      const d = new Date(record.date);
      return d >= startDate && d <= endDate && record.status === 'absent';
    }).length;

    let attendanceDeduction = 0;
    const allowed = employee.allowedAbsent ?? 1;
    const rate = employee.absentDeductionRate ?? 0;
    if (absentsCount > allowed) {
      attendanceDeduction = (absentsCount - allowed) * rate;
    }

    const totalDeductions = deductions + attendanceDeduction;
    const netSalary = Math.max(0, basic + allowance - totalDeductions);

    const ledgerTx = new LedgerTransaction({
      date: new Date(),
      type: 'expense',
      source: 'bank',
      category: 'Salary',
      amount: netSalary,
      description: `Salary paid to ${employee.name} (${employee.designation}) for ${monthYearStr}. Basic: ${basic}, Allowance: ${allowance}, Deductions: ${totalDeductions} (Base: ${deductions}, Attendance Penalty: ${attendanceDeduction} for ${absentsCount} total absents, allowed: ${allowed}).`,
      recordedBy: dbUser._id,
    });

    await ledgerTx.save();

    employee.paidMonths = [...(employee.paidMonths || []), monthYearStr];
    employee.markModified('paidMonths');
    await employee.save();

    results.push({ employeeId, name: employee.name, amount: netSalary });
  }

  revalidatePath('/admin/employees');
  revalidatePath('/admin/accounts');

  return { success: true, results };
}


export async function getEmployees() {
  await connectToDatabase();
  const employees = await Employee.find().sort({ joiningDate: -1 }).lean();
  
  // Lookup corresponding User entries by email/phone
  const emails = employees.map(emp => emp.email).filter(Boolean);
  const phones = employees.map(emp => emp.phone).filter(Boolean);
  
  const users = await User.find({
    $or: [
      { email: { $in: emails } },
      { phone: { $in: phones } }
    ]
  }).select('_id email phone').lean();
  
  const userMapByEmail = new Map(users.filter(u => u.email).map(u => [u.email, u._id.toString()]));
  const userMapByPhone = new Map(users.filter(u => u.phone).map(u => [u.phone, u._id.toString()]));
  
  const enrichedEmployees = employees.map(emp => {
    let userId = null;
    if (emp.email && userMapByEmail.has(emp.email)) {
      userId = userMapByEmail.get(emp.email);
    } else if (emp.phone && userMapByPhone.has(emp.phone)) {
      userId = userMapByPhone.get(emp.phone);
    }
    return {
      ...emp,
      userId
    };
  });

  return JSON.parse(JSON.stringify(enrichedEmployees));
}

export async function getAttendanceByDate(dateStr: string) {
  await connectToDatabase();
  const targetDate = new Date(dateStr);
  targetDate.setUTCHours(0, 0, 0, 0);

  const employees = await Employee.find().sort({ joiningDate: -1 });

  // Lookup matching User entries by email/phone for all employees
  const emails = employees.map(emp => emp.email).filter(Boolean);
  const phones = employees.map(emp => emp.phone).filter(Boolean);
  const users = await User.find({
    $or: [
      { email: { $in: emails } },
      { phone: { $in: phones } }
    ]
  }).select('_id email phone').lean();
  
  const userMapByEmail = new Map(users.filter(u => u.email).map(u => [u.email, u._id.toString()]));
  const userMapByPhone = new Map(users.filter(u => u.phone).map(u => [u.phone, u._id.toString()]));

  const report = await Promise.all(
    employees.map(async (emp) => {
      let record = emp.attendanceRecords.find((att: any) => {
        const attDate = new Date(att.date);
        attDate.setUTCHours(0, 0, 0, 0);
        return attDate.getTime() === targetDate.getTime();
      });

      if (!record) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[targetDate.getUTCDay()];
        const isWeekend = (emp.weekend || ['friday']).includes(dayOfWeek);
        const defaultStatus = isWeekend ? 'leave' : 'present';
        record = { date: targetDate, status: defaultStatus };
      }

      let userId = null;
      if (emp.email && userMapByEmail.has(emp.email)) {
        userId = userMapByEmail.get(emp.email);
      } else if (emp.phone && userMapByPhone.has(emp.phone)) {
        userId = userMapByPhone.get(emp.phone);
      }

      return {
        _id: emp._id.toString(),
        name: emp.name,
        phone: emp.phone,
        designation: emp.designation,
        status: record.status,
        userId,
      };
    })
  );

  return JSON.parse(JSON.stringify(report));
}

export async function updateEmployee(
  employeeId: string,
  data: {
    name: string;
    phone: string;
    email?: string;
    employeeId: string;
    division?: string;
    district?: string;
    thana?: string;
    address?: string;
    designation: string;
    basic: number;
    allowance: number;
    deductions: number;
    weekend?: string[];
    allowedAbsent?: number;
    absentDeductionRate?: number;
    joiningDate?: string;
  }
) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error('Employee not found');

  employee.name = data.name;
  employee.phone = data.phone;
  employee.email = data.email || '';
  employee.employeeId = data.employeeId;
  employee.division = data.division || '';
  employee.district = data.district || '';
  employee.thana = data.thana || '';
  employee.address = data.address || '';
  employee.designation = data.designation;
  employee.salaryStructure = {
    basic: data.basic,
    allowance: data.allowance,
    deductions: data.deductions,
  };
  employee.weekend = data.weekend || ['friday'];
  employee.allowedAbsent = data.allowedAbsent ?? 1;
  employee.absentDeductionRate = data.absentDeductionRate ?? 0;
  if (data.joiningDate) {
    employee.joiningDate = new Date(data.joiningDate);
  }

  await employee.save();
  revalidatePath('/admin/employees');
  return { success: true, employee: JSON.parse(JSON.stringify(employee)) };
}

export async function deleteEmployee(employeeId: string) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  const res = await Employee.findByIdAndDelete(employeeId);
  if (!res) throw new Error('Employee not found');

  revalidatePath('/admin/employees');
  return { success: true };
}

export async function getLoggedEmployeeDashboardData() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const userEmail = session.user.email;
  if (!userEmail) return null;

  // Find employee by email
  const employee = await Employee.findOne({ email: userEmail });
  if (!employee) return null;

  // Find all LedgerTransactions where category is 'Salary' and description matches this employee's name
  const escapedName = employee.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const transactions = await LedgerTransaction.find({
    category: 'Salary',
    description: { $regex: new RegExp(`Salary paid to ${escapedName}`, 'i') }
  }).sort({ date: -1 });

  return {
    employee: JSON.parse(JSON.stringify(employee)),
    salaryHistory: JSON.parse(JSON.stringify(transactions))
  };
}
