'use server';

import connectToDatabase from '@/lib/db';
import Investment from '@/models/Investment';
import User from '@/models/User';
import LedgerTransaction from '@/models/LedgerTransaction';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function logInvestment(data: {
  directorId: string;
  investmentAmount: number;
  equitySharePercentage: number;
  paymentMethod?: string;
  notes?: string;
  date?: string;
}) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const dbUser = await User.findOne({ email: session.user?.email });
  if (!dbUser) throw new Error('Logged-in administrator user record not found in database');

  const investment = new Investment({
    ...data,
    date: data.date ? new Date(data.date) : new Date(),
  });

  await investment.save();

  // Create Ledger Transaction for Investment
  const ledgerTx = new LedgerTransaction({
    date: data.date ? new Date(data.date) : new Date(),
    type: 'income',
    source: data.paymentMethod && ['cash'].includes(data.paymentMethod) ? 'cash' : 'bank',
    category: 'Investment',
    amount: data.investmentAmount,
    description: `Investment from director ID: ${data.directorId}. Notes: ${data.notes || ''}`,
    recordedBy: dbUser._id,
  });
  await ledgerTx.save();

  revalidatePath('/admin/director');
  revalidatePath('/admin/accounts');

  return { success: true, investment: JSON.parse(JSON.stringify(investment)) };
}

export async function releaseDividends(declaredProfit: number, payoutPercentage: number) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const dbUser = await User.findOne({ email: session.user?.email });
  if (!dbUser) throw new Error('Logged-in administrator user record not found in database');

  // Retrieve directors
  const directors = await User.find({ role: 'director' });
  if (directors.length === 0) {
    throw new Error('No directors found in the system to allocate dividends.');
  }

  const investments = await Investment.find();
  let totalWeightedInvestmentsSum = 0;
  const investedMap: Record<string, number> = {};
  const weightedInvestedMap: Record<string, number> = {};

  // Initialize all directors with 0 investment
  directors.forEach((d) => {
    investedMap[d._id.toString()] = 0;
    weightedInvestedMap[d._id.toString()] = 0;
  });

  const now = Date.now();

  // Calculate sum of investments and total investment sum
  investments.forEach((inv) => {
    const dId = inv.directorId.toString();
    const invDate = inv.date ? new Date(inv.date).getTime() : now;
    const diffTime = Math.max(0, now - invDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    // Multiplier logic:
    // - Below 6 months (180 days): 0% multiplier.
    // - 12 months (360 days) or more: 100% multiplier (1.0).
    // - Between 6 and 12 months: (diffDays - 180) / 180.
    let multiplier = 0;
    if (diffDays >= 360) {
      multiplier = 1.0;
    } else if (diffDays >= 180) {
      multiplier = (diffDays - 180) / 180;
    }

    const weighted = inv.investmentAmount * multiplier;
    totalWeightedInvestmentsSum += weighted;
    
    if (dId in investedMap) {
      investedMap[dId] += inv.investmentAmount;
      weightedInvestedMap[dId] += weighted;
    }
  });

  const targetPayoutPool = (declaredProfit * payoutPercentage) / 100;
  const payouts = [];
  let totalActualPayout = 0;

  for (const director of directors) {
    const invested = investedMap[director._id.toString()] || 0;
    const weightedInvested = weightedInvestedMap[director._id.toString()] || 0;
    if (weightedInvested > 0 && totalWeightedInvestmentsSum > 0) {
      const equity = (weightedInvested / totalWeightedInvestmentsSum) * 100;
      const payoutAmount = (targetPayoutPool * equity) / 100;
      if (payoutAmount > 0) {
        const ledgerTx = new LedgerTransaction({
          date: new Date(),
          type: 'expense',
          source: 'bank',
          status: 'pending',
          category: 'Dividend',
          amount: payoutAmount,
          description: `Dividend payout to director ${director.name} (${equity.toFixed(2)}% equity share based on time-weighted investment of ৳${invested.toLocaleString()})`,
          recordedBy: dbUser._id,
        });
        await ledgerTx.save();
        payouts.push({ directorName: director.name, amount: payoutAmount, equity: parseFloat(equity.toFixed(2)) });
        totalActualPayout += payoutAmount;
      }
    }
  }

  // The retained amount is the declared profit pool minus what actually got allocated to payouts
  const retainedAmount = declaredProfit - totalActualPayout;

  if (retainedAmount > 0) {
    const retainedTx = new LedgerTransaction({
      date: new Date(),
      type: 'transfer',
      source: 'bank',
      status: 'released',
      category: 'Retained Earnings',
      amount: retainedAmount,
      description: `Retained Earnings reservation from declared profit pool of ৳${declaredProfit.toLocaleString()} BDT (Payout percentage: ${payoutPercentage}%)`,
      recordedBy: dbUser._id,
    });
    await retainedTx.save();
  }

  revalidatePath('/admin/director');
  revalidatePath('/admin/accounts');

  return { success: true, payouts, retainedAmount };
}

export async function getDirectorSummary() {
  await connectToDatabase();
  const investments = await Investment.find().populate('directorId', 'name email phone');
  const directors = await User.find({ role: 'director' });

  // Compile totals
  let totalInvestmentsSum = 0;
  let totalWeightedInvestmentsSum = 0;
  const directorEquity: Record<string, { name: string; email: string; phone: string; invested: number; weightedInvested: number; equity: number }> = {};

  directors.forEach((d) => {
    directorEquity[d._id.toString()] = {
      name: d.name,
      email: d.email,
      phone: d.phone || '',
      invested: 0,
      weightedInvested: 0,
      equity: 0,
    };
  });

  const now = Date.now();

  investments.forEach((inv) => {
    const dId = inv.directorId._id ? inv.directorId._id.toString() : inv.directorId.toString();
    totalInvestmentsSum += inv.investmentAmount;

    // Calculate days active
    const invDate = inv.date ? new Date(inv.date).getTime() : now;
    const diffTime = Math.max(0, now - invDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    // Multiplier logic:
    // - Below 6 months (180 days): 0% multiplier.
    // - 12 months (360 days) or more: 100% multiplier (1.0).
    // - Between 6 and 12 months: (diffDays - 180) / 180.
    let multiplier = 0;
    if (diffDays >= 360) {
      multiplier = 1.0;
    } else if (diffDays >= 180) {
      multiplier = (diffDays - 180) / 180;
    }

    const weighted = inv.investmentAmount * multiplier;
    totalWeightedInvestmentsSum += weighted;

    if (directorEquity[dId]) {
      directorEquity[dId].invested += inv.investmentAmount;
      directorEquity[dId].weightedInvested += weighted;
    }
  });

  // Calculate dynamic equity percentage based on weighted investment amount
  Object.keys(directorEquity).forEach((dId) => {
    if (totalWeightedInvestmentsSum > 0) {
      directorEquity[dId].equity = (directorEquity[dId].weightedInvested / totalWeightedInvestmentsSum) * 100;
    } else {
      directorEquity[dId].equity = 0;
    }
  });

  // Calculate Retained Earnings and Profits from Ledger
  const transactions = await LedgerTransaction.find();
  let totalIncome = 0;
  let totalOperatingExpense = 0;
  let totalDividends = 0;
  let totalRetainedEarningsDeclarations = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      if (tx.category === 'Dividend') {
        totalDividends += tx.amount;
      } else {
        totalOperatingExpense += tx.amount;
      }
    } else if (tx.type === 'transfer' && tx.category === 'Retained Earnings') {
      totalRetainedEarningsDeclarations += tx.amount;
    }
  });

  const profitBeforeDividends = totalIncome - totalOperatingExpense;
  const retainedEarnings = profitBeforeDividends - totalDividends + totalRetainedEarningsDeclarations;

  return {
    totalInvestmentsSum,
    directorDetails: Object.values(directorEquity),
    profitBeforeDividends,
    totalDividends,
    retainedEarnings,
  };
}

export async function getInvestments() {
  await connectToDatabase();
  const investments = await Investment.find().populate('directorId', 'name email phone').sort({ date: -1 });
  return JSON.parse(JSON.stringify(investments));
}

export async function createResolution(
  title: string,
  content: string,
  fileUrl?: string,
  meetingDate?: string,
  agenda?: string,
  attendees?: string
) {
  const session = await auth();
  if (!session || !['super_admin', 'admin', 'director', 'manager'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const dbUser = await User.findOne({ email: session.user?.email });
  if (!dbUser) throw new Error('Logged-in administrator user record not found in database');

  const resolution = new (await import('@/models/Resolution')).default({
    title,
    content,
    fileUrl,
    meetingDate: meetingDate ? new Date(meetingDate) : undefined,
    agenda,
    attendees,
    recordedBy: dbUser._id,
  });

  await resolution.save();
  revalidatePath('/admin/director');
  return { success: true, resolution: JSON.parse(JSON.stringify(resolution)) };
}

export async function getResolutions() {
  await connectToDatabase();
  const resolutions = await (await import('@/models/Resolution')).default.find()
    .populate('recordedBy', 'name email')
    .sort({ date: -1 });
  return JSON.parse(JSON.stringify(resolutions));
}

export async function getDividendPayouts() {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  const payouts = await LedgerTransaction.find({ category: 'Dividend' })
    .populate('recordedBy', 'name')
    .sort({ date: -1 });
  return JSON.parse(JSON.stringify(payouts));
}

export async function approveDividendPayout(transactionId: string) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const tx = await LedgerTransaction.findById(transactionId);
  if (!tx) throw new Error('Transaction not found');
  if (tx.category !== 'Dividend') throw new Error('Invalid transaction category');

  tx.status = 'released';
  await tx.save();

  revalidatePath('/admin/director');
  revalidatePath('/admin/accounts');

  return { success: true };
}

export async function getPersonalDirectorDashboardData() {
  const session = await auth();
  if (!session || !['director', 'super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const dbUser = await User.findOne({ email: session.user?.email });
  if (!dbUser) throw new Error('User not found');

  const directorId = dbUser._id;

  // 1. Fetch investments
  const investments = await Investment.find({ directorId }).sort({ date: -1 });

  // Calculate total investment
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);

  // 2. Fetch dividend payouts from LedgerTransaction (we filter in memory based on description)
  const allDividends = await LedgerTransaction.find({ category: 'Dividend' }).sort({ date: -1 });

  const personalDividends = allDividends.filter(tx => {
    return tx.description && tx.description.includes(`to director ${dbUser.name} `);
  });

  const dividendReceived = personalDividends
    .filter(tx => tx.status === 'released')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const dividendPending = personalDividends
    .filter(tx => tx.status === 'pending')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return {
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    joiningDate: dbUser.createdAt,
    totalInvestment,
    investments: JSON.parse(JSON.stringify(investments)),
    dividends: JSON.parse(JSON.stringify(personalDividends)),
    dividendReceived,
    dividendPending
  };
}
