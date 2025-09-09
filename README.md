# 🤖 한국어 안전 상담 챗봇 - Korean Safety Chatbot

**✅ 구현 완료 및 정상 작동 확인됨**

Gemini 1.5 Pro API를 활용한 한국어 안전 전문가 "안전이" 챗봇입니다.

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 환경변수 설정 (.env.local)
GEMINI_API_KEY=your_gemini_api_key_here

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 챗봇과 대화할 수 있습니다.

## ✨ 구현된 주요 기능

- **✅ Gemini 1.5 Pro API 연동** - Google Generative AI 완전 통합
- **✅ 한국어 "안전이" 페르소나** - 친근하고 전문적인 안전 상담사
- **✅ 실시간 채팅 인터페이스** - React 기반 반응형 UI
- **✅ 모바일 반응형 디자인** - Tailwind CSS 스타일링

## 🛠️ 기술 스택

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **AI**: Google Gemini 1.5 Pro API
- **Styling**: Tailwind CSS 4.0
- **Development**: ESLint + PostCSS

## 📁 프로젝트 구조

```
app/
├── api/chat/route.ts      # Gemini API 엔드포인트
├── globals.css            # 전역 스타일
├── layout.tsx             # 앱 레이아웃
└── page.tsx              # 메인 챗봇 페이지

components/
├── ChatContainer.tsx      # 메인 채팅 컨테이너
├── MessageList.tsx        # 메시지 목록
└── MessageInput.tsx       # 사용자 입력

lib/
├── gemini.ts             # Gemini API 클라이언트
└── prompts.ts            # "안전이" 페르소나 정의
```

## 🎯 사용법

1. **기본 대화**: 안전 관련 질문을 입력하면 "안전이"가 전문적인 답변 제공
2. **모바일 지원**: 스마트폰, 태블릿에서도 최적화된 인터페이스 제공

## 🔧 환경 설정

### 필수 환경변수
```bash
GEMINI_API_KEY=your_actual_api_key
```

Google AI Studio에서 API 키를 발급받아 설정하세요: https://makersuite.google.com/app/apikey

### 개발 명령어
```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # 코드 린팅
```

## 📝 현재 제한사항

- 대화 히스토리가 새로고침 시 삭제됨
- 단일 사용자 세션만 지원

## 🚀 배포

Vercel을 통한 배포를 권장합니다:

```bash
npm install -g vercel
vercel
```

환경변수 `GEMINI_API_KEY`를 Vercel 대시보드에서 설정하세요.

---

**상위 프로젝트 문서**: `/README.md` 참조