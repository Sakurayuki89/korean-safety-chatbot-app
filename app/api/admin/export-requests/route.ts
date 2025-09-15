
import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';

export async function POST() {
  console.log('[POST /api/admin/export-requests] Received request for direct download.');
  try {
    // 1. MongoDB에서 데이터 가져오기
    console.log('[POST /api/admin/export-requests] Step 1: Fetching requests from MongoDB.');
    const client = await getMongoClient();
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

    // 3. ExcelJS 워크북 및 워크시트 생성
    console.log('[POST /api/admin/export-requests] Step 3: Creating ExcelJS workbook.');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('신청 내역');

    // 컬럼 헤더 및 너비 설정
    worksheet.columns = [
      { header: '번호', key: 'number', width: 5 },
      { header: '신청일', key: 'requestDate', width: 20 },
      { header: '신청자명', key: 'userName', width: 15 },
      { header: '용품명', key: 'itemName', width: 25 },
      { header: '사이즈', key: 'itemSize', width: 10 },
      { header: '상태', key: 'status', width: 12 },
    ];

    // 데이터 추가
    dataToExport.forEach((item) => {
      worksheet.addRow({
        number: item['번호'],
        requestDate: item['신청일'],
        userName: item['신청자명'],
        itemName: item['용품명'],
        itemSize: item['사이즈'],
        status: item['상태'],
      });
    });

    // 4. 파일 버퍼 생성
    console.log('[POST /api/admin/export-requests] Step 4: Writing workbook to buffer.');
    const buf = await workbook.xlsx.writeBuffer();

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
