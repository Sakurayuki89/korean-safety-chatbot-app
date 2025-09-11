import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('fileId');
  
  if (!fileId) {
    return NextResponse.json({ error: 'File ID required' }, { status: 400 });
  }

  // Test multiple URL formats
  const urlFormats = [
    `https://drive.google.com/uc?id=${fileId}`,
    `https://drive.google.com/uc?id=${fileId}&export=download`,
    `https://drive.google.com/thumbnail?id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/file/d/${fileId}/view`,
  ];

  const results = [];
  
  for (const url of urlFormats) {
    try {
      console.log(`Testing URL: ${url}`);
      
      // Test if URL is accessible
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageBot/1.0)'
        }
      });
      
      results.push({
        url,
        status: response.status,
        contentType: response.headers.get('content-type'),
        accessible: response.ok
      });
      
    } catch (error) {
      results.push({
        url,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        accessible: false
      });
    }
  }

  return NextResponse.json({
    fileId,
    results,
    recommendation: results.find(r => r.accessible)?.url || 'No accessible URL found'
  });
}