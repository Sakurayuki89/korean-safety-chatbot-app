import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DB_NAME, COLLECTION_NAMES } from '@/lib/constants';

// POST feedback
export async function POST(request: Request) {
  try {
    const { messageId, messageText, feedback } = await request.json();
    
    if (!messageId || !feedback) {
      return NextResponse.json({ error: 'messageId and feedback are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAMES.FEEDBACK);

    const feedbackEntry = {
      messageId,
      messageText: messageText || '',
      feedback: feedback, // 'good' or 'bad'
      createdAt: new Date(),
      userAgent: request.headers.get('user-agent') || '',
    };

    await collection.insertOne(feedbackEntry);
    console.log(`✅ Feedback saved: ${feedback} for message ${messageId}`);
    
    return NextResponse.json({ message: 'Feedback saved successfully' }, { status: 201 });
  } catch (e) {
    console.error('Feedback API error:', e);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}

// GET feedback statistics (optional - for admin dashboard)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAMES.FEEDBACK);

    const stats = await collection.aggregate([
      {
        $group: {
          _id: '$feedback',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const totalFeedback = await collection.countDocuments();
    
    return NextResponse.json({
      totalFeedback,
      breakdown: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (e) {
    console.error('Feedback stats error:', e);
    return NextResponse.json({ error: 'Failed to get feedback stats' }, { status: 500 });
  }
}
