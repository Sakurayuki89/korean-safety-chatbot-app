# 🚀 Gemini CLI - 한국 안전보건용품 관리 시스템 배포 지시서

## 📋 배포 개요

**프로젝트명**: 한국 안전보건용품 관리 시스템  
**타입**: Next.js 15 + React 19 풀스택 웹 애플리케이션  
**배포 목표**: Vercel 프로덕션 배포 (1순위), Railway/Netlify (대안)  
**현재 상태**: ✅ 배포 준비 완료 (모든 오류 수정 완료)

## 🎯 배포 미션

### 우선순위 1: Vercel 배포
```bash
# 1. Vercel CLI 설치 및 로그인
npm i -g vercel
vercel login

# 2. 프로젝트 초기화
vercel

# 3. 환경변수 설정 (아래 변수들을 Vercel 대시보드에서 설정)
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET  
vercel env add GOOGLE_REDIRECT_URI
vercel env add GOOGLE_APPLICATION_CREDENTIALS
vercel env add GOOGLE_SHEETS_SPREADSHEET_ID
vercel env add GOOGLE_DRIVE_FOLDER_ID
vercel env add MONGODB_URI
vercel env add GEMINI_API_KEY

# 4. 프로덕션 배포
vercel --prod
```

### 우선순위 2: Railway 배포 (대안)
```bash
# 1. Railway CLI 설치
npm install -g @railway/cli

# 2. 로그인 및 초기화
railway login
railway init

# 3. 환경변수 설정
railway variables set GOOGLE_APPLICATION_CREDENTIALS="[Google 서비스 계정 JSON]"
railway variables set MONGODB_URI="[MongoDB Atlas 연결 문자열]"
railway variables set GEMINI_API_KEY="[Gemini API 키]"

# 4. 배포 실행
railway up
```

## 🔧 필수 환경변수 설정값

### Google API 관련
```bash
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
GOOGLE_REDIRECT_URI="https://yourdomain.com/api/google/auth/callback"

# Google 서비스 계정 JSON (전체 JSON 문자열)
GOOGLE_APPLICATION_CREDENTIALS='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@your-project.iam.gserviceaccount.com"
}'

GOOGLE_SHEETS_SPREADSHEET_ID="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
GOOGLE_DRIVE_FOLDER_ID="1pzjLHkRFxkrj5xZs3QGH7YcjAyV9kL2m"
```

### 데이터베이스 & AI
```bash
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/korean-safety-system"
GEMINI_API_KEY="AIzaSy..."
NODE_ENV="production"
```

## 🏗️ 배포 전 체크리스트

### ✅ 코드 품질 확인
- [x] TypeScript 컴파일 에러: 0개 (✅ 해결완료)
- [x] ESLint 오류: 0개 (✅ 해결완료)  
- [x] 프로덕션 빌드: 성공 (✅ 확인완료)
- [x] 필수 의존성: 모두 설치됨

### ✅ 설정 파일 확인
- [x] `next.config.ts`: 최적화된 설정 적용
- [x] `package.json`: 모든 스크립트 정상 작동
- [x] `.env.example`: 환경변수 가이드 제공
- [x] `tsconfig.json`: TypeScript 설정 검증

### ✅ 핵심 기능 검증
- [x] 안전보건용품 관리 시스템
- [x] Google Drive 이미지 프록시
- [x] Google Sheets 내보내기
- [x] AI 안전 상담 (Gemini)
- [x] 공지사항 관리

## 📋 배포 실행 명령어 세트

### Phase 1: 환경 준비
```bash
# 프로젝트 디렉토리로 이동
cd /Users/parksonghoon/Code/korean-safety-chatbot

# 의존성 최종 확인
npm install

# 빌드 테스트 (최종 검증)
npm run build
```

### Phase 2: Vercel 배포 (권장)
```bash
# Vercel 배포 시작
vercel

# 환경변수는 Vercel 웹 대시보드에서 설정:
# 1. https://vercel.com/dashboard
# 2. 프로젝트 선택 → Settings → Environment Variables
# 3. 위의 환경변수들을 모두 추가

# 프로덕션 배포 완료
vercel --prod
```

### Phase 3: 배포 검증
```bash
# 배포된 URL에서 다음 기능들을 테스트:
# 1. 메인 페이지 로드 (/)
# 2. 안전용품 목록 표시
# 3. 이미지 프록시 작동 확인
# 4. 관리자 페이지 접근 (/admin)
# 5. AI 채팅 기능
```

## 🔍 배포 후 필수 검증사항

### 1. 기능별 검증 체크리스트
```markdown
□ 메인 페이지 로딩 (3초 이내)
□ 안전보건용품 목록 조회 정상
□ 이미지 표시 (Google Drive 프록시) 정상  
□ Google Sheets 내보내기 기능 작동
□ 관리자 페이지 접근 (인증 필요)
□ AI 채팅 시스템 응답 정상
□ 공지사항 표시 정상
□ 반응형 디자인 (모바일/태블릿/데스크톱)
□ 검색 및 필터링 기능
□ 문의 페이지 기능
```

### 2. 성능 검증 기준
```bash
# Lighthouse 스코어 목표
Performance: 90+
Accessibility: 95+  
Best Practices: 90+
SEO: 90+

# Core Web Vitals 목표
LCP (Largest Contentful Paint): < 2.5초
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
```

### 3. 보안 검증
- [ ] HTTPS 강제 적용 확인
- [ ] API 엔드포인트 보안 검증
- [ ] 환경변수 노출 여부 확인
- [ ] CORS 설정 적절성 검증

## 🚨 트러블슈팅 가이드

### 일반적인 문제 해결

#### 1. 빌드 실패 시
```bash
# 캐시 클리어 후 재시도
rm -rf .next node_modules
npm install
npm run build
```

#### 2. 환경변수 문제 시
```bash
# 환경변수 존재 확인 (Vercel 대시보드)
# Google 서비스 계정 JSON 형식 검증
# MongoDB 연결 문자열 접근 권한 확인
```

#### 3. 이미지 로딩 실패 시
```bash
# Google Drive API 권한 확인
# 서비스 계정 권한 검증
# 이미지 프록시 엔드포인트 테스트
```

### 플랫폼별 문제 해결

#### Vercel
```bash
# 함수 타임아웃 문제: vercel.json에서 maxDuration 조정
# 로그 확인: vercel logs [deployment-url]
# 캐시 무효화: vercel --force
```

#### Railway
```bash
# 메모리 문제: railway variables set NODE_OPTIONS="--max-old-space-size=2048"
# 로그 확인: railway logs
# 재배포: railway up --detach
```

## 📊 배포 완료 보고서 양식

배포 완료 후 다음 정보를 제공하세요:

```markdown
## 🎉 배포 완료 보고서

### 📍 배포 정보
- **배포 플랫폼**: Vercel / Railway / Netlify
- **배포 URL**: https://your-deployed-url.com
- **배포 일시**: YYYY-MM-DD HH:MM:SS
- **빌드 시간**: XX분 XX초

### ✅ 기능 검증 결과
- [ ] 메인 페이지 로딩: 정상/오류
- [ ] 이미지 프록시: 정상/오류  
- [ ] 데이터베이스 연결: 정상/오류
- [ ] AI 채팅: 정상/오류
- [ ] 관리자 기능: 정상/오류

### 📈 성능 메트릭
- **Lighthouse 스코어**: Performance XX / Accessibility XX / Best Practices XX / SEO XX
- **페이지 로드 시간**: X.X초
- **번들 크기**: XXX KB

### 🔗 접근 정보  
- **메인 페이지**: [URL]/
- **관리자 페이지**: [URL]/admin
- **API 상태**: [URL]/api/db-status
- **이미지 디버깅**: [URL]/debug-images

### 🚨 발견된 이슈 (있는 경우)
- 이슈 1: 설명 및 해결 방법
- 이슈 2: 설명 및 해결 방법
```

## 💡 최적화 권장사항

### 배포 후 추가 최적화
1. **CDN 활용**: Vercel Edge Network 또는 Cloudflare 연동
2. **모니터링 도구**: Sentry 에러 추적 설정
3. **성능 모니터링**: Google Analytics, Hotjar 등 사용자 분석
4. **백업 전략**: MongoDB Atlas 자동 백업 설정

### 유지보수 계획
1. **정기 업데이트**: 월 1회 의존성 업데이트
2. **보안 점검**: 분기 1회 보안 취약점 스캔
3. **성능 모니터링**: 주간 성능 리포트 검토
4. **기능 개선**: 사용자 피드백 기반 반복 개선

---

**🎯 배포 목표**: 안전하고 빠르며 확장 가능한 한국 안전보건용품 관리 시스템의 성공적인 프로덕션 배포

**⚡ 실행 지시**: 위의 단계를 순차적으로 실행하되, 각 단계에서 반드시 검증을 완료한 후 다음 단계로 진행하세요.