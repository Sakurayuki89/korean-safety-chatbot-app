# 🔧 설정 파일 백업 및 복원 가이드

## 📋 백업된 설정 파일 목록

### 핵심 설정 파일
- ✅ `next.config.ts` - Next.js 설정
- ✅ `package.json` - 의존성 및 스크립트
- ✅ `tailwind.config.ts` - Tailwind CSS 설정
- ✅ `tsconfig.json` - TypeScript 설정
- ✅ `middleware.ts` - Next.js 미들웨어 설정

### 환경변수 설정
- ✅ `.env.template` - 환경변수 구조 템플릿
- 🔒 `.env.local` - 실제 환경변수 (별도 보안 저장)

### 개발 도구 설정
- ✅ `scripts/dev-server-reset.sh` - 개발 서버 재설정 스크립트
- ✅ `DEPLOYMENT_BACKUP_CHECKLIST.md` - 배포 체크리스트

## 🛡️ 보안 고려사항

### 백업하지 않은 파일들 (보안상 중요)
```bash
.env.local          # 실제 API 키 및 시크릿
.next/              # 빌드 캐시
node_modules/       # 의존성 (package.json으로 복원 가능)
.git/               # Git 히스토리는 원격 저장소에 있음
```

### 환경변수 복원 시 주의사항
1. **MONGODB_URI**: MongoDB Atlas 연결 문자열
2. **GEMINI_API_KEY**: Google AI Studio에서 새로 발급 필요 시
3. **GOOGLE_CLIENT_***: Google Cloud Console에서 확인
4. **ADMIN_PASSWORD**: 강력한 패스워드로 설정

## 🚀 복원 절차

### 1. 프로젝트 클론 및 설정
```bash
git clone https://github.com/Sakurayuki89/korean-safety-chatbot-app.git
cd korean-safety-chatbot-app
npm install
```

### 2. 환경변수 설정
```bash
cp .env.template .env.local
# .env.local 파일을 편집하여 실제 값 입력
```

### 3. 설정 검증
```bash
npm run build        # 빌드 테스트
npm run dev         # 개발 서버 실행 테스트
```

### 4. 문제 해결 도구 실행 (필요시)
```bash
chmod +x scripts/dev-server-reset.sh
npm run dev:reset   # 개발 환경 완전 재설정
```

## 📊 설정 파일 상세 정보

### next.config.ts 주요 설정
- 이미지 최적화 설정 (Google Drive 도메인 포함)
- 보안 헤더 설정
- 성능 최적화 설정
- 개발 서버 안정성 개선 설정

### middleware.ts 주요 기능
- 관리자 페이지 인증 보호
- Google OAuth 토큰 검증
- 정적 파일 처리 최적화
- API 라우트 보안 설정

### package.json 스크립트
- `dev:clean`: 캐시 정리 후 개발 서버 시작
- `dev:reset`: 완전 환경 재설정
- `dev:force`: 강제 캐시 삭제 후 시작
- `pre-deploy`: 배포 전 검증

## 🔄 업데이트 히스토리

### 2025-09-14 백업
- 이미지 모달 문제 해결 완료
- Next.js 설정 최적화
- 개발 도구 자동화 구축
- 종합 문서화 완료

---

**백업 생성 시각**: 2025-09-14 08:30
**Git 커밋**: 9e25688
**프로덕션 빌드**: ✅ 성공
**백업 완성도**: 🟢 완전 백업