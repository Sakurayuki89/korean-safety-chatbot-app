# 🎯 현재 작업 상황 (macOS 이전 후)

## 📋 프로젝트 개요
- **목표**: 한국어 자연스러운 안전관리 챗봇
- **기술**: Next.js + Gemini Pro + 스마트 프롬프트
- **특징**: 친근한 페르소나, PDF 학습, 초보자 친화
- **환경**: macOS + CURSOR IDE + Claude Code

## 🤖 AI 역할 분담 완료
- ✅ **Claude Code**: 계획/분석/검토
- ✅ **Gemini CLI**: 실제 코딩/실행  
- ✅ **웹 AI**: 서포트/검색

## 📝 Gemini CLI 작업 지시 (macOS 환경)

### 🚀 1단계: Next.js 프로젝트 생성
```json
{
  "task": "nextjs_korean_chatbot_setup",
  "location": "~/Desktop/korean-safety-chatbot/",
  "actions": [
    "npx create-next-app@latest korean-safety-chatbot-app --typescript --tailwind --eslint --app",
    "cd korean-safety-chatbot-app", 
    "npm install @google/generative-ai",
    "mkdir -p components lib data",
    "rm -f public/next.svg public/vercel.svg app/page.module.css"
  ],
  "expected_output": "한국어 챗봇용 Next.js 프로젝트 생성 완료"
}
```

### 🧠 2단계: 핵심 컴포넌트 구현
```json
{
  "task": "core_components",
  "files_to_create": [
    "components/ChatContainer.js - 채팅 메인 컨테이너",
    "components/MessageList.js - 메시지 목록 표시",
    "components/MessageInput.js - 사용자 입력창",
    "lib/gemini.js - Gemini Pro API 연동",
    "lib/prompts.js - 한국어 페르소나 프롬프트"
  ],
  "requirements": "자연스러운 한국어 채팅 UI + AI 연동"
}
```

### 🇰🇷 3단계: 한국어 페르소나 적용
```json
{
  "task": "korean_persona",
  "focus": "KOREAN_CHATBOT_DESIGN.md 참조",
  "requirements": [
    "친근한 '안전이' 캐릭터",
    "존댓말 + 자연스러운 한국어 표현",
    "상황별 응답 템플릿",
    "이모지 적절 사용"
  ],
  "test": "안녕하세요 → 안녕하세요! 안전이예요 😊"
}
```

## 🔄 작업 플로우

### Claude Code → Gemini CLI
1. **계획서 전달** (`CURRENT_TASK.md`)
2. **구체적 지시** (JSON 형태)  
3. **필요 파일 목록** 명시

### Gemini CLI → Claude Code  
1. **작업 결과** (`RESULT.md`)
2. **에러 발생시** (`ERROR_LOG.md`)
3. **다음 단계 요청**

## 📊 현재 상태
- **진행률**: 100% (PDF 학습 기능 구현 완료)
- **다음 목표**: 완료
- **예상 소요**: 완료

## 🔗 필요한 정보
- Supabase 프로젝트 URL (생성 후)
- Supabase API Key (생성 후)  
- Gemini API Key (기존)

## 📁 첨부 파일 우선순위
1. **CURRENT_TASK.md** (지금 이 파일)
2. **AI_WORKFLOW.md** (역할 분담)
3. **PROJECT_CLEAN.md** (정리 가이드)

---
**⏰ 업데이트**: 2025-01-XX
**👤 담당**: Claude Code (계획) + Gemini CLI (실행)