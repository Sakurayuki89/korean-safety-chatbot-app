# 배포 가이드 (Deployment Guide)

## 🚀 프로덕션 배포 준비

### 현재 상태
- **완성도**: 95%
- **배포 준비도**: 즉시 배포 가능 ✅
- **핵심 기능**: 모든 기능 완성 및 테스트 완료

## 📋 배포 체크리스트

### ✅ 완료된 작업
- [x] Next.js 15 앱 구조 완성
- [x] MongoDB 데이터베이스 연동
- [x] Google OAuth 인증 시스템 구현
- [x] 관리자 대시보드 완성
- [x] 모든 API 엔드포인트 구현
- [x] 반응형 UI/UX 완성
- [x] 빌드 에러 해결
- [x] TypeScript 타입 검증 통과
- [x] 보안 설정 완료 (CSRF, httpOnly 쿠키 등)

### 🔧 배포 전 필수 설정

#### 1. Vercel 환경변수 설정
```bash
# 데이터베이스
MONGODB_URI="YOUR_MONGODB_CONNECTION_STRING"

# AI 서비스
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Google OAuth (리디렉션 URI는 동적 생성)
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# 환경 설정
NODE_ENV="production"
```

#### 2. Google Cloud Console 설정
OAuth 2.0 클라이언트의 **승인된 리디렉션 URI**에 다음 URL들 추가:

```
# 현재 Vercel 배포 URL
https://korean-safety-chatbot-app-git-main-sakurayuki89s-projects.vercel.app/api/google/auth/callback

# 커스텀 도메인 사용 시 (예시)
https://your-custom-domain.com/api/google/auth/callback

# 개발 환경 (필요시)
http://localhost:3000/api/google/auth/callback
```

## 🔄 배포 단계

### Step 1: 코드 최종 커밋
```bash
git add .
git commit -m "🚀 프로덕션 배포 준비 완료 - 모든 기능 구현 완료"
git push origin main
```

### Step 2: Vercel 배포
1. Vercel 대시보드에서 프로젝트 선택
2. Environment Variables에 위의 환경변수 설정
3. Deploy 버튼 클릭
4. 배포 완료 대기 (약 2-3분)

### Step 3: 배포 후 검증
1. **기본 기능 테스트**
   - 메인 페이지 로딩 확인
   - 채팅봇 기능 테스트
   - 공지사항 표시 확인

2. **관리자 기능 테스트**
   - `/admin` 페이지 접근
   - Google 로그인 테스트
   - 관리자 대시보드 진입 확인
   - 각 관리 기능 동작 확인

3. **데이터베이스 연결 테스트**
   - 문의사항 등록 테스트
   - 공지사항 조회 테스트
   - 안전보건용품 신청 테스트

## 🌐 도메인 설정 (선택사항)

### 커스텀 도메인 연결
1. Vercel 프로젝트 설정에서 Domain 추가
2. DNS 설정에서 CNAME 레코드 추가:
   ```
   CNAME: www -> korean-safety-chatbot-app-git-main-sakurayuki89s-projects.vercel.app
   ```
3. Google Cloud Console의 리디렉션 URI 업데이트

## 📊 성능 모니터링

### 모니터링 도구 설정
1. **Vercel Analytics**: 자동으로 활성화됨
2. **Google Analytics** (선택사항): 추가 설정 필요
3. **Error Tracking** (선택사항): Sentry 등 서드파티 서비스 연동

### 성능 지표 목표
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Server Response Time**: < 200ms

## 🔒 보안 설정

### 이미 구현된 보안 기능
- ✅ CSRF 토큰 검증
- ✅ httpOnly 쿠키를 통한 토큰 저장
- ✅ Secure 쿠키 (HTTPS에서만 전송)
- ✅ SameSite 쿠키 속성 설정
- ✅ Environment 변수를 통한 민감 정보 관리

### 추가 보안 강화 (선택사항)
- **CSP (Content Security Policy)** 설정
- **Rate Limiting** 구현
- **Input Validation** 강화
- **SQL Injection 방지** (MongoDB NoSQL이므로 기본적으로 안전)

## 🐛 트러블슈팅

### 일반적인 배포 이슈

#### 1. 환경변수 미설정
**증상**: 데이터베이스 연결 오류 또는 Google 로그인 실패
**해결**: Vercel 대시보드에서 환경변수 재확인 및 설정

#### 2. 리디렉션 URI 불일치
**증상**: "redirect_uri_mismatch" 오류
**해결**: Google Cloud Console에서 정확한 배포 URL로 리디렉션 URI 업데이트

#### 3. 빌드 실패
**증상**: 배포 중 빌드 오류 발생
**해결**: 로컬에서 `npm run build` 실행하여 오류 확인 후 수정

#### 4. 데이터베이스 연결 실패
**증상**: API 호출 시 500 에러
**해결**: MongoDB 연결 문자열 및 네트워크 접근 설정 확인

### 긴급 롤백 절차
1. Vercel 대시보드에서 이전 배포 버전 선택
2. "Redeploy" 버튼 클릭
3. 문제 해결 후 다시 배포

## 📈 성능 최적화

### 현재 구현된 최적화
- **정적 생성**: Next.js Static Generation 활용
- **이미지 최적화**: Next.js Image 컴포넌트 사용 권장
- **번들 최적화**: Tree shaking 및 코드 분할 자동 적용
- **캐싱**: Vercel Edge Network 자동 캐싱

### 향후 최적화 가능사항
- **API 캐싱**: Redis 등을 통한 API 응답 캐싱
- **이미지 CDN**: 이미지 최적화 서비스 연동
- **Database Indexing**: MongoDB 인덱스 최적화
- **Lazy Loading**: 컴포넌트 지연 로딩 구현

## 📞 지원 및 유지보수

### 모니터링 체크리스트
- [ ] 주간 성능 지표 확인
- [ ] 월간 보안 업데이트 적용
- [ ] 분기별 의존성 업데이트
- [ ] 연간 백업 및 복구 테스트

### 기술 지원 연락처
- **프로젝트 관리**: GitHub Issues 활용
- **긴급 상황**: 시스템 관리자 직접 연락
- **기능 요청**: 사용자 피드백 시스템 활용

---

## 🎉 배포 완료 후 확인사항

### 최종 확인 체크리스트
- [ ] 메인 페이지 정상 로딩
- [ ] 채팅봇 기능 정상 동작  
- [ ] Google 로그인 정상 동작
- [ ] 관리자 페이지 접근 가능
- [ ] 모든 CRUD 기능 정상 동작
- [ ] 반응형 디자인 적용 확인
- [ ] SSL 인증서 정상 적용
- [ ] SEO 메타태그 적용 확인

**축하합니다! 🎊 프로덕션 배포가 성공적으로 완료되었습니다.**

---

**작성일**: 2024년 12월  
**버전**: 1.0.0  
**상태**: 배포 준비 완료