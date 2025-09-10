# 🔧 개발 워크플로우 및 가이드

## 🚀 개발 환경 설정

### 1. 로컬 환경 준비

#### 필수 요구사항
```bash
# Node.js 18+ 설치 확인
node --version  # v18.0.0+
npm --version   # v9.0.0+

# Git 설치 확인
git --version   # v2.30+
```

#### 프로젝트 설정
```bash
# 1. 저장소 클론
git clone https://github.com/your-repo/korean-safety-chatbot.git
cd korean-safety-chatbot

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 실제 값들 입력

# 4. 개발서버 실행
npm run dev

# 5. 브라우저에서 확인
# http://localhost:3003
```

### 2. 환경변수 설정

#### .env.local 파일 구성
```bash
# Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB 연결
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/korean-safety-chatbot

# Next.js 설정
NEXT_PUBLIC_APP_URL=http://localhost:3003

# 개발 모드 (선택적)
NODE_ENV=development
DEBUG=chatbot:*
```

#### 환경변수 보안 주의사항
```yaml
보안 규칙:
  - .env.local 파일은 절대 Git에 커밋하지 않음
  - API 키는 환경변수로만 관리
  - 프로덕션과 개발 환경 분리
  - 정기적인 API 키 로테이션

환경별 설정:
  - development: .env.local
  - staging: .env.staging
  - production: Vercel/서버 환경변수
```

---

## 📋 개발 워크플로우

### 1. Git 워크플로우

#### 브랜치 전략
```
main (프로덕션)
├── develop (개발 통합)
    ├── feature/chat-improvements
    ├── feature/notice-board
    ├── bugfix/api-error-handling
    └── hotfix/critical-security-fix
```

#### 커밋 메시지 규칙
```bash
# 형식: <타입>(<범위>): <제목>
# 
# 타입:
feat:     새로운 기능 추가
fix:      버그 수정  
docs:     문서 수정
style:    코드 포매팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test:     테스트 코드 추가/수정
chore:    빌드 업무 수정, 패키지 매니저 설정 등

# 예시:
feat(chat): 실시간 스트리밍 응답 기능 추가
fix(api): MongoDB 연결 오류 수정
docs(readme): 설치 가이드 업데이트
```

### 2. 개발 프로세스

#### 기능 개발 프로세스
```bash
# 1. 새 기능 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/new-feature-name

# 2. 개발 진행
# - 코드 작성
# - 테스트 작성
# - 로컬 테스트 수행

# 3. 커밋 및 푸시
git add .
git commit -m "feat(component): 새 기능 구현"
git push origin feature/new-feature-name

# 4. Pull Request 생성
# - GitHub에서 PR 생성
# - 코드 리뷰 요청
# - CI/CD 체크 통과 확인

# 5. 머지 후 정리
git checkout develop
git pull origin develop
git branch -d feature/new-feature-name
```

#### 버그 수정 프로세스
```bash
# 긴급하지 않은 버그
git checkout -b bugfix/bug-description
# ... 수정 작업
git commit -m "fix(component): 버그 설명 및 수정 내용"

# 긴급 버그 (Hotfix)
git checkout main
git checkout -b hotfix/critical-issue
# ... 수정 작업
git commit -m "fix(critical): 긴급 수정 내용"
# main과 develop 모두에 머지 필요
```

---

## 🧪 테스트 및 품질 관리

### 1. 테스트 명령어

#### 로컬 테스트 실행
```bash
# 단위 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage

# 테스트 워치 모드
npm run test:watch

# E2E 테스트 실행
npm run test:e2e

# 모든 테스트 실행
npm run test:all
```

#### 코드 품질 검사
```bash
# ESLint 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix

# Prettier 포매팅
npm run format

# TypeScript 타입 체크
npm run type-check

# 전체 품질 검사
npm run quality-check
```

### 2. 테스트 작성 가이드

#### 컴포넌트 테스트 예시
```typescript
// components/__tests__/MessageInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import MessageInput from '../MessageInput'

describe('MessageInput', () => {
  const mockOnSendMessage = jest.fn()
  
  beforeEach(() => {
    mockOnSendMessage.mockClear()
  })

  it('메시지 입력 및 전송이 정상 작동한다', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText('메시지를 입력하세요...')
    const button = screen.getByRole('button', { name: /전송/i })
    
    fireEvent.change(input, { target: { value: '테스트 메시지' } })
    fireEvent.click(button)
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('테스트 메시지')
  })
})
```

#### API 테스트 예시
```typescript
// app/api/__tests__/chat.test.ts
import { POST } from '../chat/route'
import { NextRequest } from 'next/server'

describe('/api/chat', () => {
  it('채팅 메시지에 대한 응답을 반환한다', async () => {
    const request = new NextRequest('http://localhost:3003/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: '안전 관련 질문입니다' }),
    })
    
    const response = await POST(request)
    const reader = response.body?.getReader()
    const result = await reader?.read()
    
    expect(response.status).toBe(200)
    expect(result?.value).toBeDefined()
  })
})
```

---

## 📦 빌드 및 배포

### 1. 빌드 프로세스

#### 로컬 빌드
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 로컬 실행
npm run start

# 정적 내보내기 (선택적)
npm run export

# 빌드 분석
npm run analyze
```

#### 빌드 최적화 확인
```bash
# Bundle Analyzer 실행
npm run build:analyze

# 성능 측정
npm run build:performance

# 코드 분할 확인
npm run build:chunks
```

### 2. 배포 전략

#### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 설정
vercel login
vercel link

# 환경변수 설정
vercel env add GEMINI_API_KEY
vercel env add MONGODB_URI

# 배포 실행
vercel --prod
```

#### 수동 배포
```bash
# 1. 빌드 생성
npm run build

# 2. 빌드 파일 업로드
# .next/ 폴더를 서버에 업로드

# 3. 서버에서 실행
npm run start
```

### 3. CI/CD 파이프라인

#### GitHub Actions 워크플로우
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🐛 디버깅 및 문제 해결

### 1. 일반적인 개발 문제

#### Node.js 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
lsof -ti:3003

# 프로세스 종료
kill -9 $(lsof -ti:3003)

# 다른 포트로 실행
PORT=3004 npm run dev
```

#### MongoDB 연결 오류
```bash
# MongoDB 연결 상태 확인
curl http://localhost:3003/api/db-status

# 환경변수 확인
echo $MONGODB_URI

# 연결 문자열 형식 확인
# mongodb+srv://<username>:<password>@<cluster-url>/<database>
```

#### TypeScript 오류
```bash
# 타입 캐시 클리어
rm -rf .next
npm run build

# 타입 정의 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 버전 확인
npx tsc --version
```

### 2. 성능 디버깅

#### 번들 크기 분석
```bash
# Bundle Analyzer 실행
npm run analyze

# 큰 패키지 찾기
npx webpack-bundle-analyzer .next/static/chunks/

# 코드 스플리팅 확인
npm run build -- --analyze
```

#### 메모리 사용량 모니터링
```bash
# Node.js 메모리 사용량 확인
node --max-old-space-size=4096 node_modules/.bin/next dev

# 메모리 프로파일링
node --inspect node_modules/.bin/next dev
```

### 3. API 디버깅

#### API 응답 테스트
```bash
# 채팅 API 테스트
curl -X POST http://localhost:3003/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "테스트 메시지"}'

# 공지사항 API 테스트
curl http://localhost:3003/api/announcements

# 데이터베이스 상태 확인
curl http://localhost:3003/api/db-status
```

#### 로그 모니터링
```bash
# 개발 서버 로그 확인
DEBUG=* npm run dev

# 특정 모듈 디버깅
DEBUG=chatbot:* npm run dev

# API 요청 로깅
DEBUG=api:* npm run dev
```

---

## 🔍 코드 품질 가이드라인

### 1. TypeScript 사용 규칙

#### 타입 정의
```typescript
// ✅ 좋은 예시
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  feedback?: 'good' | 'bad'
}

// ❌ 나쁜 예시
interface ChatMessage {
  id: any
  role: string
  content: any
  timestamp: any
}
```

#### 컴포넌트 타이핑
```typescript
// ✅ 좋은 예시
interface MessageInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function MessageInput({ 
  onSendMessage, 
  disabled = false,
  placeholder = "메시지를 입력하세요..." 
}: MessageInputProps) {
  // 구현
}

// ❌ 나쁜 예시
export default function MessageInput(props: any) {
  // 구현
}
```

### 2. React 컴포넌트 규칙

#### 컴포넌트 구조
```typescript
// ✅ 권장 구조
import React, { useState, useEffect } from 'react'
import type { ComponentProps } from './types'

// 1. 인터페이스 정의
interface Props extends ComponentProps {
  // 추가 props
}

// 2. 메인 컴포넌트
export default function Component({ ...props }: Props) {
  // 3. 상태 관리
  const [state, setState] = useState()
  
  // 4. 이펙트 훅
  useEffect(() => {
    // 부수 효과
  }, [])
  
  // 5. 이벤트 핸들러
  const handleEvent = () => {
    // 핸들러 로직
  }
  
  // 6. 렌더링
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### 3. CSS 및 스타일링 규칙

#### Tailwind CSS 사용
```tsx
// ✅ 좋은 예시
<button className="
  px-4 py-2 
  bg-blue-500 hover:bg-blue-600 
  text-white font-medium 
  rounded-lg 
  transition-colors 
  disabled:opacity-50
">
  버튼
</button>

// ✅ 복잡한 스타일은 변수로 분리
const buttonStyles = `
  px-4 py-2 
  bg-blue-500 hover:bg-blue-600 
  text-white font-medium 
  rounded-lg 
  transition-colors 
  disabled:opacity-50
`

<button className={buttonStyles}>버튼</button>
```

#### CSS Modules 사용
```css
/* MessageInput.module.css */
.container {
  @apply flex items-center gap-2 p-4 border-t bg-white;
}

.input {
  @apply flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.button {
  @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors;
}
```

---

## 📚 추가 리소스

### 1. 개발 도구

#### VS Code 확장 프로그램
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### 유용한 명령어 스크립트
```json
{
  "scripts": {
    "dev": "next dev -p 3003",
    "dev:turbo": "next dev --turbo -p 3003",
    "build": "next build",
    "start": "next start -p 3003",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "clean": "rm -rf .next out node_modules/.cache"
  }
}
```

### 2. 학습 자료

#### 공식 문서
- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [MongoDB 문서](https://docs.mongodb.com)

#### 커뮤니티 리소스
- [Next.js GitHub](https://github.com/vercel/next.js)
- [React GitHub](https://github.com/facebook/react)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)
- [Discord 커뮤니티](https://nextjs.org/discord)

### 3. 트러블슈팅 가이드

#### 자주 발생하는 문제들
1. **MongoDB 연결 실패**
   - 연결 문자열 확인
   - IP 화이트리스트 설정
   - 사용자 권한 확인

2. **Gemini API 오류**
   - API 키 유효성 확인
   - 요청 한도 확인
   - 네트워크 연결 상태

3. **빌드 에러**
   - 타입 오류 수정
   - 환경변수 설정
   - 의존성 버전 확인

4. **성능 문제**
   - 번들 크기 최적화
   - 이미지 최적화
   - 불필요한 리렌더링 방지

각 문제에 대한 자세한 해결책은 `docs/06_TROUBLESHOOTING.md`를 참조하세요.