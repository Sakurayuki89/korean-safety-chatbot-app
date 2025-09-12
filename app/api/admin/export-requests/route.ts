
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function POST() {
  console.log('[POST /api/admin/export-requests] Received request for direct download.');
  try {
    // 1. MongoDB에서 데이터 가져오기
    console.log('[POST /api/admin/export-requests] Step 1: Fetching requests from MongoDB.');
    const client = await clientPromise;
    const db = client.db();
    const requests = await db.collection('item_requests').find({}).sort({ requestDate: -1 }).toArray();

    if (requests.length === 0) {
      console.log('[POST /api/admin/export-requests] No requests found.');
      return NextResponse.json({ error: '다운로드할 신청 내역이 없습니다.' }, { status: 400 });
    }

    console.log(`[POST /api/admin/export-requests] Step 2: Found ${requests.length} requests.`);

    // 2. 데이터 시트용으로 변환
    const dataToExport = requests.map((request, index) => ({
      '번호': index + 1,
      '신청일': new Date(request.requestDate).toLocaleString('ko-KR'),
      '신청자명': request.userName,
      '용품명': request.itemName,
      '사이즈': request.itemSize,
      '상태': request.status || '신청완료',
    }));

    // 3. XLSX 워크시트 생성
    console.log('[POST /api/admin/export-requests] Step 3: Creating XLSX worksheet.');
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 컬럼 너비 설정
    worksheet['!cols'] = [
      { wch: 5 },   // 번호
      { wch: 20 }, // 신청일
      { wch: 15 }, // 신청자명
      { wch: 25 }, // 용품명
      { wch: 10 }, // 사이즈
      { wch: 12 }, // 상태
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '신청 내역');

    // 4. 파일 버퍼 생성
    console.log('[POST /api/admin/export-requests] Step 4: Writing workbook to buffer.');
    const buf = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // 5. 다운로드를 위한 Response 생성
    console.log('[POST /api/admin/export-requests] Step 5: Sending file response to client.');
    const fileName = `안전용품_신청내역_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

  } catch (error) {
    console.error('[POST /api/admin/export-requests] Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `파일 생성 실패: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: '파일 생성 중 알 수 없는 오류가 발생했습니다.' }, { status: 500 });
  }
}
