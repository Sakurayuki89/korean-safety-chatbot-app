import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[TEST-DB] Testing MongoDB connection...');
    
    const client = await clientPromise;
    const db = client.db();
    
    // Test database connection
    const adminDb = client.db().admin();
    const result = await adminDb.ping();
    
    console.log('[TEST-DB] MongoDB ping result:', result);
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('[TEST-DB] Available collections:', collections.map(c => c.name));
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful',
      collections: collections.map(c => c.name),
      ping: result
    });
    
  } catch (error) {
    console.error('[TEST-DB] MongoDB connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}