import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import genAI from '@/lib/gemini';
import { KOREAN_PERSONA } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    // --- Get Form Data ---
    const formData = await req.formData();
    const message = formData.get('message') as string;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // --- AI Model Setup (Without DB for now) ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: KOREAN_PERSONA }] },
        { role: "model", parts: [{ text: "안녕하세요! 안전이예요 😊 안전 관련해서 궁금한 게 있으시면 언제든 물어보세요!" }] },
      ],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    // --- Get AI Response ---
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // --- Optional: Try DB save (graceful failure) ---
    try {
      const client = await clientPromise;
      const db = client.db("korean-safety-chatbot");
      const messagesCollection = db.collection("messages");
      
      await messagesCollection.insertOne({
        role: 'user',
        content: message,
        createdAt: new Date(),
      });
      
      await messagesCollection.insertOne({
        role: 'assistant',
        content: text,
        createdAt: new Date(),
      });
      console.log("✅ Messages saved to DB");
    } catch (dbError) {
      console.log("⚠️ DB save failed (continuing without DB):", (dbError as Error).message);
    }

    // --- Return Response ---
    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
