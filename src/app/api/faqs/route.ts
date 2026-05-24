import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FAQ from '@/models/FAQ';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const faqs = await FAQ.find({ isActive: { $ne: false } }).sort({ order: 1 });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Fetch Public FAQs Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
