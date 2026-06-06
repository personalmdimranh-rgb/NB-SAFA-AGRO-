import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import Investment from '@/models/Investment';
import User from '@/models/User';
import LedgerTransaction from '@/models/LedgerTransaction';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (
      !session ||
      !['admin', 'super_admin', 'manager', 'director'].includes(userRole)
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const investments = await Investment.find().populate('directorId', 'name email phone');
    const directors = await User.find({ role: 'director' });

    // Compile totals
    let totalInvestmentsSum = 0;
    let totalWeightedInvestmentsSum = 0;
    const directorEquity: Record<
      string,
      { name: string; email: string; phone: string; invested: number; weightedInvested: number; equity: number }
    > = {};

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
      const dId = inv.directorId?._id
        ? inv.directorId._id.toString()
        : inv.directorId?.toString();
      if (!dId) return;

      totalInvestmentsSum += inv.investmentAmount;

      const invDate = inv.date ? new Date(inv.date).getTime() : now;
      const diffTime = Math.max(0, now - invDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

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

    // Calculate dynamic equity percentage
    Object.keys(directorEquity).forEach((dId) => {
      if (totalWeightedInvestmentsSum > 0) {
        directorEquity[dId].equity =
          (directorEquity[dId].weightedInvested / totalWeightedInvestmentsSum) * 100;
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
    const retainedEarnings =
      profitBeforeDividends - totalDividends + totalRetainedEarningsDeclarations;

    return NextResponse.json({
      totalInvestmentsSum,
      directorDetails: Object.values(directorEquity),
      profitBeforeDividends,
      totalDividends,
      retainedEarnings,
      totalDirectors: directors.length,
    });
  } catch (error: any) {
    console.error('Director Summary API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
