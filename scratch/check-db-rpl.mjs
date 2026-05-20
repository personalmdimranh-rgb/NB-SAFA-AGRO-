import mongoose from "mongoose";

async function check() {
  const uri = "mongodb+srv://RPLmarket:Quzbf6bsmXGARrw9@cluster0.e5n1hnl.mongodb.net/RPLmarket";
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  // Check globalsettings
  const settings = await db.collection("globalsettings").find({}).toArray();
  console.log("--- Global Settings ---");
  for (const s of settings) {
    console.log(`ID: ${s._id}, brandName: ${s.brandName}, domain: ${s.domain}, email: ${s.contact?.email}`);
  }
  
  // Check products
  const products = await db.collection("products").find({
    $or: [
      { name: /RPL/i },
      { description: /RPL/i }
    ]
  }).toArray();
  console.log("\n--- Products with RPL ---");
  console.log(`Found ${products.length} products`);
  for (const p of products) {
    console.log(`- Product: ${p.name} (Slug: ${p.slug})`);
  }
  
  // Check categories
  const categories = await db.collection("categories").find({
    $or: [
      { name: /RPL/i },
      { description: /RPL/i }
    ]
  }).toArray();
  console.log("\n--- Categories with RPL ---");
  console.log(`Found ${categories.length} categories`);
  for (const c of categories) {
    console.log(`- Category: ${c.name}`);
  }

  // Check FAQs
  const faqs = await db.collection("faqs").find({
    $or: [
      { question: /RPL/i },
      { answer: /RPL/i }
    ]
  }).toArray();
  console.log("\n--- FAQs with RPL ---");
  console.log(`Found ${faqs.length} FAQs`);
  for (const f of faqs) {
    console.log(`- Q: ${f.question}`);
  }
  
  await mongoose.disconnect();
}

check().catch(console.error);
