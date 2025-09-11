import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[GET /api/safety-items] Fetching safety items...');
    const client = await clientPromise;
    const db = client.db();
    const items = await db.collection('safety_items').find({}).sort({ createdAt: -1 }).toArray();
    
    console.log(`[GET /api/safety-items] Found ${items.length} items`);
    items.forEach(item => {
      console.log(`[GET /api/safety-items] Item - name: "${item.name}", size: "${item.size}", description: "${item.description}"`);
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching safety items:', error);
    return NextResponse.json({ error: 'Failed to fetch safety items' }, { status: 500 });
  }
}
