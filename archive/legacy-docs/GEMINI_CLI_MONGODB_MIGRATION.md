# 🔄 GEMINI CLI 긴급 지시: MongoDB 데이터 영구화 미션

## 📊 현재 상황 분석 결과

**✅ 검토 완료**: 프로젝트 85% 완성, 핵심 문제 1개 발견
**🛡️ 백업 완료**: GitHub에 현재 상태 안전하게 커밋됨
**🎯 해결 목표**: in-memory → MongoDB 영구 저장소 마이그레이션

## 🚨 해결해야 할 핵심 문제

**문제**: 공지사항과 PDF 데이터가 서버 메모리에만 저장됨
**결과**: 서버 재시작시 데이터 삭제, 관리자 입력 내용 손실
**해결**: MongoDB 영구 저장소로 마이그레이션

## 🔧 GEMINI CLI 작업 지시서

### Phase 1: 공지사항 API MongoDB 연동 (최우선)

**파일**: `app/api/announcements/route.ts`

```typescript
// 현재 코드 (in-memory):
let announcements: Announcement[] = [...];

// 변경 목표 (MongoDB):
import clientPromise from '../../../lib/mongodb';

// 컬렉션: korean-safety-chatbot.announcements
```

**작업 내용:**
1. **기존 in-memory 배열 제거** - `let announcements = []` 삭제
2. **MongoDB 연결 추가** - `import clientPromise` 
3. **CRUD 함수들을 MongoDB 쿼리로 변경**:
   ```typescript
   // GET: db.collection("announcements").find({}).toArray()
   // POST: db.collection("announcements").insertOne(newDoc)
   // PUT: db.collection("announcements").updateOne({id}, {$set: ...})
   // DELETE: db.collection("announcements").deleteOne({id})
   ```
4. **ID 관리 개선** - MongoDB ObjectId 또는 auto-increment 구현

### Phase 2: PDF 관리 API MongoDB 연동

**파일**: `app/api/admin/pdfs/route.ts`

**작업 내용:**
1. **동일한 패턴으로 MongoDB 마이그레이션**
2. **컬렉션**: `korean-safety-chatbot.managed_pdfs`
3. **기존 Mock 데이터를 MongoDB 초기 데이터로 이전**

### Phase 3: ChatWidget 실시간 동기화

**파일**: `components/ChatWidget.tsx`

**현재 문제**: 
```typescript
// 채팅 위젯 열 때만 데이터 fetch
useEffect(() => {
  if (isOpen) { fetchContextData(); }
}, [isOpen]);
```

**해결 방안**:
```typescript
// 매번 채팅 메시지 전송시 최신 데이터 fetch
// 또는 정기적 폴링 (30초마다)
```

## 📋 구체적 실행 순서

### 1단계: announcements API 변경 (30분)
```bash
cd korean-safety-chatbot-app/app/api/announcements/
# route.ts 파일을 MongoDB 버전으로 완전 재작성
```

### 2단계: pdfs API 변경 (20분) 
```bash
cd korean-safety-chatbot-app/app/api/admin/pdfs/
# route.ts 파일을 MongoDB 버전으로 완전 재작성
```

### 3단계: 프론트엔드 동기화 개선 (15분)
```bash
cd korean-safety-chatbot-app/components/
# ChatWidget.tsx에서 실시간 데이터 fetch 로직 추가
```

### 4단계: 테스트 및 검증 (15분)
```bash
npm run dev
# 1. 관리자 페이지에서 공지사항 추가/수정/삭제
# 2. 서버 재시작 (Ctrl+C → npm run dev)
# 3. 데이터 유지 확인
# 4. 챗봇에서 최신 공지사항 반영 확인
```

## 💡 기술 참고사항

**MongoDB 연결**: 이미 설정됨 (`lib/mongodb.ts`)
**데이터베이스**: `korean-safety-chatbot` 
**컬렉션명 제안**:
- `announcements` - 공지사항
- `managed_pdfs` - PDF 관리 정보

**스키마 참고**:
```typescript
// announcements 컬렉션
{
  _id: ObjectId,
  id: number, // 기존 호환성 유지
  title: string,
  content: string,
  date: string,
  priority: 'important' | 'normal',
  createdAt: Date,
  updatedAt: Date
}

// managed_pdfs 컬렉션  
{
  _id: ObjectId,
  id: string, // 기존 호환성 유지
  fileName: string,
  uploadDate: string,
  size: number,
  createdAt: Date
}
```

## 🎯 성공 기준

**완료 조건**:
1. ✅ 관리자 페이지에서 공지사항 추가 → 서버 재시작 → 데이터 유지
2. ✅ PDF 관리 데이터 서버 재시작 후에도 유지  
3. ✅ 챗봇이 최신 공지사항을 실시간 반영
4. ✅ 모든 기존 기능 정상 작동

## ⚠️ 주의사항

1. **기존 API 호환성 유지** - 프론트엔드 수정 최소화
2. **에러 처리 강화** - MongoDB 연결 실패시 적절한 에러 메시지
3. **데이터 마이그레이션** - 기존 Mock 데이터를 초기 데이터로 활용

---

**🚀 이 작업 완료시 200명 직원용 완전한 안전 플랫폼 완성!**