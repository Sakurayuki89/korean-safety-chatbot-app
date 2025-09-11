# 🏗️ 한국 안전보건용품 관리 시스템 - 프로젝트 아키텍처

## 📋 목차
- [시스템 개요](#시스템-개요)
- [아키텍처 다이어그램](#아키텍처-다이어그램)
- [핵심 컴포넌트](#핵심-컴포넌트)
- [데이터 플로우](#데이터-플로우)
- [API 설계](#api-설계)
- [보안 아키텍처](#보안-아키텍처)
- [성능 최적화](#성능-최적화)
- [배포 아키텍처](#배포-아키텍처)

## 🎯 시스템 개요

### 핵심 목표
**한국 안전보건용품 관리의 완전한 디지털 트랜스포메이션**을 통해 효율적이고 투명한 안전용품 생태계를 구축합니다.

### 시스템 특징
- **하이브리드 아키텍처**: JAMstack + Serverless + Cloud Services
- **마이크로서비스 지향**: 독립적인 기능 모듈들의 느슨한 결합
- **API-First 설계**: RESTful API 중심의 확장 가능한 구조
- **실시간 데이터 처리**: 즉시성과 일관성을 보장하는 데이터 파이프라인

## 🏛️ 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Frontend Layer (Next.js 15)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  📱 Client Applications                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │   User Web   │ │  Admin Panel │ │ Debug Tools  │ │ Contact Page │      │
│  │   Interface  │ │              │ │              │ │              │      │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↕️
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API Layer (Next.js API Routes)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔧 Core APIs                        🔐 Auth APIs                          │
│  ┌─────────────────┐                 ┌─────────────────┐                   │
│  │ Safety Items    │                 │ Google OAuth    │                   │
│  │ Item Requests   │                 │ Session Mgmt    │                   │
│  │ Announcements   │                 │ Permissions     │                   │
│  └─────────────────┘                 └─────────────────┘                   │
│                                                                             │
│  🖼️  Proxy APIs                       🤖 AI APIs                          │
│  ┌─────────────────┐                 ┌─────────────────┐                   │
│  │ Image Proxy     │                 │ Chat/Gemini     │                   │
│  │ File Permissions│                 │ Context Chat    │                   │
│  │ Drive Integration│                 │ AI Safety      │                   │
│  └─────────────────┘                 └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↕️
┌─────────────────────────────────────────────────────────────────────────────┐
│                          External Services Layer                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  🗄️  Database                       🌐 Google Services                     │
│  ┌─────────────────┐                 ┌─────────────────┐                   │
│  │ MongoDB Atlas   │                 │ Drive API       │                   │
│  │ • Collections   │                 │ Sheets API      │                   │
│  │ • Indexes       │                 │ OAuth 2.0       │                   │
│  │ • Aggregations  │                 │ Gemini AI       │                   │
│  └─────────────────┘                 └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🧩 핵심 컴포넌트

### Frontend Architecture (React 19 + Next.js 15)

#### **페이지 컴포넌트**
```
app/
├── page.tsx                    # 메인 페이지 (안전용품 목록)
├── admin/page.tsx             # 관리자 대시보드
├── contact/page.tsx           # 문의 페이지
├── debug-images/page.tsx      # 이미지 디버깅 도구
└── layout.tsx                 # 글로벌 레이아웃
```

#### **핵심 UI 컴포넌트**
- **`SafetyItemManager`**: 안전용품 등록/관리 인터페이스
- **`SafetyItemRequest`**: 사용자 신청 시스템
- **`NoticeBoard`**: 공지사항 게시판
- **`ChatContainer`**: AI 상담 인터페이스
- **`ImageModal`**: 이미지 뷰어/프리뷰
- **`SplitLayout`**: 반응형 레이아웃

#### **커스텀 훅**
- **`useGoogleDrive`**: Google Drive OAuth 및 파일 관리
- **`useContextChat`**: AI 채팅 상태 관리

### Backend Architecture (API Routes)

#### **데이터 관리 APIs**
```typescript
/api/safety-items          # 안전용품 CRUD
/api/item-requests         # 신청 관리
/api/announcements         # 공지사항 관리
/api/admin/*              # 관리자 전용 APIs
```

#### **Google 서비스 연동 APIs**
```typescript
/api/google/auth          # OAuth 인증
/api/google/files         # Drive 파일 관리
/api/image-proxy          # 이미지 프록시 서비스
```

#### **AI & 부가 서비스 APIs**
```typescript
/api/chat                 # Gemini AI 채팅
/api/contact             # 문의 접수
/api/feedback            # 사용자 피드백
```

### Data Architecture (MongoDB)

#### **컬렉션 구조**
```javascript
// safety-items: 안전보건용품 정보
{
  _id: ObjectId,
  name: String,           // 용품명
  size: String,           // 규격/사이즈
  description: String,    // 상세 설명
  imageUrl: String,       // 이미지 URL (Google Drive)
  driveFileId: String,    // Drive 파일 ID
  createdAt: Date,
  updatedAt: Date
}

// item-requests: 용품 신청 정보
{
  _id: ObjectId,
  safetyItemId: ObjectId, // 안전용품 참조
  requesterName: String,   // 신청자명
  department: String,      // 소속 부서
  quantity: Number,        // 신청 수량
  reason: String,          // 신청 사유
  status: String,          // 처리 상태
  requestedAt: Date
}

// announcements: 공지사항
{
  _id: ObjectId,
  id: Number,              // 순번
  title: String,           // 제목
  content: String,         // 내용
  priority: String,        // 우선순위 (urgent, normal)
  date: String,           // 게시일
  createdAt: Date,
  updatedAt: Date
}
```

## 🌊 데이터 플로우

### 1. 안전용품 등록 플로우
```
관리자 → Image Upload → Google Drive → File ID 획득 → MongoDB 저장 → Image Proxy → 사용자 조회
```

### 2. 용품 신청 플로우
```
사용자 신청 → Form Validation → MongoDB 저장 → Google Sheets 동기화 → 관리자 알림
```

### 3. 이미지 프록시 플로우
```
Client Request → Image Proxy API → Google Drive API → Permission Check → Cached Response
```

### 4. AI 상담 플로우
```
사용자 질문 → Context 분석 → Gemini API → Streaming Response → UI 업데이트
```

## 🔌 API 설계

### REST API 설계 원칙
- **RESTful URLs**: 명확한 리소스 기반 경로
- **HTTP Methods**: 적절한 동사 사용 (GET, POST, PUT, DELETE)
- **Status Codes**: 표준 HTTP 상태 코드
- **Response Format**: 일관된 JSON 응답 구조

### API 응답 형식
```typescript
// 성공 응답
{
  success: true,
  data: any,
  message?: string
}

// 에러 응답
{
  success: false,
  error: string,
  details?: any
}
```

### 주요 API 엔드포인트

#### **안전용품 관리**
```typescript
GET    /api/safety-items          # 안전용품 목록 조회
POST   /api/safety-items          # 안전용품 등록
PUT    /api/safety-items/:id      # 안전용품 수정
DELETE /api/safety-items/:id      # 안전용품 삭제
```

#### **신청 관리**
```typescript
GET    /api/item-requests         # 신청 목록 조회
POST   /api/item-requests         # 새 신청 등록
PUT    /api/item-requests/:id     # 신청 상태 변경
```

#### **Google 서비스 연동**
```typescript
GET    /api/google/auth           # OAuth 인증 URL 생성
GET    /api/google/auth/callback  # OAuth 콜백 처리
GET    /api/image-proxy           # 이미지 프록시 서비스
POST   /api/google/files/upload   # 파일 업로드
```

## 🔒 보안 아키텍처

### 인증 및 권한 관리
- **Google OAuth 2.0**: 사용자 신원 확인
- **Cookie-based Session**: HTTP-only 쿠키 세션 관리
- **Role-based Access**: 관리자/일반 사용자 권한 구분

### API 보안
- **CORS 정책**: 허용된 도메인만 API 접근
- **Rate Limiting**: API 호출 빈도 제한 (구현 예정)
- **Input Validation**: 모든 입력 데이터 검증
- **SQL Injection 방지**: MongoDB 쿼리 파라미터 검증

### 데이터 보안
- **Environment Variables**: 민감한 정보는 환경변수로 관리
- **Encryption**: 전송 중 데이터는 HTTPS 암호화
- **Access Control**: Google Drive 파일 권한 자동 관리

### 보안 헤더
```typescript
X-Frame-Options: DENY                    # 클릭재킹 방지
X-Content-Type-Options: nosniff          # MIME 타입 스니핑 방지
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()
```

## ⚡ 성능 최적화

### Frontend 최적화
- **코드 분할**: 동적 import로 번들 크기 최소화
- **이미지 최적화**: Next.js Image 컴포넌트 + WebP/AVIF 형식
- **캐싱 전략**: 정적 리소스 장기 캐싱 (31536000초)
- **폰트 최적화**: 웹폰트 최적화 로딩

### Backend 최적화
- **이미지 프록시**: Google Drive 이미지 캐싱 및 압축
- **데이터베이스 인덱싱**: MongoDB 쿼리 최적화
- **API 응답 압축**: Gzip/Brotli 압축 활성화
- **CDN 활용**: Vercel Edge Network 기본 활용

### 번들 분석
```typescript
// 번들 구성 (프로덕션)
┌─ Shared by all           102 kB
├─ chunks/vendor           45.7 kB  # 외부 라이브러리
├─ chunks/framework        54.2 kB  # React/Next.js
└─ other shared chunks     1.94 kB  # 공통 유틸리티
```

## 🚀 배포 아키텍처

### Vercel 배포 (권장)
```
┌─────────────────────────────────────────┐
│              Vercel Edge Network        │
├─────────────────────────────────────────┤
│  🌍 Global CDN                         │
│  • 정적 리소스 캐싱                      │
│  • 이미지 최적화                        │  
│  • 압축 및 최소화                       │
└─────────────────────────────────────────┘
                   ↕️
┌─────────────────────────────────────────┐
│           Serverless Functions          │
├─────────────────────────────────────────┤
│  ⚡ API Routes                          │
│  • 자동 스케일링                        │
│  • Cold start 최적화                   │
│  • 환경변수 보안 관리                   │
└─────────────────────────────────────────┘
                   ↕️
┌─────────────────────────────────────────┐
│            External Services            │
├─────────────────────────────────────────┤
│  🗄️  MongoDB Atlas (Cloud Database)    │
│  🌐 Google APIs (Drive, Sheets, AI)    │
│  🔒 Environment Variables (Secure)      │
└─────────────────────────────────────────┘
```

### 대안 배포 옵션

#### **Railway**
- 풀스택 앱에 최적화
- 통합된 데이터베이스 관리
- 간편한 환경변수 설정

#### **Netlify**
- JAMstack 특화
- Edge Functions 지원
- Form 처리 기능 내장

### 환경별 설정
```typescript
// 개발 환경
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

// 스테이징 환경  
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
NODE_ENV=production

// 프로덕션 환경
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## 🔧 개발 환경 설정

### 필수 도구
- **Node.js 18+**: JavaScript 런타임
- **npm/yarn**: 패키지 매니저  
- **MongoDB Compass**: 데이터베이스 GUI (선택사항)
- **Postman**: API 테스팅 (선택사항)

### 개발 워크플로우
```bash
# 로컬 개발 시작
npm run dev:clean          # 클린 시작 (포트 정리 포함)

# 코드 품질 검사
npm run lint               # ESLint 검사
npm run type-check         # TypeScript 타입 검사

# 프로덕션 빌드 테스트
npm run build              # 프로덕션 빌드
npm run start              # 프로덕션 서버 실행
```

### 디버깅 도구
- **Debug Images Page**: `/debug-images` - 이미지 프록시 테스트
- **API Testing**: Postman 컬렉션 제공 (예정)
- **Database GUI**: MongoDB Compass 연동

## 📊 모니터링 & 로깅

### 현재 구현된 모니터링
- **Console Logging**: 개발 환경 디버깅
- **Error Boundaries**: React 에러 처리
- **API Error Tracking**: 서버 에러 로깅

### 향후 계획
- **Application Performance Monitoring (APM)**: Sentry 통합
- **Real User Monitoring (RUM)**: 사용자 경험 추적
- **Database Monitoring**: MongoDB Atlas 메트릭 활용

## 🔄 확장 가능성

### 수직적 확장
- **성능 최적화**: 더 많은 캐싱 레이어, CDN 최적화
- **기능 확장**: 더 많은 AI 모델 통합, 고급 분석 기능

### 수평적 확장  
- **마이크로서비스 분리**: 독립적인 서비스들로 분할
- **다중 데이터베이스**: 읽기/쓰기 분리, 샤딩
- **컨테이너화**: Docker + Kubernetes 배포

### 향후 아키텍처 로드맵
1. **Phase 1**: 현재 - 모놀리스 + 외부 서비스
2. **Phase 2**: API Gateway + 마이크로서비스 분리
3. **Phase 3**: 이벤트 드리븐 아키텍처 + 실시간 기능
4. **Phase 4**: AI 모델 자체 호스팅 + 엣지 컴퓨팅

---

> **아키텍처는 살아있는 문서입니다**  
> 프로젝트가 발전함에 따라 이 문서도 지속적으로 업데이트됩니다.