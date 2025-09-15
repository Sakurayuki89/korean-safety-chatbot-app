# 🛡️ Korean Safety Chatbot - 보안 강화 가이드

> **프로젝트**: Korean Safety Chatbot
> **마지막 업데이트**: 2025년 9월 15일
> **보안 레벨**: 서비스 단계 (개발/테스트 단계 이후)

---

## 📋 목차

1. [보안 강화 개요](#보안-강화-개요)
2. [현재 보안 상태](#현재-보안-상태)
3. [1주차: 즉각적인 위협 제거](#1주차-즉각적인-위협-제거)
4. [2주차: 코드 및 인프라 보안 강화](#2주차-코드-및-인프라-보안-강화)
5. [1개월차: 지속적인 보안 관리 체계](#1개월차-지속적인-보안-관리-체계)
6. [비상 복구 절차](#비상-복구-절차)

---

## 🛡️ 보안 강화 개요

### 목표
- 서비스 중단 없이 점진적 보안 강화
- MongoDB Atlas 접근 제한 최적화
- Vercel 환경변수 보안 강화
- 지속적인 보안 관리 체계 구축

### 기본 원칙
1. **서비스 중단 없는 배포**: 무중단 또는 Preview 환경 검증 후 배포
2. **최소 권한 원칙**: 필요한 최소한의 권한만 부여
3. **다층 보안**: 여러 계층에서 보안 강화
4. **지속적 모니터링**: 정기적인 보안 점검 및 업데이트

---

## 📊 현재 보안 상태

### ✅ 안전한 설정
- MongoDB 연결: `mongodb+srv://` TLS 암호화
- 환경변수 관리: Vercel 환경변수 사용
- HTTPS 연결: Vercel 자동 SSL 적용

### ⚠️ 개선 필요 사항
- MongoDB Network Access: `0.0.0.0/0` 전체 개방
- 환경변수 보안: `NEXT_PUBLIC_` 접두사 확인 필요
- NPM 패키지: 취약점 점검 필요
- Rate Limiting: API 무차별 대입 공격 방어 없음

---

## 🚨 1주차: 즉각적인 위협 제거 (최우선)

### 1.1 MongoDB Atlas IP 허용 목록 강화

**위험도**: 최상 ⚠️⚠️⚠️
**효과성**: 최상 ✅✅✅
**중단 위험**: 없음 🟢

#### 실행 단계

1. **Vercel 배포 IP 확인**
   ```bash
   # Vercel 공식 IP 범위 (2025년 9월 기준)
   64.29.17.0/24
   64.239.109.0/24
   64.239.123.0/24
   66.33.60.0/24
   76.76.21.0/24
   198.169.1.0/24
   198.169.2.0/24
   216.150.1.0/24
   216.150.16.0/24
   ```

2. **MongoDB Atlas 설정**
   - Atlas 콘솔 → Network Access → Add IP Address
   - 위 IP 범위들을 개별적으로 추가
   - **중요**: 기존 `0.0.0.0/0` 규칙은 아직 삭제하지 말 것

3. **연결 테스트**
   ```bash
   curl https://korean-safety-chatbot.vercel.app/api/db-status
   # 응답: {"status":"ok","message":"Successfully connected to database."}
   ```

4. **기존 규칙 삭제**
   - 연결이 확인되면 `0.0.0.0/0` 규칙 삭제

### 1.2 Vercel 환경변수 보안 감사

**위험도**: 상 ⚠️⚠️
**효과성**: 상 ✅✅
**중단 위험**: Preview 후 배포 🟡

#### 점검 항목

1. **민감 정보 노출 확인**
   - Vercel Dashboard → Settings → Environment Variables
   - `NEXT_PUBLIC_` 접두사가 붙은 변수 중 민감 정보 확인:
     - API 키, 시크릿 키
     - 데이터베이스 연결 정보
     - 인증 토큰

2. **조치 방법**
   ```bash
   # 민감 정보가 발견된 경우
   # 1. NEXT_PUBLIC_ 접두사 제거
   # 2. 서버 사이드에서만 사용하도록 코드 수정
   # 3. Preview 환경에서 테스트 후 배포
   ```

---

## 🛡️ 2주차: 코드 및 인프라 보안 강화

### 2.1 NPM 패키지 취약점 점검 및 패치

**위험도**: 중 ⚠️
**효과성**: 상 ✅✅
**중단 위험**: Preview 후 배포 🟡

#### 실행 명령어

```bash
# 1. 취약점 스캔
npm audit

# 2. 자동 수정 (심각도 high, critical)
npm audit fix

# 3. 수동 업데이트 (필요시)
npm install [패키지명]@latest

# 4. 테스트 후 배포
npm run build
npm run dev
```

### 2.2 API Rate Limiting 구현

**위험도**: 중 ⚠️
**효과성**: 상 ✅✅
**중단 위험**: Preview 후 배포 🟡

#### 구현 예시

```typescript
// middleware.ts 또는 개별 API에 추가
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 1분에 5회
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  return NextResponse.next();
}
```

### 2.3 보안 HTTP 헤더 추가

**위험도**: 하-중 ⚠️
**효과성**: 중 ✅
**중단 위험**: Preview 후 배포 🟡

#### next.config.ts 설정

```typescript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
];

module.exports = {
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders }
    ];
  }
};
```

---

## 🔄 1개월차: 지속적인 보안 관리 체계

### 3.1 비밀 키 정기 교체 계획

**주기**: 3-6개월
**대상**: MongoDB 비밀번호, API 키

#### 교체 절차

```bash
# 1. 새로운 강력한 비밀번호 생성
openssl rand -base64 32

# 2. Vercel 환경변수 추가 (새 이름으로)
vercel env add MONGODB_URI_V2 --prod

# 3. 코드 업데이트 및 배포

# 4. 안정성 확인 후 이전 키 삭제
vercel env rm MONGODB_URI --prod
```

### 3.2 정적 코드 분석 도구 도입

#### GitHub Actions 설정

```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        with:
          command: test
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 3.3 관리자 인증 로직 강화

#### 쿠키 보안 설정

```typescript
// 관리자 로그인 API에서
const cookieOptions = {
  httpOnly: true,     // XSS 방지
  secure: true,       // HTTPS에서만 전송
  sameSite: 'strict', // CSRF 방지
  maxAge: 60 * 60 * 24 // 24시간
};

response.setHeader('Set-Cookie', serialize('admin-token', token, cookieOptions));
```

---

## 🚨 비상 복구 절차

### 백업 정보
- **백업 위치**: `korean-safety-chatbot-backup-20250915-195823`
- **백업 생성일**: 2025년 9월 15일 19:58

### 복구 단계

1. **MongoDB 연결 실패 시**
   ```bash
   # MongoDB Atlas에서 0.0.0.0/0 규칙 임시 추가
   # 서비스 복구 후 원인 분석 및 재설정
   ```

2. **환경변수 문제 시**
   ```bash
   # Vercel 환경변수 롤백
   vercel env add ORIGINAL_VAR_NAME --prod
   ```

3. **전체 롤백 시**
   ```bash
   # 백업 폴더에서 복원
   cp -r ../korean-safety-chatbot-backup-20250915-195823/* ./
   ```

---

## 📞 지원 및 문의

- **MongoDB Atlas 지원**: https://docs.atlas.mongodb.com/
- **Vercel 지원**: https://vercel.com/docs
- **보안 이슈 신고**: 프로젝트 관리자에게 즉시 연락

---

**⚠️ 중요 알림**: 이 문서는 보안 정보를 포함하고 있으므로 승인된 팀 멤버만 접근할 수 있도록 관리하세요.