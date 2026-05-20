import mongoose from "mongoose";

async function checkBlogs() {
  const uri = "mongodb+srv://RPLmarket:Quzbf6bsmXGARrw9@cluster0.e5n1hnl.mongodb.net/RPLmarket";
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  const blogs = await db.collection("blogs").find({
    $or: [
      { title: /RPL/i },
      { content: /RPL/i },
      { summary: /RPL/i }
    ]
  }).toArray();
  
  console.log(`Found ${blogs.length} blogs matching RPL`);
  for (const b of blogs) {
    console.log(`- Blog: ${b.title}`);
  }
  
  await mongoose.disconnect();
}

checkBlogs().catch(console.error);
