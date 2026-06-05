import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { productIds } = await req.json();
    if (!Array.isArray(productIds)) {
      return NextResponse.json({ message: 'productIds must be an array' }, { status: 400 });
    }

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    const validProductIds = productIds
      .map((id: any) => (typeof id === 'string' ? id.trim() : ''))
      .filter((id: string) => id !== '' && objectIdRegex.test(id));

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const existingIds = new Set(user.wishlist.map((id: any) => id.toString()));
    let addedCount = 0;

    validProductIds.forEach((id: string) => {
      if (!existingIds.has(id)) {
        user.wishlist.push(id as any);
        existingIds.add(id);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      await user.save();
    }

    return NextResponse.json(user.wishlist.map((id: any) => id.toString()));
  } catch (error) {
    console.error('Error syncing wishlist:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
