import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectToDatabase();
    
    const categoriesToSeed = [
      {
        name: 'Fresh Organic Mangoes',
        slug: 'organic-mangoes',
        image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400',
        isActive: true
      },
      {
        name: 'Raw Organic Honey',
        slug: 'organic-honey',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
        isActive: true
      },
      {
        name: 'Pure Ghee & Healthy Oils',
        slug: 'pure-ghee-oils',
        image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=400',
        isActive: true
      },
      {
        name: 'Organic Spices & Herbs',
        slug: 'organic-spices',
        image: 'https://images.unsplash.com/photo-1596790011460-98730f7687d7?auto=format&fit=crop&q=80&w=400',
        isActive: true
      },
      {
        name: 'Maize & Corn Silage',
        slug: 'corn-silage',
        image: 'https://images.unsplash.com/photo-1595089880893-9548417dc684?auto=format&fit=crop&q=80&w=400',
        isActive: true
      }
    ];

    const seeded = [];
    for (const cat of categoriesToSeed) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        const newCat = await Category.create(cat);
        seeded.push(newCat);
      } else {
        // Update it with the new name/image/isActive if it exists to refresh details
        existing.name = cat.name;
        existing.image = cat.image;
        existing.isActive = cat.isActive;
        await existing.save();
        seeded.push({ ...existing.toObject(), existed: true });
      }
    }

    return NextResponse.json({ message: 'Seeding organic food categories completed successfully!', seeded });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ message: 'Seeding failed', error: error?.message }, { status: 500 });
  }
}
