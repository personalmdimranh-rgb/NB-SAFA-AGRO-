import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Slider from '@/models/Slider';

export async function GET() {
  try {
    await connectToDatabase();
    const banners = await Slider.find({ isActive: true }).sort({ order: 1 });
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
