# 📋 Korean Safety Notice Management Platform - 완전한 프로젝트 명세서

## 🎯 프로젝트 정의 (중요: 올바른 이해)

**⚠️ 주의: 이것은 "챗봇 프로젝트"가 아닙니다!**

### 실제 프로젝트 목적
```
🏢 Korean Safety Notice Management Platform
├── 📋 주요 목적: 공지사항 홈페이지 & 관리 시스템
├── 👨‍💼 핵심 기능: 관리자 CMS (공지 등록/편집/삭제)
└── 🤖 부가 기능: '안전이' 안전 상담 챗봇
```

**사용자 시나리오:**
1. **관리자**: 관리 페이지에서 공지사항을 등록/편집
2. **직원들**: 홈페이지에서 공지사항을 확인  
3. **직원들**: 챗봇으로 안전 관련 질문

---

## 📊 현재 상황 & 기존 자산

### ✅ 이미 구현된 것들
1. **NoticeBoard.tsx** (완성된 컴포넌트)
   - 위치: `/Users/parksonghoon/Code/korean-safety-chatbot/NoticeBoard.tsx`
   - 상태: 완전 구현됨 (이동 필요)
   - 기능: 카테고리별 공지 표시, 접기/펼치기, 반응형 디자인

2. **NoticeBoard.css** (완성된 스타일)
   - 모바일 최적화 스타일링
   - 카테고리별 색상 구분

3. **기본 Next.js 프로젝트**
   - 위치: `/Users/parksonghoon/Code/korean-safety-chatbot/korean-safety-chatbot-app/`
   - 상태: 기본 구조만 있음

### ❌ 누락된 핵심 요소들
1. **데이터베이스 및 API** (공지 저장/조회)
2. **관리자 페이지** (공지 등록/편집 UI)
3. **인증 시스템** (관리자 로그인)
4. **파일 업로드** (PDF, 이미지 첨부)
5. **챗봇 시스템** (Gemini AI 연동)

---

## 🏗️ 시스템 아키텍처

### 전체 구조
```
Korean Safety Platform
│
├── 🏠 공지사항 홈페이지 (page.tsx)
│   └── NoticeBoard 컴포넌트 사용 (이미 구현됨)
│
├── 👨‍💼 관리자 시스템 (/admin)
│   ├── 로그인 페이지
│   ├── 공지사항 관리 (CRUD)
│   ├── 카테고리 관리
│   └── 대시보드
│
├── 🤖 챗봇 시스템
│   ├── 플로팅 챗봇 버튼
│   ├── 채팅 인터페이스
│   └── Gemini AI 연동
│
└── 🔧 백엔드 API
    ├── 공지사항 CRUD API
    ├── 파일 업로드 API
    ├── 인증 API
    └── 챗봇 API
```

### 기술 스택
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon) 또는 MySQL (PlanetScale)
- **Authentication**: NextAuth.js
- **File Storage**: Vercel Blob 또는 Cloudinary
- **AI**: Google Gemini Pro
- **Deployment**: Vercel

---

## 💾 데이터베이스 설계

### 테이블 구조
```sql
-- 공지사항 테이블
CREATE TABLE notices (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('안전공지', '안전규정', '사내공지', '노조소식') NOT NULL,
  priority ENUM('urgent', 'important', 'normal') DEFAULT 'normal',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  author_id INT,
  view_count INT DEFAULT 0,
  attachments JSON -- 첨부파일 정보
);

-- 사용자/관리자 테이블
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 카테고리 설정 테이블
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6', -- hex color
  icon VARCHAR(50), -- lucide icon name
  description TEXT
);

-- 챗봇 대화 로그
CREATE TABLE chat_logs (
  id SERIAL PRIMARY KEY,
  user_session VARCHAR(255),
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📋 6단계 구현 가이드

### Phase 1: 프로젝트 기반 구축 및 NoticeBoard 통합
**목표**: 기존 NoticeBoard를 프로젝트에 통합하고 홈페이지 완성

**Tasks:**
1. NoticeBoard 관련 파일들을 올바른 위치로 이동:
   ```
   NoticeBoard.tsx → korean-safety-chatbot-app/components/
   NoticeBoard.css → korean-safety-chatbot-app/styles/
   ```

2. 메인 페이지에서 NoticeBoard 사용:
   ```typescript
   // app/page.tsx
   import NoticeBoard from '@/components/NoticeBoard';
   
   // 임시 데이터로 테스트
   const sampleNotices = [
     // NoticeBoard.example.tsx에서 복사
   ];
   
   export default function HomePage() {
     return <NoticeBoard notices={sampleNotices} />;
   }
   ```

3. 기본 레이아웃 및 네비게이션 추가

### Phase 2: 데이터베이스 연동 및 API 구축
**목표**: 실제 데이터베이스에서 공지사항을 가져오는 시스템

**Tasks:**
1. 데이터베이스 설정 (Neon PostgreSQL 권장):
   ```bash
   npm install @neondatabase/serverless
   ```

2. API Routes 생성:
   ```typescript
   // app/api/notices/route.ts
   export async function GET() {
     // 공지사항 목록 조회
   }
   
   export async function POST() {
     // 새 공지사항 등록
   }
   ```

3. 데이터 fetching 훅 생성:
   ```typescript
   // hooks/useNotices.ts
   export function useNotices(category?: string) {
     // API 호출 및 상태 관리
   }
   ```

### Phase 3: 관리자 페이지 구축
**목표**: 관리자가 공지사항을 등록/편집할 수 있는 CMS

**Tasks:**
1. 관리자 레이아웃 생성:
   ```typescript
   // app/admin/layout.tsx
   // 사이드바, 네비게이션 포함
   ```

2. 공지사항 관리 페이지들:
   ```typescript
   // app/admin/notices/page.tsx - 목록
   // app/admin/notices/new/page.tsx - 등록
   // app/admin/notices/[id]/edit/page.tsx - 편집
   ```

3. 폼 컴포넌트 및 에디터:
   ```typescript
   // components/admin/NoticeEditor.tsx
   // React Hook Form + TinyMCE 또는 Tiptap
   ```

### Phase 4: 인증 시스템 구축
**목표**: 관리자 로그인 및 권한 관리

**Tasks:**
1. NextAuth.js 설정:
   ```bash
   npm install next-auth
   ```

2. 로그인 페이지:
   ```typescript
   // app/admin/login/page.tsx
   ```

3. 보호된 라우트 미들웨어:
   ```typescript
   // middleware.ts
   // 관리자 페이지 접근 제한
   ```

### Phase 5: 파일 업로드 시스템
**목표**: PDF 첨부파일 업로드 및 관리

**Tasks:**
1. 파일 업로드 API:
   ```typescript
   // app/api/upload/route.ts
   // Vercel Blob 또는 로컬 업로드
   ```

2. 업로드 컴포넌트:
   ```typescript
   // components/FileUpload.tsx
   // 드래그 앤 드롭 지원
   ```

3. 파일 표시 및 다운로드 기능

### Phase 6: 챗봇 시스템 통합
**목표**: '안전이' 챗봇 구현 및 통합

**Tasks:**
1. Gemini AI 클라이언트:
   ```typescript
   // lib/gemini.ts
   // API 키 설정 및 프롬프트 템플릿
   ```

2. 챗봇 UI 컴포넌트:
   ```typescript
   // components/ChatBot.tsx
   // 플로팅 버튼 + 채팅 인터페이스
   ```

3. 챗봇 API 및 PDF 처리:
   ```typescript
   // app/api/chat/route.ts
   // 업로드된 PDF 기반 응답 생성
   ```

---

## 🔧 상세 기술 요구사항

### 환경 변수 설정
```env
# .env.local
DATABASE_URL="postgresql://username:password@host/database"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_AI_API_KEY="your-gemini-api-key"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

### 필수 패키지
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "typescript": "^5.0.0",
    "@neondatabase/serverless": "^0.9.0",
    "next-auth": "^4.24.0",
    "@google/generative-ai": "^0.15.0",
    "@vercel/blob": "^0.23.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.22.0",
    "@tiptap/react": "^2.5.0",
    "lucide-react": "^0.400.0"
  }
}
```

### 폴더 구조
```
korean-safety-chatbot-app/
├── app/
│   ├── page.tsx              # 공지사항 홈페이지
│   ├── admin/               # 관리자 페이지들
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── notices/
│   │   └── login/
│   └── api/
│       ├── notices/
│       ├── auth/
│       ├── upload/
│       └── chat/
├── components/
│   ├── NoticeBoard.tsx      # 이동된 기존 컴포넌트
│   ├── admin/              # 관리자용 컴포넌트들
│   └── ChatBot.tsx         # 챗봇 컴포넌트
├── hooks/
├── lib/
│   ├── db.ts               # 데이터베이스 연결
│   ├── auth.ts             # 인증 설정
│   └── gemini.ts           # AI 클라이언트
└── styles/
    └── NoticeBoard.css     # 이동된 기존 스타일
```

---

## 🚀 배포 및 최적화

### Vercel 배포 설정
1. GitHub 연동 및 자동 배포
2. 환경 변수 설정
3. 도메인 연결

### 성능 최적화
1. 이미지 최적화 (Next.js Image)
2. 코드 스플리팅
3. SEO 최적화 (메타태그, 사이트맵)
4. PWA 설정 (선택사항)

---

## 💡 구현 시 주의사항

### 1. 기존 자산 활용
- **NoticeBoard 컴포넌트를 반드시 재사용**하세요
- CSS 스타일과 반응형 디자인이 이미 완성되어 있습니다

### 2. 데이터 구조 호환성
- NoticeBoard 컴포넌트의 Notice 인터페이스와 일치하도록 API 응답 구조를 맞추세요

### 3. 카테고리 시스템
- '안전공지', '안전규정', '사내공지', '노조소식' 4개 카테고리를 정확히 사용하세요

### 4. 모바일 우선 설계
- 기존 NoticeBoard가 모바일 최적화되어 있으므로, 관리자 페이지도 반응형으로 구현하세요

### 5. 보안 고려사항
- 관리자 페이지는 반드시 인증 필요
- 파일 업로드 시 보안 검증
- SQL 인젝션 방지

---

## 🎯 최종 목표

이 명세서를 따라 구현하면 다음이 완성됩니다:

1. ✅ **완전한 공지사항 홈페이지** (NoticeBoard 활용)
2. ✅ **직관적인 관리자 CMS**
3. ✅ **안전한 인증 시스템**
4. ✅ **파일 첨부 기능**
5. ✅ **'안전이' 챗봇 통합**
6. ✅ **모바일 최적화**
7. ✅ **프로덕션 배포 준비**

**예상 개발 기간: 7-10일** (단계별 구현 시)