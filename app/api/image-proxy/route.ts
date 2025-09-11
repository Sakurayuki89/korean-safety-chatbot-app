import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('fileId');
  
  console.log(`[Image Proxy] Request for fileId: ${fileId}`);
  
  if (!fileId) {
    console.log('[Image Proxy] No fileId provided');
    return NextResponse.json({ error: 'File ID required' }, { status: 400 });
  }

  // Multiple URL formats to try - reordered for better success rate
  const urlsToTry = [
    `https://drive.google.com/uc?id=${fileId}&export=view`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/uc?id=${fileId}`,
    `https://drive.google.com/uc?id=${fileId}&export=download`,
    `https://drive.google.com/thumbnail?id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}=w1000-h1000`,
  ];

  for (let i = 0; i < urlsToTry.length; i++) {
    const imageUrl = urlsToTry[i];
    console.log(`[Image Proxy] Trying URL ${i + 1}/${urlsToTry.length}: ${imageUrl}`);
    
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageBot/1.0)',
          'Accept': 'image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Referer': 'https://drive.google.com',
        },
        redirect: 'follow',
      });
      
      console.log(`[Image Proxy] Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        // Check if it's actually an image
        if (contentType && contentType.startsWith('image/')) {
          console.log(`[Image Proxy] Success with URL: ${imageUrl}`);
          
          const imageBuffer = await response.arrayBuffer();
          
          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
          });
        } else {
          console.log(`[Image Proxy] Not an image: ${contentType}, first 200 chars:`, 
            await response.text().then(text => text.substring(0, 200)));
        }
      } else {
        console.log(`[Image Proxy] Failed with status: ${response.status}, statusText: ${response.statusText}`);
        const errorText = await response.text().catch(() => 'Could not read response text');
        console.log(`[Image Proxy] Error response body:`, errorText.substring(0, 500));
      }
    } catch (error) {
      console.log(`[Image Proxy] Error with ${imageUrl}:`, error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof Error) {
        console.log(`[Image Proxy] Error stack:`, error.stack?.substring(0, 300));
      }
    }
  }

  // If all URLs failed, return a placeholder or error
  console.log('[Image Proxy] All URLs failed, returning error');
  return NextResponse.json(
    { 
      error: 'Failed to load image from all sources',
      fileId: fileId,
      attemptedUrls: urlsToTry
    }, 
    { status: 404 }
  );
}