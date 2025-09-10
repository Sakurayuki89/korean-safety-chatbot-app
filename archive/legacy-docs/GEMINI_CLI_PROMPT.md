# 🚀 GEMINI CLI 실행 명령서

## 📋 프로젝트 인수 확인사항

**현재 위치**: `/Users/parksonghoon/Code/korean-safety-chatbot/korean-safety-chatbot-app`

**기존 완성 기능 (25%) - 절대 건드리지 말 것**:
- ✅ 채팅 시스템 (`components/ChatContainer.tsx`, `MessageList.tsx`, `MessageInput.tsx`) 
- ✅ Gemini AI 연동 (`app/api/chat/route.ts`, `lib/gemini.ts`)
- ✅ MongoDB 연동 (`lib/mongodb.ts`, `app/api/history/route.ts`) 
- ✅ 스크롤 기능 (완벽 작동 중)
- ✅ 환경변수 설정 (`.env.local`)

**새로 구현할 기능 (75%)**:
- 🎯 Google Drive 연동 (OAuth + 파일 관리)
- 🎯 PDF 뷰어 시스템
- 🎯 컨텍스트 기반 채팅 연동
- 🎯 하이브리드 UI 레이아웃

---

## 🏃‍♂️ 즉시 실행 명령

### Phase 1: 환경 준비 (30분)

```bash
# 1. 필요한 패키지 설치
npm install googleapis@134.0.0 react-pdf@7.7.0 pdfjs-dist@4.0.0 react-dropzone@14.2.3 react-split-pane@2.0.3 js-cookie@3.0.5

npm install --save-dev @types/js-cookie@3.0.6

# 2. PDF.js 워커 설정을 위한 public 폴더 준비  
mkdir -p public/pdf-worker
curl -o public/pdf-worker/pdf.worker.min.js https://unpkg.com/pdfjs-dist@4.0.0/build/pdf.worker.min.js

# 3. Google Cloud Console 설정 안내 출력
echo "🔧 Google Cloud Console에서 다음 작업 필요:"
echo "1. 프로젝트 생성"
echo "2. Drive API 활성화" 
echo "3. OAuth 2.0 클라이언트 ID 생성"
echo "4. 승인된 리디렉션 URI: http://localhost:3000/api/google/auth/callback"
```

### Phase 2: 폴더 구조 생성 (15분)

```bash
# 새로운 폴더 구조 생성
mkdir -p components/drive components/pdf components/layout hooks types

# 필요한 타입 파일들 생성
touch types/google-drive.ts types/pdf.ts
touch hooks/useGoogleDrive.ts hooks/usePDFViewer.ts hooks/useContextChat.ts
```

---

## 🎯 구체적 구현 지시사항

### STEP 1: Google Drive API 연동 (2일)

#### 1-1. 환경변수 추가 (`.env.local`에 추가)
```env
# 기존 변수들 유지하고 추가
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/auth/callback
```

#### 1-2. Google Drive 유틸리티 생성 (`lib/google-drive.ts`)
```typescript
// ARCHITECTURE_DESIGN.md의 "Google Drive API" 섹션 참고하여 구현
// OAuth 토큰 관리, 파일 CRUD 작업 포함
// 에러 처리 및 재시도 로직 필수
```

#### 1-3. API 라우트 생성
- `app/api/google/auth/route.ts` - OAuth 인증
- `app/api/google/files/route.ts` - 파일 목록  
- `app/api/google/files/upload/route.ts` - 파일 업로드
- `app/api/google/files/[fileId]/download/route.ts` - 파일 다운로드

### STEP 2: PDF 뷰어 시스템 (2일)

#### 2-1. PDF 뷰어 컴포넌트 생성
```typescript
// components/pdf/PDFViewer.tsx
// react-pdf 사용, 텍스트 선택 기능 포함
// 페이지 네비게이션, 줌 기능
// 모바일 터치 지원 필수
```

#### 2-2. PDF 상태 관리
```typescript  
// hooks/usePDFViewer.ts
// 현재 페이지, 줌 레벨, 선택된 텍스트 관리
// 성능 최적화 (가상화 고려)
```

### STEP 3: 하이브리드 레이아웃 구성 (1일)

#### 3-1. 분할 레이아웃 구현
```typescript
// components/layout/SplitLayout.tsx  
// react-split-pane 사용
// 데스크톱: 좌측 PDF, 우측 채팅
// 모바일: 탭 형태 전환
```

#### 3-2. 메인 페이지 수정
```typescript
// app/page.tsx 완전 재구성
// Drive 인증 → 파일 선택 → PDF + 채팅 화면
```

### STEP 4: 컨텍스트 채팅 연동 (1일)

#### 4-1. 채팅 API 확장
```typescript
// app/api/chat/route.ts 수정
// 기존 기능 유지하면서 contextInfo 추가 처리
// 프롬프트에 문서 정보 포함
```

#### 4-2. 컨텍스트 관리 시스템
```typescript
// lib/context-manager.ts
// 현재 문서, 페이지, 선택 텍스트 관리
// Gemini에게 전달할 컨텍스트 생성
```

---

## 🔍 필수 검증 체크리스트

### 기능 검증
- [ ] Google Drive 로그인 → 파일 목록 정상 출력
- [ ] PDF 선택 → 뷰어에서 정상 렌더링  
- [ ] 페이지 변경 → 채팅에서 현재 페이지 인식
- [ ] 텍스트 선택 → 선택 내용이 채팅 컨텍스트에 포함
- [ ] 채팅 기능 → 기존 기능 그대로 작동
- [ ] 모바일 반응형 → 좁은 화면에서 탭 형태 전환

### 성능 검증
- [ ] 10MB PDF 로딩 → 3초 이내
- [ ] 100개 파일 목록 → 스무스 스크롤
- [ ] 채팅 응답 → 기존과 동일한 속도
- [ ] 메모리 사용량 → 500MB 이하 유지

### 에러 처리 검증
- [ ] 네트워크 오류 → 적절한 에러 메시지
- [ ] 큰 PDF 파일 → 로딩 인디케이터
- [ ] Google 토큰 만료 → 재인증 유도
- [ ] 손상된 PDF → 에러 메시지 표시

---

## ⚠️ 중요 주의사항

### DO NOT TOUCH (절대 건드리지 말 것)
- 기존 채팅 시스템의 핵심 로직
- MongoDB 스키마 및 연결 설정
- Gemini AI 설정 및 프롬프트
- 환경변수 중 기존 항목들
- 패키지.json의 기존 스크립트들

### MUST PRESERVE (반드시 보존할 것)  
- 실시간 스트리밍 채팅 기능
- 자동 스크롤 기능 (완벽 작동 중)
- MongoDB 대화 기록 저장
- 좀비 프로세스 방지 스크립트
- 기존 UI 스타일링

### CAREFUL WITH (주의해서 수정)
- `components/ChatContainer.tsx` - 컨텍스트 추가만
- `app/api/chat/route.ts` - 기존 로직 유지하면서 확장만
- `app/page.tsx` - 레이아웃만 변경, 기능 유지

---

## 🐛 예상 문제 및 해결책

### Google Drive API 이슈
```bash
# 문제: OAuth 인증 실패
# 해결: 리디렉션 URI 정확히 설정 확인

# 문제: CORS 에러
# 해결: Next.js API 라우트 사용 (클라이언트 직접 호출 금지)

# 문제: 파일 다운로드 권한 오류  
# 해결: 적절한 스코프 설정 (drive.readonly)
```

### PDF 렌더링 이슈
```bash
# 문제: PDF.js 워커 로드 실패
# 해결: public/pdf-worker/ 경로 확인

# 문제: 큰 PDF 렌더링 느림
# 해결: 페이지 가상화 또는 레이지 로딩 적용

# 문제: 모바일에서 줌/스크롤 문제
# 해결: touch-action CSS 속성 설정
```

### 메모리 이슈
```bash
# 문제: 메모리 사용량 급증
# 해결: PDF 페이지 캐시 크기 제한

# 문제: 파일 목록 많을 때 느림
# 해결: react-window 가상화 적용
```

---

## 📱 모바일 최적화 가이드

### 반응형 브레이크포인트
```css
/* 768px 이하: 모바일 */
/* 768px~1024px: 태블릿 */  
/* 1024px 이상: 데스크톱 */
```

### 모바일 UX 요구사항
- PDF와 채팅 간 탭 전환 (하단 탭바)
- 터치 스크롤 및 핀치 줌 지원
- 텍스트 선택 시 적절한 피드백
- 가상 키보드 대응

---

## 🚀 성공 기준

### 2-3주 후 달성 목표
1. **완전한 하이브리드 시스템**: PDF + 채팅 자연스러운 연동
2. **Google Drive 완전 통합**: 인증, 업로드, 파일 관리 완성
3. **모바일 완벽 지원**: 데스크톱과 동일한 UX
4. **성능 최적화**: 빠른 로딩, 부드러운 인터랙션
5. **에러 처리 완성**: 모든 예외 상황 대응

### 최종 검수 항목
- [ ] 기존 채팅 기능 100% 보존
- [ ] 새로운 PDF 기능 완전 작동  
- [ ] 컨텍스트 기반 답변 정확성
- [ ] 모든 디바이스에서 원활한 작동
- [ ] 에러 상황 적절한 처리

---

## 💬 Claude Code와의 협업 가이드

### 코드 리뷰 요청 시
- 기존 기능 영향도 명시
- 성능 테스트 결과 포함
- 모바일 테스트 결과 포함
- 에러 케이스 처리 상태 보고

### 진행 상황 보고 포맷
```
✅ 완료: [기능명] - [소요시간] - [테스트 결과]  
🔄 진행중: [기능명] - [진행률] - [예상 완료일]
⚠️ 이슈: [문제상황] - [해결 방안] - [도움 필요 여부]
```

### 최종 인계 시 제출 자료
- 완성된 코드베이스
- 테스트 결과 스크린샷
- 성능 측정 결과
- 알려진 이슈 목록
- 배포 가이드

---

**🎯 목표: Claude Code가 설계한 하이브리드 PDF 챗봇 시스템을 2-3주 내에 완벽하게 구현하여 실제 서비스 가능한 수준으로 완성**

**지금 바로 Phase 1부터 시작하세요!** ⚡

*이 문서는 Claude Code가 Gemini CLI를 위해 작성한 실행 명령서입니다.*