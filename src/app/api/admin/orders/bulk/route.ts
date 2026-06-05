import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import LedgerTransaction from '@/models/LedgerTransaction';
import { auth } from '@/auth';

const ALLOWED_ORDER_STATUSES = ['Order Placed', 'Confirmed', 'Paid', 'Ready for Delivery', 'Released for Delivery', 'Cancelled', 'Delivered'];
const ALLOWED_PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed'];
const MAX_BULK_IDS = 100;

function validateIds(ids: any) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return 'No order IDs provided';
  }
  if (ids.length > MAX_BULK_IDS) {
    return `Cannot process more than ${MAX_BULK_IDS} orders at once`;
  }
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `Invalid order ID format: ${id}`;
    }
  }
  return null;
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !(['admin', 'super_admin'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { ids, status, paymentStatus } = await req.json();

    const idError = validateIds(ids);
    if (idError) {
      return NextResponse.json({ message: idError }, { status: 400 });
    }

    const updateData: any = {};
    
    if (status) {
      if (!ALLOWED_ORDER_STATUSES.includes(status)) {
        return NextResponse.json({ 
          message: `Invalid status. Allowed values: ${ALLOWED_ORDER_STATUSES.join(', ')}` 
        }, { status: 400 });
      }
      updateData.status = status;
    }

    if (paymentStatus) {
      if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
        return NextResponse.json({ 
          message: `Invalid payment status. Allowed values: ${ALLOWED_PAYMENT_STATUSES.join(', ')}` 
        }, { status: 400 });
      }
      updateData.paymentStatus = paymentStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No valid update data provided' }, { status: 400 });
    }

    const conn = await connectToDatabase();

    const dbSession = await conn.startSession();
    dbSession.startTransaction();

    let modifiedCount = 0;
    try {
      const becomesValid = ['Confirmed', 'Paid', 'Delivered'].includes(status || '');

      const dbUser = await User.findOne({ email: session?.user?.email }).session(dbSession);
      const isIdValid = mongoose.isValidObjectId((session?.user as any)?.id);
      const recorderId = dbUser?._id || (isIdValid ? new mongoose.Types.ObjectId((session?.user as any)?.id) : new mongoose.Types.ObjectId());

      for (const id of ids) {
        const updateObj: any = {};
        if (status) updateObj.status = status;
        if (paymentStatus) updateObj.paymentStatus = paymentStatus;

        let order;
        if (becomesValid) {
          // Atomic check-then-set for isSalesCounted to prevent race conditions
          order = await Order.findOneAndUpdate(
            { _id: id, isSalesCounted: { $ne: true } },
            { $set: { ...updateObj, isSalesCounted: true } },
            { session: dbSession, new: true }
          );

          if (order) {
            modifiedCount++;
          } else {
            // Fallback: update status/paymentStatus even if sales were already counted
            const fallbackOrder = await Order.findOneAndUpdate(
              { _id: id },
              { $set: updateObj },
              { session: dbSession, new: true }
            );
            if (fallbackOrder) {
              order = fallbackOrder;
              modifiedCount++;
            }
          }
        } else {
          // Regular update when not becoming a valid sale
          const regularOrder = await Order.findOneAndUpdate(
            { _id: id },
            { $set: updateObj },
            { session: dbSession, new: true }
          );
          if (regularOrder) {
            order = regularOrder;
            modifiedCount++;
          }
        }

        // --- LEDGER INTEGRATION ---
        if (order) {
          const nextPaymentStatus = paymentStatus || order.paymentStatus;
          const nextStatus = status || order.status;
          const orderShortId = order.shortId || order._id.toString().slice(-8).toUpperCase();
          const ledgerDescription = `Payment for order #${orderShortId}`;



          if (nextPaymentStatus === 'Paid' || nextStatus === 'Delivered') {
            const existingLedger = await LedgerTransaction.findOne({ description: ledgerDescription }).session(dbSession);
            if (!existingLedger) {
              const isCash = ['cod', 'cash'].includes((order.paymentMethod || '').toLowerCase());
              await LedgerTransaction.create([{
                date: new Date(),
                type: 'income',
                source: isCash ? 'cash' : 'bank',
                category: 'Product Sale',
                amount: order.totalAmount,
                description: ledgerDescription,
                recordedBy: recorderId,
              }], { session: dbSession });
            }
          } else if (nextStatus === 'Cancelled' || nextPaymentStatus === 'Failed') {
            await LedgerTransaction.deleteMany({ description: ledgerDescription }).session(dbSession);
          }
        }
      }

      await dbSession.commitTransaction();
      return NextResponse.json({ 
        message: `${modifiedCount} orders updated successfully`,
        count: modifiedCount 
      });
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      await dbSession.endSession();
    }
  } catch (error) {
    console.error('Bulk Update Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !(['admin', 'super_admin'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = await req.json();

    const idError = validateIds(ids);
    if (idError) {
      return NextResponse.json({ message: idError }, { status: 400 });
    }

    await connectToDatabase();

    // Delete corresponding ledger entries
    for (const id of ids) {
      const order = await Order.findById(id);
      if (order) {
        const orderShortId = order.shortId || order._id.toString().slice(-8).toUpperCase();
        await LedgerTransaction.deleteMany({ description: `Payment for order #${orderShortId}` });
      }
    }

    const result = await Order.updateMany(
      { _id: { $in: ids } },
      { $set: { deletedAt: new Date() } }
    );

    return NextResponse.json({ 
      message: `${result.modifiedCount} orders soft-deleted successfully`,
      count: result.modifiedCount 
    });
  } catch (error) {
    console.error('Bulk Delete Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
