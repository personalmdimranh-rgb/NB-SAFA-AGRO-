const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://RPLmarket:Quzbf6bsmXGARrw9@cluster0.e5n1hnl.mongodb.net/RPLmarket";

// Define Mongoose Schema for FAQ
const FAQSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);

const sampleFAQs = [
  {
    question: "How do I order prescription medicines on RPL Market?",
    answer: "Ordering prescription medicines is fast and easy! Simply upload a clear photo of your valid prescription written by a registered physician when checking out, or send it to us via WhatsApp at our official helpline. Our licensed pharmacist will review the prescription before your order is dispatched.",
    order: 1,
    isActive: true
  },
  {
    question: "Are all the medicines and clinical products genuine?",
    answer: "Yes, 100%. RPL Market strictly enforces a zero-counterfeit policy. All medicines, surgical tools, diagnostic devices, and wellness supplements are sourced directly from authorized manufacturers and licensed pharmaceutical distributors, stored under optimal temperature-controlled conditions.",
    order: 2,
    isActive: true
  },
  {
    question: "How long does home delivery take?",
    answer: "For deliveries inside Dhaka, your package will arrive within 24 to 48 hours. For orders outside Dhaka, it typically takes 2 to 4 business days via our trusted nationwide delivery partners. Express delivery options are also available during checkout.",
    order: 3,
    isActive: true
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We offer a hassle-free 7-day return policy for diagnostic machines and tools if they are found defective upon arrival. However, for clinical safety and hygiene regulations, opened medicines, surgical disposables, and baby personal hygiene products are non-returnable.",
    order: 4,
    isActive: true
  },
  {
    question: "What payment methods are supported on your platform?",
    answer: "We offer a wide variety of secure payment methods, including Cash on Delivery (COD) across all districts in Bangladesh, secure mobile banking (bKash, Nagad, Rocket), and all major domestic and international debit/credit cards.",
    order: 5,
    isActive: true
  }
];

async function seedFAQs() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully.");

    console.log("Clearing existing FAQs from database collection...");
    await FAQ.deleteMany({});
    console.log("Existing FAQs cleared.");

    console.log("Inserting 5 highly relevant healthcare FAQs...");
    const result = await FAQ.insertMany(sampleFAQs);
    console.log(`Successfully seeded ${result.length} FAQs!`);

    await mongoose.disconnect();
    console.log("Database connection closed gracefully.");
  } catch (error) {
    console.error("Error seeding FAQs:", error);
    process.exit(1);
  }
}

seedFAQs();
