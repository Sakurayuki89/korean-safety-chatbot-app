# 🚀 한국 안전보건용품 관리 시스템 - 배포 가이드

## 목차
- [배포 전 체크리스트](#배포-전-체크리스트)
- [오류 수정 가이드](#오류-수정-가이드)
- [Vercel 배포](#vercel-배포)
- [Netlify 배포](#netlify-배포)  
- [Railway 배포](#railway-배포)
- [환경변수 설정](#환경변수-설정)
- [트러블슈팅](#트러블슈팅)

---

## 📋 배포 전 필수 체크리스트

### ✅ 1. 코드 품질 검사
- [ ] ESLint 오류 수정 (현재: 21개 오류, 14개 경고)
- [ ] TypeScript 컴파일 오류 수정 (현재: 1개 오류)
- [ ] 빌드 테스트 성공 확인
- [ ] 테스트 코드 실행 (있는 경우)

### ✅ 2. 환경 변수 설정 확인
- [ ] GOOGLE_APPLICATION_CREDENTIALS (Google API 인증)
- [ ] GOOGLE_SHEETS_SPREADSHEET_ID (스프레드시트 ID)
- [ ] GOOGLE_DRIVE_FOLDER_ID (드라이브 폴더 ID)
- [ ] MONGODB_URI (데이터베이스 연결)
- [ ] GEMINI_API_KEY (AI API 키)
- [ ] NODE_ENV (환경 설정)

### ✅ 3. 의존성 및 보안 검사
- [ ] package.json dependencies 최신 버전 확인
- [ ] 보안 취약점 스캔 (`npm audit`)
- [ ] 불필요한 파일 제거 (.env, 테스트 파일 등)
- [ ] Google 서비스 계정 키 확인

### ✅ 4. 기능 테스트
- [ ] 안전보건용품 등록/수정/삭제
- [ ] Google OAuth 인증
- [ ] 파일 업로드 (이미지 → Google Drive)
- [ ] Google Sheets 내보내기
- [ ] MongoDB 연결 및 데이터 조회
- [ ] 이미지 프록시 시스템
- [ ] 반응형 UI 테스트

---

## 🔧 발견된 오류 및 수정 방안

### 🚨 Critical Errors (즉시 수정 필요)

#### 1. TypeScript 컴파일 오류
```bash
# 오류: app/api/check-file-permissions/route.ts(3,10): error TS2459: Module '"@/lib/google-drive"' declares 'getDriveClient' locally, but it is not exported.
```

**수정 방법:**
```typescript
// lib/google-drive.ts에서 getDriveClient 함수를 export 하거나
// check-file-permissions/route.ts에서 사용하지 않는 import 제거

// Option 1: lib/google-drive.ts에 추가
export const getDriveClient = (accessToken: string) => {
  // ... 기존 코드
};

// Option 2: 미사용 import 제거 (권장)
// import { getDriveClient } from '@/lib/google-drive'; // 이 줄 제거
```

#### 2. ESLint Critical Errors

**a) @typescript-eslint/no-explicit-any (12개 오류)**
```typescript
// ❌ 잘못된 예시
const data: any = response.data;

// ✅ 올바른 수정
interface ApiResponse {
  data: SafetyItem[];
  message: string;
}
const data: ApiResponse = response.data;
```

**b) @typescript-eslint/no-require-imports (2개 오류)**
```typescript
// ❌ 잘못된 예시
const { OAuth2Client } = require('google-auth-library');

// ✅ 올바른 수정
import { OAuth2Client } from 'google-auth-library';
```

### ⚠️ High Priority Warnings (배포 전 수정 권장)

#### 1. Next.js Image Optimization (4개 경고)
```tsx
// ❌ 기존 코드
<img src={imageUrl} alt="Safety item" />

// ✅ 수정된 코드
import Image from 'next/image';
<Image 
  src={imageUrl} 
  alt="Safety item" 
  width={300} 
  height={200} 
  loading="lazy"
/>
```

#### 2. React Hook Dependencies (3개 경고)
```tsx
// ❌ 기존 코드
useEffect(() => {
  fetchAnnouncements();
}, []); // fetchAnnouncements 누락

// ✅ 수정된 코드
useEffect(() => {
  fetchAnnouncements();
}, [fetchAnnouncements]);

// 또는 useCallback으로 안정화
const fetchAnnouncements = useCallback(async () => {
  // ... 구현
}, []);
```

### 🔄 Medium Priority Issues (선택적 수정)

#### 1. Unused Variables (3개 경고)
```typescript
// ❌ 사용하지 않는 변수
const [error, setError] = useState<string>('');

// ✅ 제거 또는 사용
// const [, setError] = useState<string>(''); // 사용 안할 경우
// 또는 실제로 error 변수 활용
```

#### 2. React Unescaped Entities (2개 오류)
```tsx
// ❌ 기존 코드
<span>업데이트된 "안전보건용품" 정보</span>

// ✅ 수정된 코드
<span>업데이트된 &quot;안전보건용품&quot; 정보</span>
```

---

## 🛠️ 자동 수정 스크립트

### 1. ESLint 자동 수정
```bash
# 자동으로 수정 가능한 오류들 수정
npm run lint -- --fix

# 또는
npx eslint . --fix
```

### 2. 의존성 보안 업데이트
```bash
# 보안 취약점 확인
npm audit

# 자동 수정 (가능한 경우)
npm audit fix
```

### 3. 패키지 업데이트 확인
```bash
# outdated 패키지 확인
npm outdated

# 업데이트 (주의: 테스트 필요)
npm update
```

---

## 🏗️ 빌드 및 프로덕션 테스트

### 1. 로컬 빌드 테스트
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 빌드된 애플리케이션 테스트
# http://localhost:3000에서 모든 기능 테스트
```

### 2. 환경별 설정 확인
```bash
# 개발 환경
NODE_ENV=development npm run build

# 프로덕션 환경
NODE_ENV=production npm run build
```

---

## 📊 성능 최적화 체크리스트

### 🎯 Core Web Vitals 최적화
- [ ] 이미지 최적화 (Next.js Image 컴포넌트 사용)
- [ ] 번들 크기 분석 (`npm run build` 후 확인)
- [ ] 불필요한 의존성 제거
- [ ] 코드 스플리팅 적용 확인

### 📱 반응형 및 접근성
- [ ] 모바일 디바이스 테스트
- [ ] 키보드 네비게이션 테스트
- [ ] 스크린 리더 호환성 확인
- [ ] Color contrast 검사

---

## 🔍 배포 직전 최종 검증

### 1. 기능 테스트 시나리오
```markdown
□ 홈페이지 접속
□ 안전보건용품 목록 조회
□ Google 로그인/로그아웃
□ 관리자 페이지 접근 (인증된 사용자)
□ 안전보건용품 등록 (이미지 포함)
□ 용품 신청 기능
□ Google Sheets 다운로드
□ 반응형 UI (모바일/태블릿/데스크톱)
```

### 2. 성능 테스트
```bash
# Lighthouse 스코어 확인 (Chrome DevTools)
# 목표: Performance 90+, Accessibility 90+, Best Practices 90+, SEO 90+
```

### 3. 보안 검사
```bash
# 환경 변수 노출 확인
grep -r "process.env" --exclude-dir=node_modules --exclude-dir=.next .

# API 키 하드코딩 확인
grep -r "AIza\|sk-\|pk_" --exclude-dir=node_modules --exclude-dir=.next .
```

---

## 📝 배포 전 최종 체크리스트

### ✅ 완료해야 할 항목들
- [ ] 모든 ESLint 오류 수정 (21개 → 0개)
- [ ] TypeScript 컴파일 오류 수정 (1개 → 0개)
- [ ] 프로덕션 빌드 성공
- [ ] 환경 변수 설정 완료
- [ ] 기능 테스트 통과
- [ ] 성능 최적화 적용
- [ ] 보안 검사 통과
- [ ] Git commit 및 push 완료
- [ ] 배포 플랫폼 설정 준비

### 🚨 배포 금지 조건
- ESLint 오류가 남아있는 경우
- TypeScript 컴파일 실패
- 빌드 실패
- 환경 변수 누락
- 핵심 기능 동작 실패

---

## 💡 추가 권장사항

### 1. 모니터링 설정
- 애플리케이션 성능 모니터링 (APM) 설정
- 오류 추적 시스템 (Sentry 등) 설정
- 로그 수집 시스템 설정

### 2. 백업 및 복구 계획
- 데이터베이스 백업 전략
- 배포 롤백 계획
- 장애 대응 매뉴얼

### 3. 문서화
- API 문서 업데이트
- 사용자 매뉴얼 준비
- 운영 가이드 작성

---

---

## Vercel 배포

### 1. 준비사항
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 로그인
vercel login
```

### 2. 배포 설정

#### vercel.json 파일 생성
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "GOOGLE_APPLICATION_CREDENTIALS": "@google_credentials_json",
    "GOOGLE_SHEETS_SPREADSHEET_ID": "@google_sheets_id",
    "GOOGLE_DRIVE_FOLDER_ID": "@google_drive_folder_id",
    "MONGODB_URI": "@mongodb_uri",
    "GEMINI_API_KEY": "@gemini_api_key"
  },
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

### 3. 배포 과정
```bash
# 초기 배포
vercel

# 프로덕션 배포
vercel --prod

# 환경변수 설정
vercel env add GOOGLE_APPLICATION_CREDENTIALS
vercel env add GOOGLE_SHEETS_SPREADSHEET_ID
vercel env add GOOGLE_DRIVE_FOLDER_ID
vercel env add MONGODB_URI
vercel env add GEMINI_API_KEY
```

### 4. Vercel 웹 대시보드 설정
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 환경변수 추가:
   - `GOOGLE_APPLICATION_CREDENTIALS`: Google 서비스 계정 JSON 전체 내용
   - `GOOGLE_SHEETS_SPREADSHEET_ID`: 스프레드시트 ID
   - `GOOGLE_DRIVE_FOLDER_ID`: Google Drive 폴더 ID
   - `MONGODB_URI`: MongoDB 연결 문자열
   - `GEMINI_API_KEY`: Google Gemini API 키

### 5. 도메인 설정
- Settings → Domains에서 커스텀 도메인 추가
- DNS 설정: CNAME 레코드를 Vercel 주소로 설정

---

## Netlify 배포

### 1. 준비사항
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login
```

### 2. 빌드 설정

#### netlify.toml 파일 생성
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "8"
  NEXT_PRIVATE_TARGET = "server"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. Next.js Netlify 설정

#### next.config.js 수정
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify 배포를 위한 설정
  target: 'serverless',
  
  // 이미지 최적화 설정
  images: {
    domains: ['drive.google.com', 'lh3.googleusercontent.com'],
    unoptimized: true // Netlify에서는 true로 설정
  },
  
  // API 라우트 설정
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Netlify Functions 지원
  experimental: {
    serverComponentsExternalPackages: ['mongodb']
  }
};

module.exports = nextConfig;
```

### 4. 배포 과정
```bash
# 초기화
netlify init

# 빌드 및 배포
netlify build
netlify deploy

# 프로덕션 배포
netlify deploy --prod
```

### 5. 환경변수 설정
- [Netlify Dashboard](https://app.netlify.com) → Site settings → Environment variables
- 또는 CLI로 설정:
```bash
netlify env:set GOOGLE_APPLICATION_CREDENTIALS "$(cat path/to/credentials.json)"
netlify env:set GOOGLE_SHEETS_SPREADSHEET_ID "your_spreadsheet_id"
netlify env:set GOOGLE_DRIVE_FOLDER_ID "your_drive_folder_id"
netlify env:set MONGODB_URI "your_mongodb_uri"
netlify env:set GEMINI_API_KEY "your_gemini_key"
```

---

## Railway 배포

### 1. 준비사항
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login
```

### 2. 프로젝트 설정

#### railway.json 파일 생성
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### 3. 환경변수 설정

#### .env.example 파일 업데이트
```bash
# Google API 설정
GOOGLE_APPLICATION_CREDENTIALS=
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_DRIVE_FOLDER_ID=

# 데이터베이스 설정
MONGODB_URI=

# AI API 설정
GEMINI_API_KEY=

# Railway 전용 설정
RAILWAY_ENVIRONMENT=production
PORT=3000
NODE_ENV=production
```

### 4. 배포 과정
```bash
# 프로젝트 초기화
railway init

# 환경변수 설정
railway variables set GOOGLE_APPLICATION_CREDENTIALS="$(cat credentials.json)"
railway variables set GOOGLE_SHEETS_SPREADSHEET_ID="your_id"
railway variables set GOOGLE_DRIVE_FOLDER_ID="your_folder_id"
railway variables set MONGODB_URI="your_mongodb_uri"
railway variables set GEMINI_API_KEY="your_gemini_key"

# 배포
railway up
```

### 5. Railway MongoDB 설정 (옵션)
```bash
# Railway에서 MongoDB 서비스 추가
railway add mongodb

# 자동 생성된 MONGO_URL 사용
railway variables set MONGODB_URI=$MONGO_URL
```

### 6. 도메인 설정
```bash
# 커스텀 도메인 추가
railway domain add yourdomain.com
```

---

## 환경변수 설정

### 필수 환경변수
```bash
# Google API 인증 (JSON 형태)
GOOGLE_APPLICATION_CREDENTIALS='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}'

# Google Sheets 설정
GOOGLE_SHEETS_SPREADSHEET_ID="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"

# Google Drive 설정  
GOOGLE_DRIVE_FOLDER_ID="1pzjLHkRFxkrj5xZs3QGH7YcjAyV9kL2m"

# MongoDB 연결
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/korean-safety-system"

# Gemini AI API
GEMINI_API_KEY="AIzaSy..."

# 환경 설정
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Google 서비스 계정 설정 방법

#### 1. Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services → Library에서 필요한 API 활성화:
   - Google Sheets API
   - Google Drive API
   - Gmail API (선택사항)

#### 2. 서비스 계정 생성
```bash
# Google Cloud CLI 설치 후
gcloud iam service-accounts create korean-safety-service \
  --display-name="Korean Safety System Service Account"

# 키 파일 생성
gcloud iam service-accounts keys create ./credentials.json \
  --iam-account=korean-safety-service@your-project-id.iam.gserviceaccount.com

# 권한 부여
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:korean-safety-service@your-project-id.iam.gserviceaccount.com" \
  --role="roles/editor"
```

#### 3. Google Sheets/Drive 권한 설정
1. Google Sheets에서 서비스 계정 이메일로 공유 (편집 권한)
2. Google Drive 폴더에서 서비스 계정 이메일로 공유 (편집 권한)

---

## 트러블슈팅

### 일반적인 문제들

#### 1. 빌드 실패
```bash
# 의존성 문제
rm -rf node_modules package-lock.json
npm install

# Node.js 버전 확인 (v18+ 권장)
node --version

# 캐시 정리
npm run clean
```

#### 2. 환경변수 문제
```javascript
// 환경변수 디버깅 코드 (개발 시에만 사용)
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Has Google credentials:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log('Has Sheets ID:', !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
console.log('Has MongoDB URI:', !!process.env.MONGODB_URI);
```

#### 3. Google API 인증 실패
```bash
# 서비스 계정 권한 확인
1. Google Cloud Console → IAM
2. 서비스 계정에 필요한 역할 부여:
   - "편집자" 또는 "Google Sheets API Service Agent"
   - "Google Drive API Service Agent"

# API 할당량 확인
Google Cloud Console → APIs & Services → Quotas
```

#### 4. MongoDB 연결 실패
```javascript
// MongoDB 연결 테스트
const { MongoClient } = require('mongodb');

async function testConnection() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('MongoDB 연결 성공');
    await client.close();
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
  }
}
```

### 플랫폼별 문제 해결

#### Vercel
```bash
# 함수 타임아웃 문제
# vercel.json에서 maxDuration 조정 (최대 60초)

# 빌드 캐시 문제
vercel --force

# 로그 확인
vercel logs
```

#### Netlify
```bash
# 함수 크기 제한 (50MB)
# 큰 의존성이 있는 경우 최적화 필요

# 빌드 플러그인 사용
npm install @netlify/plugin-nextjs

# netlify.toml에 추가
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### Railway
```bash
# 메모리 부족 문제
railway variables set NODE_OPTIONS="--max-old-space-size=2048"

# 포트 문제
railway variables set PORT=3000

# 로그 확인
railway logs
```

### 성능 최적화

#### 이미지 최적화
```javascript
// next.config.js
const nextConfig = {
  images: {
    domains: ['drive.google.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }
};
```

#### 번들 크기 분석
```bash
# Bundle analyzer 설치
npm install @next/bundle-analyzer

# 분석 실행
ANALYZE=true npm run build
```

---

## 배포 후 확인사항

### 1. 기능 테스트 체크리스트
- [ ] 홈페이지 로딩 (3초 이내)
- [ ] 안전보건용품 목록 조회
- [ ] 이미지 표시 (Google Drive 프록시)
- [ ] Google Sheets 내보내기
- [ ] 관리자 기능 (인증 필요)
- [ ] 반응형 디자인 (모바일/태블릿)
- [ ] 검색 및 필터링
- [ ] 폼 제출 및 데이터 저장

### 2. 성능 모니터링
```bash
# Lighthouse 스코어 확인 (목표)
Performance: 90+
Accessibility: 95+
Best Practices: 90+
SEO: 90+

# Core Web Vitals
LCP (Largest Contentful Paint): < 2.5초
FID (First Input Delay): < 100ms  
CLS (Cumulative Layout Shift): < 0.1
```

### 3. 보안 검증
- [ ] HTTPS 강제 적용
- [ ] API 엔드포인트 보호
- [ ] 민감한 정보 노출 없음
- [ ] CORS 설정 적절
- [ ] XSS/CSRF 보호

---

## 추천 배포 전략

### 초보자 추천 순위
1. **Vercel** - Next.js와 완벽 호환, 설정 간단, 무료 플랜 충분
2. **Railway** - 데이터베이스 포함 풀스택 앱에 적합, CLI 사용 편리
3. **Netlify** - JAMstack에 특화, Functions 지원 좋음

### 단계별 배포 가이드
1. **개발**: 로컬에서 모든 기능 테스트 완료
2. **스테이징**: 테스트용 환경에 먼저 배포 (preview 브랜치)
3. **프로덕션**: 실제 서비스 환경 배포 (main 브랜치)
4. **모니터링**: 배포 후 24시간 지속적인 모니터링

---

**⚠️ 주의사항:** 
- 모든 오류를 수정한 후 반드시 전체 기능 테스트를 다시 실행하세요. 
- 환경변수에 실제 Google 서비스 계정 정보를 정확히 입력하세요.
- 배포 전 반드시 로컬에서 프로덕션 빌드가 성공하는지 확인하세요.

*이 가이드는 한국 안전보건용품 관리 시스템의 배포를 위한 맞춤형 가이드입니다.*