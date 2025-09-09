import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    return NextResponse.json({ status: 'ok', message: 'Successfully connected to database.' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: 'error', message: 'Failed to connect to database.' }, { status: 500 });
  }
}
