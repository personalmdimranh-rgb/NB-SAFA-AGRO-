'use server';

import connectToDatabase from '@/lib/db';
import LedgerTransaction from '@/models/LedgerTransaction';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createTransaction(data: {
  type: 'income' | 'expense' | 'transfer';
  source: 'cash' | 'bank';
  bankDetails?: {
    bankName?: string;
    accountNo?: string;
  };
  category: string;
  amount: number;
  description?: string;
  voucherImage?: string;
  date?: string;
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  const isAdmin = (session.user as any).isAdmin;
  if (!['super_admin', 'admin', 'staff'].includes(role) && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();

  const transaction = new LedgerTransaction({
    ...data,
    date: data.date ? new Date(data.date) : new Date(),
    recordedBy: (session.user as any).id,
  });

  await transaction.save();
  revalidatePath('/admin/accounts');
  return { success: true, transaction: JSON.parse(JSON.stringify(transaction)) };
}

export async function getTransactions() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  const isAdmin = (session.user as any).isAdmin;
  if (!['super_admin', 'admin', 'manager', 'staff'].includes(role) && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  const transactions = await LedgerTransaction.find()
    .populate('recordedBy', 'name email')
    .sort({ date: -1, createdAt: -1 });
  return JSON.parse(JSON.stringify(transactions));
}

export async function getLedgerBalances() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  const isAdmin = (session.user as any).isAdmin;
  if (!['super_admin', 'admin', 'manager', 'staff'].includes(role) && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  const transactions = await LedgerTransaction.find();

  let cashBalance = 0;
  let bankBalance = 0;

  transactions.forEach((tx) => {
    if ((tx as any).status === 'pending') return;
    if (tx.category === 'Retained Earnings') return;
    if (tx.type === 'income') {
      if (tx.source === 'cash') cashBalance += tx.amount;
      if (tx.source === 'bank') bankBalance += tx.amount;
    } else if (tx.type === 'expense') {
      if (tx.source === 'cash') cashBalance -= tx.amount;
      if (tx.source === 'bank') bankBalance -= tx.amount;
    } else if (tx.type === 'transfer') {
      if (tx.source === 'cash') {
        // Cash to Bank
        cashBalance -= tx.amount;
        bankBalance += tx.amount;
      } else if (tx.source === 'bank') {
        // Bank to Cash
        bankBalance -= tx.amount;
        cashBalance += tx.amount;
      }
    }
  });

  return { cashBalance, bankBalance, totalBalance: cashBalance + bankBalance };
}

export async function getProfitLossReport() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  const isAdmin = (session.user as any).isAdmin;
  if (!['super_admin', 'admin', 'manager', 'staff'].includes(role) && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  const transactions = await LedgerTransaction.find().sort({ date: 1 });

  let totalIncome = 0;
  let totalExpense = 0;
  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};
  const monthlyData: Record<string, { income: number; expense: number; profit: number }> = {};

  transactions.forEach((tx) => {
    if ((tx as any).status === 'pending') return;
    if (tx.category === 'Retained Earnings') return;
    const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0, profit: 0 };
    }

    if (tx.type === 'income') {
      totalIncome += tx.amount;
      incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
      monthlyData[month].income += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
      monthlyData[month].expense += tx.amount;
    }
    
    monthlyData[month].profit = monthlyData[month].income - monthlyData[month].expense;
  });

  const chartData = Object.entries(monthlyData).map(([name, data]) => ({
    name,
    income: data.income,
    expense: data.expense,
    profit: data.profit,
  }));

  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    incomeByCategory: Object.entries(incomeByCategory).map(([category, amount]) => ({ category, amount })),
    expenseByCategory: Object.entries(expenseByCategory).map(([category, amount]) => ({ category, amount })),
    chartData,
  };
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  const isAdmin = (session.user as any).isAdmin;
  if (!['super_admin', 'admin'].includes(role) && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  const res = await LedgerTransaction.findByIdAndDelete(id);
  if (!res) {
    throw new Error('Transaction not found');
  }

  revalidatePath('/admin/accounts');
  return { success: true };
}

export async function updateTransaction(
  id: string,
  data: {
    type: 'income' | 'expense' | 'transfer';
    source: 'cash' | 'bank';
    bankDetails?: {
      bankName?: string;
      accountNo?: string;
    };
    category: string;
    amount: number;
    description?: string;
    date?: string;
  }
) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  const isAdmin = (session.user as any).isAdmin;
  if (!['super_admin', 'admin'].includes(role) && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  const tx = await LedgerTransaction.findById(id);
  if (!tx) {
    throw new Error('Transaction not found');
  }

  tx.type = data.type;
  tx.source = data.source;
  tx.category = data.category;
  tx.amount = data.amount;
  tx.description = data.description;
  if (data.date) {
    tx.date = new Date(data.date);
  }
  if (data.source === 'bank') {
    tx.bankDetails = data.bankDetails;
  } else {
    tx.bankDetails = undefined;
  }

  await tx.save();

  revalidatePath('/admin/accounts');
  return { success: true, transaction: JSON.parse(JSON.stringify(tx)) };
}
