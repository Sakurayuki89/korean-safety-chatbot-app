
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("korean-safety-chatbot");
    const messagesCollection = db.collection("messages");

    const messages = await messagesCollection.find({}).sort({ createdAt: 1 }).toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.log("⚠️ DB fetch failed, returning empty history:", (error as Error).message);
    // Return empty array if DB is not available
    return NextResponse.json([]);
  }
}
