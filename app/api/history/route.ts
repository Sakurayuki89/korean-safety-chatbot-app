
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    // If no session ID is provided, there is no history to fetch.
    if (!sessionId) {
      return NextResponse.json([]);
    }

    const client = await clientPromise;
    const db = client.db("korean-safety-chatbot");
    const messagesCollection = db.collection("messages");

    // Find messages that match the session ID
    const messages = await messagesCollection.find({ sessionId }).sort({ createdAt: 1 }).toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.log("⚠️ DB fetch failed, returning empty history:", (error as Error).message);
    return NextResponse.json([]);
  }
}
