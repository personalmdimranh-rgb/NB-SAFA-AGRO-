import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Slider from '@/models/Slider';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !(['admin', 'super_admin'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid Banner ID' }, { status: 400 });
    }

    await connectToDatabase();
    const banner = await Slider.findById(id);
    if (!banner) {
      return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Fetch Banner Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !(['admin', 'super_admin'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid Banner ID' }, { status: 400 });
    }

    const body = await req.json();
    
    // Whitelist allowed fields
    const allowedFields = ['title', 'subtitle', 'image', 'ctaText', 'ctaLink', 'secondaryBtnText', 'secondaryBtnLink', 'order', 'isActive'];
    const sanitizedUpdate: Record<string, any> = {};
    
    for (const key in body) {
      if (
        allowedFields.includes(key) && 
        !key.startsWith('$') && 
        !key.includes('.')
      ) {
        sanitizedUpdate[key] = body[key];
      }
    }

    await connectToDatabase();

    const banner = await Slider.findOneAndUpdate({ _id: id }, sanitizedUpdate, { 
      new: true,
      runValidators: true 
    });
    
    if (!banner) {
      return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
    }

    try {
      revalidateTag('banners', 'max');
      revalidatePath('/');
    } catch (revalidateError) {
      console.error('Failed to revalidate banners cache after update:', revalidateError);
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Update Banner Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !(['admin', 'super_admin'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid Banner ID' }, { status: 400 });
    }

    await connectToDatabase();
    
    const banner = await Slider.findOneAndDelete({ _id: id });

    if (!banner) {
      return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
    }

    try {
      revalidateTag('banners', 'max');
      revalidatePath('/');
    } catch (revalidateError) {
      console.error('Failed to revalidate banners cache after delete:', revalidateError);
    }

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete Banner Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
