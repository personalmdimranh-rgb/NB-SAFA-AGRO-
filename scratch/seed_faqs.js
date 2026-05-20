const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://GOMart:S4Epscw0SOkd5ZtG@cluster0.e5n1hnl.mongodb.net/GOMart";

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

const faqs = [
  {
    question: "What is GO Mart?",
    answer: "GO Mart is a multi-version e-commerce platform designed to customize and deploy tailored online storefronts for various clients using modular UI component versions (V1 to V6).",
    order: 1,
    isActive: true
  },
  {
    question: "How do I change the theme of my storefront?",
    answer: "The storefront themes are controlled dynamically using CSS variables defined in the theme configuration file. You can change themes (e.g., Vintage, Cyberpunk, Ocean) without changing the core codebase.",
    order: 2,
    isActive: true
  },
  {
    question: "What UI component versions are supported?",
    answer: "Currently, we support versions V1 to V6 for core components like Navbars, Footers, and Product Cards, allowing clients to choose their desired look and feel.",
    order: 3,
    isActive: true
  },
  {
    question: "Does GO Mart support MongoDB?",
    answer: "Yes, GO Mart uses MongoDB as its primary database to store product details, orders, client configurations, and global settings securely.",
    order: 4,
    isActive: true
  },
  {
    question: "How are alerts and confirmations handled?",
    answer: "We use SweetAlert2 for all administrative confirmations and success/error notifications to provide a premium, modern, and consistent user experience.",
    order: 5,
    isActive: true
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");
    
    // Clear existing FAQs to prevent duplicates
    await FAQ.deleteMany({});
    console.log("Cleared existing FAQs.");
    
    await FAQ.insertMany(faqs);
    console.log("Successfully seeded 5 FAQs.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
