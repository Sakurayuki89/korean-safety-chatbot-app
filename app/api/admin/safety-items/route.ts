import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { uploadFileToDrive, getPublicUrl, deleteFileFromDrive, ensureSafeChatbotFolders } from '@/lib/google-drive';
import { getMongoClient } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

const GOOGLE_TOKEN_COOKIE = 'google_token';

export async function GET() {
  try {
    console.log('[GET /api/admin/safety-items] Authentication already handled by middleware.');
    console.log('[GET /api/admin/safety-items] Authentication successful.');
    return NextResponse.json({ authenticated: true });

  } catch (error) {
    console.error('[GET /api/admin/safety-items] Error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

async function fileToStream(file: File): Promise<Readable> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return Readable.from(buffer);
}

export async function POST(req: NextRequest) {
  console.log('[POST /api/admin/safety-items] Received request.');
  try {
    // 1. JWT Authentication already handled by middleware
    console.log('[POST /api/admin/safety-items] Authentication already handled by middleware.');

    // 2. Get Google Access Token (for Google Drive operations)
    console.log('[POST /api/admin/safety-items] Step 1: Getting Google access token from cookie.');
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(GOOGLE_TOKEN_COOKIE)?.value;
    if (!tokenCookie) {
      console.error('[POST /api/admin/safety-items] Error: Google OAuth required for file upload.');
      return NextResponse.json({ error: 'Google OAuth 로그인이 필요합니다. 파일 업로드를 위해 Google 계정 연동이 필요합니다.' }, { status: 403 });
    }
    const { access_token } = JSON.parse(tokenCookie);
    if (!access_token) {
        console.error('[POST /api/admin/safety-items] Error: Google access token not found.');
        return NextResponse.json({ error: 'Google OAuth 토큰이 유효하지 않습니다.' }, { status: 403 });
    }
    console.log('[POST /api/admin/safety-items] Step 1: Google access token retrieved successfully.');

    // 2. Parse Form Data
    console.log('[POST /api/admin/safety-items] Step 2: Parsing form data.');
    const formData = await req.formData();
    const name = formData.get('name') as string | null;
    const size = formData.get('size') as string | null;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;
    
    if (!description || !imageFile) {
      console.error('[POST /api/admin/safety-items] Error: Description or image file is missing.');
      return NextResponse.json({ error: '설명과 이미지가 필요합니다.' }, { status: 400 });
    }
    
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(imageFile.type)) {
      console.error('[POST /api/admin/safety-items] Error: Invalid file type:', imageFile.type);
      return NextResponse.json({ error: '지원되지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.' }, { status: 400 });
    }
    
    if (imageFile.size > maxSize) {
      console.error('[POST /api/admin/safety-items] Error: File too large:', imageFile.size);
      return NextResponse.json({ error: '파일 크기가 10MB를 초과합니다.' }, { status: 400 });
    }
    
    console.log('[POST /api/admin/safety-items] Step 2: Form data parsed successfully.');
    console.log('[POST /api/admin/safety-items] File info:', {
      name: imageFile.name,
      type: imageFile.type,
      size: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`
    });

    // 3. 폴더 구조 생성 및 이미지 업로드
    console.log('[POST /api/admin/safety-items] Step 3: Setting up folder structure and uploading to Google Drive.');
    
    // safe-chatbot 폴더 구조 생성/확인
    const folderStructure = await ensureSafeChatbotFolders(access_token);
    
    const fileMetadata = {
      name: imageFile.name || 'safety-item-image.jpg',
      parents: [folderStructure.imagesFolderId], // safe-chatbot/images 폴더에 저장
    };
    const imageStream = await fileToStream(imageFile);
    const media = {
      mimeType: imageFile.type, // Use actual file type (PNG, JPEG, etc.)
      body: imageStream,
    };
    console.log('[POST /api/admin/safety-items] Calling uploadFileToDrive...');
    
    let fileId;
    try {
      fileId = await uploadFileToDrive(access_token, fileMetadata, media);
      if (!fileId) {
        console.error('[POST /api/admin/safety-items] Error: uploadFileToDrive returned no fileId.');
        return NextResponse.json({ error: 'Google Drive에 파일 업로드를 실패했습니다.' }, { status: 500 });
      }
      console.log(`[POST /api/admin/safety-items] Step 3: File uploaded successfully. File ID: ${fileId}`);
    } catch (uploadError) {
      console.error('[POST /api/admin/safety-items] Upload error details:', uploadError);
      return NextResponse.json({ 
        error: `Google Drive 업로드 실패: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` 
      }, { status: 500 });
    }

    // 4. Get public URL
    console.log('[POST /api/admin/safety-items] Step 4: Getting public URL.');
    const imageUrl = await getPublicUrl(access_token, fileId);
    if (!imageUrl) {
        console.error(`[POST /api/admin/safety-items] Warning: Could not get public URL for fileId: ${fileId}`);
    }
    console.log(`[POST /api/admin/safety-items] Step 4: Public URL retrieved: ${imageUrl}`);

    // 5. Save to MongoDB
    console.log('[POST /api/admin/safety-items] Step 5: Saving to MongoDB.');
    const client = await getMongoClient();
    const db = client.db();
    const result = await db.collection('safety_items').insertOne({
      name,
      size,
      description,
      imageUrl: imageUrl, 
      googleFileId: fileId,
      createdAt: new Date(),
    });
    console.log(`[POST /api/admin/safety-items] Step 5: Saved to MongoDB. Inserted ID: ${result.insertedId}`);

    return NextResponse.json({ success: true, insertedId: result.insertedId, imageUrl });

  } catch (error) {
    console.error('[POST /api/admin/safety-items] CATCH BLOCK: An unexpected error occurred.', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: `서버 내부 오류: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  console.log('[DELETE /api/admin/safety-items] Received request.');
  try {
    // 1. JWT Authentication already handled by middleware
    console.log('[DELETE /api/admin/safety-items] Authentication already handled by middleware.');

    // 2. Get Google Access Token (for Google Drive operations)
    console.log('[DELETE /api/admin/safety-items] Step 1: Getting Google access token from cookie.');
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(GOOGLE_TOKEN_COOKIE)?.value;
    if (!tokenCookie) {
      console.error('[DELETE /api/admin/safety-items] Error: Google OAuth required for file deletion.');
      return NextResponse.json({ error: 'Google OAuth 로그인이 필요합니다. 파일 삭제를 위해 Google 계정 연동이 필요합니다.' }, { status: 403 });
    }
    const { access_token } = JSON.parse(tokenCookie);
    if (!access_token) {
        console.error('[DELETE /api/admin/safety-items] Error: Google access token not found.');
        return NextResponse.json({ error: 'Google OAuth 토큰이 유효하지 않습니다.' }, { status: 403 });
    }
    console.log('[DELETE /api/admin/safety-items] Step 1: Google access token retrieved successfully.');

    // 2. Parse Request Body
    const { id, googleFileId } = await req.json();
    if (!id || !googleFileId) {
      return NextResponse.json({ error: 'Item ID and Google File ID are required' }, { status: 400 });
    }

    // 3. Delete from MongoDB
    console.log(`[DELETE /api/admin/safety-items] Step 2: Deleting item from MongoDB. ID: ${id}`);
    const client = await getMongoClient();
    const db = client.db();
    const deleteResult = await db.collection('safety_items').deleteOne({ _id: new ObjectId(id) });

    if (deleteResult.deletedCount === 0) {
      console.warn(`[DELETE /api/admin/safety-items] Item with ID ${id} not found in DB.`);
      // Proceed to delete from Drive anyway, in case DB entry was already removed
    }
    console.log(`[DELETE /api/admin/safety-items] Step 2: MongoDB deletion successful.`);

    // 4. Delete from Google Drive
    console.log(`[DELETE /api/admin/safety-items] Step 3: Deleting file from Google Drive. File ID: ${googleFileId}`);
    await deleteFileFromDrive(access_token, googleFileId);
    console.log(`[DELETE /api/admin/safety-items] Step 3: Google Drive deletion process completed.`);

    return NextResponse.json({ success: true, message: 'Item deleted successfully' });

  } catch (error) {
    console.error('[DELETE /api/admin/safety-items] CATCH BLOCK: An unexpected error occurred.', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: `서버 내부 오류: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
