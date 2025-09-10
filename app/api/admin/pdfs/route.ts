import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DB_NAME, COLLECTION_NAMES } from '@/lib/constants';

// GET all managed PDFs
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const pdfs = await db.collection(COLLECTION_NAMES.PDFS).find({}).sort({ uploadDate: -1 }).toArray();
    return NextResponse.json(pdfs);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch PDFs' }, { status: 500 });
  }
}

// POST (upload) a new PDF - MOCK IMPLEMENTATION
export async function POST(request: Request) {
  try {
    const { fileName, size } = await request.json();
    if (!fileName || !size) {
      return NextResponse.json({ error: 'fileName and size are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAMES.PDFS);

    const newPdf = {
      id: `pdf-${Date.now()}`,
      fileName,
      size,
      uploadDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };

    await collection.insertOne(newPdf);
    return NextResponse.json(newPdf, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create PDF entry' }, { status: 500 });
  }
}

// DELETE a managed PDF
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required for deletion' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAMES.PDFS);

    const result = await collection.deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'PDF not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'PDF deleted successfully' }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete PDF' }, { status: 500 });
  }
}