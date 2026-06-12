import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/auth';

// POST sync the user's cart
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { cartItems } = await req.json();

    if (!Array.isArray(cartItems)) {
      return NextResponse.json({ message: 'Invalid cart items format' }, { status: 400 });
    }

    // Validate cart items before proceeding
    for (const item of cartItems) {
      if (!item || typeof item !== 'object') {
        return NextResponse.json({ message: 'Invalid cart item structure' }, { status: 400 });
      }
      if (typeof item.productId !== 'string' || !item.productId.trim()) {
        return NextResponse.json({ message: 'Each cart item must have a valid string productId' }, { status: 400 });
      }
      if (typeof item.name !== 'string' || !item.name.trim()) {
        return NextResponse.json({ message: 'Each cart item must have a valid string name' }, { status: 400 });
      }
      if (typeof item.price !== 'number' || isNaN(item.price) || item.price < 0) {
        return NextResponse.json({ message: 'Each cart item must have a valid price (number >= 0)' }, { status: 400 });
      }
      if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ message: 'Each cart item must have a valid quantity (integer > 0)' }, { status: 400 });
      }
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Format items to match UserSchema cart subdocument
    user.cart = cartItems.map((item: any) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || '',
      color: item.color || '',
      size: item.size || ''
    }));

    await user.save();
    return NextResponse.json(user.cart, { status: 200 });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
