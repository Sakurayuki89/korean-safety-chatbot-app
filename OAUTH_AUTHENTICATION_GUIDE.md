# 🔐 OAuth 인증 시스템 완전 가이드

**Korean Safety Chatbot Google OAuth 인증 문제 해결 및 학습 문서**

---

## 📊 프로젝트 인증 시스템 현황

- **인증 방식**: Google OAuth 2.0 (통일됨)
- **토큰 저장**: HTTP-only 쿠키 (`google_token`)
- **인증 확인**: `/api/auth/status`
- **로그아웃**: `/api/auth/logout`
- **관리자 접근**: Google 계정 기반

---

## 🚨 **Critical Issue #007 - OAuth 관리자 로그인 실패** ✅ RESOLVED

**발견일**: 2025-09-14  
**증상**: Google OAuth 로그인 후 관리자 페이지에서 메인 페이지로 자동 리다이렉트  
**심각도**: ⭐⭐⭐⭐⭐ (Critical)  
**소요 시간**: 2시간  

### 🔍 **근본 원인 분석 (Think-Hard Analysis)**

#### 1. **Redirect URI 불일치 (핵심 원인)**
```
❌ 설정된 URI: https://korean-safety-chatbot-app-git-main-sakurayuki89s-projects.vercel.app/api/google/auth/callback
✅ 올바른 URI: https://korean-safety-chatbot-app.vercel.app/api/google/auth/callback
```

**원인**: Vercel 환경변수 `GOOGLE_REDIRECT_URI`가 git 브랜치 URL을 가리킴  
**디버깅 도구**: `/api/debug/oauth-config` 엔드포인트 생성으로 발견

#### 2. **인증 시스템 혼재 (복합 원인)**
```
관리자 페이지 → Google OAuth 토큰 확인 ✅
SafetyItemManager → JWT 토큰 확인 ❌
```

**결과**: 인증 충돌로 컴포넌트별 리다이렉트 발생

#### 3. **쿠키 전송 실패 (기술적 원인)**
```javascript
// ❌ 문제 코드
await fetch('/api/auth/status');

// ✅ 해결 코드  
await fetch('/api/auth/status', {
  credentials: 'include',
  cache: 'no-store'
});
```

### ⚡ **단계별 해결 과정**

#### Phase 1: 토큰 교환 실패 해결
```typescript
// lib/google-drive.ts - 동적 리다이렉트 URI 수정
export const getOAuth2Client = (req?: Request): OAuth2Client => {
  let redirectUri = GOOGLE_REDIRECT_URI;
  
  // 프로덕션 도메인에 대해 강제 올바른 URI 적용
  if (req) {
    const host = req.headers.get('host');
    if (host === 'korean-safety-chatbot-app.vercel.app') {
      redirectUri = 'https://korean-safety-chatbot-app.vercel.app/api/google/auth/callback';
    }
  }
  
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUri);
};
```

#### Phase 2: 콜백 리다이렉트 수정
```typescript
// app/api/google/auth/callback/route.ts - HTML 페이지로 변경
const html = `
<!DOCTYPE html>
<html>
<body>
    <h2>로그인 성공!</h2>
    <div class="spinner"></div>
    <script>
        setTimeout(() => {
            window.location.href = '${targetUrl}';
        }, 1500);
    </script>
</body>
</html>`;
```

#### Phase 3: 미들웨어 인증 통일
```typescript
// middleware.ts - Google OAuth 토큰 확인으로 변경
async function verifyGoogleToken(tokenString: string): Promise<boolean> {
  const tokens = JSON.parse(tokenString);
  return !!(tokens.access_token && (!tokens.expiry_date || tokens.expiry_date > Date.now()));
}
```

#### Phase 4: 컴포넌트 인증 통일
```typescript
// components/admin/SafetyItemManager.tsx
const checkAuthStatus = async () => {
  const response = await fetch('/api/auth/status', {
    credentials: 'include', // 핵심!
    cache: 'no-store'
  });
  const data = await response.json();
  setIsAuthenticated(data.isAuthenticated);
};
```

### 🎯 **해결 결과**

1. ✅ **토큰 교환 성공**: Redirect URI 불일치 해결
2. ✅ **관리자 페이지 접근**: 인증 시스템 통일
3. ✅ **쿠키 전송**: credentials 옵션 추가
4. ✅ **리다이렉트 방지**: 컴포넌트 인증 로직 통일

---

## 🏗️ **현재 인증 아키텍처**

### **OAuth Flow 다이어그램**
```
사용자 → Google 로그인 → 콜백 처리 → 쿠키 설정 → 관리자 페이지
   ↓           ↓            ↓           ↓            ↓
브라우저 → Google Auth → /callback → google_token → 인증 완료
```

### **API 엔드포인트 맵**
```
/api/google/auth              → OAuth URL 생성
/api/google/auth/callback     → 토큰 교환 및 쿠키 설정
/api/auth/status             → Google 토큰 확인
/api/auth/logout             → 토큰 삭제
/api/debug/oauth-config      → 설정 디버깅
```

### **인증 확인 플로우**
```typescript
// 모든 컴포넌트에서 동일하게 사용
const checkAuth = async () => {
  const response = await fetch('/api/auth/status', {
    credentials: 'include',
    cache: 'no-store'
  });
  return response.ok ? (await response.json()).isAuthenticated : false;
};
```

---

## 🔧 **배포 및 환경 설정 가이드**

### **환경 변수 체크리스트**
```bash
# Vercel 환경변수 확인
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=https://korean-safety-chatbot-app.vercel.app/api/google/auth/callback

# MongoDB (선택사항)
MONGODB_URI=mongodb+srv://...
```

### **배포 전 검증 단계**
1. **OAuth 설정 확인**
   ```bash
   curl https://korean-safety-chatbot-app.vercel.app/api/debug/oauth-config
   ```

2. **리다이렉트 URI 검증**
   ```json
   {
     "redirectUri": "올바른 프로덕션 URL인지 확인",
     "expectedCallback": "현재 도메인과 일치하는지 확인"
   }
   ```

3. **인증 플로우 테스트**
   - `/admin` 접근 → Google 로그인 → 관리자 페이지 유지 확인

### **Google Cloud Console 설정**
```
OAuth 2.0 클라이언트 ID 설정:
승인된 리디렉션 URI:
- https://korean-safety-chatbot-app.vercel.app/api/google/auth/callback
- http://localhost:3000/api/google/auth/callback (개발용)
```

---

## 🧪 **디버깅 및 트러블슈팅**

### **일반적인 문제들**

#### 1. **"Failed to exchange authorization code for tokens"**
```bash
# 원인: Redirect URI 불일치
# 해결: /api/debug/oauth-config로 URI 확인
curl https://korean-safety-chatbot-app.vercel.app/api/debug/oauth-config
```

#### 2. **관리자 페이지에서 메인 페이지로 리다이렉트**
```javascript
// 원인: credentials: 'include' 누락
// 해결: 모든 인증 관련 fetch에 옵션 추가
fetch('/api/auth/status', { credentials: 'include' })
```

#### 3. **쿠키가 설정되지 않음**
```typescript
// 원인: sameSite/secure 설정 충돌
// 해결: 환경별 secure 설정
secure: process.env.NODE_ENV === 'production'
```

### **디버깅 도구들**

#### 1. **OAuth 설정 확인**
```typescript
// /api/debug/oauth-config/route.ts
export async function GET(req: NextRequest) {
  const oauth2Client = getOAuth2Client(req);
  return NextResponse.json({
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    redirectUri: '확인할 URI',
    currentDomain: req.headers.get('host')
  });
}
```

#### 2. **쿠키 상태 확인**
```typescript
// /api/debug/cookies/route.ts
export async function GET() {
  const cookieStore = await cookies();
  return NextResponse.json({
    hasGoogleToken: !!cookieStore.get('google_token'),
    allCookies: cookieStore.getAll()
  });
}
```

#### 3. **브라우저 개발자 도구**
```javascript
// Console에서 쿠키 확인
document.cookie

// Network 탭에서 확인사항
// - /api/auth/status 요청에 쿠키 포함 여부
// - Response에서 Set-Cookie 헤더 확인
```

---

## 📚 **학습 포인트 및 모범 사례**

### **1. OAuth 구현 시 주의사항**
- ✅ Redirect URI는 정확히 일치해야 함
- ✅ 환경별 URL 관리 필요
- ✅ 쿠키 설정 시 환경별 secure 옵션 적용
- ✅ credentials: 'include' 필수

### **2. 인증 시스템 설계 원칙**
- ✅ 단일 인증 방식 사용 (혼재 금지)
- ✅ 모든 컴포넌트에서 동일한 인증 확인 로직
- ✅ 미들웨어와 클라이언트 인증 방식 일치
- ✅ 에러 처리 및 디버깅 도구 준비

### **3. 배포 및 환경 관리**
- ✅ 환경변수 검증 도구 구현
- ✅ 단계별 배포 검증 프로세스
- ✅ 프로덕션/개발 환경별 설정 분리
- ✅ 디버깅 엔드포인트 준비

---

## 🚀 **향후 개선 계획**

### **보안 강화**
- [ ] JWT 기반 세션 관리 추가
- [ ] CSRF 토큰 구현
- [ ] Rate limiting 적용

### **사용자 경험**
- [ ] 로딩 상태 개선
- [ ] 에러 메시지 현지화
- [ ] 로그인 유지 기능

### **운영 도구**
- [ ] 인증 로그 모니터링
- [ ] 자동 배포 검증
- [ ] 헬스 체크 엔드포인트

---

## 📋 **체크리스트 템플릿**

### **배포 전 필수 확인사항**
- [ ] Google Cloud Console에서 Redirect URI 설정 완료
- [ ] Vercel 환경변수 모든 값 설정 완료
- [ ] `/api/debug/oauth-config`에서 올바른 URI 확인
- [ ] 로컬에서 OAuth 플로우 테스트 완료
- [ ] 모든 관리자 컴포넌트에서 `credentials: 'include'` 설정 확인

### **문제 발생 시 디버깅 순서**
1. `/api/debug/oauth-config`에서 설정 확인
2. 브라우저 Network 탭에서 쿠키 전송 확인
3. `/api/auth/status` 응답 확인
4. 컴포넌트별 인증 로직 확인
5. middleware.ts의 토큰 확인 방식 점검

---

**작성일**: 2025-09-14  
**최종 업데이트**: 2025-09-14  
**작성자**: Claude Code  
**검토자**: 박송훈

> 이 문서는 실제 프로덕션 환경에서 발생한 복잡한 OAuth 인증 문제를 해결한 과정을 바탕으로 작성되었습니다. 향후 동일한 문제 발생 시 빠른 해결과 학습을 위해 활용하십시오.