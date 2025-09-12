import { NextResponse } from 'next/server';
import { getMongoClient } from '../../../lib/mongodb';
import { DB_NAME } from '../../../lib/constants';

export async function POST(request: Request) {
  try {
    const { name, message } = await request.json();

    // Message is required, name is optional
    if (!message) {
      return NextResponse.json({ message: 'Message is a required field' }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db(DB_NAME);

    const contact = {
      name: name || 'Anonymous', // Save as 'Anonymous' if name is not provided
      message,
      createdAt: new Date(),
    };

    await db.collection('contacts').insertOne(contact);

    return NextResponse.json({ message: 'Contact form submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
