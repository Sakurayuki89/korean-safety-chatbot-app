# 🔧 문제해결 가이드 (Troubleshooting Guide)

## 🚨 긴급 상황 대응

### 서비스 완전 중단
```yaml
증상: 웹사이트 접속 불가, 500 에러
체크리스트:
  □ 서버 상태 확인 (health check endpoint)
  □ 데이터베이스 연결 상태 확인
  □ DNS 설정 확인
  □ CDN 상태 확인 (Vercel/CloudFlare)
  □ 환경변수 설정 검증

즉시 조치:
  1. 서버 재시작: pm2 restart all 또는 docker restart
  2. 롤백 실행: 이전 안정 버전으로 복구
  3. 모니터링 시스템 확인
  4. 사용자 공지사항 게시
```

### 데이터베이스 연결 실패
```yaml
증상: "Database connection failed" 에러
원인 분석:
  - MongoDB Atlas 서비스 상태
  - 네트워크 연결 문제
  - 인증 정보 오류
  - IP 화이트리스트 설정

해결 단계:
  1. MongoDB Atlas 상태 페이지 확인
  2. 연결 문자열 검증
  3. IP 화이트리스트에 서버 IP 추가
  4. 데이터베이스 사용자 권한 확인
  5. 연결 풀 설정 확인
```

---

## 🔍 개발 환경 문제 해결

### 1. 로컬 환경 설정 문제

#### Node.js 버전 호환성
```bash
# 현재 Node.js 버전 확인
node --version

# 권장 버전: 18.17.0 이상
# nvm 사용 시 버전 변경
nvm install 18.19.0
nvm use 18.19.0

# npm 버전 호환성 확인
npm --version  # 9.0.0 이상 권장

# 패키지 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 환경변수 설정 오류
```bash
# .env.local 파일 존재 확인
ls -la .env*

# 환경변수 형식 검증
echo "GEMINI_API_KEY=$GEMINI_API_KEY"
echo "MONGODB_URI=$MONGODB_URI"

# 일반적인 오류
# ❌ GEMINI_API_KEY="your_key" (따옴표 불필요)
# ✅ GEMINI_API_KEY=your_actual_key

# MongoDB URI 형식 확인
# ✅ mongodb+srv://username:password@cluster.mongodb.net/database
# ❌ mongodb://localhost:27017 (로컬 개발이 아닌 경우)
```

#### 포트 충돌 문제
```bash
# 포트 사용 중인 프로세스 확인
lsof -ti:3003

# 프로세스 강제 종료
kill -9 $(lsof -ti:3003)

# 다른 포트로 실행
PORT=3004 npm run dev

# 또는 package.json 수정
"scripts": {
  "dev": "next dev -p 3005"
}
```

### 2. 빌드 및 배포 문제

#### TypeScript 컴파일 에러
```bash
# 타입 체크 실행
npx tsc --noEmit

# 일반적인 해결방법
rm -rf .next/
rm -rf node_modules/.cache/
npm run build

# 타입 정의 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 메모리 부족 오류
```bash
# Node.js 메모리 한도 증가
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# package.json 스크립트 수정
"scripts": {
  "build": "NODE_OPTIONS=\"--max-old-space-size=4096\" next build"
}

# Vercel 배포 시 메모리 설정
# vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024
    }
  }
}
```

---

## 🐛 API 관련 문제 해결

### 1. Gemini API 오류

#### API 키 인증 실패
```javascript
// 증상: "API key not valid" 에러
// 해결방법:

// 1. API 키 형식 확인
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length)
// 정상: 39자리 문자열

// 2. API 키 권한 확인
// Google AI Studio에서 키 활성 상태 확인
// 사용량 한도 확인

// 3. 환경변수 로딩 확인
// next.config.js
console.log('Environment:', process.env.NODE_ENV)
console.log('Has API Key:', !!process.env.GEMINI_API_KEY)
```

#### API 요청 한도 초과
```javascript
// lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 1분에 10회
  analytics: true,
})

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
  
  if (!success) {
    throw new Error(`Rate limit exceeded. Reset in ${Math.ceil((reset - Date.now()) / 1000)}s`)
  }
  
  return { remaining, reset }
}
```

#### 스트리밍 응답 오류
```javascript
// app/api/chat/route.ts - 디버깅 코드 추가
export async function POST(request: Request) {
  try {
    const { message, sessionId } = await request.json()
    
    console.log('Chat request:', { message, sessionId })
    
    if (!message) {
      console.error('No message provided')
      return new Response('Message is required', { status: 400 })
    }
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Gemini API 호출 및 스트리밍 로직
          console.log('Starting Gemini API call...')
          
          // ... 기존 코드
          
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
```

### 2. MongoDB 연결 문제

#### 연결 타임아웃
```javascript
// lib/mongodb.ts - 연결 설정 최적화
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!
const options = {
  // 연결 타임아웃 설정
  serverSelectionTimeoutMS: 5000, // 5초
  socketTimeoutMS: 45000, // 45초
  
  // 연결 풀 설정
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  
  // 재연결 설정
  retryWrites: true,
  retryReads: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
```

#### 쿼리 성능 문제
```javascript
// 느린 쿼리 디버깅
// MongoDB Compass 또는 직접 쿼리로 확인

// 1. 인덱스 확인
db.chat_history.getIndexes()

// 2. 쿼리 실행 계획 확인
db.chat_history.find({ sessionId: "session123" }).explain("executionStats")

// 3. 필요한 인덱스 생성
db.chat_history.createIndex({ sessionId: 1, createdAt: -1 })
db.announcements.createIndex({ 
  title: "text", 
  content: "text" 
}, { 
  weights: { title: 10, content: 5 } 
})
```

---

## 🎨 Frontend 문제 해결

### 1. 이미지 표시 문제

#### Google Drive 이미지 CORS 오류
```yaml
증상: "안전보건용품 신청" 모달에서 이미지가 표시되지 않음
오류: "CORS policy: No 'Access-Control-Allow-Origin' header is present"

해결책: 이미지 프록시 API 사용
  ✅ /api/image-proxy 엔드포인트로 Google Drive 이미지 우회
  ✅ 6가지 Google Drive URL 형식 자동 처리
  ✅ 캐시 헤더로 성능 최적화
```

```typescript
// components/SafetyItemRequest.tsx - URL 변환 로직
const convertGoogleDriveUrl = (url: string) => {
  if (url.includes('drive.google.com')) {
    let fileId = null;
    
    // Format 1: https://drive.google.com/file/d/FILE_ID/view
    const fileIdMatch1 = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch1) {
      fileId = fileIdMatch1[1];
    }
    
    // Format 2: https://drive.google.com/uc?id=FILE_ID
    const fileIdMatch2 = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (fileIdMatch2) {
      fileId = fileIdMatch2[1];
    }
    
    if (fileId) {
      console.log(`Converting: ${url} -> /api/image-proxy?fileId=${fileId}`);
      return `/api/image-proxy?fileId=${fileId}`;
    }
  }
  return url;
};
```

```typescript
// app/api/image-proxy/route.ts - 프록시 서버 구현
export async function GET(req: NextRequest) {
  const fileId = new URL(req.url).searchParams.get('fileId');
  
  // 6가지 URL 형식 시도
  const urlsToTry = [
    `https://drive.google.com/uc?id=${fileId}&export=view`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/uc?id=${fileId}`,
    `https://drive.google.com/uc?id=${fileId}&export=download`,
    `https://drive.google.com/thumbnail?id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}=w1000-h1000`,
  ];

  for (const imageUrl of urlsToTry) {
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageBot/1.0)',
          'Accept': 'image/*,*/*;q=0.8',
          'Referer': 'https://drive.google.com',
        },
      });
      
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        const imageBuffer = await response.arrayBuffer();
        
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': response.headers.get('content-type')!,
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    } catch (error) {
      console.log(`Failed URL: ${imageUrl}`);
    }
  }
  
  return NextResponse.json({ error: 'Image not found' }, { status: 404 });
}
```

#### 이미지 로드 디버깅 방법
```bash
# 1. 브라우저 개발자 도구에서 Network 탭 확인
# 2. 이미지 요청 상태 및 응답 헤더 검사

# 3. 직접 프록시 URL 테스트
curl -I "http://localhost:3000/api/image-proxy?fileId=FILE_ID"

# 4. 컴포넌트에서 로드 상태 추적
onLoad={() => console.log('Image loaded successfully')}
onError={() => console.log('Image failed to load')}
```

#### 해결 과정 요약
1. **문제 식별**: CORS 정책으로 인한 Google Drive 직접 접근 차단
2. **프록시 구현**: `/api/image-proxy` 엔드포인트 생성
3. **URL 변환**: `convertGoogleDriveUrl` 함수로 자동 변환
4. **폴백 전략**: 6가지 URL 형식으로 안정성 확보
5. **성능 최적화**: 캐시 헤더 및 CORS 헤더 설정

### 2. React 컴포넌트 오류

#### Hydration Mismatch
```jsx
// 증상: "Hydration failed because the initial UI does not match what was rendered on the server"
// 원인: SSR과 클라이언트 렌더링 불일치

// ❌ 문제가 되는 코드
function ChatContainer() {
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    // 클라이언트에서만 실행되는 코드
    setMessages(getLocalStorageMessages())
  }, [])
  
  return (
    <div>
      {messages.length > 0 ? (
        <MessageList messages={messages} />
      ) : (
        <div>No messages</div>
      )}
    </div>
  )
}

// ✅ 수정된 코드
function ChatContainer() {
  const [messages, setMessages] = useState([])
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    setMessages(getLocalStorageMessages())
  }, [])
  
  if (!isClient) {
    return <div>Loading...</div>
  }
  
  return (
    <div>
      {messages.length > 0 ? (
        <MessageList messages={messages} />
      ) : (
        <div>No messages</div>
      )}
    </div>
  )
}
```

#### 메모리 누수 문제
```jsx
// useEffect 정리 함수 누락
// ❌ 문제 코드
function MessageInput() {
  useEffect(() => {
    const interval = setInterval(() => {
      // 주기적 작업
    }, 1000)
    
    // 정리 함수 누락!
  }, [])
}

// ✅ 수정 코드
function MessageInput() {
  useEffect(() => {
    const interval = setInterval(() => {
      // 주기적 작업
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
}

// 이벤트 리스너 정리
function ChatContainer() {
  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 처리
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
}
```

### 2. CSS 및 스타일링 문제

#### Tailwind CSS 클래스 적용 안됨
```css
/* globals.css - 올바른 Tailwind 임포트 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 커스텀 스타일 추가 */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors;
  }
}

/* CSS 변수 사용 */
:root {
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --danger-color: #ef4444;
}
```

```javascript
// tailwind.config.js - 설정 확인
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        success: 'var(--success-color)',
        danger: 'var(--danger-color)',
      },
    },
  },
  plugins: [],
}
```

#### 반응형 디자인 문제
```jsx
// 모바일 우선 접근법
function NoticeBoard() {
  return (
    <div className="
      w-full p-4                    // 모바일 기본
      md:p-6                       // 태블릿
      lg:p-8 lg:max-w-4xl lg:mx-auto  // 데스크톱
    ">
      <div className="
        grid grid-cols-1           // 모바일: 1열
        md:grid-cols-2             // 태블릿: 2열
        lg:grid-cols-3             // 데스크톱: 3열
        gap-4
      ">
        {/* 공지사항 아이템들 */}
      </div>
    </div>
  )
}
```

---

## 📊 성능 문제 해결

### 1. 느린 페이지 로딩

#### 번들 크기 분석
```bash
# Bundle Analyzer 실행
npm run build && npm run analyze

# 큰 파일들 확인
du -sh .next/static/chunks/*.js | sort -hr | head -10

# 불필요한 라이브러리 제거
npm uninstall unused-package
```

#### 이미지 최적화
```jsx
// Next.js Image 컴포넌트 사용
import Image from 'next/image'

function LogoImage() {
  return (
    <Image
      src="/logo.png"
      alt="Korean Safety Chatbot"
      width={200}
      height={100}
      priority // 중요한 이미지는 우선 로딩
      placeholder="blur" // 로딩 중 블러 효과
      blurDataURL="data:image/jpeg;base64,..." // 블러 이미지
    />
  )
}
```

#### 코드 스플리팅
```jsx
// 동적 임포트 사용
import dynamic from 'next/dynamic'

// 무거운 컴포넌트 lazy 로딩
const PDFViewer = dynamic(() => import('./PDFViewer'), {
  loading: () => <div>Loading PDF viewer...</div>,
  ssr: false // 서버사이드 렌더링 비활성화
})

// 조건부 로딩
function ChatContainer() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const AdvancedFeatures = dynamic(() => import('./AdvancedFeatures'), {
    loading: () => <div>Loading...</div>
  })
  
  return (
    <div>
      {/* 기본 채팅 기능 */}
      {showAdvanced && <AdvancedFeatures />}
    </div>
  )
}
```

### 2. 메모리 사용량 최적화

#### React 렌더링 최적화
```jsx
// useMemo와 useCallback 사용
import { useMemo, useCallback } from 'react'

function MessageList({ messages, onMessageSelect }) {
  // 비싼 계산 메모이제이션
  const sortedMessages = useMemo(() => {
    return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }, [messages])
  
  // 함수 메모이제이션
  const handleMessageClick = useCallback((messageId) => {
    onMessageSelect(messageId)
  }, [onMessageSelect])
  
  return (
    <div>
      {sortedMessages.map(message => (
        <MessageItem 
          key={message.id}
          message={message}
          onClick={handleMessageClick}
        />
      ))}
    </div>
  )
}

// React.memo로 불필요한 리렌더링 방지
import { memo } from 'react'

const MessageItem = memo(function MessageItem({ message, onClick }) {
  return (
    <div onClick={() => onClick(message.id)}>
      {message.content}
    </div>
  )
})
```

---

## 🔒 보안 문제 해결

### 1. API 보안

#### CORS 설정
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://your-domain.com' 
              : 'http://localhost:3003'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  }
}
```

#### Rate Limiting 구현
```javascript
// lib/rate-limiter.ts
const rateLimitMap = new Map()

export function rateLimit(identifier: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, [])
  }
  
  const requests = rateLimitMap.get(identifier)
  const validRequests = requests.filter(timestamp => timestamp > windowStart)
  
  if (validRequests.length >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: validRequests[0] + windowMs
    }
  }
  
  validRequests.push(now)
  rateLimitMap.set(identifier, validRequests)
  
  return {
    success: true,
    remaining: limit - validRequests.length,
    resetTime: now + windowMs
  }
}
```

### 2. 입력 검증

#### 클라이언트/서버 이중 검증
```javascript
// lib/validation.ts
import { z } from 'zod'

export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, '메시지는 필수입니다')
    .max(1000, '메시지는 1000자 이하여야 합니다')
    .regex(/^[가-힣a-zA-Z0-9\s.,!?]+$/, '허용되지 않는 문자가 포함되어 있습니다'),
  sessionId: z.string().uuid().optional()
})

export const contactFormSchema = z.object({
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다'),
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  message: z.string().min(10, '문의 내용은 10글자 이상이어야 합니다')
})

// API 라우트에서 사용
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = chatMessageSchema.parse(body)
    
    // 검증된 데이터로 처리
    return handleChatMessage(validatedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: '입력 데이터가 유효하지 않습니다',
        details: error.errors 
      }), { status: 400 })
    }
    
    return new Response('Internal Server Error', { status: 500 })
  }
}
```

---

## 📱 모바일 문제 해결

### 1. iOS Safari 특정 문제

#### 뷰포트 높이 문제
```css
/* iOS Safari 주소창 고려한 높이 설정 */
.chat-container {
  height: 100vh; /* 기본값 */
  height: 100svh; /* Safari 지원 시 */
  height: -webkit-fill-available; /* iOS Safari */
}

/* JavaScript로 동적 조정 */
```

```javascript
// lib/viewport-fix.ts
export function fixMobileViewport() {
  function setVH() {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }
  
  setVH()
  window.addEventListener('resize', setVH)
  window.addEventListener('orientationchange', setVH)
}

// CSS에서 사용
.full-height {
  height: calc(var(--vh, 1vh) * 100);
}
```

#### 터치 스크롤 문제
```css
/* iOS 관성 스크롤 활성화 */
.message-list {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* 탭 하이라이트 제거 */
.clickable-element {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
}
```

### 2. Android Chrome 문제

#### 키보드 레이아웃 문제
```javascript
// 키보드 표시 시 레이아웃 조정
function handleKeyboardResize() {
  const initialViewportHeight = window.innerHeight
  
  window.addEventListener('resize', () => {
    const currentHeight = window.innerHeight
    const difference = initialViewportHeight - currentHeight
    
    // 키보드가 표시된 상태 (높이 차이가 150px 이상)
    if (difference > 150) {
      document.body.classList.add('keyboard-open')
    } else {
      document.body.classList.remove('keyboard-open')
    }
  })
}

// CSS
.keyboard-open .chat-input {
  position: fixed;
  bottom: 0;
  z-index: 1000;
}
```

---

## 🛠️ 디버깅 도구 및 기법

### 1. 로그 분석

#### 구조화된 로깅
```javascript
// lib/logger.ts
export class Logger {
  static info(message: string, meta: object = {}) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }))
  }
  
  static error(message: string, error: Error, meta: object = {}) {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...meta
    }))
  }
  
  static performance(operation: string, duration: number, meta: object = {}) {
    console.log(JSON.stringify({
      level: 'performance',
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...meta
    }))
  }
}

// 사용 예시
Logger.info('Chat message processed', { sessionId, messageLength: message.length })
Logger.error('Database connection failed', error, { retryCount: 3 })
Logger.performance('Gemini API call', 1500, { tokenCount: 150 })
```

### 2. 브라우저 개발자 도구 활용

#### Performance 탭 활용
```javascript
// 성능 측정 코드
function measurePerformance(name, fn) {
  return async (...args) => {
    const start = performance.now()
    
    try {
      const result = await fn(...args)
      const end = performance.now()
      
      console.log(`${name} took ${end - start} milliseconds`)
      return result
    } catch (error) {
      const end = performance.now()
      console.error(`${name} failed after ${end - start} milliseconds`, error)
      throw error
    }
  }
}

// 사용
const measuredChatAPI = measurePerformance('Chat API', chatAPI)
```

#### 네트워크 요청 디버깅
```javascript
// API 요청 인터셉터
function debugFetch(url, options) {
  console.log('🌐 API Request:', { url, method: options?.method, headers: options?.headers })
  
  return fetch(url, options)
    .then(response => {
      console.log('✅ API Response:', { url, status: response.status, ok: response.ok })
      return response
    })
    .catch(error => {
      console.error('❌ API Error:', { url, error: error.message })
      throw error
    })
}

// 글로벌 교체 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  window.originalFetch = window.fetch
  window.fetch = debugFetch
}
```

---

## 📞 전문가 지원 요청

### 언제 전문가 도움을 요청해야 하는가?

#### 즉시 지원 요청이 필요한 상황
- 서비스 완전 중단 (30분 이상)
- 데이터 손실 위험
- 보안 취약점 발견
- 대규모 사용자 영향

#### 지원 요청 시 포함할 정보
```
1. 문제 설명
   - 언제 시작되었는지
   - 어떤 조건에서 발생하는지
   - 에러 메시지 전문

2. 환경 정보
   - 운영체제 및 브라우저
   - Node.js 및 npm 버전
   - 배포 환경 (로컬/스테이징/프로덕션)

3. 재현 단계
   - 문제를 재현하는 정확한 단계
   - 예상 결과 vs 실제 결과
   - 스크린샷 또는 비디오

4. 시도한 해결책
   - 이미 시도해본 방법들
   - 결과 (성공/실패/부분적 개선)

5. 로그 및 에러 정보
   - 브라우저 콘솔 로그
   - 서버 로그
   - 네트워크 탭 정보
```

### 지원 채널
- **긴급**: GitHub Issues (Critical 라벨)
- **일반**: 이메일 support@korean-safety-chatbot.com
- **기술**: GitHub Discussions
- **버그 리포트**: GitHub Issues (Bug 라벨)

---

## 📚 추가 리소스

### 공식 문서
- [Next.js 문제해결](https://nextjs.org/docs/messages)
- [React 디버깅 가이드](https://reactjs.org/docs/debugging.html)
- [MongoDB 문제해결](https://docs.mongodb.com/manual/reference/troubleshooting/)
- [Vercel 지원](https://vercel.com/support)

### 커뮤니티 지원
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)
- [Reddit - Next.js](https://www.reddit.com/r/nextjs/)
- [Discord - Reactiflux](https://discord.gg/reactiflux)

### 도구 및 유틸리티
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Postman](https://www.postman.com/) - API 테스팅