import mongoose from "mongoose";

const uri = "mongodb+srv://GOMart:S4Epscw0SOkd5ZtG@cluster0.e5n1hnl.mongodb.net/GOMart";

const categoriesData = [
  {
    name: "Organic Honey",
    slug: "organic-honey",
    image: "/assets/images/cagetory/organic_honey_category_1778344034194.webp",
    isActive: true,
  },
  {
    name: "Natural Oils",
    slug: "natural-oils",
    image: "/assets/images/cagetory/natural_oils_category_1778344059813.webp",
    isActive: true,
  },
  {
    name: "Herbal Medicine",
    slug: "herbal-medicine",
    image: "/assets/images/cagetory/herbal_medicine_category_1778344082037.webp",
    isActive: true,
  },
  {
    name: "Dry Fruits",
    slug: "dry-fruits",
    image: "/assets/images/cagetory/dry_fruits_category_1778344105530.webp",
    isActive: true,
  },
  {
    name: "Organic Spices",
    slug: "organic-spices",
    image: "/assets/images/cagetory/organic_spices_category_1778344130003.webp",
    isActive: true,
  },
  {
    name: "Herbal Tea",
    slug: "herbal-tea",
    image: "/assets/images/cagetory/herbal_tea_category_1778344158301.webp",
    isActive: true,
  },
  {
    name: "Organic Grains",
    slug: "organic-grains",
    image: "/assets/images/cagetory/organic_grains_category_1778344185901.webp",
    isActive: true,
  },
  {
    name: "Organic Fruits",
    slug: "organic-fruits",
    image: "/assets/images/cagetory/organic_fruits_category_1778344207005.webp",
    isActive: true,
  },
  {
    name: "Organic Skincare",
    slug: "organic-skincare",
    image: "/assets/images/cagetory/organic_skincare_category_1778344233376.webp",
    isActive: true,
  },
  {
    name: "Health Drinks",
    slug: "health-drinks",
    image: "/assets/images/cagetory/health_drinks_category_1778344257804.webp",
    isActive: true,
  }
];

async function seed() {
  console.log("Connecting to GOMart database...");
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const categoriesCol = db.collection("categories");

  console.log("Checking for existing categories...");
  const count = await categoriesCol.countDocuments({});
  console.log(`Currently there are ${count} categories in the database.`);

  console.log("Inserting new categories...");
  for (const cat of categoriesData) {
    const existing = await categoriesCol.findOne({ slug: cat.slug });
    if (existing) {
      console.log(`Category "${cat.name}" already exists. Updating image path...`);
      await categoriesCol.updateOne(
        { _id: existing._id },
        { $set: { image: cat.image, isActive: true } }
      );
    } else {
      console.log(`Inserting category: "${cat.name}"`);
      await categoriesCol.insertOne({
        ...cat,
        parentCategory: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  console.log("Seeding finished successfully!");
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
