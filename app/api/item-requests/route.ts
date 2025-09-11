import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[GET /api/item-requests] Fetching item requests...');
    const client = await clientPromise;
    const db = client.db();
    const requests = await db.collection('item_requests').find({}).sort({ requestDate: -1 }).toArray();
    
    console.log(`[GET /api/item-requests] Found ${requests.length} requests`);
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching item requests:', error);
    return NextResponse.json({ error: 'Failed to fetch item requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('[POST /api/item-requests] Processing new item request...');
    const { userName, itemName, itemSize, itemId } = await req.json();

    if (!userName || !itemName || !itemSize || !itemId) {
      console.error('[POST /api/item-requests] Missing required fields');
      return NextResponse.json({ error: '모든 필드가 필요합니다.' }, { status: 400 });
    }

    console.log('[POST /api/item-requests] Request data:', { userName, itemName, itemSize, itemId });

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('item_requests').insertOne({
      userName,
      itemName,
      itemSize,
      itemId, // Storing the ID of the requested item
      requestDate: new Date(),
      status: 'pending', // Default status
    });

    console.log(`[POST /api/item-requests] Request saved with ID: ${result.insertedId}`);
    return NextResponse.json({ success: true, insertedId: result.insertedId });

  } catch (error) {
    console.error('Error in item-requests POST handler:', error);
    return NextResponse.json({ error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('item_requests').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item request:', error);
    return NextResponse.json({ error: 'Failed to delete item request' }, { status: 500 });
  }
}
