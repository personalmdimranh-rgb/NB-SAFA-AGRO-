import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import LedgerTransaction from '@/models/LedgerTransaction';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (
      !session ||
      !['admin', 'super_admin', 'manager', 'staff', 'director'].includes(userRole)
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const payouts = await LedgerTransaction.find({ category: 'Dividend' })
      .populate('recordedBy', 'name')
      .sort({ date: -1 });

    return NextResponse.json(JSON.parse(JSON.stringify(payouts)));
  } catch (error: any) {
    console.error('Dividend Payouts API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
