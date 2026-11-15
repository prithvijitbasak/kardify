import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

export async function getDatabase() {
  const uri = process.env.DB_URL as string;

  try {
    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
    }
    return client.db("kardify");
  } catch (error) {
    client = null;
    throw error;
  }
}
