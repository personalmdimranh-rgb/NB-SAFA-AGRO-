import mongoose from "mongoose";

async function count() {
  const uri = "mongodb+srv://RPLmarket:Quzbf6bsmXGARrw9@cluster0.e5n1hnl.mongodb.net/RPLmarket";
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    const cnt = await db.collection(col.name).countDocuments();
    console.log(`Collection ${col.name}: ${cnt} documents`);
  }
  
  await mongoose.disconnect();
}

count().catch(console.error);
