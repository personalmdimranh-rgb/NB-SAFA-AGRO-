import mongoose from "mongoose";

const uri = "mongodb+srv://GOMart:S4Epscw0SOkd5ZtG@cluster0.e5n1hnl.mongodb.net/GOMart";

const rawProductsData = [
  // --- Category 1: Organic Honey (isFlashSale = true) ---
  {
    name: "Sundarban Wild Forest Honey",
    image: "sundarban_wild_forest_honey_img_1778344034084.webp", // Fallback to actual files
    imageFile: "sundarban_wild_forest_honey_img_177834403804.webp", // Wait, let's use exact name from files
    imageName: "sundarban_wild_forest_honey_img_1778345403804.webp",
    categorySlug: "organic-honey",
    price: 850,
    salePrice: 699,
    description: "Premium raw honey harvested from the deep mangrove forests of Sundarbans. 100% natural and unprocessed with multiple health benefits.",
    weight: "500g",
    isFlashSale: true,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Kalojira Black Seed Honey",
    imageName: "black_seed_honey_img_1778345423989.webp",
    categorySlug: "organic-honey",
    price: 1200,
    salePrice: 990,
    description: "Monofloral black seed honey gathered by bees from Kalojira (Nigella Sativa) fields. Highly prized for its rich therapeutic properties.",
    weight: "500g",
    isFlashSale: true,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Litchi Flower Honey",
    imageName: "litchi_flower_honey_img_1778345442933.webp",
    categorySlug: "organic-honey",
    price: 650,
    salePrice: 550,
    description: "Delightfully sweet and aromatic honey harvested from the litchi orchards. Possesses a light golden color and a distinct fruity essence.",
    weight: "500g",
    isFlashSale: true,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Mustard Flower Honey",
    imageName: "mustard_flower_honey_img_1778345464053.webp",
    categorySlug: "organic-honey",
    price: 550,
    salePrice: 450,
    description: "Naturally crystallizing organic honey sourced from golden mustard fields. Perfect as a natural sweetener for tea and baking.",
    weight: "500g",
    isFlashSale: true,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Raw Organic Honeycomb",
    imageName: "raw_honeycomb_img_1778345486986.webp",
    categorySlug: "organic-honey",
    price: 1600,
    salePrice: 1350,
    description: "Pure honey preserved inside its original beeswax comb. Cut straight from the hive, representing the most natural state of honey.",
    weight: "400g",
    isFlashSale: true,
    isNewArrival: false,
    isFeatured: false,
  },

  // --- Category 2: Natural Oils (isFlashSale = true) ---
  {
    name: "Wood Pressed Mustard Oil",
    imageName: "wood_pressed_mustard_oil_img_1778345506999.webp",
    categorySlug: "natural-oils",
    price: 380,
    salePrice: 320,
    description: "Traditionally wood-pressed (Kani) mustard oil made from select local mustard seeds. Maintains natural aroma, flavor, and nutrients.",
    weight: "1 Litre",
    isFlashSale: true,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Extra Virgin Coconut Oil",
    imageName: "virgin_coconut_oil_img_1778345526404.webp",
    categorySlug: "natural-oils",
    price: 750,
    salePrice: 650,
    description: "Cold-pressed from fresh organic coconuts. Excellent for healthy cooking, hair treatment, and skin moisturization.",
    weight: "500ml",
    isFlashSale: true,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Premium Extra Virgin Olive Oil",
    imageName: "Extra Virgin Olive Oil.webp",
    categorySlug: "natural-oils",
    price: 1100,
    salePrice: 950,
    description: "Cold extracted from premium hand-picked organic olives. Rich in antioxidants and healthy monounsaturated fats.",
    weight: "500ml",
    isFlashSale: true,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Cold Pressed Black Seed Oil",
    imageName: "Premium Black Seed Oil.webp",
    categorySlug: "natural-oils",
    price: 950,
    salePrice: 850,
    description: "100% pure cold-pressed oil from premium black seeds. Commonly used as a daily remedy to boost immunity and skin health.",
    weight: "250ml",
    isFlashSale: true,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Pure Sweet Almond Oil",
    imageName: "Pure Sweet Almond Oil.webp",
    categorySlug: "natural-oils",
    price: 890,
    salePrice: 790,
    description: "Cold-pressed sweet almond oil, rich in vitamin E and essential fatty acids. Highly effective for nourishing skin and baby massages.",
    weight: "200ml",
    isFlashSale: true,
    isNewArrival: false,
    isFeatured: false,
  },

  // --- Category 3: Herbal Medicine (isNewArrival = true) ---
  {
    name: "Organic Ashwagandha Powder",
    imageName: "Organic Ashwagandha Powder.webp",
    categorySlug: "herbal-medicine",
    price: 450,
    description: "Premium adaptogenic herb powder that helps reduce stress, boost energy levels, and improve overall physical vitality.",
    weight: "200g",
    isFlashSale: false,
    isNewArrival: true,
    isFeatured: false,
  },
  {
    name: "Organic Turmeric Capsules",
    imageName: "Organic Turmeric Capsules.webp",
    categorySlug: "herbal-medicine",
    price: 650,
    description: "Standardized organic turmeric extract capsules containing high curcumin concentration. Boosts joint health and decreases inflammation.",
    weight: "60 Capsules",
    isFlashSale: false,
    isNewArrival: true,
    isFeatured: false,
  },
  {
    name: "Premium Spirulina Powder",
    imageName: "Premium Spirulina Powder.webp",
    categorySlug: "herbal-medicine",
    price: 850,
    description: "Nutritious blue-green algae superfood powder. Packed with proteins, vitamins, and antioxidants for natural detoxification.",
    weight: "150g",
    isFlashSale: false,
    isNewArrival: true,
    isFeatured: false,
  },
  {
    name: "Pure Moringa Leaf Powder",
    imageName: "Pure Moringa Leaf Powder.webp",
    categorySlug: "herbal-medicine",
    price: 350,
    description: "Nutritious green superfood made from sun-dried moringa leaves. Excellent source of vitamins, iron, and calcium.",
    weight: "200g",
    isFlashSale: false,
    isNewArrival: true,
    isFeatured: false,
  },
  {
    name: "Triphala Digestive Powder",
    imageName: "Triphala Digestive Powde.webp",
    categorySlug: "herbal-medicine",
    price: 290,
    description: "Traditional Ayurvedic formulation combining Amla, Haritaki, and Bibhitaki. Supports digestive health and natural colon cleanse.",
    weight: "150g",
    isFlashSale: false,
    isNewArrival: true,
    isFeatured: false,
  },

  // --- Category 4: Dry Fruits (isNewArrival = true) ---
  {
    name: "California Shelled Almonds",
    imageName: "California Shelled Almonds.webp",
    categorySlug: "dry-fruits",
    price: 600,
    description: "Premium raw California almonds. Highly nutritious, rich in healthy fats, vitamin E, and magnesium.",
    weight: "250g",
    isFlashSale: false,
    isNewArrival: true,
    isFeatured: false,
  },
  {
    name: "Premium Mixed Dry Fruits & Berries",
    imageName: "Mixed Dry Fruits & Berries.webp",
    categorySlug: "dry-fruits",
    price: 980,
    description: "A healthy mix of premium cashew nuts, almonds, walnuts, raisins, dried cranberries, and pumpkin seeds.",
    weight: "500g",
    isFlashSale: false,
    isNewArrival: true,
    isFeatured: false,
  },
  {
    name: "Premium Ajwa Dates (Madinah)",
    imageName: "Premium Ajwa Dates (Madinah).webp",
    categorySlug: "dry-fruits",
    price: 1100,
    description: "Authentic, dark, soft Ajwa dates imported directly from Madinah, Saudi Arabia. Famous for their spiritual and health benefits.",
    weight: "500g",
    isFlashSale: false,
    isNewArrival: true,
    isFeatured: false,
  },
  {
    name: "Premium Walnut Kernels",
    imageName: "Premium Walnut Kernels.webp",
    categorySlug: "dry-fruits",
    price: 750,
    description: "Crispy and fresh shelled halves of organic walnuts. Excellent brain food rich in Omega-3 fatty acids.",
    weight: "250g",
    isFlashSale: false,
    isNewArrival: true,
    isFeatured: false,
  },
  {
    name: "Roasted Whole Cashew Nuts",
    imageName: "Roasted Whole Cashew Nuts.webp",
    categorySlug: "dry-fruits",
    price: 520,
    description: "Perfectly roasted, crunchy, salted cashew nuts. Rich in plant-based proteins, fiber, and essential minerals.",
    weight: "250g",
    isFlashSale: false,
    isNewArrival: true,
    isFeatured: false,
  },

  // --- Category 5: Organic Spices (isFeatured = true) ---
  {
    name: "Organic Turmeric Powder",
    imageName: "organic_turmeric_powder_1778373855826.webp",
    categorySlug: "organic-spices",
    price: 180,
    description: "Pure, high-curcumin organic turmeric powder with no artificial coloring or additives. Sourced from local farmers.",
    weight: "200g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: true,
  },
  {
    name: "Premium Red Chili Powder",
    imageName: "premium_red_chili_powder_1778373870948.webp",
    categorySlug: "organic-spices",
    price: 220,
    description: "Freshly ground red chili powder that delivers authentic flavor and heat. Made from naturally dried chilies.",
    weight: "200g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: true,
  },
  {
    name: "Whole Black Pepper Corns",
    imageName: "whole_black_pepper_corns_1778373888662.webp",
    categorySlug: "organic-spices",
    price: 340,
    description: "Hand-picked whole organic black peppercorns with intense aroma and sharp spicy flavor. Perfect for fresh grinding.",
    weight: "150g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: true,
  },
  {
    name: "Ceylon Cinnamon Sticks",
    imageName: "ceylon_cinnamon_sticks_1778373905330.webp",
    categorySlug: "organic-spices",
    price: 490,
    description: "Premium quality authentic Ceylon cinnamon sticks. Highly aromatic with a sweet, delicate flavor compared to cassia.",
    weight: "100g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: true,
  },
  {
    name: "Premium Green Cardamom",
    imageName: "green_cardamom_premium_1778373923019.webp",
    categorySlug: "organic-spices",
    price: 650,
    description: "Select large green cardamom pods with strong aroma and fresh taste. Hand-sorted to ensure uniform premium size.",
    weight: "100g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: true,
  },

  // --- Category 6: Herbal Tea (isFeatured = true) ---
  {
    name: "Organic Green Tea Leaves",
    imageName: "organic_green_tea_leaves_1778373944818.webp",
    categorySlug: "herbal-tea",
    price: 280,
    description: "Whole-leaf organic green tea leaves harvested from sustainable high-altitude tea gardens. Rich in protective catechins.",
    weight: "100g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: true,
  },
  {
    name: "Hibiscus Flower Tea",
    imageName: "hibiscus_tea_flowers_1778373966990.webp",
    categorySlug: "herbal-tea",
    price: 320,
    description: "Premium dried organic hibiscus flowers. Brews a vibrant ruby-red herbal tea with a tart, cranberry-like flavor.",
    weight: "100g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: true,
  },
  {
    name: "Chamomile Flower Tea",
    imageName: "chamomile_flower_tea_1778373983068.webp",
    categorySlug: "herbal-tea",
    price: 450,
    description: "Whole organic chamomile flowers. Known for its soothing properties, making it the perfect bedtime relaxing tea.",
    weight: "80g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: true,
  },
  {
    name: "Tulsi Ginger Herbal Blend Tea",
    imageName: "tulsi_ginger_herbal_blend_tea_1778373997289.webp",
    categorySlug: "herbal-tea",
    price: 350,
    description: "A warming and spicy blend of organic holy basil (Tulsi) leaves and dry ginger pieces. Helps soothe cough and cold.",
    weight: "100g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: true,
  },
  {
    name: "Ceremonial Matcha Green Tea",
    imageName: "ceremonial_matcha_powder_bowl_1778374016834.webp",
    categorySlug: "herbal-tea",
    price: 1800,
    description: "Finely stone-ground organic green tea powder from Uji, Japan. Ideal for traditional whisking and healthy matcha lattes.",
    weight: "50g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: true,
  },

  // --- Category 7: Organic Grains (isDiscounted = true, i.e., salePrice set) ---
  {
    name: "Organic Black Chia Seeds",
    imageName: "organic_black_chia_seeds_jar_1778374038335.webp",
    categorySlug: "organic-grains",
    price: 420,
    salePrice: 350,
    description: "Premium organic black chia seeds. Highly water-absorbent seed packed with plant-based Omega-3, fiber, and calcium.",
    weight: "250g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Premium Tri-Color Quinoa",
    imageName: "tri_color_quinoa_bowl_1778374053723.webp",
    categorySlug: "organic-grains",
    price: 680,
    salePrice: 590,
    description: "A nutritious blend of organic white, red, and black quinoa seeds. Complete protein source with all essential amino acids.",
    weight: "400g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Golden Flax Seeds",
    imageName: "golden_flax_seeds_container_1778374069623.webp",
    categorySlug: "organic-grains",
    price: 250,
    salePrice: 199,
    description: "Premium organic golden flax seeds. High in dietary fiber and lignans. Excellent addition to smoothies and baked foods.",
    weight: "250g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Aromatic Red Rice",
    imageName: "aromatic_red_rice_jute_bag_1778374084524.webp",
    categorySlug: "organic-grains",
    price: 180,
    salePrice: 155,
    description: "Unpolished organic red rice with intact bran. Possesses a nutty flavor, chewy texture, and high mineral and fiber content.",
    weight: "1kg",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Raw Pumpkin Seeds",
    imageName: "raw_pumpkin_seeds_bowl_1778374100018.webp",
    categorySlug: "organic-grains",
    price: 480,
    salePrice: 390,
    description: "Shelled green pumpkin seeds (pepitas). Natural source of zinc, magnesium, and healthy plant fats for immune support.",
    weight: "250g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },

  // --- Category 8: Organic Fruits (isDiscounted = true, i.e., salePrice set) ---
  {
    name: "Naturally Ripened Banana Bunch",
    imageName: "naturally_ripened_banana_bunch_1778374121594.webp",
    categorySlug: "organic-fruits",
    price: 120,
    salePrice: 99,
    description: "Sweet, local bananas naturally ripened without any harmful chemical sprays or ethylene accelerators.",
    weight: "1 Dozen",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Premium Fresh Green Apples",
    imageName: "premium_green_apples_fresh_1778374139017.webp",
    categorySlug: "organic-fruits",
    price: 360,
    salePrice: 299,
    description: "Crispy and juicy fresh green apples imported from organic orchards. Great source of vitamins and dietary fiber.",
    weight: "1kg",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Fresh Dragon Fruit",
    imageName: "Fresh Dragon Fruit.webp",
    categorySlug: "organic-fruits",
    price: 450,
    salePrice: 380,
    description: "Locally harvested fresh red-fleshed dragon fruit. Very sweet, low-calorie, and rich in vitamin C and antioxidants.",
    weight: "1kg",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Organic Red Pomegranate",
    imageName: "Organic Red Pomegranate.webp",
    categorySlug: "organic-fruits",
    price: 550,
    salePrice: 470,
    description: "Ruby-red organic pomegranates with juicy, sweet seeds. Packed with protective polyphenols and vitamin C.",
    weight: "1kg",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Sweet Nagpur Oranges",
    imageName: "Sweet Nagpur Oranges.webp",
    categorySlug: "organic-fruits",
    price: 280,
    salePrice: 230,
    description: "Naturally sweet and juicy Nagpur oranges. Perfect for fresh juicing and obtaining daily dose of vitamin C.",
    weight: "1kg",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },

  // --- Category 9: Organic Skincare (Standard / Regular) ---
  {
    name: "Distilled Rose Water Mist",
    imageName: "Distilled Rose Water Mist.webp",
    categorySlug: "organic-skincare",
    price: 350,
    description: "100% pure steam-distilled organic rose water. Serves as a soothing facial toner, skin hydrator, and makeup remover.",
    weight: "120ml",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Multani Mitti (Fuller's Earth)",
    imageName: "Multani Mitti (Fuller's Earth).webp",
    categorySlug: "organic-skincare",
    price: 180,
    description: "Natural sun-dried clay powder for detoxifying face masks. Highly effective in absorbing excess oils and clearing pores.",
    weight: "150g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Organic Neem Face Pack",
    imageName: "Organic Neem Face Pack.webp",
    categorySlug: "organic-skincare",
    price: 280,
    description: "Herbal face mask containing neem leaf powder, clay, and essential oils. Fights acne-causing bacteria and soothes skin.",
    weight: "100g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Pure Aloe Vera Gel",
    imageName: "Pure Aloe Vera Gel.webp",
    categorySlug: "organic-skincare",
    price: 390,
    description: "99% pure organic aloe vera gel cold-stabilized from fresh inner leaves. Soothes sunburns, hydrates skin, and conditions hair.",
    weight: "200ml",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Unrefined Shea Butter",
    imageName: "Unrefined Shea Butter.webp",
    categorySlug: "organic-skincare",
    price: 750,
    description: "Pure raw unrefined shea butter imported from Ghana. Premium natural moisturizer for dry skin, cracked heels, and eczema.",
    weight: "250g",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },

  // --- Category 10: Health Drinks (Standard / Regular) ---
  {
    name: "Apple Cider Vinegar (with Mother)",
    imageName: "Apple Cider Vinegar (Mother).webp",
    categorySlug: "health-drinks",
    price: 650,
    description: "Organic raw apple cider vinegar containing the beneficial 'Mother' of vinegar. Unfiltered, unpasteurized, and full of enzymes.",
    weight: "500ml",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Creamy Organic Soy Milk",
    imageName: "Creamy Organic Soy Milk.webp",
    categorySlug: "health-drinks",
    price: 320,
    description: "Rich, creamy, and dairy-free soy milk made from non-GMO organic soybeans. Excellent source of plant protein.",
    weight: "1 Litre",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Digestive Aloe Vera Juice",
    imageName: "Digestive Aloe Vera Juice.webp",
    categorySlug: "health-drinks",
    price: 390,
    description: "Organic health drink formulated with pure inner leaf aloe vera pulp. Helps soothe acidity and supports gut health.",
    weight: "500ml",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Natural Pomegranate Juice",
    imageName: "Natural Pomegranate Juice.webp",
    categorySlug: "health-drinks",
    price: 490,
    description: "100% natural cold-pressed pomegranate juice without any added sugar, preservatives, or artificial colors.",
    weight: "350ml",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  },
  {
    name: "Pure Amla Vitamin C Juice",
    imageName: "Pure Amla Vitamin C Juice.webp",
    categorySlug: "health-drinks",
    price: 290,
    description: "Cold extracted juice from fresh organic Indian gooseberries (Amla). Powerhouse of natural vitamin C to boost immunity.",
    weight: "500ml",
    isFlashSale: false,
    isNewArrival: false,
    isFeatured: false,
  }
];

async function seed() {
  console.log("Connecting to database...");
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const categoriesCol = db.collection("categories");
  const productsCol = db.collection("products");

  console.log("Fetching seeded categories...");
  const categories = await categoriesCol.find({}).toArray();
  const categoryMap = {};
  for (const cat of categories) {
    categoryMap[cat.slug] = cat._id;
  }

  console.log("Found categories in DB:", Object.keys(categoryMap));

  console.log("Cleaning existing products collection...");
  await productsCol.deleteMany({});
  console.log("Cleaned existing products.");

  console.log("Formatting and seeding 50 products...");
  const seededProducts = [];

  for (let i = 0; i < rawProductsData.length; i++) {
    const raw = rawProductsData[i];
    const catId = categoryMap[raw.categorySlug];

    if (!catId) {
      console.warn(`Warning: Category not found for slug "${raw.categorySlug}"`);
      continue;
    }

    const indexStr = String(i + 1).padStart(3, '0');
    const slug = raw.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const price = raw.price;
    const salePrice = raw.salePrice || null;
    let discountRate = null;
    if (salePrice) {
      discountRate = Math.round(((price - salePrice) / price) * 100);
    }
    const purchasePrice = Math.round(price * 0.7);

    const productDoc = {
      name: raw.name,
      slug: slug,
      description: raw.description,
      price: price,
      salePrice: salePrice,
      purchasePrice: purchasePrice,
      discountRate: discountRate,
      sku: `GOM-PROD-${indexStr}`,
      stock: Math.floor(Math.random() * 50) + 50, // 50 to 100 stock
      categories: [catId],
      tags: ["organic", "healthy", raw.categorySlug],
      images: [`/assets/images/products/${raw.imageName}`],
      attributes: [
        { key: "Origin", value: "Bangladesh" },
        { key: "Weight", value: raw.weight },
        { key: "Type", value: "Organic & Natural" }
      ],
      variants: [],
      isFeatured: raw.isFeatured,
      isNewArrival: raw.isNewArrival,
      isFlashSale: raw.isFlashSale,
      isPublished: true,
      ratings: parseFloat((4 + Math.random()).toFixed(1)), // 4.0 to 5.0
      numReviews: Math.floor(Math.random() * 20) + 5,      // 5 to 25 reviews
      views: Math.floor(Math.random() * 400) + 100,       // 100 to 500 views
      totalSales: Math.floor(Math.random() * 40) + 10,    // 10 to 50 sales
      createdAt: new Date(),
      updatedAt: new Date()
    };

    seededProducts.push(productDoc);
  }

  const result = await productsCol.insertMany(seededProducts);
  console.log(`Successfully seeded ${result.insertedCount} products in the database.`);

  await mongoose.disconnect();
  console.log("Database disconnected successfully.");
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
