'use server';

import connectToDatabase from '@/lib/db';
import Farmer from '@/models/Farmer';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createFarmer(data: {
  name: string;
  phone: string;
  addressLine?: string;
  division?: string;
  thana?: string;
  district?: string;
  cattleCount: number;
  creditLimit: number;
}) {
  const session = await auth();
  if (!session || !['super_admin', 'admin', 'staff'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const existingFarmer = await Farmer.findOne({ phone: data.phone });
  if (existingFarmer) {
    throw new Error('Phone number already registered for a farmer.');
  }

  const farmer = new Farmer({
    name: data.name,
    phone: data.phone,
    address: {
      village: data.addressLine || '',
      division: data.division || '',
      thana: data.thana || '',
      district: data.district || '',
    },
    cattleCount: data.cattleCount,
    creditLimit: data.creditLimit,
    purchaseCount: 0,
    totalPurchasedQty: 0,
    currentDues: 0,
  });

  await farmer.save();
  revalidatePath('/admin/farmers');
  return { success: true, farmer: JSON.parse(JSON.stringify(farmer)) };
}

export async function updateFarmer(
  farmerId: string,
  data: {
    name: string;
    phone: string;
    addressLine?: string;
    division?: string;
    thana?: string;
    district?: string;
    cattleCount: number;
    creditLimit: number;
  }
) {
  const session = await auth();
  if (!session || !['super_admin', 'admin', 'staff'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const existingFarmer = await Farmer.findOne({ phone: data.phone, _id: { $ne: farmerId } });
  if (existingFarmer) {
    throw new Error('Phone number already registered for another farmer.');
  }

  const farmer = await Farmer.findById(farmerId);
  if (!farmer) throw new Error('Farmer not found');

  farmer.name = data.name;
  farmer.phone = data.phone;
  farmer.address = {
    village: data.addressLine || '',
    division: data.division || '',
    thana: data.thana || '',
    district: data.district || '',
  };
  farmer.cattleCount = data.cattleCount;
  farmer.creditLimit = data.creditLimit;

  await farmer.save();
  revalidatePath('/admin/farmers');
  return { success: true, farmer: JSON.parse(JSON.stringify(farmer)) };
}

export async function getFarmers() {
  const session = await auth();
  if (!session || !['super_admin', 'admin', 'manager', 'staff'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  const Sale = (await import('@/models/Sale')).default;
  const farmers = await Farmer.find().sort({ createdAt: -1 }).lean();
  
  // Lookup matching User entries by phone number
  const phones = farmers.map(f => f.phone).filter(Boolean);
  const User = (await import('@/models/User')).default;
  const users = await User.find({ phone: { $in: phones } }).select('_id phone').lean();
  const userMap = new Map(users.map(u => [u.phone, u._id.toString()]));

  const enrichedFarmers = await Promise.all(
    farmers.map(async (f) => {
      const sales = await Sale.find({ buyerId: f._id, buyerType: 'farmer' });
      const purchaseValue = sales.reduce((acc, s) => acc + s.grandTotal, 0);
      const totalOrders = sales.length;
      return {
        ...f,
        userId: f.phone ? userMap.get(f.phone) || null : null,
        totalOrders,
        purchaseValue,
      };
    })
  );

  return JSON.parse(JSON.stringify(enrichedFarmers));
}

export async function deleteFarmer(farmerId: string) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  const res = await Farmer.findByIdAndDelete(farmerId);
  if (!res) throw new Error('Farmer not found');

  revalidatePath('/admin/farmers');
  return { success: true };
}

export async function getFarmerDashboardSummary(userId: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const userRole = (session.user as any).role;
  const isSelf = (session.user as any).id === userId;
  const isAdmin = ['super_admin', 'admin', 'manager', 'staff'].includes(userRole);
  if (!isSelf && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  
  const User = (await import('@/models/User')).default;
  let user = await User.findById(userId).lean();
  if (!user && session.user.email) {
    user = await User.findOne({ email: session.user.email }).lean();
  }
  if (!user && session.user.email) {
    const isSuperAdmin = session.user.email === 'imranshuvo101@gmail.com';
    const newUser = new User({
      name: session.user.name || 'Unknown',
      email: session.user.email,
      image: session.user.image || '',
      role: isSuperAdmin ? 'super_admin' : 'farmer',
      status: 'active',
      phone: 'N/A'
    });
    await newUser.save();
    newUser.phone = `G-${newUser._id.toString().slice(-8)}`;
    await newUser.save();
    user = JSON.parse(JSON.stringify(newUser));
  }
  if (!user) throw new Error('User not found');

  let userPhone = (user as any).phone;
  if (!userPhone || userPhone === 'N/A') {
    const uniquePhone = `G-${(user as any)._id.toString().slice(-8)}`;
    await User.findByIdAndUpdate((user as any)._id, { phone: uniquePhone });
    userPhone = uniquePhone;
  }

  let farmer = await Farmer.findOne({ phone: userPhone }).lean();
  if (!farmer && (user.role === 'farmer' || (user as any).role === 'farmer')) {
    const newFarmer = await Farmer.create({
      name: user.name || 'Unknown Farmer',
      phone: userPhone,
      address: {
        village: '',
        division: '',
        thana: '',
        district: ''
      },
      cattleCount: 0,
      purchaseCount: 0,
      totalPurchasedQty: 0,
      creditLimit: 0,
      currentDues: 0
    });
    farmer = JSON.parse(JSON.stringify(newFarmer));
  }

  if (!farmer) return null;

  const Sale = (await import('@/models/Sale')).default;
  const sales = await Sale.find({ buyerId: (farmer as any)._id, buyerType: 'farmer' }).sort({ date: -1 }).limit(10).lean();

  return {
    farmer: JSON.parse(JSON.stringify(farmer)),
    recentSales: JSON.parse(JSON.stringify(sales)),
  };
}
