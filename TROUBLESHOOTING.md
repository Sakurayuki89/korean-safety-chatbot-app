# 문제 해결 가이드 (Troubleshooting Guide)

## 📝 프로젝트 수정 히스토리

### 🔐 Google OAuth 로그인 및 세션 관리 이슈 해결

#### 문제 상황
- Google 로그인 성공 후 관리자 페이지 진입 실패
- 로그인 상태가 유지되지 않음
- 매번 "Login with Google" 화면이 표시됨

#### 발견된 주요 문제점

##### 1. OAuth 콜백 라우트 버그 (Critical)
```typescript
// 문제: code 변수가 정의되지 않음
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // const code = searchParams.get('code'); // 누락됨
  if (!code) { // 정의되지 않은 변수 사용
    return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
  }
}

// 해결: code 변수 정의 추가
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code'); // 추가됨
  if (!code) {
    return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
  }
}
```

##### 2. useGoogleDrive 훅 구조적 결함
```typescript
// 문제: 훅 함수가 제대로 정의되지 않음
// useState, setState 등이 정의되지 않은 상태에서 사용됨

// 해결: 완전한 훅 구조 재작성
export const useGoogleDrive = () => {
  const [state, setState] = useState<GoogleDriveState>({
    files: [],
    loading: false,
    error: null,
    isAuthenticated: false,
  });
  // ... 나머지 구현
};
```

##### 3. 환경변수 불일치 문제
```bash
# 문제: localhost URI로 고정됨
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/auth/callback

# 해결: 동적 리디렉션 URI 생성
# .env.local에서 제거하고 런타임에 동적 생성
```

##### 4. CSRF 토큰 검증 이슈
```typescript
// 문제: 쿠키 저장/읽기 불일치로 CSRF 검증 실패
// 해결: sameSite 속성 추가 및 디버깅 로깅 강화
cookieStore.set(OAUTH_STATE_COOKIE, nonce, {
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'development',
  maxAge: maxAge,
  path: '/',
  sameSite: 'lax'  // 추가됨
});
```

##### 5. Next.js 15 호환성 문제
```typescript
// 문제: cookies() 함수 사용법 변경
export async function GET() {
  const cookieStore = cookies(); // 구버전 방식

// 해결: await 키워드 추가
export async function GET() {
  const cookieStore = await cookies(); // Next.js 15 방식
```

#### 해결 과정

##### Phase 1: 근본 원인 분석
1. 코드베이스 전체 분석을 통한 구조적 문제 파악
2. OAuth 플로우의 각 단계별 로직 검증
3. 환경변수 및 설정 파일 점검

##### Phase 2: 핵심 버그 수정
1. `code` 변수 누락 문제 해결
2. `useGoogleDrive` 훅 완전 재작성
3. Next.js 15 호환성 문제 해결

##### Phase 3: 동적 시스템 구현
1. 리디렉션 URI 동적 생성 시스템 구축
2. 환경에 따른 자동 적응 로직 구현
3. 디버깅 시스템 통합

##### Phase 4: 보안 및 안정성 강화
1. 쿠키 설정 최적화 (sameSite, secure 속성)
2. CSRF 보호 강화
3. 상세한 로깅 시스템 구축

#### 최종 해결책

##### 1. 동적 리디렉션 URI 시스템
```typescript
export const getOAuth2Client = (req?: Request): OAuth2Client => {
  let redirectUri = GOOGLE_REDIRECT_URI;
  
  // 환경변수가 없으면 요청에서 동적 생성
  if (!redirectUri && req) {
    const url = new URL(req.url);
    redirectUri = `${url.protocol}//${url.host}/api/google/auth/callback`;
  }
  
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
};
```

##### 2. 포괄적 로깅 시스템
- OAuth 플로우의 모든 단계에 상세 로깅 추가
- 에러 발생 시 정확한 원인 파악 가능
- 프로덕션 환경에서의 디버깅 용이성 확보

##### 3. 개선된 사용자 경험
- 인증 상태에 따른 적절한 피드백 제공
- 디버그 정보를 접을 수 있는 형태로 제공
- Google Cloud Console 설정 가이드 제공

## 🔧 주요 설정 파일

### Google Cloud Console 설정
- OAuth 2.0 클라이언트의 승인된 리디렉션 URI에 다음 추가 필요:
  ```
  https://your-domain.vercel.app/api/google/auth/callback
  ```

### Vercel 환경변수 설정
```bash
MONGODB_URI="mongodb+srv://..."
GEMINI_API_KEY="AIzaSy..."
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
# GOOGLE_REDIRECT_URI는 동적으로 생성되므로 설정 불필요
```

## 🐛 디버깅 가이드

### 로그인 문제 발생 시 확인사항
1. 브라우저 콘솔에서 로그 확인
2. Google Cloud Console의 리디렉션 URI 설정 확인
3. Vercel 환경변수 설정 확인
4. 쿠키 상태 확인 (관리자 페이지의 디버그 패널 활용)

### 일반적인 오류와 해결책

#### "Invalid state parameter" 오류
- 원인: 쿠키 설정 문제 또는 CSRF 토큰 불일치
- 해결: 브라우저 쿠키 삭제 후 재시도

#### "redirect_uri_mismatch" 오류
- 원인: Google Cloud Console의 리디렉션 URI 설정 불일치
- 해결: 정확한 도메인으로 리디렉션 URI 업데이트

#### 로그인 후 페이지가 로딩되지 않음
- 원인: React 상태 업데이트 문제
- 해결: 페이지 새로고침 또는 세션 초기화

## 📈 성능 최적화

### 구현된 최적화
1. **토큰 관리**: httpOnly 쿠키를 통한 안전한 토큰 저장
2. **세션 유지**: 30일 만료 시간으로 장기 세션 지원
3. **동적 URI**: 배포 환경에 자동 적응
4. **에러 복구**: 자동 재시도 및 Graceful degradation

### 향후 개선 가능사항
1. **토큰 갱신**: Refresh token을 이용한 자동 토큰 갱신
2. **캐싱**: API 응답 캐싱을 통한 성능 향상
3. **최적화**: 불필요한 API 호출 최소화

## 📚 참고 자료

### 공식 문서
- [Google OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)
- [Next.js App Router 문서](https://nextjs.org/docs/app)
- [Vercel 배포 가이드](https://vercel.com/docs/deployments)

### 관련 이슈
- Next.js 15 cookies() 함수 변경사항
- React strict mode에서의 useEffect 동작
- Vercel serverless 환경에서의 쿠키 처리

---

**작성일**: 2024년 12월
**최종 수정**: Google OAuth 로그인 완전 해결 완료