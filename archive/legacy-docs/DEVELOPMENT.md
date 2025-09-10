# 🛠️ 개발 가이드

## 🎯 개발 환경 설정

### 필수 요구사항
- **Node.js**: v18+ (권장: v20 LTS)
- **NPM**: v8+ (Node.js와 함께 설치)
- **Gemini API Key**: Google AI Studio에서 발급

### 로컬 개발 환경 구축
```bash
# 1. 저장소 클론
git clone <repository-url>
cd korean-safety-chatbot/korean-safety-chatbot-app

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# GEMINI_API_KEY=your_actual_api_key 입력

# 4. 개발서버 실행
npm run dev
```

## 📁 코드베이스 구조

### 핵심 디렉토리
```
korean-safety-chatbot-app/
├── app/                    # Next.js App Router
│   ├── api/chat/route.ts   # Gemini API 엔드포인트
│   ├── globals.css         # 전역 스타일 (Tailwind)
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 메인 페이지 (챗봇 UI)
├── components/             # React 컴포넌트
│   ├── ChatContainer.tsx   # 메인 채팅 인터페이스
│   ├── MessageList.tsx     # 대화 내역 표시
│   └── MessageInput.tsx    # 사용자 입력 폼
├── lib/                    # 유틸리티 & 설정
│   ├── gemini.ts          # Google Generative AI 클라이언트
│   └── prompts.ts         # "안전이" 페르소나 정의
└── .env.local             # 환경변수 (API 키)
```

### 코드 흐름도
```
사용자 입력 → MessageInput.tsx 
    ↓
ChatContainer.tsx (상태 관리)
    ↓  
POST /api/chat → route.ts
    ↓
Gemini API 호출 (lib/gemini.ts)
    ↓
응답 → MessageList.tsx 표시
```

## 🔧 핵심 컴포넌트 분석

### 1. ChatContainer.tsx (메인 로직)
```typescript
// 주요 책임
- 채팅 상태 관리 (messages, pdfFile)
- API 호출 및 에러 처리  
- PDF 파일 업로드 관리
- UI 컴포넌트 조합

// 핵심 함수
handleSendMessage()  // 메시지 전송 및 API 호출
handleFileChange()   // PDF 파일 선택 처리
```

### 2. API Route (/api/chat/route.ts)
```typescript
// 처리 흐름
1. FormData 파싱 (message, pdf)
2. PDF 텍스트 추출 (pdf-parse)
3. Gemini 모델 초기화 + 페르소나 설정
4. 채팅 히스토리와 함께 메시지 전송
5. 응답 JSON 반환

// 에러 처리
- PDF 파싱 실패
- Gemini API 호출 실패
- 네트워크 타임아웃
```

### 3. Gemini 클라이언트 (lib/gemini.ts)
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
export default genAI;

// 사용법
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
```

## 🎨 스타일링 가이드

### Tailwind CSS 클래스 패턴
```css
/* 채팅 컨테이너 */
.flex .flex-col .h-screen .max-w-2xl .mx-auto

/* 메시지 버블 */
.bg-blue-500 .text-white .rounded-lg .p-3 .mb-2

/* 입력 필드 */
.border .rounded-md .px-3 .py-2 .flex-1

/* 버튼 스타일 */  
.bg-gray-200 .hover:bg-gray-300 .text-gray-800 .font-bold .py-2 .px-4 .rounded-md
```

### 반응형 디자인
- **모바일**: `sm:` prefix (640px+)
- **태블릿**: `md:` prefix (768px+)  
- **데스크톱**: `lg:` prefix (1024px+)

## 🧪 테스팅 전략

### 수동 테스트 체크리스트
```bash
# 1. 기본 채팅 테스트
✅ 메시지 입력 및 전송
✅ Gemini 응답 수신 확인
✅ 한국어 페르소나 동작 확인

# 2. PDF 업로드 테스트  
✅ PDF 파일 선택 기능
✅ 파일명 표시 확인
✅ PDF 내용 기반 답변 생성

# 3. 에러 처리 테스트
✅ 잘못된 API 키 처리
✅ 네트워크 오류 처리
✅ 대용량 PDF 파일 처리

# 4. UI/UX 테스트
✅ 반응형 레이아웃 (모바일/데스크톱)
✅ 스크롤 동작 확인
✅ 버튼 클릭 반응성
```

### 개발 도구
```bash
# 린트 검사
npm run lint

# 타입스크립트 검사  
npx tsc --noEmit

# 빌드 테스트
npm run build

# 프로덕션 실행
npm run start
```

## 🔐 보안 고려사항

### API 키 관리
```bash
# ✅ 올바른 방법
echo "GEMINI_API_KEY=actual_key" >> .env.local

# ❌ 절대 금지
- 하드코딩 API 키
- 클라이언트 사이드 노출
- GitHub 커밋에 포함
```

### 데이터 보안
- PDF 파일: 메모리에서만 처리, 디스크 저장 안함
- 사용자 메시지: 현재 세션에서만 보관
- API 응답: 클라이언트에서만 표시

## 🚀 배포 가이드

### Vercel 배포 (권장)
```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 프로젝트 배포
vercel

# 3. 환경변수 설정
vercel env add GEMINI_API_KEY
```

### Docker 배포
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔄 개발 워크플로우

### 새 기능 개발
1. **브랜치 생성**: `git checkout -b feature/새기능명`
2. **코드 작성**: 컴포넌트/API 개발
3. **테스트**: 수동 테스트 + 린트 검사
4. **문서 업데이트**: README.md, CHANGELOG.md 수정
5. **PR 생성**: 코드 리뷰 요청

### 버그 수정
1. **이슈 재현**: 로컬에서 버그 확인
2. **원인 분석**: 콘솔 로그, 네트워크 탭 확인
3. **수정 적용**: 최소한의 변경으로 해결
4. **회귀 테스트**: 기존 기능 영향 확인

## 🐛 디버깅 가이드

### 일반적인 문제들

#### API 연동 실패
```bash
# 증상: "Something went wrong" 에러
# 해결: 
1. .env.local 파일에 GEMINI_API_KEY 확인
2. 콘솔에서 API 오류 메시지 확인
3. Google AI Studio에서 API 할당량 확인
```

#### PDF 업로드 실패
```bash
# 증상: PDF 파일 선택 후 오류
# 해결:
1. 파일 크기 확인 (10MB 이하 권장)
2. PDF 형식 확인 (application/pdf)
3. 서버 로그에서 pdf-parse 오류 확인
```

#### 빌드 실패
```bash
# 증상: npm run build 실패
# 해결:
1. TypeScript 오류: npx tsc --noEmit 실행
2. 의존성 문제: npm install 재실행
3. Next.js 설정: next.config.ts 확인
```

### 유용한 디버깅 도구
```javascript
// 1. 콘솔 로그 (개발용)
console.log('Debug info:', { message, response });

// 2. React DevTools (브라우저 확장)
// 3. Network 탭 (API 호출 모니터링)
// 4. VS Code 디버거 (breakpoint 설정)
```

## 📈 성능 최적화

### 현재 성능 지표
- **First Load**: ~1.2초
- **API Response**: 2-5초 (Gemini 의존)
- **Bundle Size**: ~2.1MB
- **Memory Usage**: ~50MB

### 최적화 기회
1. **이미지 최적화**: next/image 컴포넌트 활용
2. **코드 분할**: dynamic import 적용
3. **캐싱**: SWR/TanStack Query 도입
4. **번들 분석**: @next/bundle-analyzer 사용

## 🤝 기여 가이드

### 코딩 스타일
- **TypeScript**: 엄격 모드 사용
- **Prettier**: 자동 포매팅 설정
- **ESLint**: 코드 품질 검사
- **Conventional Commits**: 커밋 메시지 규칙

### PR 체크리스트
- [ ] 코드 린트 통과
- [ ] TypeScript 타입 오류 없음
- [ ] 수동 테스트 완료
- [ ] 문서 업데이트 완료
- [ ] 브레이킹 체인지 명시

---

**💡 궁금한 점이나 개선 제안은 Issues 탭에서 자유롭게 제기해 주세요!**