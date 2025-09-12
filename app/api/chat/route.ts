import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '../../../lib/mongodb';
import genAI from '@/lib/gemini';
import { KOREAN_PERSONA } from '@/lib/prompts';
import { randomUUID } from 'crypto';
import { generateContextPrompt, ContextInfo } from '@/lib/context-manager';

export async function POST(req: NextRequest) {
  try {
    // --- Get JSON Body & Session ID ---
    const body = await req.json();
    const message: string = body.message;
    const contextInfo: ContextInfo | null = body.contextInfo;
    const sessionIdFromClient: string | null = body.sessionId;

    const sessionId = sessionIdFromClient || randomUUID();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // --- AI Model Setup ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: KOREAN_PERSONA }] },
        { role: "model", parts: [{ text: "안녕하세요! 안전이예요 😊 안전 관련해서 궁금한 게 있으시면 언제든 물어보세요!" }] },
      ],
      generationConfig: {
        maxOutputTokens: 2048, // Increased for potentially longer and more detailed responses
      },
    });

    // --- Generate Prompt with Context ---
    const finalPrompt = contextInfo 
      ? generateContextPrompt(message, contextInfo)
      : message;

    // --- Get AI Stream Response ---
    const result = await chat.sendMessageStream(finalPrompt);

    // --- Encode the stream for the client ---
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponseText = "";

        // Save user message to DB right away
        try {
          const client = await getMongoClient();
          const db = client.db("korean-safety-chatbot");
          await db.collection("messages").insertOne({
            sessionId,
            role: 'user',
            content: message, // Store the original message, not the context-injected one
            context: contextInfo, // Optionally store context for history
            createdAt: new Date(),
          });
          console.log("✅ User message saved to DB");
        } catch (dbError) {
          console.log("⚠️ DB save for user message failed:", (dbError as Error).message);
        }

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponseText += chunkText;
          controller.enqueue(encoder.encode(chunkText));
        }

        // Now save the full assistant response
        try {
          const client = await getMongoClient();
          const db = client.db("korean-safety-chatbot");
          await db.collection("messages").insertOne({
            sessionId,
            role: 'assistant',
            content: fullResponseText,
            createdAt: new Date(),
          });
          console.log("✅ Assistant message saved to DB");
        } catch (dbError) {
          console.log("⚠️ DB save for assistant message failed:", (dbError as Error).message);
        }

        controller.close();
      },
    });

    // --- Return stream and session ID in header ---
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-session-id': sessionId,
      },
    });

  } catch (error) {
    console.error("An error occurred in chat API:", error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}