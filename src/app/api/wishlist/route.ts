import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import { auth } from '@/auth';

// GET the user's wishlist (populated)
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    // Pre-register Product model in Mongoose context
    const _p = Product;
    const user = await User.findById(session.user.id).populate('wishlist');
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.wishlist || []);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST toggle a product in the wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const index = user.wishlist.findIndex((id: any) => id.toString() === productId);
    if (index === -1) {
      user.wishlist.push(productId as any);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    return NextResponse.json(user.wishlist);
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
