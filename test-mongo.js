const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

async function main() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  try {
    await client.connect();
    await client.db("QuickBite").command({ ping: 1 });
    console.log("MongoDB connection successful!");
  } catch (error) {
    console.error("MongoDB test failed:", error);
  } finally {
    await client.close();
  }
}

main();