# OAuth 테스트 가이드

## 로컬 테스트

1. **Google Cloud Console 설정**
   - 승인된 리디렉션 URI에 추가: `http://localhost:3000/api/google/auth/callback`

2. **환경 변수 설정**
   ```bash
   cp .env.example .env.local
   # .env.local에서 Google OAuth 정보 입력
   ```

3. **로컬 서버 실행**
   ```bash
   npm run dev
   ```

4. **테스트 경로**
   - http://localhost:3000/admin
   - "안전보건용품 관리" 탭 → Google 로그인

## 프로덕션 테스트

**현재 배포 URL**: 배포 완료 후 업데이트
- 관리자 페이지: /admin
- OAuth 엔드포인트: /api/google/auth
- OAuth 콜백: /api/google/auth/callback

## 단순화된 OAuth 플로우

1. **State 검증**: 타임스탬프 기반 (쿠키 없음)
2. **CSRF 보호**: Google OAuth 자체 보안에 의존
3. **토큰 저장**: 필수 토큰 쿠키만 사용 (sameSite: lax)

## 문제 해결

- 브라우저 개발자 도구에서 Network 탭 확인
- Vercel 함수 로그 확인: `npx vercel logs [deployment-url]`
- 쿠키 설정 확인: Application → Cookies