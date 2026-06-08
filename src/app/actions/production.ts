'use server';

import connectToDatabase from '@/lib/db';
import ProductionBatch from '@/models/ProductionBatch';
import LedgerTransaction from '@/models/LedgerTransaction';
import User from '@/models/User';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function logProductionBatch(data: {
  rawMaterialsUsed: {
    materialName: string;
    quantity: number; // in kg/ton
    cost: number;
  }[];
  totalProducedQty: number; // in bags/ton
  warehouseLocation?: string;
  productionDate?: string;
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  if (!['super_admin', 'admin', 'staff'].includes(role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();

  const dbUser = await User.findOne({ email: session.user?.email });
  if (!dbUser) throw new Error('Logged-in administrator user record not found in database');

  // Calculate costs
  const totalCost = data.rawMaterialsUsed.reduce((acc, rm) => acc + rm.cost, 0);
  const productionCostPerUnit = data.totalProducedQty > 0 ? totalCost / data.totalProducedQty : 0;

  // Generate unique batchNumber avoiding collision risk
  let batchNumber = '';
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 10) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    batchNumber = `BATCH-${timestamp}-${random}`;
    const existing = await ProductionBatch.findOne({ batchNumber });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  if (!isUnique) {
    throw new Error('Failed to generate a unique batch number. Please try again.');
  }

  const batch = new ProductionBatch({
    batchNumber,
    rawMaterialsUsed: data.rawMaterialsUsed,
    totalProducedQty: data.totalProducedQty,
    productionCostPerUnit,
    productionDate: data.productionDate ? new Date(data.productionDate) : new Date(),
    warehouseLocation: data.warehouseLocation,
  });

  await batch.save();

  // Log raw materials cost as expense in accounts
  if (totalCost > 0) {
    const expenseTx = new LedgerTransaction({
      date: data.productionDate ? new Date(data.productionDate) : new Date(),
      type: 'expense',
      source: 'cash', // Default to cash for raw materials
      category: 'Raw Materials',
      amount: totalCost,
      description: `Raw materials for silage production batch ${batchNumber}`,
      recordedBy: dbUser._id,
    });
    await expenseTx.save();
  }

  revalidatePath('/admin/inventory');
  revalidatePath('/admin/accounts');

  return { success: true, batch: JSON.parse(JSON.stringify(batch)) };
}

export async function getProductionBatches() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  if (!['super_admin', 'admin', 'manager', 'staff'].includes(role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  const batches = await ProductionBatch.find().sort({ productionDate: -1 });
  return JSON.parse(JSON.stringify(batches));
}

export async function getProductionSummary() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  if (!['super_admin', 'admin', 'manager', 'staff'].includes(role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  const batches = await ProductionBatch.find();

  let totalSilageProduced = 0;
  let totalCostSum = 0;

  batches.forEach((b) => {
    totalSilageProduced += b.totalProducedQty;
    const batchCost = b.rawMaterialsUsed.reduce((sum, r) => sum + r.cost, 0);
    totalCostSum += batchCost;
  });

  const avgCostPerUnit = totalSilageProduced > 0 ? totalCostSum / totalSilageProduced : 0;

  return {
    totalSilageProduced,
    totalCostSum,
    avgCostPerUnit,
    totalBatches: batches.length,
  };
}

export async function deleteProductionBatch(batchId: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  if (!['super_admin', 'admin', 'staff'].includes(role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();

  const batch = await ProductionBatch.findById(batchId);
  if (!batch) {
    throw new Error('Production batch not found');
  }

  await ProductionBatch.findByIdAndDelete(batchId);

  // Delete associated LedgerTransaction if it exists
  await LedgerTransaction.deleteOne({
    description: `Raw materials for silage production batch ${batch.batchNumber}`,
  });

  revalidatePath('/admin/inventory');
  revalidatePath('/admin/accounts');

  return { success: true };
}

export async function updateProductionBatch(
  batchId: string,
  data: {
    rawMaterialsUsed: {
      materialName: string;
      quantity: number;
      cost: number;
    }[];
    totalProducedQty: number;
    warehouseLocation?: string;
    productionDate?: string;
  }
) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  if (!['super_admin', 'admin', 'staff'].includes(role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();

  const dbUser = await User.findOne({ email: session.user?.email });
  if (!dbUser) throw new Error('Logged-in administrator user record not found in database');

  const batch = await ProductionBatch.findById(batchId);
  if (!batch) {
    throw new Error('Production batch not found');
  }

  const totalCost = data.rawMaterialsUsed.reduce((acc, rm) => acc + rm.cost, 0);
  const productionCostPerUnit = data.totalProducedQty > 0 ? totalCost / data.totalProducedQty : 0;

  batch.rawMaterialsUsed = data.rawMaterialsUsed;
  batch.totalProducedQty = data.totalProducedQty;
  batch.productionCostPerUnit = productionCostPerUnit;
  if (data.warehouseLocation !== undefined) {
    batch.warehouseLocation = data.warehouseLocation;
  }
  if (data.productionDate) {
    batch.productionDate = new Date(data.productionDate);
  }

  await batch.save();

  // Sync LedgerTransaction
  const desc = `Raw materials for silage production batch ${batch.batchNumber}`;
  if (totalCost > 0) {
    const existingTx = await LedgerTransaction.findOne({ description: desc });
    if (existingTx) {
      existingTx.amount = totalCost;
      if (data.productionDate) {
        existingTx.date = new Date(data.productionDate);
      }
      await existingTx.save();
    } else {
      const expenseTx = new LedgerTransaction({
        date: data.productionDate ? new Date(data.productionDate) : new Date(),
        type: 'expense',
        source: 'cash',
        category: 'Raw Materials',
        amount: totalCost,
        description: desc,
        recordedBy: dbUser._id,
      });
      await expenseTx.save();
    }
  } else {
    await LedgerTransaction.deleteOne({ description: desc });
  }

  revalidatePath('/admin/inventory');
  revalidatePath('/admin/accounts');

  return { success: true, batch: JSON.parse(JSON.stringify(batch)) };
}

