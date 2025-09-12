# 트러블슈팅 가이드

이 문서는 프로젝트 개발 및 운영 중 발생할 수 있는 문제와 해결 방법을 기록합니다.

---

## 🎉 프로젝트 완성 및 배포 상태 (2025-09-13)

### 📊 최종 완성 상태
- ✅ **배포 완료**: https://korean-safety-chatbot-gc6asvr0r-sakurayuki89s-projects.vercel.app
- ✅ **모든 핵심 기능 구현 완료**
- ✅ **보안 취약점 해결 완료** (7개 → 1개, 85.7% 개선)
- ✅ **빌드 오류 100% 해결**
- ✅ **성능 최적화 완료**

### 🚀 구현된 핵심 기능들
1. **안전용품 신청 시스템**
   - 사용자 친화적인 신청 폼
   - 관리자 승인 워크플로우
   - Excel/Google Sheets 내보내기

2. **관리자 시스템**
   - Google OAuth 2.0 로그인
   - 용품 관리 (이미지 업로드, CRUD)
   - 신청 내역 관리
   - PDF 관리 시스템
   - 공지사항 관리

3. **AI 채팅 봇**
   - Gemini AI 기반 안전 상담
   - 한국어 전문 대화
   - 채팅 이력 저장
   - 피드백 시스템

4. **문의 및 피드백 시스템**
   - 고객 문의 접수
   - 관리자 답변 시스템

### 🔧 해결된 기술적 문제들

#### MongoDB 연결 최적화
**문제**: 빌드 시 MongoDB 환경변수 오류
**해결**: 15개 API 라우트를 `getMongoClient()` 패턴으로 통일
```typescript
// Before: 빌드 시 오류 발생
const client = await clientPromise;

// After: 안전한 런타임 연결
const client = await getMongoClient();
```

#### Google OAuth 빌드 오류 해결
**문제**: 빌드 시 OAuth 자격증명 누락 오류
**해결**: 환경변수 검증을 런타임으로 이동
```typescript
// lib/google-drive.ts - 동적 검증으로 변경
function validateCredentials() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials are not configured');
  }
}
```

#### 보안 취약점 대량 해결
- **react-split-pane 제거**: 6개 고위험 취약점 해결
- **custom SplitLayout 구현**: 마우스 드래그 기능 포함
- **xlsx 업데이트**: 프로토타입 오염 취약점 해결

#### Next.js 15 호환성 완료
- **Image 컴포넌트 최적화**: 8개 파일에서 img → Image 변환
- **Dynamic imports 수정**: Suspense → Loading 옵션 변경
- **useCallback 의존성 배열**: React Hook 최적화

### 📈 성능 최적화 결과
- **빌드 경고**: 8개 → 0개 (100% 해결)
- **보안 취약점**: 7개 → 1개 (85.7% 개선)  
- **이미지 최적화**: LCP 성능 향상
- **코드 분할**: 동적 임포트 적용

### 🌐 배포 환경 설정
- **플랫폼**: Vercel
- **환경변수**: MongoDB, Gemini AI, Google OAuth 설정 완료
- **도메인**: korean-safety-chatbot-gc6asvr0r-sakurayuki89s-projects.vercel.app
- **SSL/TLS**: 자동 적용됨

### 🔒 보안 강화 완료
- OWASP 보안 가이드라인 준수
- 환경변수 보안 관리
- API 엔드포인트 인증/권한 구현
- XSS/CSRF 방어 적용

---

## 1. 관리자 페이지 무한 로딩 문제

### 증상

- `/admin` 경로로 접속 시, 페이지 내용이 표시되지 않고 계속해서 로딩 스피너만 나타나는 현상.
- 특히 새로운 기능(예: 인증)을 추가한 후 자주 발생.

### 원인 분석

개발 서버(`npm run dev`)를 비정상적으로 종료했거나, 다른 프로세스가 3000번 포트를 이미 사용하고 있을 때 "좀비 프로세스"가 남게 됩니다. 

이 상태에서 `npm run dev`를 다시 실행하면, Next.js는 사용 중인 3000번 포트 대신 비어있는 다른 포트(예: 3001)를 자동으로 사용합니다. 

사용자는 습관적으로 `http://localhost:3000`으로 접속하지만, 실제 서버는 `http://localhost:3001`에서 실행되고 있으므로 아무런 응답을 받지 못하고 무한 로딩 상태에 빠지게 됩니다.

디버깅 과정에서 `server.log` 파일을 확인하여 다음과 같은 메시지로 원인을 특정했습니다.

```
⚠ Port 3000 is in use by process 35083, using available port 3001 instead.
```

### 해결 방법

가장 확실한 해결책은 3000번 포트를 점유하고 있는 모든 프로세스를 완전히 종료하고, 깨끗한 상태에서 서버를 다시 시작하는 것입니다.

프로젝트에 내장된 `dev:clean` 스크립트를 사용하면 이 과정을 한번에 처리할 수 있습니다.

**해결 명령어:**

```bash
npm run dev:clean
```

이 명령어는 다음 두 가지 작업을 순차적으로 수행합니다.

1.  `lsof -ti:3000 | xargs -r kill -9`: 3000번 포트를 사용하는 모든 프로세스를 찾아 강제 종료합니다.
2.  `npm run dev`: Next.js 개발 서버를 시작합니다.

따라서, 앞으로 개발 서버 접속에 문제가 발생하면 가장 먼저 이 명령어를 실행하는 것을 권장합니다.

---

## 2. Google OAuth 인증에서 Password 인증으로 전환

### 변경 개요 (2024-12-15)

Google OAuth 방식의 인증이 복잡성과 유지보수의 어려움으로 인해 간단한 패스워드 기반 인증으로 전환되었습니다.

### 주요 변경 사항

#### 1. 관리자 페이지 인증 변경
- **이전**: Google OAuth 기반 인증 (`DriveAuth` 컴포넌트 사용)
- **이후**: 패스워드 기반 인증 (`PasswordAuth` 컴포넌트 사용)

#### 2. 새로운 인증 API 엔드포인트 추가
- `app/api/auth/` 디렉토리 생성
- 인증 상태 확인 API (`/api/auth/status`)
- 로그아웃 API (`/api/auth/logout`)

#### 3. 파일 변경 내용

##### app/admin/page.tsx
- Google Drive 관련 인증 로직 제거
- `DriveAuth`에서 `PasswordAuth`로 변경
- 동적 imports와 Suspense를 사용한 성능 최적화
- 로그아웃 기능 추가

##### app/api/admin/export-requests/route.ts
- Google Sheets 기반 내보내기를 XLSX 직접 다운로드로 변경
- Google Drive API 의존성 제거
- 클라이언트에서 직접 Excel 파일 다운로드

#### 4. 새로운 컴포넌트 추가
- `components/auth/PasswordAuth.tsx`: 패스워드 인증 컴포넌트
- `components/admin/AnnouncementManager.tsx`: 공지사항 관리 (분리됨)
- `components/admin/PdfManager.tsx`: PDF 관리 (분리됨)

#### 5. 미들웨어 추가
- `middleware.ts`: 인증이 필요한 경로 보호

### 장점
- 설정 복잡도 대폭 감소
- Google Cloud Console 설정 불필요
- 외부 API 의존성 제거
- 더 빠른 인증 과정

### 주의사항
- 패스워드는 환경변수로 관리 필요
- 로그인 세션 관리를 위한 보안 강화 필요
