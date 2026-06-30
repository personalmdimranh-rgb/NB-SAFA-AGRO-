'use server';

import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Dealer from '@/models/Dealer';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function registerDealer(data: {
  name: string;
  email: string;
  phone: string;
  password?: string;
  shopName: string;
  addressLine?: string;
  division?: string;
  thana?: string;
  district?: string;
  tradeLicense?: string;
  nidNumber?: string;
}) {
  await connectToDatabase();

  // Check if user exists
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('Email already registered.');
  }

  // Create User
  const securePassword = data.password || (crypto.randomBytes(16).toString('hex') + "A1!");
  const passwordHash = await bcrypt.hash(securePassword, 12);
  const user = new User({
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: 'dealer',
    password: passwordHash,
    status: 'inactive', // inactive until approved by admin
    addresses: [{
      street: data.addressLine || '',
      division: data.division || '',
      state: data.district || '',
      city: data.thana || '',
      country: 'Bangladesh',
      isDefault: true
    }]
  });
  await user.save();

  // Create Dealer
  const dealer = new Dealer({
    userId: user._id,
    shopName: data.shopName,
    address: {
      village: data.addressLine || '', // village is stored as addressLine
      thana: data.thana || '',
      district: data.district || '',
    },
    tradeLicense: data.tradeLicense,
    nidNumber: data.nidNumber,
    commissionRate: 0,
    commissionWallet: 0,
    totalSalesCount: 0,
    creditLimit: 0,
    currentDues: 0,
  });
  await dealer.save();

  revalidatePath('/admin/users');
  revalidatePath('/admin/dealers');
  return { success: true, dealer: JSON.parse(JSON.stringify(dealer)) };
}

export async function approveDealer(userId: string) {
  const session = await auth();
  if (!session || (!['super_admin', 'admin'].includes((session.user as any).role) && !(session.user as any).isAdmin)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.status = 'active';
  await user.save();

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateDealerSettings(
  dealerId: string,
  data: {
    commissionRate: number;
    creditLimit: number;
  }
) {
  const session = await auth();
  if (!session || (!['super_admin', 'admin'].includes((session.user as any).role) && !(session.user as any).isAdmin)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const dealer = await Dealer.findByIdAndUpdate(
    dealerId,
    {
      $set: {
        commissionRate: data.commissionRate,
        creditLimit: data.creditLimit,
      },
    },
    { new: true }
  );

  revalidatePath('/admin/users');
  revalidatePath('/admin/dealers');
  return { success: true, dealer: JSON.parse(JSON.stringify(dealer)) };
}

export async function updateDealer(
  dealerId: string,
  data: {
    name: string;
    email: string;
    phone: string;
    shopName: string;
    addressLine?: string;
    division?: string;
    thana?: string;
    district?: string;
    tradeLicense?: string;
    nidNumber?: string;
    commissionRate: number;
    creditLimit: number;
  }
) {
  const session = await auth();
  if (!session || (!['super_admin', 'admin'].includes((session.user as any).role) && !(session.user as any).isAdmin)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const dealer = await Dealer.findById(dealerId);
  if (!dealer) throw new Error('Dealer not found');

  // Check if email already exists on another user
  const existingUser = await User.findOne({ email: data.email, _id: { $ne: dealer.userId } });
  if (existingUser) {
    throw new Error('Email already registered by another user.');
  }

  // Update associated user
  await User.findByIdAndUpdate(dealer.userId, {
    name: data.name,
    email: data.email,
    phone: data.phone,
    addresses: [{
      street: data.addressLine || '',
      division: data.division || '',
      state: data.district || '',
      city: data.thana || '',
      country: 'Bangladesh',
      isDefault: true
    }]
  });

  // Update dealer profile
  dealer.shopName = data.shopName;
  dealer.address = {
    village: data.addressLine || '',
    thana: data.thana || '',
    district: data.district || '',
  };
  dealer.tradeLicense = data.tradeLicense || '';
  dealer.nidNumber = data.nidNumber || '';
  dealer.commissionRate = data.commissionRate;
  dealer.creditLimit = data.creditLimit;

  await dealer.save();

  revalidatePath('/admin/users');
  revalidatePath('/admin/dealers');
  return { success: true, dealer: JSON.parse(JSON.stringify(dealer)) };
}

export async function getDealers() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  const isAdmin = (session.user as any).isAdmin;
  if (!['super_admin', 'admin', 'manager', 'staff'].includes(role) && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  const Sale = (await import('@/models/Sale')).default;
  const dealers = await Dealer.find()
    .populate('userId', 'name email phone status')
    .sort({ createdAt: -1 });

  const dealersWithStats = await Promise.all(
    dealers.map(async (d) => {
      const sales = await Sale.find({ buyerId: d._id, buyerType: 'dealer' });
      const purchaseValue = sales.reduce((acc, s) => acc + s.grandTotal, 0);
      const totalOrders = sales.length;
      return {
        ...d.toObject(),
        totalOrders,
        purchaseValue,
      };
    })
  );

  return JSON.parse(JSON.stringify(dealersWithStats));
}

export async function getDealerProfile(userId: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const userRole = (session.user as any).role;
  const isSelf = (session.user as any).id === userId;
  const isAdmin = ['super_admin', 'admin', 'manager', 'staff'].includes(userRole) || (session.user as any).isAdmin;
  if (!isSelf && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  const dealer = await Dealer.findOne({ userId }).populate('userId', 'name email phone status');
  if (!dealer) return null;
  return JSON.parse(JSON.stringify(dealer));
}

export async function getDealerDashboardSummary(userId: string) {
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
  const dealer = await Dealer.findOne({ userId }).populate('userId', 'name email phone status');
  if (!dealer) throw new Error('Dealer not found');

  const Sale = (await import('@/models/Sale')).default;
  const sales = await Sale.find({ buyerId: dealer._id }).sort({ date: -1 }).limit(10);

  return {
    dealer: JSON.parse(JSON.stringify(dealer)),
    recentSales: JSON.parse(JSON.stringify(sales)),
  };
}

export async function deleteDealer(dealerId: string) {
  const session = await auth();
  if (!session || !['super_admin', 'admin'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  const dealer = await Dealer.findById(dealerId);
  if (!dealer) throw new Error('Dealer not found');

  // Remove the associated user account too
  await User.findByIdAndDelete(dealer.userId);
  await Dealer.findByIdAndDelete(dealerId);

  revalidatePath('/admin/dealers');
  return { success: true };
}
