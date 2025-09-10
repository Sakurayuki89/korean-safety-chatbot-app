
import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = 'korean-safety-chatbot';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const inquiries = await db
      .collection('contacts')
      .find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .toArray();

    return NextResponse.json(inquiries, { status: 200 });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Inquiry ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection('contacts').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Inquiry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
