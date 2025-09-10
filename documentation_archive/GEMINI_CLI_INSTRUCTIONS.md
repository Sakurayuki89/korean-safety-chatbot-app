# 🤖 Gemini CLI 코딩 지시사항

**Korean Safety Chatbot 프로젝트 - 실제 코딩 작업 지시**

---

## 🎯 현재 작업 목표

**우측 하단 플로팅 챗봇 아이콘 + 카테고리 선택 UI 구현**

---

## 📋 작업 순서

### 🚀 STEP 1: 플로팅 챗봇 버튼 구현

**파일명**: `components/FloatingChatButton.tsx`

**작업 내용**:
```typescript
"use client";

import React, { useState } from 'react';

interface FloatingChatButtonProps {
  onClick: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      aria-label="안전 챗봇 열기"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>
  );
};

export default FloatingChatButton;
```

---

### 🎨 STEP 2: 카테고리 선택 컴포넌트

**파일명**: `components/CategorySelector.tsx`

**작업 내용**:
```typescript
"use client";

import React from 'react';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface CategorySelectorProps {
  onSelectCategory: (category: Category) => void;
  onClose: () => void;
}

const CATEGORIES: Category[] = [
  {
    id: 'safety-notice',
    name: '안전공지',
    icon: '🚨',
    color: 'bg-red-500',
    description: '긴급 안전사항, 사고 예방 정보'
  },
  {
    id: 'safety-rules',
    name: '안전규정',
    icon: '📋',
    color: 'bg-blue-500',
    description: '작업장 안전수칙, 법규 정보'
  },
  {
    id: 'company-notice',
    name: '사내공지',
    icon: '📢',
    color: 'bg-green-500',
    description: '회사 알림, 정책 변경사항'
  },
  {
    id: 'union-news',
    name: '노조소식',
    icon: '🤝',
    color: 'bg-purple-500',
    description: '노동조합 관련 정보'
  }
];

const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelectCategory, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">카테고리 선택</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">어떤 분야에 대해 궁금하신가요?</p>
        
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category)}
              className={`${category.color} text-white p-4 rounded-lg hover:opacity-90 transition-all duration-200 text-left`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="font-medium text-sm">{category.name}</div>
              <div className="text-xs opacity-90 mt-1">{category.description}</div>
            </button>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          일반 질문하기
        </button>
      </div>
    </div>
  );
};

export default CategorySelector;
```

---

### 🔄 STEP 3: 메인 앱 컴포넌트 수정

**파일명**: `app/page.tsx`

**작업 내용**:
```typescript
"use client";

import React, { useState } from 'react';
import ChatContainer from '@/components/ChatContainer';
import FloatingChatButton from '@/components/FloatingChatButton';
import CategorySelector, { Category } from '@/components/CategorySelector';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleFloatingButtonClick = () => {
    setShowCategories(true);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowCategories(false);
    setIsChatOpen(true);
  };

  const handleCategoryClose = () => {
    setShowCategories(false);
    setIsChatOpen(true);
    setSelectedCategory(null);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setSelectedCategory(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 메인 랜딩 페이지 */}
      {!isChatOpen && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              안전이 🛡️
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              안전 관리 전문 챗봇입니다
            </p>
            <p className="text-gray-500">
              우측 하단 버튼을 눌러 대화를 시작하세요
            </p>
          </div>
        </div>
      )}

      {/* 채팅 화면 */}
      {isChatOpen && (
        <div className="relative">
          <button
            onClick={handleChatClose}
            className="fixed top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 z-40"
            aria-label="채팅 닫기"
          >
            ✕
          </button>
          <ChatContainer selectedCategory={selectedCategory} />
        </div>
      )}

      {/* 플로팅 버튼 (채팅 열려있을 때는 숨김) */}
      {!isChatOpen && (
        <FloatingChatButton onClick={handleFloatingButtonClick} />
      )}

      {/* 카테고리 선택 모달 */}
      {showCategories && (
        <CategorySelector
          onSelectCategory={handleCategorySelect}
          onClose={handleCategoryClose}
        />
      )}
    </main>
  );
}
```

---

### 💬 STEP 4: ChatContainer 수정

**파일명**: `components/ChatContainer.tsx`

**기존 파일에 추가할 내용**:

```typescript
// 인터페이스 추가
import { Category } from './CategorySelector';

interface ChatContainerProps {
  selectedCategory?: Category | null;
}

// ChatContainer 컴포넌트 시작 부분에 추가
const ChatContainer: React.FC<ChatContainerProps> = ({ selectedCategory }) => {
  
  // 기존 상태들...
  
  // 카테고리별 환영 메시지
  const getCategoryWelcomeMessage = (category: Category | null | undefined): Message | null => {
    if (!category) return null;
    
    return {
      id: 0,
      text: `${category.icon} ${category.name} 관련해서 도움드릴게요! 무엇이 궁금하신가요?`,
      sender: 'bot'
    };
  };

  // useEffect로 카테고리 선택 시 환영 메시지 추가
  useEffect(() => {
    if (selectedCategory && messages.length === 0) {
      const welcomeMessage = getCategoryWelcomeMessage(selectedCategory);
      if (welcomeMessage) {
        setMessages([welcomeMessage]);
      }
    }
  }, [selectedCategory]);

  // handleSendMessage 함수에서 카테고리 정보 포함
  const handleSendMessage = async (text: string) => {
    // 기존 코드...
    
    const formData = new FormData();
    formData.append('message', text);
    if (pdfFile) {
      formData.append('pdf', pdfFile);
    }
    // 카테고리 정보 추가
    if (selectedCategory) {
      formData.append('category', JSON.stringify(selectedCategory));
    }
    
    // 나머지 기존 코드...
  };

  // 렌더링 부분에서 카테고리 표시 추가
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* 카테고리 헤더 */}
      {selectedCategory && (
        <div className={`p-3 ${selectedCategory.color} text-white text-center`}>
          <span className="text-lg">{selectedCategory.icon}</span>
          <span className="ml-2 font-medium">{selectedCategory.name}</span>
        </div>
      )}
      
      {/* 기존 MessageList와 다른 컴포넌트들... */}
      <MessageList messages={messages} />
      
      {/* 기존 PDF 업로드와 MessageInput... */}
    </div>
  );
};
```

---

### 🔧 STEP 5: API 라우트 수정

**파일명**: `app/api/chat/route.ts`

**수정할 내용**:
```typescript
// POST 함수 내부에서 카테고리 정보 처리
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const message = formData.get('message') as string;
    const pdfFile = formData.get('pdf') as File | null;
    const categoryData = formData.get('category') as string | null;
    
    // 카테고리 정보 파싱
    const category = categoryData ? JSON.parse(categoryData) : null;
    
    // 기존 PDF 처리 코드...
    
    // 카테고리별 맞춤 프롬프트
    const getCategoryPrompt = (category: any) => {
      if (!category) return '';
      
      const categoryPrompts = {
        'safety-notice': '긴급 안전사항과 사고 예방에 중점을 두고 답변해주세요.',
        'safety-rules': '작업장 안전수칙과 관련 법규에 대해 정확하고 상세히 설명해주세요.',
        'company-notice': '회사 공지사항과 정책에 대해 명확하게 안내해주세요.',
        'union-news': '노동조합 관련 정보를 친근하게 설명해주세요.'
      };
      
      return categoryPrompts[category.id] || '';
    };

    const categoryPrompt = getCategoryPrompt(category);
    
    // Gemini Pro 요청에 카테고리 정보 포함
    const fullMessage = `
    ${categoryPrompt ? `[카테고리: ${category.name}] ${categoryPrompt}\n` : ''}
    ${pdfText ? `PDF 내용:\n${pdfText}\n` : ''}
    사용자 질문: ${message}
    `;

    // 나머지 기존 코드...
  }
}
```

---

## ✅ 작업 완료 체크리스트

### 필수 작업
- [ ] `components/FloatingChatButton.tsx` 생성
- [ ] `components/CategorySelector.tsx` 생성  
- [ ] `app/page.tsx` 전체 수정
- [ ] `components/ChatContainer.tsx` 수정 (카테고리 지원)
- [ ] `app/api/chat/route.ts` 수정 (카테고리 처리)

### 테스트 항목
- [ ] 플로팅 버튼 클릭 → 카테고리 선택 화면
- [ ] 각 카테고리 선택 → 해당 환영 메시지
- [ ] 카테고리별 맞춤 답변 확인
- [ ] 모바일 반응형 확인
- [ ] PDF 업로드 + 카테고리 조합 테스트

---

## 🔄 실행 명령어

### 개발 서버 실행
```bash
cd korean-safety-chatbot-app
npm run dev
```

### 빌드 테스트
```bash
npm run build
npm start
```

---

## 🎯 기대 결과

1. **메인 화면**: 간단한 랜딩 페이지 + 우측 하단 플로팅 버튼
2. **카테고리 선택**: 4개 카테고리 (안전공지/안전규정/사내공지/노조소식)
3. **맞춤 대화**: 선택한 카테고리에 따른 전문 답변
4. **모바일 최적화**: 모든 화면이 모바일에서 완벽 동작

---

## 📝 작업 후 보고

**완료 시 DEVELOPMENT_LOG.md에 기록할 내용**:
- 구현 완료 기능 목록
- 발생한 문제 및 해결 과정
- 테스트 결과
- 다음 단계 제안

---

**🚀 화이팅! 코딩 작업 완료 후 결과를 알려주세요!**