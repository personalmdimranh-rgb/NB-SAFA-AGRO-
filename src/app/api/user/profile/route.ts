import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';


export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ _id: session.user.id }).select('-password').lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userObj = user as any;
    if (userObj.role === 'farmer') {
      const Farmer = (await import('@/models/Farmer')).default;
      const farmer = await Farmer.findOne({ phone: userObj.phone }).lean();
      if (farmer) {
        userObj.farmer = farmer;
      }
    }

    return NextResponse.json(userObj, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { name, image, phone, address } = data;

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ _id: session.user.id });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const oldPhone = user.phone;
    user.name = name;
    if (image !== undefined) user.image = image;
    if (phone !== undefined) user.phone = phone;

    if (address) {
      if (user.addresses && user.addresses.length > 0) {
        // Update the first address (acting as default)
        user.addresses[0].street = address.street;
        user.addresses[0].division = address.division;
        user.addresses[0].city = address.city;
        user.addresses[0].state = address.state;
        user.addresses[0].zipCode = address.zipCode;
        user.addresses[0].country = address.country;
      } else {
        // Create new address
        user.addresses = [address];
      }
    }

    await user.save();

    // Also update corresponding Farmer profile if it exists
    const Farmer = (await import('@/models/Farmer')).default;
    const farmer = await Farmer.findOne({ phone: oldPhone });
    if (farmer) {
      farmer.name = name;
      if (phone !== undefined) farmer.phone = phone;
      if (address) {
        farmer.address = {
          village: address.street || farmer.address?.village,
          division: address.division || farmer.address?.division,
          thana: address.city || farmer.address?.thana,
          district: address.state || farmer.address?.district
        };
      }
      await farmer.save();
    }

    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({ message: 'Profile updated successfully', user: userObj }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}

