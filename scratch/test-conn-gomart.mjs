import mongoose from "mongoose";

async function test() {
  const uri = "mongodb+srv://RPLmarket:Quzbf6bsmXGARrw9@cluster0.e5n1hnl.mongodb.net/GOMart";
  console.log("Connecting...");
  await mongoose.connect(uri);
  console.log("Connected successfully to GOMart database!");
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("Collections in GOMart:", collections.map(c => c.name));
  await mongoose.disconnect();
}

test().catch(console.error);
