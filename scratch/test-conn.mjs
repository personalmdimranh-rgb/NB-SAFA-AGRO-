import mongoose from "mongoose";

async function test() {
  const uri = "mongodb+srv://RPLmarket:Quzbf6bsmXGARrw9@cluster0.e5n1hnl.mongodb.net/RPLmarket";
  console.log("Connecting...");
  await mongoose.connect(uri);
  console.log("Connected!");
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
  
  if (collections.some(c => c.name === "globalsettings")) {
    const settings = await db.collection("globalsettings").find({}).toArray();
    console.log("Global Settings:", JSON.stringify(settings, null, 2));
  } else {
    console.log("No globalsettings collection!");
  }
  
  await mongoose.disconnect();
}

test().catch(console.error);
