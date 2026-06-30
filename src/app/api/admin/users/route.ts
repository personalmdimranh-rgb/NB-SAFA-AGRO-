import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order'; // Import to ensure model is registered

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const sessionIsAdmin = (session?.user as any)?.isAdmin === true;
    
    if (!session || (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'director' && !sessionIsAdmin)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const pageVal = searchParams.get('page');
    const limit = parseInt(searchParams.get('limit') || '20') || 20;

    await connectToDatabase();

    // Base match stage — super_admin role exclusion covers all system super-admin accounts
    let matchStage: any = {
      role: { $ne: 'super_admin' },
    };

    if (role && role !== 'super_admin') {
      matchStage.role = role;
    }

    if (status && ['active', 'inactive'].includes(status)) {
      matchStage.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      matchStage.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } }
      ];
    }

    // Build the aggregation pipeline
    const aggregatePipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'userOrders'
        }
      },
      {
        $lookup: {
          from: 'dealers',
          localField: '_id',
          foreignField: 'userId',
          as: 'dealerProfile'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          isAdmin: 1,
          status: 1,
          image: 1,
          createdAt: 1,
          phone: 1,
          addresses: 1,
          lastActive: 1,
          totalOrders: { $size: '$userOrders' },
          totalSpent: { $sum: '$userOrders.totalAmount' },
          lastOrderDate: { $max: '$userOrders.createdAt' },
          shopName: { $arrayElemAt: ['$dealerProfile.shopName', 0] }
        }
      },
      { $sort: { createdAt: -1 } }
    ];

    if (pageVal) {
      const page = parseInt(pageVal) || 1;
      const skip = (page - 1) * limit;

      const totalCount = await User.countDocuments(matchStage);

      aggregatePipeline.push(
        { $skip: skip },
        { $limit: limit }
      );

      const users = await User.aggregate(aggregatePipeline);
      const totalPages = Math.ceil(totalCount / limit) || 1;

      return NextResponse.json({
        users,
        pagination: {
          total: totalCount,
          totalPages,
          page,
          limit
        }
      });
    } else {
      const users = await User.aggregate(aggregatePipeline);
      return NextResponse.json(users);
    }
  } catch (error) {
    console.error('Fetch Users Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserRole = (session?.user as any)?.role;
    
    // Only super_admin can manually assign admins by email
    if (!session || currentUserRole !== 'super_admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.[A-Za-z]{2,})+$/.test(email)) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    await connectToDatabase();

    // Find or Create user with this email and set role to admin
    // If user already exists, update their role to admin
    // If they don't exist, we create them with a placeholder name
    const result = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        $set: { role: 'admin' },
        $setOnInsert: { 
          name: email.split('@')[0], // Use email prefix as initial name
          phone: 'N/A',
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      message: `Successfully assigned Admin role to ${email}`,
      user: result
    });
  } catch (error) {
    console.error('Assign Admin Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserRole = (session?.user as any)?.role;
    const sessionIsAdmin = (session?.user as any)?.isAdmin === true;
    
    if (!session || (currentUserRole !== 'admin' && currentUserRole !== 'super_admin' && !sessionIsAdmin)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role, status, isAdmin } = await req.json();

    // Must provide either role, status or isAdmin
    if (!userId || (!role && !status && typeof isAdmin !== 'boolean')) {
      return NextResponse.json({ message: 'Invalid data: userId and role, status or isAdmin required' }, { status: 400 });
    }

    // Validate role if provided
    if (role && !['farmer', 'dealer', 'staff', 'director', 'manager', 'admin', 'user'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role value' }, { status: 400 });
    }

    // Validate status if provided
    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status value. Must be active or inactive.' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the user to update
    const userToUpdate = await User.findOne({ _id: userId });

    if (!userToUpdate) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prevent changing role/status of super_admin
    if (userToUpdate.role === 'super_admin') {
      return NextResponse.json({ message: 'Cannot modify a super_admin account' }, { status: 403 });
    }

    if (role) userToUpdate.role = role;
    if (status) userToUpdate.status = status;
    if (typeof isAdmin === 'boolean') userToUpdate.isAdmin = isAdmin;
    await userToUpdate.save();

    const action = role 
      ? `role updated to ${role}` 
      : (status ? `status updated to ${status}` : `admin access updated to ${isAdmin}`);
    return NextResponse.json({ message: `User ${action} successfully` });
  } catch (error) {
    console.error('Update User Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserRole = (session?.user as any)?.role;
    
    if (!session || (currentUserRole !== 'admin' && currentUserRole !== 'super_admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the user to delete
    const userToDelete = await User.findOne({ _id: userId });

    if (!userToDelete) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prevent deleting super_admin
    if (userToDelete.role === 'super_admin') {
      return NextResponse.json({ message: 'Cannot delete a super_admin' }, { status: 403 });
    }

    // Check if user has orders
    const orderCount = await Order.countDocuments({ user: userId });
    if (orderCount > 0) {
      return NextResponse.json({ 
        message: `Cannot delete user: This user has ${orderCount} existing orders. Delete orders first or suspend the user instead.` 
      }, { status: 400 });
    }

    await User.deleteOne({ _id: userId });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
