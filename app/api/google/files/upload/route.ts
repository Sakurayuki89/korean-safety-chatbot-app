
import { NextResponse, NextRequest } from 'next/server';
import { MongoClient } from 'mongodb';

// TODO: lib/mongodb.ts에서 클라이언트 인스턴스 가져오도록 리팩토링
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not set in .env.local');
}
const client = new MongoClient(uri);

/**
 * @swagger
 * /api/google/files/upload:
 *   post:
 *     summary: Uploads a file to Google Drive.
 *     description: Uploads a file to a specific folder in the user's Google Drive.
 *     tags:
 *       - Google Drive
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: 
 *                 type: string
 *                 format: binary
 *               sessionId: 
 *                 type: string
 *               folderId: 
 *                 type: string
 *     responses:
 *       200:
 *         description: File uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request, file or session ID missing.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!file || !sessionId) {
      return NextResponse.json({ error: 'File and session ID are required' }, { status: 400 });
    }

    // 1. DB에서 세션 정보 조회
    await client.connect();
    const db = client.db('chatbot-db');
    const sessionCollection = db.collection('user-sessions');
    const session = await sessionCollection.findOne({ sessionId });

    if (!session || !session.googleToken) {
      return NextResponse.json({ error: 'Session not found or invalid' }, { status: 401 });
    }

    // 2. lib/google-drive.ts의 파일 업로드 함수 호출 (상세 구현 필요)
    // const driveFile = await uploadFile(session.googleToken, file);

    // 3. 임시 플레이스홀더 응답
    const driveFile = {
        _id: 'temp_id',
        driveFileId: 'temp_drive_id',
        name: file.name,
        mimeType: file.type,
        size: file.size,
        createdTime: new Date(),
        modifiedTime: new Date(),
        localCreatedAt: new Date(),
        lastAccessedAt: new Date(),
        isActive: true,
    };

    return NextResponse.json({ success: true, file: driveFile });

  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  } finally {
    await client.close();
  }
}
