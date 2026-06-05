import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Slider from '@/models/Slider';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !(['admin', 'super_admin'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const sliders = await Slider.find().sort({ order: 1 });
    return NextResponse.json(sliders);
  } catch (error) {
    console.error('Fetch Sliders Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !(['admin', 'super_admin'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Whitelist fields
    const allowedFields = ['title', 'subtitle', 'image', 'ctaText', 'ctaLink', 'secondaryBtnText', 'secondaryBtnLink', 'order', 'isActive'];
    const sanitizedData: Record<string, any> = {};
    
    for (const key in body) {
      if (
        allowedFields.includes(key) && 
        !key.startsWith('$') && 
        !key.includes('.')
      ) {
        sanitizedData[key] = body[key];
      }
    }

    if (!sanitizedData.title || !sanitizedData.image) {
      return NextResponse.json({ message: 'Title and Image are required' }, { status: 400 });
    }

    await connectToDatabase();
    
    const slider = await Slider.create(sanitizedData);

    try {
      revalidateTag('banners', 'max');
      revalidatePath('/');
    } catch (revalidateError) {
      console.error('Failed to revalidate banners cache after create:', revalidateError);
    }

    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
    console.error('Create Slider Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
