'use server';

import connectToDatabase from '@/lib/db';
import Sale, { ISaleItem } from '@/models/Sale';
import Dealer from '@/models/Dealer';
import Farmer from '@/models/Farmer';
import LedgerTransaction from '@/models/LedgerTransaction';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';

import User from '@/models/User';

export async function createSale(data: {
  buyerType: 'dealer' | 'farmer';
  buyerId: string;
  items: {
    productName: string;
    productType?: string;
    quantity: number;
    unitPrice: number;
  }[];
  discount: number;
  paidAmount: number;
  paymentMethod: 'cash' | 'bank-transfer' | 'bkash' | 'nagad';
  distributionDistrict: string;
  date?: string;
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const userRole = (session.user as any).role;
  const userId = (session.user as any).id;

  // Authorize based on role
  if (['super_admin', 'admin', 'manager', 'staff'].includes(userRole)) {
    // Admins can log any sale
  } else if (userRole === 'dealer') {
    // Dealers can only create a sale for themselves (as a dealer buyer)
    if (data.buyerType !== 'dealer') {
      throw new Error('Forbidden: Dealers can only create dealer orders.');
    }
    // Verify buyerId matches this dealer
    const dealer = await Dealer.findOne({ userId });
    if (!dealer || dealer._id.toString() !== data.buyerId) {
      throw new Error('Forbidden: Dealers can only place orders for their own account.');
    }
  } else if (userRole === 'farmer') {
    // Farmers can only create a sale for themselves (as a farmer buyer)
    if (data.buyerType !== 'farmer') {
      throw new Error('Forbidden: Farmers can only create farmer orders.');
    }
    // Verify buyerId matches this farmer
    const currentUser = await User.findById(userId);
    if (!currentUser) throw new Error('User not found');
    const farmer = await Farmer.findOne({ phone: currentUser.phone });
    if (!farmer || farmer._id.toString() !== data.buyerId) {
      throw new Error('Forbidden: Farmers can only place orders for their own account.');
    }
  } else {
    throw new Error('Forbidden: Insufficient permissions');
  }

  // 1. Calculate items total prices and subtotal
  const saleItems: ISaleItem[] = data.items.map((item) => ({
    productName: item.productName,
    productType: item.productType || (item.productName.toLowerCase().includes('bag') ? 'bag' : 'other'),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.quantity * item.unitPrice,
  }));

  const subtotal = saleItems.reduce((acc, item) => acc + item.totalPrice, 0);

  // 2. Determine commission and credit limits based on buyer type
  let commissionApplied = 0;
  let dueAmount = 0;
  const grandTotal = subtotal - data.discount;

  if (data.buyerType === 'dealer') {
    const dealer = await Dealer.findById(data.buyerId);
    if (!dealer) throw new Error('Dealer not found');

    // Calculate commission
    const totalQty = data.items.reduce((acc, item) => acc + item.quantity, 0);
    commissionApplied = totalQty * dealer.commissionRate;
    dueAmount = grandTotal - data.paidAmount;

    // Atomically update dealer stats with credit-limit enforcement (prevention of race conditions)
    const updatedDealer = await Dealer.findOneAndUpdate(
      {
        _id: data.buyerId,
        $expr: { $lte: [{ $add: ['$currentDues', dueAmount] }, '$creditLimit'] },
      },
      {
        $inc: {
          currentDues: dueAmount,
          commissionWallet: commissionApplied,
          totalSalesCount: 1,
        },
      },
      { new: true }
    );

    if (!updatedDealer) {
      throw new Error(`Order blocks: Current due plus new due exceeds dealer's credit limit (${dealer.creditLimit}).`);
    }

  } else if (data.buyerType === 'farmer') {
    const farmer = await Farmer.findById(data.buyerId);
    if (!farmer) throw new Error('Farmer not found');

    dueAmount = grandTotal - data.paidAmount;

    // Atomically update farmer stats with credit-limit enforcement (prevention of race conditions)
    const totalQty = data.items.reduce((acc, item) => acc + item.quantity, 0);
    const updatedFarmer = await Farmer.findOneAndUpdate(
      {
        _id: data.buyerId,
        $expr: { $lte: [{ $add: ['$currentDues', dueAmount] }, '$creditLimit'] },
      },
      {
        $inc: {
          currentDues: dueAmount,
          purchaseCount: 1,
          totalPurchasedQty: totalQty,
        },
      },
      { new: true }
    );

    if (!updatedFarmer) {
      throw new Error(`Order blocks: Current due plus new due exceeds farmer's credit limit (${farmer.creditLimit}).`);
    }
  }

  // 3. Generate unique invoice number checking database for duplicates to prevent collision risk
  let invoiceNumber = '';
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 20) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    invoiceNumber = `INV-${code}`;
    const existing = await Sale.findOne({ invoiceNumber });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  if (!isUnique) {
    throw new Error('Failed to generate a unique invoice number. Please try again.');
  }

  // 4. Determine payment status
  let paymentStatus: 'paid' | 'partially-paid' | 'unpaid' = 'unpaid';
  if (data.paidAmount >= grandTotal) {
    paymentStatus = 'paid';
  } else if (data.paidAmount > 0) {
    paymentStatus = 'partially-paid';
  }

  // 5. Create Sale
  const sale = new Sale({
    invoiceNumber,
    buyerType: data.buyerType,
    buyerId: data.buyerId,
    items: saleItems,
    subtotal,
    discount: data.discount,
    commissionApplied,
    grandTotal,
    paidAmount: data.paidAmount,
    dueAmount,
    paymentStatus,
    paymentMethod: data.paymentMethod,
    distributionDistrict: data.distributionDistrict,
    date: data.date ? new Date(data.date) : new Date(),
  });

  await sale.save();

  // 6. Sync to Cash/Bank Ledger if money paid
  if (data.paidAmount > 0) {
    const ledgerTx = new LedgerTransaction({
      date: data.date ? new Date(data.date) : new Date(),
      type: 'income',
      source: ['cash'].includes(data.paymentMethod) ? 'cash' : 'bank',
      bankDetails: ['bank-transfer'].includes(data.paymentMethod)
        ? { bankName: 'Silage Sales Bank', accountNo: 'Sales-A/C' }
        : undefined,
      category: 'Silage Sale',
      amount: data.paidAmount,
      description: `Payment for invoice ${invoiceNumber}`,
      recordedBy: (session.user as any).id,
    });
    await ledgerTx.save();
  }

  revalidatePath('/admin/sales');
  revalidatePath('/admin/accounts');

  return { success: true, sale: JSON.parse(JSON.stringify(sale)) };
}

export async function collectDue(data: {
  buyerType: 'dealer' | 'farmer';
  buyerId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank-transfer' | 'bkash' | 'nagad';
  date?: string;
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  if (!['super_admin', 'admin', 'manager', 'staff'].includes(role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();

  if (data.buyerType === 'dealer') {
    const updatedDealer = await Dealer.findOneAndUpdate(
      { _id: data.buyerId },
      [
        {
          $set: {
            currentDues: {
              $max: [0, { $subtract: ['$currentDues', data.amount] }]
            }
          }
        }
      ],
      { new: true }
    );
    if (!updatedDealer) throw new Error('Dealer not found');
  } else {
    const updatedFarmer = await Farmer.findOneAndUpdate(
      { _id: data.buyerId },
      [
        {
          $set: {
            currentDues: {
              $max: [0, { $subtract: ['$currentDues', data.amount] }]
            }
          }
        }
      ],
      { new: true }
    );
    if (!updatedFarmer) throw new Error('Farmer not found');
  }

  // Create Ledger Transaction
  const ledgerTx = new LedgerTransaction({
    date: data.date ? new Date(data.date) : new Date(),
    type: 'income',
    source: ['cash'].includes(data.paymentMethod) ? 'cash' : 'bank',
    category: 'Due Collection',
    amount: data.amount,
    description: `Due payment from ${data.buyerType} ID: ${data.buyerId}`,
    recordedBy: (session.user as any).id,
  });
  await ledgerTx.save();

  revalidatePath('/admin/sales');
  revalidatePath('/admin/accounts');

  return { success: true };
}

export async function getSales() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  if (!['super_admin', 'admin', 'manager', 'staff'].includes(role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  // Fetch sales, populate dealer / farmer names if we can
  const sales = await Sale.find().sort({ date: -1 });
  
  // Custom manual population helper to handle multiple collections (Dealer / Farmer)
  const populatedSales = await Promise.all(
    sales.map(async (sale) => {
      let buyerName = 'Unknown';
      let shopName = '';
      if (sale.buyerType === 'dealer') {
        const dealer = await Dealer.findById(sale.buyerId).populate('userId', 'name');
        buyerName = (dealer?.userId as any)?.name || 'Unknown Dealer';
        shopName = dealer?.shopName || '';
      } else {
        const farmer = await Farmer.findById(sale.buyerId);
        buyerName = farmer?.name || 'Unknown Farmer';
      }
      const s = sale.toObject();
      return {
        ...s,
        buyerName,
        shopName,
      };
    })
  );

  return JSON.parse(JSON.stringify(populatedSales));
}

export async function getSalesByDealer(userId: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const userRole = (session.user as any).role;
  const currentUserId = (session.user as any).id;

  // Authorize: Admin roles can fetch any dealer's sales; dealer can only fetch their own sales
  if (!['super_admin', 'admin', 'manager', 'staff'].includes(userRole)) {
    if (userRole !== 'dealer' || currentUserId !== userId) {
      throw new Error('Forbidden: Insufficient permissions');
    }
  }

  await connectToDatabase();
  const dealer = await Dealer.findOne({ userId });
  if (!dealer) return [];

  const sales = await Sale.find({ buyerId: dealer._id, buyerType: 'dealer' }).sort({ date: -1 });
  return JSON.parse(JSON.stringify(sales));
}

export const logSale = createSale;

export async function deleteSale(saleId: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  if (!['super_admin', 'admin', 'manager'].includes(role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();
  const sale = await Sale.findByIdAndDelete(saleId);
  if (!sale) throw new Error('Sale not found');

  revalidatePath('/admin/sales');
  return { success: true };
}

export async function togglePaymentStatus(saleId: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  const role = (session.user as any).role;
  if (!['super_admin', 'admin', 'manager', 'staff'].includes(role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();

  const sale = await Sale.findById(saleId);
  if (!sale) throw new Error('Sale not found');

  // Partially-paid sales must be handled via a dedicated payment path, not this simple toggle.
  if (sale.paymentStatus === 'partially-paid') {
    throw new Error(
      'Cannot toggle a partially-paid sale. Use the dedicated payment update path to mark it as paid or unpaid.'
    );
  }

  const oldPaymentStatus = sale.paymentStatus;
  const newPaymentStatus = oldPaymentStatus === 'paid' ? 'unpaid' : 'paid';
  const newPaidAmount = newPaymentStatus === 'paid' ? sale.grandTotal : 0;
  const newDueAmount = newPaymentStatus === 'paid' ? 0 : sale.grandTotal;
  const diffDue = newDueAmount - sale.dueAmount;

  // Update buyer's currentDues
  if (sale.buyerType === 'dealer') {
    await Dealer.findByIdAndUpdate(sale.buyerId, {
      $inc: { currentDues: diffDue }
    });
  } else if (sale.buyerType === 'farmer') {
    await Farmer.findByIdAndUpdate(sale.buyerId, {
      $inc: { currentDues: diffDue }
    });
  }

  sale.paymentStatus = newPaymentStatus;
  sale.paidAmount = newPaidAmount;
  sale.dueAmount = newDueAmount;
  await sale.save();

  // Also log ledger transaction
  if (newPaymentStatus === 'paid') {
    const existingLedger = await LedgerTransaction.findOne({ description: `Payment for invoice ${sale.invoiceNumber}` });
    if (!existingLedger) {
      const ledgerTx = new LedgerTransaction({
        date: new Date(),
        type: 'income',
        source: ['cash'].includes(sale.paymentMethod) ? 'cash' : 'bank',
        category: 'Silage Sale',
        amount: sale.grandTotal,
        description: `Payment for invoice ${sale.invoiceNumber}`,
        recordedBy: (session.user as any).id,
      });
      await ledgerTx.save();
    } else {
      existingLedger.amount = sale.grandTotal;
      await existingLedger.save();
    }
  } else {
    await LedgerTransaction.deleteMany({ description: `Payment for invoice ${sale.invoiceNumber}` });
  }

  revalidatePath('/admin/sales');
  revalidatePath('/admin/accounts');

  return { success: true, paymentStatus: newPaymentStatus };
}

export async function updateSaleStatus(saleId: string, status: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  const role = (session.user as any).role;
  if (!['super_admin', 'admin', 'manager', 'staff'].includes(role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();

  const sale = await Sale.findById(saleId);
  if (!sale) throw new Error('Sale not found');

  const allowedStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid status "${status}". Allowed values: ${allowedStatuses.join(', ')}.`);
  }

  sale.status = status;
  await sale.save();

  revalidatePath('/admin/sales');
  return { success: true, status };
}


