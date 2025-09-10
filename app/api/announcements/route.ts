import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const DB_NAME = 'korean-safety-chatbot';
const COLLECTION_NAME = 'announcements';

// GET announcements, with optional search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    let query = {};
    if (searchTerm) {
      query = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
        ],
      };
    }

    const announcements = await db.collection(COLLECTION_NAME).find(query).sort({ id: -1 }).toArray();
    return NextResponse.json(announcements);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST a new announcement
export async function POST(request: Request) {
  try {
    const { title, content, priority = 'normal' } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Get the highest existing ID and increment it
    const lastAnnouncement = await collection.findOne({}, { sort: { id: -1 } });
    const newId = lastAnnouncement ? lastAnnouncement.id + 1 : 1;

    const newAnnouncement = {
      id: newId,
      title,
      content,
      priority,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(newAnnouncement);
    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}

// PUT (update) an announcement
export async function PUT(request: Request) {
  try {
    const { id, title, content, priority } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required for update' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const updateData: any = { updatedAt: new Date() };
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (priority) updateData.priority = priority;

    const result = await collection.updateOne(
      { id: Number(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }

    const updatedDocument = await collection.findOne({ id: Number(id) });
    return NextResponse.json(updatedDocument);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

// DELETE an announcement
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required for deletion' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteOne({ id: Number(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Announcement deleted successfully' }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}