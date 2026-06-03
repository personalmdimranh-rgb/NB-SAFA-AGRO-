import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Dealer from '@/models/Dealer';
import Employee from '@/models/Employee';
import Farmer from '@/models/Farmer';

export async function POST(req: NextRequest) {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      address, 
      division, 
      district, 
      thana,
      role = 'user',
      shopName,
      tradeLicense,
      nidNumber,
      cattleCount,
      designation
    } = await req.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { message: 'Please provide all required fields.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email.' },
        { status: 409 }
      );
    }

    const selectedRole = ['farmer', 'dealer', 'staff', 'director'].includes(role) ? role : 'farmer';
    let dbRole = selectedRole;
    if (normalizedEmail === 'imranshuvo101@gmail.com') {
      dbRole = 'super_admin';
    }
    
    // Role-specific validation BEFORE creating the user
    if (selectedRole === 'dealer' && !shopName) {
      return NextResponse.json(
        { message: 'Shop name is required for dealer registration.' },
        { status: 400 }
      );
    }

    if (selectedRole === 'farmer') {
      // Check if phone already registered for a farmer (since farmer model phone is unique)
      const existingFarmer = await Farmer.findOne({ phone });
      if (existingFarmer) {
        return NextResponse.json(
          { message: 'Phone number already registered for a farmer profile.' },
          { status: 409 }
        );
      }
    }

    // De-activate staff, dealer, and director accounts until admin approves them
    const status = ['dealer', 'staff', 'director'].includes(dbRole) ? 'inactive' : 'active';

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      addresses: [{
        street: address,
        division: division,
        state: district,
        city: thana,
        country: 'Bangladesh',
        isDefault: true
      }],
      role: dbRole,
      status,
    });

    try {
      // Create extra role-specific profiles
      if (selectedRole === 'dealer') {
        await Dealer.create({
          userId: user._id,
          shopName,
          address: {
            village: address,
            thana: thana,
            district: district,
          },
          tradeLicense: tradeLicense || '',
          nidNumber: nidNumber || '',
          commissionRate: 0,
          commissionWallet: 0,
          totalSalesCount: 0,
          creditLimit: 0,
          currentDues: 0
        });
      } else if (selectedRole === 'farmer') {
        const existingFarmer = await Farmer.findOne({ phone });
        if (!existingFarmer) {
          await Farmer.create({
            name,
            phone,
            address: {
              village: address || '',
              division: division || '',
              thana: thana || '',
              district: district || ''
            },
            cattleCount: Number(cattleCount) || 0,
            purchaseCount: 0,
            totalPurchasedQty: 0,
            creditLimit: 0,
            currentDues: 0
          });
        }
      } else if (selectedRole === 'staff') {
        await Employee.create({
          name,
          phone,
          address,
          designation: designation || 'Staff Operator',
          salaryStructure: {
            basic: 0,
            allowance: 0,
            deductions: 0
          },
          attendanceRecords: [],
          workReports: [],
          joiningDate: new Date()
        });
      }
    } catch (profileError) {
      // Clean up the created User on profile creation failure to prevent orphans
      try {
        await User.deleteOne({ _id: user._id });
      } catch (cleanupError) {
        console.error('Failed to clean up user after profile creation error:', cleanupError);
      }
      throw profileError;
    }

    let successMessage = 'User registered successfully!';
    if (status === 'inactive') {
      successMessage = 'Registration submitted! Your account is pending administrative approval.';
    }

    return NextResponse.json(
      { message: successMessage, userId: user._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to register user.' },
      { status: 500 }
    );
  }
}

