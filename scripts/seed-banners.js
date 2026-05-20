const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local file to get MONGODB_URI
const envPath = path.join(__dirname, '../.env.local');
let mongodbUri = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^MONGODB_URI=(.*)$/m);
  if (match && match[1]) {
    mongodbUri = match[1].trim().replace(/['"]/g, '');
  }
}

if (!mongodbUri) {
  // Fallback if env file doesn't parse correctly
  mongodbUri = 'mongodb+srv://GOMart:S4Epscw0SOkd5ZtG@cluster0.e5n1hnl.mongodb.net/GOMart';
}

console.log('Connecting to MongoDB...');

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String },
    primaryBtnText: { type: String },
    primaryBtnLink: { type: String },
    secondaryBtnText: { type: String },
    secondaryBtnLink: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

const banners = [
  {
    title: 'Premium Organic Groceries & Fresh Handpicked Produce',
    image: '/assets/images/Banner/Banner (1).webp',
    link: 'https://rad-flan-e903ce.netlify.app/shop',
    primaryBtnText: 'Shop Now',
    primaryBtnLink: 'https://rad-flan-e903ce.netlify.app/shop',
    secondaryBtnText: 'Order on Call',
    secondaryBtnLink: 'https://wa.me/8801866128382',
    order: 1,
    isActive: true,
  },
  {
    title: '100% Certified Chemical-Free & Healthy Foods',
    image: '/assets/images/Banner/Banner (2).webp',
    link: 'https://rad-flan-e903ce.netlify.app/shop',
    primaryBtnText: 'Explore Shop',
    primaryBtnLink: 'https://rad-flan-e903ce.netlify.app/shop',
    secondaryBtnText: 'Quick Call',
    secondaryBtnLink: 'https://wa.me/8801866128382',
    order: 2,
    isActive: true,
  },
  {
    title: 'Daily Essentials & Family Wellness Products',
    image: '/assets/images/Banner/Banner (3).webp',
    link: 'https://rad-flan-e903ce.netlify.app/shop',
    primaryBtnText: 'Order Now',
    primaryBtnLink: 'https://rad-flan-e903ce.netlify.app/shop',
    secondaryBtnText: 'Call to Order',
    secondaryBtnLink: 'https://wa.me/8801866128382',
    order: 3,
    isActive: true,
  },
  {
    title: 'Organic Superfoods & Nutrient-Rich Choices',
    image: '/assets/images/Banner/Banner (4).webp',
    link: 'https://rad-flan-e903ce.netlify.app/shop',
    primaryBtnText: 'Shop Wellness',
    primaryBtnLink: 'https://rad-flan-e903ce.netlify.app/shop',
    secondaryBtnText: 'Contact Sales',
    secondaryBtnLink: 'https://wa.me/8801866128382',
    order: 4,
    isActive: true,
  }
];

async function seed() {
  try {
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB successfully.');

    // Clear existing banners
    const deleteResult = await Banner.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing banners.`);

    // Insert new banners
    const insertResult = await Banner.insertMany(banners);
    console.log(`Seeded ${insertResult.length} banners successfully:`);
    insertResult.forEach((b, i) => {
      console.log(`[Banner ${i+1}] Title: "${b.title}", Image: "${b.image}"`);
    });

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seed();
