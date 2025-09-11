import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPublicUrl } from '@/lib/google-drive';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_COOKIE = 'google_token';

export async function POST() {
  try {
    console.log('[POST /api/fix-permissions] Starting permission fix...');
    
    // Get access token
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(GOOGLE_TOKEN_COOKIE)?.value;
    if (!tokenCookie) {
      return NextResponse.json({ error: '인증되지 않았습니다.' }, { status: 401 });
    }
    
    const { access_token } = JSON.parse(tokenCookie);
    if (!access_token) {
      return NextResponse.json({ error: '유효하지 않은 인증 토큰입니다.' }, { status: 401 });
    }

    // Get all safety items
    const client = await clientPromise;
    const db = client.db();
    const items = await db.collection('safety_items').find({}).toArray();
    
    console.log(`[POST /api/fix-permissions] Found ${items.length} items to fix`);
    
    const results = [];
    
    for (const item of items) {
      try {
        console.log(`[POST /api/fix-permissions] Fixing permissions for: ${item.description}`);
        
        // Fix permissions and get new URL
        const newUrl = await getPublicUrl(access_token, item.googleFileId);
        
        if (newUrl) {
          // Update the URL in database
          await db.collection('safety_items').updateOne(
            { _id: item._id },
            { $set: { imageUrl: newUrl } }
          );
          
          results.push({
            id: item._id,
            description: item.description,
            oldUrl: item.imageUrl,
            newUrl: newUrl,
            status: 'success'
          });
        } else {
          results.push({
            id: item._id,
            description: item.description,
            status: 'failed'
          });
        }
      } catch (error) {
        console.error(`[POST /api/fix-permissions] Error fixing ${item.description}:`, error);
        results.push({
          id: item._id,
          description: item.description,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`[POST /api/fix-permissions] Fixed ${results.filter(r => r.status === 'success').length}/${items.length} items`);
    
    return NextResponse.json({
      success: true,
      totalItems: items.length,
      results: results
    });
    
  } catch (error) {
    console.error('[POST /api/fix-permissions] Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}