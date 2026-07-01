import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Dealer from '@/models/Dealer';
import Employee from '@/models/Employee';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    const isAdmin = (session.user as any).isAdmin === true;
    const allowedRoles = ['super_admin', 'admin', 'manager', 'staff'];
    if (!allowedRoles.includes(role) && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    await connectToDatabase();

    const user = await User.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userObj = user as any;

    const viewerRole = (session.user as any).role;
    const viewerId = (session.user as any).id || (session.user as any)._id;
    const viewerEmail = session.user.email;
    const isSelf = viewerId === id || viewerEmail === userObj.email;

    if (userObj.role === 'staff') {
      const isAuthorizedViewer = ['super_admin', 'admin', 'manager'].includes(viewerRole) || isSelf;
      if (!isAuthorizedViewer) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      if (viewerRole === 'staff' && !isSelf) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    let extra: any = null;

    // Fetch role-specific extra data
    if (userObj.role === 'dealer') {
      const Sale = (await import('@/models/Sale')).default;
      const dealer = await Dealer.findOne({ userId: id }).lean();
      if (dealer) {
        const d = dealer as any;
        const recentSales = await Sale.find({ buyerId: d._id, buyerType: 'dealer' })
          .sort({ date: -1 })
          .limit(5)
          .lean();
        extra = { dealer: d, recentSales };
      }
    } else if (userObj.role === 'staff' || userObj.role === 'manager') {
      const emp = await Employee.findOne({ phone: userObj.phone }).lean();
      if (emp) extra = { employee: emp };
    }

    // Get order summary for any user
    let orderSummary = { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
    try {
      const Sale = (await import('@/models/Sale')).default;
      const totalOrders = await Sale.countDocuments({ buyerType: 'farmer', buyerId: id });
      const lastOrderDoc = await Sale.findOne({ buyerType: 'farmer', buyerId: id })
        .sort({ date: -1 })
        .select('date')
        .lean();
      const orders = await Sale.find({ buyerType: 'farmer', buyerId: id })
        .select('grandTotal')
        .lean();
      const totalSpent = orders.reduce((s: number, o: any) => s + (o.grandTotal || 0), 0);

      orderSummary = {
        totalOrders,
        totalSpent,
        lastOrderDate: lastOrderDoc ? (lastOrderDoc as any).date : null,
      };
    } catch { /* no orders */ }

    return NextResponse.json({
      user: userObj,
      extra,
      orderSummary,
    });
  } catch (error: any) {
    console.error('User profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
