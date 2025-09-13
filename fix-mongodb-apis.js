#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// MongoDB API 파일들 목록
const apiFiles = [
  'app/api/feedback/route.ts',
  'app/api/contact/route.ts', 
  'app/api/history/route.ts',
  'app/api/item-requests/route.ts',
  'app/api/chat/route.ts',
  'app/api/admin/inquiries/route.ts',
  'app/api/admin/safety-items/route.ts',
  'app/api/admin/export-requests/route.ts'
];

const mongoCheck = `    // Return empty array if MongoDB is not configured
    if (!process.env.MONGODB_URI) {
      console.log('[${COLLECTION_NAME}] MongoDB not configured, returning empty array');
      return NextResponse.json([]);
    }

`;

apiFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // getMongoClient() 호출 직전에 체크 추가
    if (content.includes('const client = await getMongoClient();') && 
        !content.includes('MongoDB not configured')) {
      content = content.replace(
        'const client = await getMongoClient();',
        mongoCheck + '    const client = await getMongoClient();'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${filePath}`);
    }
  }
});

console.log('MongoDB API fixes completed');