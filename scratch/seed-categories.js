const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://RPLmarket:Quzbf6bsmXGARrw9@cluster0.e5n1hnl.mongodb.net/RPLmarket";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
    image: { type: String },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.pre('save', function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

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

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    for (const cat of categoriesToSeed) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (existing) {
        existing.name = cat.name;
        existing.image = cat.image;
        existing.isActive = cat.isActive;
        await existing.save();
        console.log(`Updated category: ${cat.name} (${cat.slug})`);
      } else {
        await Category.create(cat);
        console.log(`Created category: ${cat.name} (${cat.slug})`);
      }
    }

    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
