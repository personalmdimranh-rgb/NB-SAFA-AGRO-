const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://SafaAgro:YrXRi7yPmQfJWiw5@cluster0.e5n1hnl.mongodb.net/ShafaAgro';

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

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const categoriesToSeed = [
  {
    name: 'Fresh Organic Mangoes',
    slug: 'organic-mangoes',
    image: '/assets/images/products/Sweet Nagpur Oranges.webp',
    isActive: true
  },
  {
    name: 'Raw Organic Honey',
    slug: 'organic-honey',
    image: '/assets/images/products/sundarban_wild_forest_honey_img_1778345403804.webp',
    isActive: true
  },
  {
    name: 'Pure Ghee & Healthy Oils',
    slug: 'pure-ghee-oils',
    image: '/assets/images/products/virgin_coconut_oil_img_1778345526404.webp',
    isActive: true
  },
  {
    name: 'Organic Spices & Herbs',
    slug: 'organic-spices',
    image: '/assets/images/products/organic_turmeric_powder_1778373855826.webp',
    isActive: true
  },
  {
    name: 'Maize & Corn Silage',
    slug: 'corn-silage',
    image: '/assets/images/products/aromatic_red_rice_jute_bag_1778374084524.webp',
    isActive: true
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully. Seeding categories...');

    for (const cat of categoriesToSeed) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      } else {
        existing.name = cat.name;
        existing.image = cat.image;
        existing.isActive = cat.isActive;
        await existing.save();
        console.log(`Updated category: ${cat.name}`);
      }
    }

    console.log('Seeding completed!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
