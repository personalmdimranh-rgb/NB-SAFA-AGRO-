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
  if (!session || !['super_admin', 'admin', 'manager', 'staff'].includes((session.user as any).role)) {
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
  if (!session || !['super_admin', 'admin', 'manager', 'staff'].includes((session.user as any).role)) {
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
  const farmers = await Farmer.find().sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(farmers));
}

export async function deleteFarmer(farmerId: string) {
  const session = await auth();
  if (!session || !['super_admin', 'admin', 'manager'].includes((session.user as any).role)) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  const res = await Farmer.findByIdAndDelete(farmerId);
  if (!res) throw new Error('Farmer not found');

  revalidatePath('/admin/farmers');
  return { success: true };
}
