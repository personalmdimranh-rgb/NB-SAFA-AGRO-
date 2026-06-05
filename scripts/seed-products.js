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

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    purchasePrice: { type: Number, min: 0 },
    discountRate: { type: Number },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    tags: [{ type: String }],
    images: [{ type: String }],
    attributes: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
    totalSales: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const productsData = [
  {
    name: "Premium Rajshahi Gopalbhog Mango",
    slug: "premium-rajshahi-gopalbhog-mango",
    description: "Sweet, juicy, and naturally ripened Gopalbhog Mangoes sourced directly from the finest orchards of Rajshahi. Chemically untreated and naturally packed with flavor.",
    price: 250,
    salePrice: 220,
    purchasePrice: 150,
    sku: "FRT-MNG-GPB-001",
    stock: 120,
    categorySlug: "organic-mangoes",
    tags: ["mango", "fruit", "organic", "fresh"],
    images: ["/assets/images/products/Sweet Nagpur Oranges.webp"],
    isFeatured: true,
    isNewArrival: true,
  },
  {
    name: "Naturally Ripened Himsagar Mango",
    slug: "naturally-ripened-himsagar-mango",
    description: "Savor the rich, fiberless sweetness of Himsagar mangoes. Freshly harvested and ripened naturally without any harmful chemicals.",
    price: 220,
    salePrice: 190,
    purchasePrice: 130,
    sku: "FRT-MNG-HMS-002",
    stock: 150,
    categorySlug: "organic-mangoes",
    tags: ["mango", "fruit", "organic", "fresh"],
    images: ["/assets/images/products/naturally_ripened_banana_bunch_1778374121594.webp"],
    isFeatured: false,
    isNewArrival: true,
  },
  {
    name: "Sundarban Wild Forest Honey",
    slug: "sundarban-wild-forest-honey",
    description: "100% pure, raw, and unfiltered honey collected from the wild mangrove forests of the Sundarbans. Rich in antioxidants and health benefits.",
    price: 950,
    salePrice: 850,
    purchasePrice: 600,
    sku: "HNY-SND-WLD-001",
    stock: 80,
    categorySlug: "organic-honey",
    tags: ["honey", "raw", "organic", "sundarban"],
    images: ["/assets/images/products/sundarban_wild_forest_honey_img_1778345403804.webp"],
    isFeatured: true,
    isNewArrival: false,
  },
  {
    name: "Premium Black Seed Honey",
    slug: "premium-black-seed-honey",
    description: "Pure natural honey sourced from bees feeding on black seed (Kalajira) flowers. Famous for its intense color, unique flavor, and medicinal properties.",
    price: 1200,
    salePrice: 1100,
    purchasePrice: 800,
    sku: "HNY-BLK-SD-002",
    stock: 60,
    categorySlug: "organic-honey",
    tags: ["honey", "black seed", "organic", "premium"],
    images: ["/assets/images/products/black_seed_honey_img_1778345423989.webp"],
    isFeatured: false,
    isNewArrival: true,
  },
  {
    name: "Cold Pressed Extra Virgin Coconut Oil",
    slug: "cold-pressed-extra-virgin-coconut-oil",
    description: "100% natural and cold-pressed extra virgin coconut oil. Retains all natural nutrients, aroma, and health benefits. Perfect for cooking or skin care.",
    price: 480,
    salePrice: 450,
    purchasePrice: 300,
    sku: "OIL-CCN-EVR-001",
    stock: 90,
    categorySlug: "pure-ghee-oils",
    tags: ["coconut oil", "virgin oil", "organic", "cold pressed"],
    images: ["/assets/images/products/virgin_coconut_oil_img_1778345526404.webp"],
    isFeatured: true,
    isNewArrival: false,
  },
  {
    name: "Wood Pressed Pure Mustard Oil",
    slug: "wood-pressed-pure-mustard-oil",
    description: "Traditionally extracted using wood pressing (Khani) from high-quality local mustard seeds. Unrefined and completely free from preservatives.",
    price: 350,
    salePrice: 320,
    purchasePrice: 220,
    sku: "OIL-MST-WOD-002",
    stock: 200,
    categorySlug: "pure-ghee-oils",
    tags: ["mustard oil", "khani", "cooking oil", "organic"],
    images: ["/assets/images/products/wood_pressed_mustard_oil_img_1778345506999.webp"],
    isFeatured: false,
    isNewArrival: false,
  },
  {
    name: "Premium Organic Turmeric Powder",
    slug: "premium-organic-turmeric-powder",
    description: "Finely ground organic turmeric with high curcumin content. Adds a vibrant golden color and earthy flavor to all traditional recipes.",
    price: 180,
    salePrice: 150,
    purchasePrice: 90,
    sku: "SPC-TUR-ORG-001",
    stock: 300,
    categorySlug: "organic-spices",
    tags: ["turmeric", "spices", "organic", "powder"],
    images: ["/assets/images/products/organic_turmeric_powder_1778373855826.webp"],
    isFeatured: true,
    isNewArrival: false,
  },
  {
    name: "Ceylon Cinnamon Sticks",
    slug: "ceylon-cinnamon-sticks",
    description: "Authentic, thin-layered Ceylon cinnamon sticks. Highly aromatic with a sweet, delicate flavor. Imported directly from select organic farms.",
    price: 390,
    salePrice: 350,
    purchasePrice: 240,
    sku: "SPC-CIN-CYL-002",
    stock: 110,
    categorySlug: "organic-spices",
    tags: ["cinnamon", "spices", "ceylon", "aromatic"],
    images: ["/assets/images/products/ceylon_cinnamon_sticks_1778373905330.webp"],
    isFeatured: false,
    isNewArrival: true,
  },
  {
    name: "High-Starch Maize Corn Silage (Premium)",
    slug: "high-starch-maize-corn-silage-premium",
    description: "Premium high-starch corn silage formulated for maximum dairy milk yields and healthy livestock weight gain. High dry matter content and excellent palatability.",
    price: 15,
    salePrice: 13,
    purchasePrice: 9,
    sku: "SLG-MZ-PREM-001",
    stock: 5000,
    categorySlug: "corn-silage",
    tags: ["silage", "maize", "livestock", "feed"],
    images: ["/assets/images/products/aromatic_red_rice_jute_bag_1778374084524.webp"],
    isFeatured: true,
    isNewArrival: false,
  },
  {
    name: "Standard Maize Silage (50kg Bag)",
    slug: "standard-maize-silage-50kg-bag",
    description: "Top-grade fermented maize silage packed in heavy-duty 50kg bags. Ensures easy handling, storage, and keeps the nutrition fresh for months.",
    price: 750,
    salePrice: 680,
    purchasePrice: 450,
    sku: "SLG-MZ-50KG-002",
    stock: 200,
    categorySlug: "corn-silage",
    tags: ["silage", "50kg", "livestock", "feed"],
    images: ["/assets/images/products/California Shelled Almonds.webp"],
    isFeatured: false,
    isNewArrival: true,
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully. Fetching categories...');

    for (const item of productsData) {
      // Find category by slug
      const category = await Category.findOne({ slug: item.categorySlug });
      if (!category) {
        console.error(`Category not found for slug: ${item.categorySlug}`);
        continue;
      }

      const productPayload = {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        salePrice: item.salePrice,
        purchasePrice: item.purchasePrice,
        discountRate: Math.round(((item.price - item.salePrice) / item.price) * 100),
        sku: item.sku,
        stock: item.stock,
        categories: [category._id],
        tags: item.tags,
        images: item.images,
        isFeatured: item.isFeatured,
        isNewArrival: item.isNewArrival,
        isFlashSale: false,
        isPublished: true,
        ratings: 4 + Math.random(),
        numReviews: Math.floor(Math.random() * 20) + 1,
        views: Math.floor(Math.random() * 200) + 10,
        totalSales: Math.floor(Math.random() * 50) + 5
      };

      const existing = await Product.findOne({ slug: item.slug });
      if (!existing) {
        await Product.create(productPayload);
        console.log(`Created product: ${item.name}`);
      } else {
        Object.assign(existing, productPayload);
        await existing.save();
        console.log(`Updated product: ${item.name}`);
      }
    }

    console.log('Product seeding completed!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
