# 🤖 Gemini CLI 실행 가능 프롬프트 템플릿
> **즉시 사용 가능한 단계별 구현 가이드**

## 🎯 사용법
각 섹션의 프롬프트를 Gemini CLI에 복사하여 단계별로 실행하세요.

---

## 🚀 STEP 1: Next.js 프로젝트 초기 세팅

### 프롬프트 1-1: 프로젝트 생성 및 기본 설정
```
Create a Next.js 15 project for a Korean safety chatbot with the following requirements:

1. Project name: korean-safety-chatbot
2. Use TypeScript and Tailwind CSS
3. Install additional dependencies: @google/generative-ai, react-markdown, pdf-parse, lucide-react
4. Configure tailwind.config.js for mobile-first responsive design
5. Create basic project structure:
   - components/
   - hooks/
   - lib/
   - types/
   - app/ (App Router)

Create the complete package.json and next.config.js files.
```

### 프롬프트 1-2: TypeScript 설정 및 타입 정의
```
Create TypeScript configuration and type definitions for Korean safety chatbot:

1. Create types/index.ts with interfaces for:
   - ChatMessage (id, content, sender, timestamp, category)
   - ChatSession (id, messages, userId, createdAt)
   - SafetyCategory ('안전공지' | '안전규정' | '사내공지' | '노조소식')
   - GeminiResponse (content, confidence, sources)

2. Update tsconfig.json for strict mode and path aliases
3. Add proper typing for Gemini API responses

Make sure all types follow Korean safety chatbot domain requirements.
```

---

## 💬 STEP 2: 핵심 챗봇 컴포넌트 구현

### 프롬프트 2-1: 플로팅 챗봇 버튼
```
Create a floating chat button component with the following specifications:

File: components/FloatingChatButton.tsx

Requirements:
1. Fixed position bottom-right corner (mobile optimized)
2. Blue gradient background with hover effects
3. Chat bubble icon using Lucide React
4. Accessibility features (aria-label, keyboard navigation)
5. Animation on hover and click
6. TypeScript with proper prop types
7. Tailwind CSS for styling (mobile-first)

The button should be visually appealing and follow modern UI design patterns.
```

### 프롬프트 2-2: 채팅 인터페이스 컴포넌트
```
Create a chat interface component for Korean safety chatbot:

File: components/ChatInterface.tsx

Requirements:
1. Full-screen modal overlay for mobile
2. Chat message list with proper scrolling
3. Message input field with send button
4. Category selector for '안전공지', '안전규정', '사내공지', '노조소식'
5. Loading indicator for AI responses
6. Message bubbles styled differently for user vs bot
7. TypeScript with ChatMessage and SafetyCategory types
8. Mobile-optimized responsive design
9. Korean placeholder text and labels
10. Proper state management with useState/useEffect

Include proper error handling and loading states.
```

### 프롬프트 2-3: 카테고리 선택 컴포넌트
```
Create a category selector component:

File: components/CategorySelector.tsx

Requirements:
1. 4 category buttons: '안전공지', '안전규정', '사내공지', '노조소식'
2. Visual distinction for active/selected category
3. Icon for each category (using Lucide React)
4. Horizontal scroll on mobile if needed
5. Proper TypeScript interfaces
6. Callback function for category selection
7. Tailwind CSS with Korean typography support
8. Accessibility compliance (ARIA labels)

The design should be intuitive and mobile-friendly.
```

---

## 🧠 STEP 3: Gemini AI 연동 및 커스텀 훅

### 프롬프트 3-1: Gemini API 클라이언트
```
Create Gemini AI client for Korean safety chatbot:

File: lib/gemini-client.ts

Requirements:
1. Initialize Google Generative AI with API key from environment
2. Create chat completion function with Korean safety context
3. Implement safety persona prompt:
   - Name: "안전이" (Safety bot)
   - Tone: Friendly but professional Korean
   - Expertise: Industrial safety, regulations, company policies
   - Response format: Clear, actionable Korean text
4. Add function to process messages by category
5. Error handling for API failures
6. Type safety with custom interfaces
7. Rate limiting consideration

Include proper environment variable configuration for API key.
```

### 프롬프트 3-2: 채팅 상태 관리 훅
```
Create a custom hook for chat state management:

File: hooks/useChat.ts

Requirements:
1. State management for messages, loading, category
2. Function to send messages to Gemini API
3. Message history management (local storage)
4. Category-specific conversation context
5. Error handling and retry logic
6. TypeScript with proper return types
7. Cleanup function for unmounting
8. Korean text processing utilities

The hook should handle all chat-related state and API calls efficiently.
```

### 프롬프트 3-3: PDF 문서 처리 훅
```
Create a hook for PDF document processing:

File: hooks/useDocumentProcessor.ts

Requirements:
1. File upload handling for PDF documents
2. Text extraction from PDFs using pdf-parse
3. Document indexing for categories
4. Search functionality within uploaded documents
5. Integration with Gemini for document-based Q&A
6. Progress tracking for large file processing
7. Error handling for corrupted/unsupported files
8. Korean text encoding support
9. Local storage for processed documents cache

Include proper TypeScript interfaces for document metadata.
```

---

## 🎨 STEP 4: 메인 앱 페이지 구현

### 프롬프트 4-1: 루트 레이아웃
```
Create the root layout for Korean safety chatbot:

File: app/layout.tsx

Requirements:
1. Next.js 15 App Router layout
2. Korean language meta tags and SEO
3. Responsive viewport settings
4. Tailwind CSS imports
5. Korean web fonts (Noto Sans KR)
6. Proper HTML structure with accessibility
7. Theme configuration for dark/light mode
8. Mobile-optimized meta tags

Include proper TypeScript types for children props.
```

### 프롬프트 4-2: 메인 페이지
```
Create the main page component:

File: app/page.tsx

Requirements:
1. Landing page with hero section about safety chatbot
2. Key features showcase (Korean text)
3. FloatingChatButton integration
4. ChatInterface modal state management
5. Responsive design for mobile/desktop
6. Korean typography and content
7. Call-to-action sections
8. Company branding area
9. Footer with safety guidelines links

The page should be professional and safety-focused.
```

### 프롬프트 4-3: API 라우트
```
Create API routes for the chatbot:

File: app/api/chat/route.ts

Requirements:
1. POST endpoint for chat messages
2. Integration with Gemini client
3. Request/response validation
4. Error handling with proper HTTP codes
5. Rate limiting middleware
6. CORS configuration
7. Request logging for debugging
8. TypeScript with Next.js 15 Route Handlers
9. Korean text processing
10. Category-based response routing

Include proper environment variable validation.
```

---

## 🔧 STEP 5: 환경설정 및 배포 준비

### 프롬프트 5-1: 환경 변수 설정
```
Create environment configuration files:

1. Create .env.example with all required variables:
   - GOOGLE_AI_API_KEY
   - NEXT_PUBLIC_APP_URL
   - Any other required keys

2. Create .env.local template with instructions
3. Update next.config.js for environment variables
4. Add proper validation in lib/env.ts
5. Create error handling for missing env vars

Include Korean comments for developers.
```

### 프롬프트 5-2: 배포 설정
```
Create deployment configuration:

1. Create vercel.json for Vercel deployment
2. Update package.json build scripts
3. Create Docker configuration (optional)
4. Add deployment documentation in Korean
5. Create health check endpoint
6. Configure proper redirects and headers
7. Set up error pages (404, 500)

Include step-by-step deployment guide.
```

### 프롬프트 5-3: 테스팅 설정
```
Set up testing configuration:

1. Install and configure Jest + Testing Library
2. Create test files for key components:
   - FloatingChatButton.test.tsx
   - ChatInterface.test.tsx
   - useChat.test.ts
3. Add API route tests
4. Create mock for Gemini API
5. Add Korean text testing utilities
6. Configure test scripts in package.json

Include testing best practices documentation.
```

---

## 📱 STEP 6: 모바일 최적화 및 PWA

### 프롬프트 6-1: PWA 설정
```
Convert the app to Progressive Web App:

1. Create manifest.json for Korean safety chatbot
2. Add service worker for offline functionality
3. Create app icons in multiple sizes
4. Add PWA meta tags to layout
5. Implement offline message handling
6. Add install prompt functionality
7. Configure caching strategies

Include Korean PWA descriptions and prompts.
```

### 프롬프트 6-2: 성능 최적화
```
Implement performance optimizations:

1. Add React.lazy for code splitting
2. Implement proper image optimization
3. Add loading skeletons for components
4. Optimize bundle size analysis
5. Add performance monitoring
6. Implement proper error boundaries
7. Add Korean font optimization

Include performance testing guidelines.
```

---

## 🚀 실행 순서 가이드

1. **초기 설정** (프롬프트 1-1, 1-2) → 프로젝트 기반 구축
2. **UI 컴포넌트** (프롬프트 2-1, 2-2, 2-3) → 시각적 인터페이스
3. **AI 연동** (프롬프트 3-1, 3-2, 3-3) → 핵심 기능 구현
4. **앱 구성** (프롬프트 4-1, 4-2, 4-3) → 전체 앱 연결
5. **배포 준비** (프롬프트 5-1, 5-2, 5-3) → 운영 환경 설정
6. **최적화** (프롬프트 6-1, 6-2) → 완성도 높이기

## 💡 사용 팁

- 각 프롬프트 실행 후 결과를 확인하고 다음 단계 진행
- 에러 발생 시 구체적 에러 메시지와 함께 Gemini에 문의
- 단계별로 테스트하여 누적 오류 방지
- 한국어 텍스트는 실제 사용할 내용으로 맞춤 수정