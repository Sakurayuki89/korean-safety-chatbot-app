import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import clientPromise from '@/lib/mongodb';
import { createAuthenticatedGoogleClient } from '@/lib/token-refresh';
import { ensureSafeChatbotFolders } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

export async function POST() {
  console.log('[POST /api/admin/export-requests] Received request.');
  try {
    // 1. 인증된 Google 클라이언트 생성
    console.log('[POST /api/admin/export-requests] Step 1: Creating authenticated Google client.');
    const oauth2Client = await createAuthenticatedGoogleClient();
    console.log('[POST /api/admin/export-requests] Step 1: Authentication successful.');

    // 1-1. 폴더 구조 생성/확인
    console.log('[POST /api/admin/export-requests] Step 1-1: Setting up folder structure.');
    const accessToken = oauth2Client.credentials.access_token;
    const folderStructure = await ensureSafeChatbotFolders(accessToken!);

    // 2. MongoDB에서 신청 내역 가져오기
    console.log('[POST /api/admin/export-requests] Step 2: Fetching requests from MongoDB.');
    const client = await clientPromise;
    const db = client.db();
    const requests = await db.collection('item_requests').find({}).sort({ requestDate: -1 }).toArray();
    
    if (requests.length === 0) {
      console.log('[POST /api/admin/export-requests] No requests found.');
      return NextResponse.json({ error: '다운로드할 신청 내역이 없습니다.' }, { status: 400 });
    }

    // 3. Google Sheets API 클라이언트 생성
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // 4. 새 스프레드시트 생성
    console.log('[POST /api/admin/export-requests] Step 4: Creating new spreadsheet.');
    const spreadsheetTitle = `안전보건용품 신청내역_${new Date().toISOString().split('T')[0]}`;
    
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: spreadsheetTitle,
        },
        sheets: [{
          properties: {
            title: '신청 내역',
          },
        }],
      },
    });

    const spreadsheetId = createResponse.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('스프레드시트 생성 실패');
    }

    // 4-1. 스프레드시트를 safe-chatbot/sheets 폴더로 이동
    console.log('[POST /api/admin/export-requests] Step 4-1: Moving spreadsheet to sheets folder.');
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: folderStructure.sheetsFolderId,
      removeParents: 'root', // root 폴더에서 제거
      fields: 'id, parents',
    });

    // 5. 데이터 준비
    console.log('[POST /api/admin/export-requests] Step 5: Preparing data for export.');
    const headers = ['번호', '신청일', '신청자명', '용품명', '사이즈', '상태'];
    const rows = [headers];

    requests.forEach((request, index) => {
      rows.push([
        (index + 1).toString(),
        new Date(request.requestDate).toLocaleString('ko-KR'),
        request.userName || '',
        request.itemName || '',
        request.itemSize || '',
        request.status || '신청완료'
      ]);
    });

    // 6. 데이터 입력
    console.log('[POST /api/admin/export-requests] Step 6: Writing data to spreadsheet.');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });

    // 7. 시트 정보 가져오기 및 헤더 스타일링
    console.log('[POST /api/admin/export-requests] Step 7: Formatting spreadsheet.');
    
    // 먼저 스프레드시트 정보를 가져와서 정확한 시트 ID를 확인
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    const sheetId = spreadsheetInfo.data.sheets?.[0]?.properties?.sheetId;
    
    if (sheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            // 헤더 행 굵게
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                    },
                    backgroundColor: {
                      red: 0.8,
                      green: 0.9,
                      blue: 1.0,
                    },
                  },
                },
                fields: 'userEnteredFormat(textFormat,backgroundColor)',
              },
            },
            // 열 너비 자동 조정
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: headers.length,
                },
              },
            },
          ],
        },
      });
    }

    // 8. 스프레드시트를 공개 읽기 권한으로 설정
    console.log('[POST /api/admin/export-requests] Step 8: Setting public permissions.');
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // 9. 스프레드시트 URL 생성
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`;
    
    console.log(`[POST /api/admin/export-requests] Success: Spreadsheet created with ID: ${spreadsheetId}`);
    
    return NextResponse.json({ 
      success: true, 
      spreadsheetId,
      spreadsheetUrl,
      title: spreadsheetTitle,
      requestCount: requests.length
    });

  } catch (error) {
    console.error('[POST /api/admin/export-requests] Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `스프레드시트 생성 실패: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: '스프레드시트 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}