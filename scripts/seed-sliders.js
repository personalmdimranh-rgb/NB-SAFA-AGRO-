const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://SafaAgro:YrXRi7yPmQfJWiw5@cluster0.e5n1hnl.mongodb.net/ShafaAgro';

const SliderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    ctaText: { type: String },
    ctaLink: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Slider = mongoose.models.Slider || mongoose.model('Slider', SliderSchema);

const slidersData = [
  {
    title: "Premium High-Starch Maize Silage",
    subtitle: "Formulated for maximum dairy milk yields and healthy livestock weight gain.",
    image: "/assets/images/Banner/Banner.webp",
    ctaText: "Explore Shop",
    ctaLink: "/shop",
    order: 1,
    isActive: true
  },
  {
    title: "Vacuum Compacted & UV Protected",
    subtitle: "Ensures anaerobic fermentation and preserves nutrients for up to 18 months.",
    image: "/assets/images/Banner/Banner (2).webp",
    ctaText: "Dealer Portal",
    ctaLink: "/register",
    order: 2,
    isActive: true
  },
  {
    title: "Certified Aflatoxin-Safe Feed",
    subtitle: "Rigorous quality audits and tested in premium agricultural laboratories.",
    image: "/assets/images/Banner/Banner (3).webp",
    ctaText: "Our Team",
    ctaLink: "/team",
    order: 3,
    isActive: true
  },
  {
    title: "Empowering Livestock Farming",
    subtitle: "High-fidelity supply transparency and reliable dealer networks.",
    image: "/assets/images/Banner/Banner (4).webp",
    ctaText: "Contact Us",
    ctaLink: "/contact",
    order: 4,
    isActive: true
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully. Seeding sliders...');

    // Clear existing sliders to avoid duplicate seedings
    await Slider.deleteMany({});
    console.log('Cleared existing sliders.');

    for (const slider of slidersData) {
      await Slider.create(slider);
      console.log(`Created slider: ${slider.title}`);
    }

    console.log('Slider seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
