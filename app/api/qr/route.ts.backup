import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) {
    return NextResponse.json({ error: 'Text for QR code is required' }, { status: 400 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Naver API credentials are not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const naverApiUrl = `https://openapi.naver.com/v1/util/qrcode?text=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(naverApiUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Naver API error:', errorData);
      return NextResponse.json({ error: 'Failed to generate QR code', details: errorData }, { status: response.status });
    }

    // Naver API returns the image data directly
    const imageBuffer = await response.arrayBuffer();

    // Return the image as a response
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Error calling Naver API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}