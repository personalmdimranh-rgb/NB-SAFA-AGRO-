const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb+srv://SafaAgro:YrXRi7yPmQfJWiw5@cluster0.e5n1hnl.mongodb.net/ShafaAgro";

// Define inline schemas to avoid ESM/TS loading issues in plain node script
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, required: true },
  status: { type: String, default: 'active' },
  phone: { type: String, required: true },
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const DealerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopName: { type: String, required: true },
  address: {
    village: String,
    union: String,
    thana: String,
    district: String
  },
  nidNumber: String,
  currentDues: { type: Number, default: 0 }
});

const Dealer = mongoose.models.Dealer || mongoose.model('Dealer', DealerSchema);

const FarmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: {
    village: String,
    thana: String,
    district: String
  },
  currentDues: { type: Number, default: 0 }
});

const Farmer = mongoose.models.Farmer || mongoose.model('Farmer', FarmerSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Let's seed 5 directors
  const directors = [
    { name: 'Director Kamal', email: 'director.kamal@mail.com', phone: '01712345601', role: 'director' },
    { name: 'Director Hasan', email: 'director.hasan@mail.com', phone: '01712345602', role: 'director' },
    { name: 'Director Nila', email: 'director.nila@mail.com', phone: '01712345603', role: 'director' },
    { name: 'Director Rashed', email: 'director.rashed@mail.com', phone: '01712345604', role: 'director' },
    { name: 'Director Tania', email: 'director.tania@mail.com', phone: '01712345605', role: 'director' },
  ];

  for (const d of directors) {
    const exists = await User.findOne({ email: d.email });
    if (!exists) {
      const user = new User({ ...d, password: '123@Test' });
      await user.save();
      console.log(`Seeded Director: ${d.name}`);
    }
  }

  // Let's seed 5 dealers
  const dealers = [
    { name: 'Dealer Abul', email: 'dealer.abul@mail.com', phone: '01812345601', role: 'dealer', shopName: 'Abul Traders', village: 'Gopalpur', union: 'Gopalpur', thana: 'Savar', district: 'Dhaka' },
    { name: 'Dealer Babul', email: 'dealer.babul@mail.com', phone: '01812345602', role: 'dealer', shopName: 'Babul Feed Store', village: 'Mirpur', union: 'Mirpur', thana: 'Mirpur', district: 'Dhaka' },
    { name: 'Dealer Kabir', email: 'dealer.kabir@mail.com', phone: '01812345603', role: 'dealer', shopName: 'Kabir Agro', village: 'Signboard', union: 'Signboard', thana: 'Feni Sadar', district: 'Feni' },
    { name: 'Dealer Selim', email: 'dealer.selim@mail.com', phone: '01812345604', role: 'dealer', shopName: 'Selim Feed Center', village: 'Mymensingh Bazar', union: 'Mymensingh', thana: 'Mymensingh Sadar', district: 'Mymensingh' },
    { name: 'Dealer Younus', email: 'dealer.younus@mail.com', phone: '01812345605', role: 'dealer', shopName: 'Younus & Sons', village: 'Dhanmondi', union: 'Dhanmondi', thana: 'Dhanmondi', district: 'Dhaka' },
  ];

  for (const dl of dealers) {
    const exists = await User.findOne({ email: dl.email });
    if (!exists) {
      const user = new User({
        name: dl.name,
        email: dl.email,
        phone: dl.phone,
        role: dl.role,
        password: '123@Test'
      });
      const savedUser = await user.save();
      
      const dealerProfile = new Dealer({
        userId: savedUser._id,
        shopName: dl.shopName,
        address: {
          village: dl.village,
          union: dl.union,
          thana: dl.thana,
          district: dl.district
        },
        nidNumber: '1234567890123',
        currentDues: 0
      });
      await dealerProfile.save();
      console.log(`Seeded Dealer: ${dl.name}`);
    }
  }

  // Let's seed 5 farmers
  const farmers = [
    { name: 'Farmer Mofiz', email: 'farmer.mofiz@mail.com', phone: '01912345601', village: 'Chapainawabganj', thana: 'Chapai Sadar', district: 'Chapainawabganj' },
    { name: 'Farmer Rafiq', email: 'farmer.rafiq@mail.com', phone: '01912345602', village: 'Bogra Bazar', thana: 'Sherpur', district: 'Bogra' },
    { name: 'Farmer Shamim', email: 'farmer.shamim@mail.com', phone: '01912345603', village: 'Rangpur Village', thana: 'Mithapukur', district: 'Rangpur' },
    { name: 'Farmer Jalal', email: 'farmer.jalal@mail.com', phone: '01912345604', village: 'Jessore Bazar', thana: 'Jessore Sadar', district: 'Jessore' },
    { name: 'Farmer Karim', email: 'farmer.karim@mail.com', phone: '01912345605', village: 'Barisal Village', thana: 'Uzirpur', district: 'Barisal' },
  ];

  for (const f of farmers) {
    const existsUser = await User.findOne({ email: f.email });
    if (!existsUser) {
      const user = new User({
        name: f.name,
        email: f.email,
        phone: f.phone,
        role: 'user',
        password: '123@Test'
      });
      await user.save();
    }

    const existsFarmer = await Farmer.findOne({ phone: f.phone });
    if (!existsFarmer) {
      const farmerProfile = new Farmer({
        name: f.name,
        phone: f.phone,
        address: {
          village: f.village,
          thana: f.thana,
          district: f.district
        },
        currentDues: 0
      });
      await farmerProfile.save();
      console.log(`Seeded Farmer: ${f.name}`);
    }
  }

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
