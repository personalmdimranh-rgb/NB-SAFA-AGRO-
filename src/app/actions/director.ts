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
  if (!session || !['super_admin', 'admin', 'manager'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

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
    recordedBy: (session.user as any).id,
  });
  await ledgerTx.save();

  revalidatePath('/admin/director');
  revalidatePath('/admin/accounts');

  return { success: true, investment: JSON.parse(JSON.stringify(investment)) };
}

export async function releaseDividends(totalDividendPool: number) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  // Retrieve directors and their equity share from active investments
  const directors = await User.find({ role: 'director' });
  if (directors.length === 0) {
    throw new Error('No directors found in the system to allocate dividends.');
  }

  // Calculate total equity registered to see if we distribute relative to total equity
  const investments = await Investment.find();
  const equityMap: Record<string, number> = {};

  // Initialize all directors with 0 equity
  directors.forEach((d) => {
    equityMap[d._id.toString()] = 0;
  });

  // Calculate sum of equity percentages
  investments.forEach((inv) => {
    const dId = inv.directorId.toString();
    if (dId in equityMap) {
      equityMap[dId] += inv.equitySharePercentage;
    }
  });

  // Create expense transaction for each director's dividend
  const payouts = [];
  for (const director of directors) {
    const equity = equityMap[director._id.toString()] || 0;
    if (equity > 0) {
      const payoutAmount = (totalDividendPool * equity) / 100;
      if (payoutAmount > 0) {
        const ledgerTx = new LedgerTransaction({
          date: new Date(),
          type: 'expense',
          source: 'bank',
          category: 'Dividend',
          amount: payoutAmount,
          description: `Dividend payout to director ${director.name} (${equity}% equity share)`,
          recordedBy: (session.user as any).id,
        });
        await ledgerTx.save();
        payouts.push({ directorName: director.name, amount: payoutAmount, equity });
      }
    }
  }

  revalidatePath('/admin/director');
  revalidatePath('/admin/accounts');

  return { success: true, payouts };
}

export async function getDirectorSummary() {
  await connectToDatabase();
  const investments = await Investment.find().populate('directorId', 'name email phone');
  const directors = await User.find({ role: 'director' });

  // Compile totals
  let totalInvestmentsSum = 0;
  const directorEquity: Record<string, { name: string; email: string; phone: string; invested: number; equity: number }> = {};

  directors.forEach((d) => {
    directorEquity[d._id.toString()] = {
      name: d.name,
      email: d.email,
      phone: d.phone || '',
      invested: 0,
      equity: 0,
    };
  });

  investments.forEach((inv) => {
    const dId = inv.directorId._id ? inv.directorId._id.toString() : inv.directorId.toString();
    totalInvestmentsSum += inv.investmentAmount;
    if (directorEquity[dId]) {
      directorEquity[dId].invested += inv.investmentAmount;
      directorEquity[dId].equity += inv.equitySharePercentage;
    }
  });

  return {
    totalInvestmentsSum,
    directorDetails: Object.values(directorEquity),
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
  if (!session || !['super_admin', 'admin', 'director'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  const resolution = new (await import('@/models/Resolution')).default({
    title,
    content,
    fileUrl,
    meetingDate: meetingDate ? new Date(meetingDate) : undefined,
    agenda,
    attendees,
    recordedBy: (session.user as any).id,
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
