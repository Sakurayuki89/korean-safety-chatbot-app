# 🏗️ 기술 아키텍처 및 설계

## 📐 시스템 아키텍처 개요

### 전체 아키텍처 다이어그램
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    한국어 안전 상담 챗봇 시스템                          │
├────────────────┬─────────────────┬──────────────────┬─────────────────────┤
│   CLIENT       │   APPLICATION   │   API LAYER      │   DATA LAYER        │
│   LAYER        │   LAYER         │                  │                     │
├────────────────┼─────────────────┼──────────────────┼─────────────────────┤
│ • React 19     │ • Next.js 15    │ • REST API       │ • MongoDB Atlas     │
│ • TypeScript   │ • App Router    │ • Gemini API     │ • Collections:      │
│ • Tailwind CSS │ • SSR/CSR       │ • Streaming      │   - chat_history    │
│ • Responsive   │ • Middleware    │ • Rate Limiting  │   - announcements   │
│ • PWA Ready    │ • Error Handle  │ • CORS           │   - contacts        │
│              │ • i18n Ready    │ • Validation     │   - feedback        │
└────────────────┴─────────────────┴──────────────────┴─────────────────────┘
```

---

## 🛠️ 기술 스택 상세

### Frontend 기술 스택
```yaml
Framework: Next.js 15.5.2
  - App Router 사용
  - SSR/SSG 하이브리드
  - 코드 스플리팅 자동화
  - 이미지 최적화 내장

UI Library: React 19.0.0
  - Concurrent Features 활용
  - Server Components 사용
  - Hooks 기반 상태관리
  - Suspense 경계 설정

Language: TypeScript 5.7.2
  - Strict Mode 활성화
  - 타입 안전성 100%
  - 인터페이스 중심 설계
  - 제네릭 활용

Styling: 
  - Tailwind CSS 4.0
  - CSS Modules 보조
  - 반응형 디자인
  - 다크모드 지원
```

### Backend 기술 스택
```yaml
Runtime: Node.js 18+
  - ES2022 지원
  - 비동기 I/O
  - 메모리 최적화

API Framework: Next.js API Routes
  - RESTful API 설계
  - 미들웨어 체이닝
  - 에러 핸들링 통합
  - CORS 설정

AI Integration: Google Gemini 1.5 Pro
  - Streaming Response
  - Context Management
  - Token 최적화
  - Rate Limiting

Database: MongoDB Atlas
  - 클러스터 구성
  - 인덱스 최적화
  - 트랜잭션 지원
  - 백업 자동화
```

---

## 📊 데이터베이스 설계

### MongoDB 컬렉션 구조

#### 1. chat_history 컬렉션
```javascript
{
  _id: ObjectId,
  sessionId: string,           // 세션 고유 ID
  messages: [
    {
      id: string,              // 메시지 고유 ID
      role: "user" | "assistant",
      content: string,
      timestamp: Date,
      feedback?: "good" | "bad" // 선택적 피드백
    }
  ],
  createdAt: Date,
  lastUpdated: Date,
  userAgent: string            // 사용자 환경 정보
}
```

#### 2. announcements 컬렉션
```javascript
{
  _id: ObjectId,
  id: number,                  // 공지사항 번호 (자동 증가)
  title: string,               // 공지사항 제목
  content: string,             // 공지사항 내용
  priority: "high" | "normal" | "low",
  date: string,               // YYYY-MM-DD 형식
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. contacts 컬렉션
```javascript
{
  _id: ObjectId,
  name: string,                // 문의자 이름
  email: string,              // 문의자 이메일
  message: string,            // 문의 내용
  status: "pending" | "reviewed" | "resolved",
  createdAt: Date,
  respondedAt: Date?,         // 답변 일시 (선택적)
  userAgent: string
}
```

#### 4. feedback 컬렉션
```javascript
{
  _id: ObjectId,
  messageId: string,          // 채팅 메시지 ID
  messageText: string,        // 메시지 내용 (참조용)
  feedback: "good" | "bad",   // 피드백 유형
  createdAt: Date,
  userAgent: string
}
```

### 인덱스 설계
```javascript
// chat_history 컬렉션
db.chat_history.createIndex({ sessionId: 1 })
db.chat_history.createIndex({ createdAt: -1 })

// announcements 컬렉션  
db.announcements.createIndex({ id: -1 })
db.announcements.createIndex({ title: "text", content: "text" })

// contacts 컬렉션
db.contacts.createIndex({ createdAt: -1 })
db.contacts.createIndex({ status: 1 })

// feedback 컬렉션
db.feedback.createIndex({ messageId: 1 })
db.feedback.createIndex({ createdAt: -1 })
```

---

## 🔗 API 설계

### RESTful API 엔드포인트

#### 채팅 API
```
POST /api/chat
- 요청: { message: string, sessionId?: string }
- 응답: Stream<{ content: string, done: boolean }>
- 기능: Gemini AI와 대화, 스트리밍 응답
```

#### 공지사항 API
```
GET /api/announcements?search={term}
- 응답: Announcement[]
- 기능: 공지사항 목록 조회, 검색 지원

POST /api/announcements
- 요청: { title: string, content: string, priority?: string }
- 응답: Announcement
- 기능: 새 공지사항 생성

PUT /api/announcements
- 요청: { id: number, title?: string, content?: string, priority?: string }
- 응답: Announcement
- 기능: 공지사항 수정

DELETE /api/announcements
- 요청: { id: number }
- 응답: { message: string }
- 기능: 공지사항 삭제
```

#### 연락 및 피드백 API
```
POST /api/contact
- 요청: { name: string, email: string, message: string }
- 응답: { message: string }
- 기능: 연락 문의 접수

POST /api/feedback
- 요청: { messageId: string, messageText?: string, feedback: "good" | "bad" }
- 응답: { message: string }
- 기능: 채팅 피드백 수집

GET /api/feedback
- 응답: { totalFeedback: number, breakdown: { good: number, bad: number } }
- 기능: 피드백 통계 조회
```

#### 관리자 API
```
GET /api/admin/inquiries
- 응답: Contact[]
- 기능: 문의 내역 조회

DELETE /api/admin/inquiries
- 요청: { id: string }
- 응답: { message: string }
- 기능: 문의 삭제

GET /api/admin/pdfs
- 응답: PDF[]
- 기능: 관리되는 PDF 목록 조회

POST /api/admin/pdfs
- 요청: { fileName: string, size: number }
- 응답: PDF
- 기능: PDF 정보 등록 (모의 구현)
```

#### 안전보건용품 관리 API
```
GET /api/safety-items
- 응답: SafetyItem[]
- 기능: 등록된 안전용품 목록 조회

POST /api/item-requests
- 요청: { userName: string, itemName: string, itemSize: string, itemId: string }
- 응답: { message: string }
- 기능: 안전용품 신청 접수
```

#### 이미지 프록시 API
```
GET /api/image-proxy?fileId={googleDriveFileId}
- 매개변수: fileId (Google Drive 파일 ID)
- 응답: Image Binary Data
- 기능: Google Drive 이미지 CORS 우회 프록시
- 특징:
  • 6가지 Google Drive URL 형식 자동 시도
  • 캐시 헤더 (1시간) 성능 최적화
  • CORS 헤더 설정으로 브라우저 호환성 확보
  • Content-Type 자동 감지 및 전달

GET /api/check-file-permissions?fileId={googleDriveFileId}
- 매개변수: fileId (Google Drive 파일 ID)
- 응답: FilePermission 객체
- 기능: Google Drive 파일 권한 및 메타데이터 조회

GET /api/test-image-url?url={googleDriveUrl}
- 매개변수: url (Google Drive URL)
- 응답: { success: boolean, contentType?: string, error?: string }
- 기능: 이미지 URL 접근 가능성 테스트
```

#### Google Drive 통합 API
```
GET /api/google/auth/url
- 응답: { authUrl: string }
- 기능: Google OAuth 인증 URL 생성

GET /api/google/auth/callback?code={authCode}
- 매개변수: code (OAuth 인증 코드)
- 응답: { success: boolean, message: string }
- 기능: OAuth 콜백 처리 및 토큰 교환

POST /api/google/upload
- 요청: FormData (파일 업로드)
- 응답: { fileId: string, publicUrl: string }
- 기능: Google Drive에 파일 업로드 및 공개 설정
```

---

## 🔒 보안 아키텍처

### 1. 인증 및 권한
```yaml
API Keys:
  - 환경변수 관리 (.env.local)
  - 서버사이드에서만 접근
  - 로테이션 정책 수립

Rate Limiting:
  - IP 기반 요청 제한
  - API 엔드포인트별 제한
  - DDoS 방어 메커니즘

Input Validation:
  - 클라이언트/서버 이중 검증
  - XSS 방어 (HTML 이스케이프)
  - SQL Injection 방어 (MongoDB)
```

### 2. 데이터 보안
```yaml
Data Encryption:
  - HTTPS 강제 (TLS 1.3)
  - 데이터베이스 연결 암호화
  - 민감 정보 해싱

Privacy Protection:
  - 개인정보 최소 수집
  - 데이터 보관 기간 설정
  - GDPR 준수 설계

Session Management:
  - UUID 기반 세션 ID
  - 클라이언트 쿠키 보안 설정
  - 세션 타임아웃 관리
```

---

## 📈 성능 최적화

### 1. Frontend 최적화
```yaml
Code Splitting:
  - Dynamic Imports 활용
  - Route-based 분할
  - Component Lazy Loading

Bundle Optimization:
  - Tree Shaking 활성화
  - Dead Code Elimination
  - 중복 제거

Caching Strategy:
  - Static Assets CDN
  - Service Worker
  - Browser Caching Headers
```

### 2. Backend 최적화
```yaml
Database Optimization:
  - 인덱스 전략 수립
  - 쿼리 최적화
  - Connection Pooling

API Performance:
  - Response Compression
  - JSON 압축
  - 스트리밍 응답

Memory Management:
  - 가비지 컬렉션 튜닝
  - 메모리 누수 방지
  - 캐시 메모리 관리
```

---

## 🔧 DevOps 및 배포

### 1. 개발 환경
```yaml
Development:
  - Next.js Dev Server
  - Hot Module Replacement
  - TypeScript Watch Mode
  - MongoDB Local/Atlas

Testing:
  - Unit Tests (Jest)
  - Integration Tests
  - E2E Tests (Playwright)
  - API Tests (Supertest)

Code Quality:
  - ESLint 규칙 적용
  - Prettier 포매팅
  - Husky Git Hooks
  - 커밋 메시지 검증
```

### 2. 배포 전략
```yaml
Production Build:
  - Static Export 가능
  - Docker 컨테이너화
  - Environment Variables
  - Health Check 엔드포인트

Deployment Options:
  - Vercel (권장)
  - AWS ECS/Fargate
  - Google Cloud Run
  - Self-hosted Docker

Monitoring:
  - Application Metrics
  - Error Tracking (Sentry)
  - Performance Monitoring
  - Database Metrics
```

---

## 🧪 테스트 전략

### 테스트 피라미드
```
    ┌─────────────────┐
    │   E2E Tests     │  ← Playwright (UI 플로우)
    │     (10%)       │
    └─────────────────┘
  ┌─────────────────────┐
  │ Integration Tests   │  ← API 테스트, DB 연동
  │      (30%)          │
  └─────────────────────┘
┌─────────────────────────┐
│     Unit Tests          │  ← 컴포넌트, 유틸 함수
│       (60%)             │
└─────────────────────────┘
```

### 테스트 도구 및 설정
```yaml
Unit Testing:
  - Jest 29+ (테스트 러너)
  - React Testing Library
  - MSW (API 모킹)
  - Istanbul (커버리지)

Integration Testing:
  - Supertest (API 테스트)
  - MongoDB Memory Server
  - Test Containers
  - Fixtures 관리

E2E Testing:
  - Playwright (크로스 브라우저)
  - Visual Regression
  - Performance Testing
  - Mobile Testing
```

---

## 📱 확장성 고려사항

### 1. 수평 확장
```yaml
Microservices:
  - 기능별 서비스 분리
  - API Gateway 도입
  - Service Mesh 고려
  - 독립 배포 가능

Load Balancing:
  - Application Load Balancer
  - Session Affinity 없음
  - Health Check 기반 라우팅
  - Auto Scaling 지원
```

### 2. 국제화 준비
```yaml
i18n Framework:
  - next-i18next 도입 준비
  - 메시지 파일 구조화
  - RTL 언어 지원 준비
  - 로케일 기반 라우팅

Content Management:
  - 다국어 데이터베이스 스키마
  - CMS 연동 준비
  - 번역 워크플로우
  - 콘텐츠 버전 관리
```

---

## 🔄 마이그레이션 전략

### 데이터 마이그레이션
```yaml
Schema Evolution:
  - 스키마 버전 관리
  - 점진적 마이그레이션
  - 롤백 전략
  - 데이터 검증

Migration Scripts:
  - MongoDB Migration Tools
  - 배치 처리 지원
  - 진행 상황 모니터링
  - 에러 복구 메커니즘
```

### Legacy 시스템 연동
```yaml
API Integration:
  - REST/GraphQL 어댑터
  - 데이터 포맷 변환
  - 인증 브릿지
  - 에러 핸들링 통합

Data Synchronization:
  - 실시간 동기화
  - 배치 동기화 옵션
  - 충돌 해결 전략
  - 일관성 검증
```