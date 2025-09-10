# 🤖 한국어 안전 상담 챗봇

**Gemini API 기반 한국어 안전 전문가 "안전이" 챗봇** ✅ **구현 완료 및 테스트 성공**

## ⚡ 빠른 시작

```bash
# 1. 의존성 설치
cd korean-safety-chatbot-app
npm install

# 2. 환경변수 설정
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 3. 개발서버 실행  
npm run dev

# 4. 브라우저에서 접속
# http://localhost:3000
```

## ✅ 현재 구현 상태 (2024년 9월 7일 기준)

### 🎯 완료된 핵심 기능
- **✅ Gemini 1.5 Pro API 연동** - Google Generative AI 완전 연동
- **✅ "안전이" 한국어 페르소나** - 친근한 안전 전문가 캐릭터
- **✅ 실시간 채팅 인터페이스** - React 기반 반응형 UI
- **✅ PDF 문서 업로드 및 분석** - pdf-parse 라이브러리 활용
- **✅ 모바일 반응형 디자인** - Tailwind CSS 스타일링
- **✅ 개발서버 정상 실행** - Next.js 15 프로덕션 준비

### 🛠️ 기술 스택
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4.0
- **AI**: Google Gemini 1.5 Pro API
- **PDF 처리**: pdf-parse 라이브러리
- **개발환경**: Node.js 18+, NPM

## 📖 사용법

### 1. 기본 대화
- 웹페이지 접속 후 하단 입력창에 안전 관련 질문 입력
- "안전이"가 친근한 한국어로 전문적인 답변 제공

### 2. PDF 문서 분석
1. **"Upload PDF"** 버튼 클릭
2. 안전 관련 PDF 문서 선택
3. 문서 내용에 대한 질문 입력
4. PDF 내용을 바탕으로 한 맞춤형 답변 수신

### 3. 대화 예시
```
사용자: "안전모를 꼭 써야 하나요?"
안전이: "네, 안전모 착용은 필수입니다. 😊 떨어지는 물건 등 위험으로부터 
        머리를 보호하기 위해 꼭 필요해요. 항상 안전하게 작업하시는 것이 
        가장 중요합니다."
```

## 🏗️ 프로젝트 구조

```
korean-safety-chatbot-app/
├── app/
│   ├── api/chat/route.ts      # Gemini API 엔드포인트
│   ├── layout.tsx             # 앱 레이아웃
│   └── page.tsx              # 메인 페이지
├── components/
│   ├── ChatContainer.tsx      # 채팅 컨테이너 (메인 컴포넌트)
│   ├── MessageList.tsx        # 메시지 목록 표시
│   └── MessageInput.tsx       # 메시지 입력 인터페이스
├── lib/
│   ├── gemini.ts             # Gemini API 클라이언트
│   └── prompts.ts            # "안전이" 페르소나 정의
└── .env.local                # 환경변수 (API 키)
```

## 🔧 개발 정보

### API 엔드포인트
- **POST** `/api/chat` - 채팅 메시지 처리 및 응답 생성
  - Form data: `message` (string), `pdf` (File, optional)
  - Response: `{text: string}` - Gemini 응답

### 환경변수
- `GEMINI_API_KEY` - Google Gemini API 키 (필수)

### 의존성
```json
{
  "@google/generative-ai": "^0.24.1",  // Gemini API 클라이언트
  "pdf-parse": "^1.1.1",               // PDF 문서 파싱
  "next": "15.5.2",                    // Next.js 프레임워크
  "react": "19.1.0"                    // React 라이브러리
}
```

## 📝 알려진 제한사항

- **채팅 히스토리 저장 안됨** - 새로고침 시 대화 내용 삭제
- **멀티유저 지원 안됨** - 단일 사용자 세션만 지원
- **파일 저장 기능 없음** - 업로드된 PDF는 임시 처리만
- **플로팅 챗 아이콘 없음** - 전체 화면 인터페이스만 제공

## 🚀 향후 개선 계획

1. **데이터베이스 연동** - 채팅 히스토리 영구 저장
2. **사용자 인증** - 개별 사용자 세션 관리
3. **플로팅 채팅** - 웹사이트 임베드 가능한 위젯
4. **다국어 지원** - 영어, 중국어 등 추가 언어

## ⚠️ 문제 해결

### 서버 실행 오류
```bash
# Node.js 버전 확인 (18+ 필요)
node --version

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

### API 연동 오류
1. `.env.local` 파일에 유효한 `GEMINI_API_KEY` 설정 확인
2. Google AI Studio에서 API 키 발급: https://makersuite.google.com/app/apikey
3. API 할당량 및 결제 정보 확인

## 📄 라이센스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

**✨ 현재 상태: 완전히 작동하는 한국어 안전 상담 챗봇 ✨**