import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Category from '@/models/Category';
import { auth } from '@/auth';

const categoriesToSeed = [
  {
    name: 'Prescription Medicines',
    slug: 'prescription-medicines',
    image: '/assets/images/category/prescription_medicines.webp',
    isActive: true,
  },
  {
    name: 'OTC & Daily Healthcare',
    slug: 'otc-healthcare',
    image: '/assets/images/category/otc_healthcare.webp',
    isActive: true,
  },
  {
    name: 'Surgical Instruments',
    slug: 'surgical-instruments',
    image: '/assets/images/category/surgical_instruments.webp',
    isActive: true,
  },
  {
    name: 'Clinic & Hospital Supplies',
    slug: 'clinic-supplies',
    image: '/assets/images/category/clinic_supplies.webp',
    isActive: true,
  },
  {
    name: 'Diagnostic Devices',
    slug: 'diagnostic-devices',
    image: '/assets/images/category/diagnostic_devices.webp',
    isActive: true,
  },
  {
    name: 'Mobility & Rehab Aids',
    slug: 'mobility-rehabilitation',
    image: '/assets/images/category/mobility_rehabilitation.webp',
    isActive: true,
  },
  {
    name: 'Baby Nutrition & Care',
    slug: 'baby-care-nutrition',
    image: '/assets/images/category/baby_care_nutrition.webp',
    isActive: true,
  },
  {
    name: 'Baby Diapering & Hygiene',
    slug: 'baby-diapering-hygiene',
    image: '/assets/images/category/baby_diapering_hygiene.webp',
    isActive: true,
  },
  {
    name: 'Family & Personal Wellness',
    slug: 'personal-wellness',
    image: '/assets/images/category/personal_wellness.webp',
    isActive: true,
  },
  {
    name: 'Maternity & Motherhood',
    slug: 'motherhood-maternity',
    image: '/assets/images/category/motherhood_maternity.webp',
    isActive: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    // 1. Authorize - Allow admin role OR local development/secret query parameter bypass
    const session = await auth();
    const isAdmin = session?.user && ['admin', 'super_admin'].includes((session.user as any)?.role);

    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const isSecretBypass = secret === 'seed123' || process.env.NODE_ENV === 'development';

    if (!isAdmin && !isSecretBypass) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Connect to database
    await connectToDatabase();

    const seededCategories = [];
    const skippedCategories = [];

    // 3. Process each category
    for (const cat of categoriesToSeed) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (existing) {
        // Update the image and name if it already exists, ensuring no duplicate slug errors
        existing.name = cat.name;
        existing.image = cat.image;
        existing.isActive = cat.isActive;
        await existing.save();
        seededCategories.push({ ...cat, status: 'updated' });
      } else {
        // Create new category
        await Category.create(cat);
        seededCategories.push({ ...cat, status: 'created' });
      }
    }

    // 4. Revalidate cache
    revalidateTag('categories', 'max');
    revalidatePath('/');

    return NextResponse.json({
      message: 'Category seeding completed successfully',
      seededCount: seededCategories.length,
      details: seededCategories,
    });
  } catch (error: any) {
    console.error('Error seeding categories:', error);
    return NextResponse.json(
      { message: 'Seeding failed', error: error.message || error },
      { status: 500 }
    );
  }
}
