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
  paymentMethod: 'cash' | 'bank-transfer' | 'bkash' | 'nagad' | 'cod' | 'due' | 'wallet';
  estimatedPaymentDate?: string;
  paymentNumber?: string;
  transactionNumber?: string;
  bankName?: string;
  phone?: string;
  addressLine?: string;
  division?: string;
  thana?: string;
  district?: string;
  distributionDistrict?: string;
  date?: string;
  orderType?: 'manual' | 'by-user';
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const dbUser = await User.findOne({ email: session.user?.email });
  if (!dbUser) throw new Error('Logged-in user record not found in database');

  const userRole = dbUser.role as string;
  const userId = dbUser._id.toString();
  const isAdmin = dbUser.isAdmin === true;

  // Authorize based on role
  if (['super_admin', 'admin', 'staff'].includes(userRole) || isAdmin) {
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

    dueAmount = grandTotal - data.paidAmount;

    // Calculate commission
    const totalQty = data.items.reduce((acc, item) => acc + item.quantity, 0);
    commissionApplied = totalQty * dealer.commissionRate;
    let walletDeduction = 0;
    if (data.paymentMethod === 'wallet') {
      if (dealer.commissionWallet < data.paidAmount) {
        throw new Error(`Insufficient wallet balance. Available: ৳${dealer.commissionWallet.toLocaleString()}`);
      }
      walletDeduction = data.paidAmount;
    }

    // Atomically update dealer stats with credit-limit enforcement (prevention of race conditions)
    // Only check credit limit if the transaction results in new/additional dues (dueAmount > 0)
    const dealerQuery: any = { _id: data.buyerId };
    if (dueAmount > 0) {
      dealerQuery.$expr = { $lte: [{ $add: ['$currentDues', dueAmount] }, '$creditLimit'] };
    }
    if (walletDeduction > 0) {
      dealerQuery.commissionWallet = { $gte: walletDeduction };
    }

    const updatedDealer = await Dealer.findOneAndUpdate(
      dealerQuery,
      {
        $inc: {
          currentDues: dueAmount,
          commissionWallet: commissionApplied - walletDeduction,
          totalSalesCount: 1,
        },
      },
      { new: true }
    );

    if (!updatedDealer) {
      if (walletDeduction > 0) {
        throw new Error('Order blocks: Insufficient wallet balance or credit limit exceeded.');
      }
      throw new Error(`Order blocks: Current due plus new due exceeds dealer's credit limit (${dealer.creditLimit}).`);
    }

    // Defer profile updates until transaction succeeds
    if (data.phone) {
      await User.findByIdAndUpdate(dealer.userId, { phone: data.phone });
    }
    if (data.addressLine || data.thana || data.district) {
      dealer.address = {
        village: data.addressLine || dealer.address?.village || '',
        union: dealer.address?.union || '',
        thana: data.thana || dealer.address?.thana || '',
        district: data.district || dealer.address?.district || '',
      };
      await dealer.save();

      if (data.division) {
        await User.findByIdAndUpdate(dealer.userId, {
          addresses: [{
            street: data.addressLine || '',
            division: data.division || '',
            state: data.district || '',
            city: data.thana || '',
            country: 'Bangladesh',
            isDefault: true
          }]
        });
      }
    }

  } else if (data.buyerType === 'farmer') {
    const farmer = await Farmer.findById(data.buyerId);
    if (!farmer) throw new Error('Farmer not found');

    dueAmount = grandTotal - data.paidAmount;

    // Atomically update farmer stats with credit-limit enforcement (prevention of race conditions)
    // Only check credit limit if the transaction results in new/additional dues (dueAmount > 0)
    const farmerQuery: any = { _id: data.buyerId };
    if (dueAmount > 0) {
      farmerQuery.$expr = { $lte: [{ $add: ['$currentDues', dueAmount] }, '$creditLimit'] };
    }

    const totalQty = data.items.reduce((acc, item) => acc + item.quantity, 0);
    const updatedFarmer = await Farmer.findOneAndUpdate(
      farmerQuery,
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

    // Defer profile updates until transaction succeeds
    if (data.phone) {
      farmer.phone = data.phone;
      await User.findOneAndUpdate({ email: session.user?.email }, { phone: data.phone });
    }
    if (data.addressLine || data.division || data.thana || data.district) {
      farmer.address = {
        village: data.addressLine || farmer.address?.village || '',
        division: data.division || farmer.address?.division || '',
        thana: data.thana || farmer.address?.thana || '',
        district: data.district || farmer.address?.district || '',
      };
    }
    await farmer.save();
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
    estimatedPaymentDate: data.estimatedPaymentDate ? new Date(data.estimatedPaymentDate) : undefined,
    paymentNumber: data.paymentNumber,
    transactionNumber: data.transactionNumber,
    bankName: data.bankName,
    distributionDistrict: data.district || data.distributionDistrict || 'Unknown',
    orderType: data.orderType || 'by-user',
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
      description: `Payment for invoice ${invoiceNumber}${data.paymentMethod === 'wallet' ? ' (Paid via Wallet)' : ''}`,
      recordedBy: dbUser._id,
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
  description?: string;
  bankDetails?: {
    bankName?: string;
    accountNo?: string;
  };
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const role = (session.user as any).role;
  const isAdmin = (session.user as any).isAdmin;
  if (!['super_admin', 'admin', 'staff'].includes(role) && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();

  const dbUser = await User.findOne({ email: session.user?.email });
  if (!dbUser) throw new Error('Logged-in user record not found in database');

  let buyerName = '';

  if (data.buyerType === 'dealer') {
    const dealer = await Dealer.findById(data.buyerId).populate('userId', 'name');
    if (!dealer) throw new Error('Dealer not found');
    dealer.currentDues = Math.max(0, dealer.currentDues - data.amount);
    await dealer.save();
    buyerName = `${(dealer.userId as any)?.name || 'Unknown'} (${dealer.shopName || ''})`;
  } else {
    const farmer = await Farmer.findById(data.buyerId);
    if (!farmer) throw new Error('Farmer not found');
    farmer.currentDues = Math.max(0, (farmer.currentDues || 0) - data.amount);
    await farmer.save();
    buyerName = farmer.name;
  }

  // Distribute the payment amount across unpaid or partially-paid invoices using FIFO (First In, First Out)
  let remainingAmount = data.amount;
  const unpaidSales = await Sale.find({
    buyerId: data.buyerId,
    buyerType: data.buyerType,
    paymentStatus: { $in: ['unpaid', 'partially-paid'] }
  }).sort({ date: 1 }); // Oldest first

  for (const sale of unpaidSales) {
    if (remainingAmount <= 0) break;

    const invoiceDue = Math.max(0, sale.grandTotal - sale.paidAmount);
    if (invoiceDue <= 0) continue;

    const paymentToApply = Math.min(remainingAmount, invoiceDue);
    sale.paidAmount += paymentToApply;
    sale.dueAmount = Math.max(0, sale.grandTotal - sale.paidAmount);

    if (sale.paidAmount >= sale.grandTotal) {
      sale.paymentStatus = 'paid';
    } else if (sale.paidAmount > 0) {
      sale.paymentStatus = 'partially-paid';
    } else {
      sale.paymentStatus = 'unpaid';
    }

    await sale.save();
    remainingAmount -= paymentToApply;
  }


  // Create Ledger Transaction
  const ledgerTx = new LedgerTransaction({
    date: data.date ? new Date(data.date) : new Date(),
    type: 'income',
    source: ['cash'].includes(data.paymentMethod) ? 'cash' : 'bank',
    bankDetails: !['cash'].includes(data.paymentMethod) ? data.bankDetails : undefined,
    category: 'Due Collection',
    amount: data.amount,
    description: data.description || `Due collection from ${data.buyerType === 'dealer' ? 'Dealer' : 'Farmer'} ${buyerName}`,
    recordedBy: dbUser._id,
  });
  await ledgerTx.save();

  revalidatePath('/admin/sales');
  revalidatePath('/admin/accounts');
  revalidatePath('/admin/dealers');
  revalidatePath('/admin/farmers');

  return { success: true };
}


export async function getSales() {
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
  // Fetch sales
  const sales = await Sale.find().sort({ date: -1 });

  // Auto-repair dueAmount discrepancies for older records
  for (const sale of sales) {
    const expectedDue = Math.max(0, sale.grandTotal - sale.paidAmount);
    if (sale.dueAmount !== expectedDue) {
      const diffDue = expectedDue - sale.dueAmount;
      sale.dueAmount = expectedDue;
      await sale.save();

      if (sale.buyerType === 'dealer') {
        await Dealer.findByIdAndUpdate(sale.buyerId, {
          $inc: { currentDues: diffDue }
        });
      } else if (sale.buyerType === 'farmer') {
        await Farmer.findByIdAndUpdate(sale.buyerId, {
          $inc: { currentDues: diffDue }
        });
      }
    }
  }

  
  // Custom manual population helper to handle multiple collections (Dealer / Farmer)
  const populatedSales = await Promise.all(
    sales.map(async (sale) => {
      let buyerName = 'Unknown';
      let shopName = '';
      let buyerUserId = '';
      if (sale.buyerType === 'dealer') {
        const dealer = await Dealer.findById(sale.buyerId).populate('userId', 'name');
        buyerName = (dealer?.userId as any)?.name || 'Unknown Dealer';
        shopName = dealer?.shopName || '';
        const uid = dealer?.userId;
        if (uid) {
          buyerUserId = (uid as any)._id ? (uid as any)._id.toString() : uid.toString();
        }
      } else {
        const farmer = await Farmer.findById(sale.buyerId);
        buyerName = farmer?.name || 'Unknown Farmer';
        if (farmer?.phone) {
          const user = await User.findOne({ phone: farmer.phone });
          buyerUserId = user?._id?.toString() || '';
        }
        if (!buyerUserId && farmer) {
          const user = await User.findOne({ name: farmer.name, role: 'farmer' });
          buyerUserId = user?._id?.toString() || '';
        }
      }
      const s = sale.toObject();
      return {
        ...s,
        buyerName,
        shopName,
        buyerUserId,
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
  const isAdmin = ['super_admin', 'admin', 'manager', 'staff'].includes(userRole) || (session.user as any).isAdmin;
  if (!isAdmin) {
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
  const isAdmin = (session.user as any).isAdmin;
  if (!['super_admin', 'admin'].includes(role) && !isAdmin) {
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
  const isAdmin = (session.user as any).isAdmin;
  if (!['super_admin', 'admin', 'staff'].includes(role) && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();

  const dbUser = await User.findOne({ email: session.user?.email });
  if (!dbUser) throw new Error('Logged-in user record not found in database');

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
        recordedBy: dbUser._id,
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
  const isAdmin = (session.user as any).isAdmin;
  if (!['super_admin', 'admin', 'staff'].includes(role) && !isAdmin) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  await connectToDatabase();

  const sale = await Sale.findById(saleId);
  if (!sale) throw new Error('Sale not found');

  const allowedStatuses = ['pending', 'approved', 'ready to deliver', 'release to deliver', 'delivery complete', 'cancel'] as const;
  type SaleStatus = typeof allowedStatuses[number];
  if (!(allowedStatuses as readonly string[]).includes(status)) {
    throw new Error(`Invalid status "${status}". Allowed values: ${allowedStatuses.join(', ')}.`);
  }

  sale.status = status as SaleStatus;
  await sale.save();

  revalidatePath('/admin/sales');
  return { success: true, status };
}


