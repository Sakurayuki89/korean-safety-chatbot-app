# 🏗️ ARCHITECTURE DESIGN: 하이브리드 PDF 챗봇 시스템

## 🎯 시스템 아키텍처 Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID PDF CHATBOT SYSTEM                   │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   GOOGLE DRIVE  │   PDF VIEWER    │      CHAT SYSTEM            │
│   INTEGRATION   │   COMPONENT     │      (EXISTING)             │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • OAuth 2.0     │ • React-PDF     │ • Gemini AI                 │
│ • Drive API v3  │ • PDF.js        │ • Streaming                 │
│ • File Upload   │ • Text Select   │ • MongoDB                   │
│ • File List     │ • Page Track    │ • Session Mgmt              │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

---

## 📁 새로운 프로젝트 구조

```
korean-safety-chatbot-app/
├── app/
│   ├── api/
│   │   ├── google/
│   │   │   ├── auth/route.ts          # OAuth 토큰 처리
│   │   │   ├── files/route.ts         # Drive 파일 목록
│   │   │   └── download/route.ts      # 파일 다운로드
│   │   ├── chat/route.ts              # 기존 + 컨텍스트 강화
│   │   ├── history/route.ts           # 기존 유지
│   │   └── db-status/route.ts         # 기존 유지
│   └── page.tsx                       # 메인 페이지 (레이아웃 변경)
├── components/
│   ├── chat/                          # 기존 채팅 시스템
│   │   ├── ChatContainer.tsx          # 수정 필요
│   │   ├── MessageList.tsx            # 기존 유지
│   │   └── MessageInput.tsx           # 컨텍스트 추가
│   ├── drive/                         # 새로운 Google Drive 컴포넌트
│   │   ├── DriveAuth.tsx              # OAuth 인증
│   │   ├── FileList.tsx               # 파일 목록
│   │   ├── FileUpload.tsx             # 드래그앤드롭 업로드
│   │   └── DriveProvider.tsx          # Context Provider
│   ├── pdf/                           # 새로운 PDF 뷰어 컴포넌트
│   │   ├── PDFViewer.tsx              # 메인 PDF 뷰어
│   │   ├── PDFControls.tsx            # 페이지 네비게이션
│   │   ├── TextSelector.tsx           # 텍스트 선택 기능
│   │   └── PDFProvider.tsx            # PDF 상태 관리
│   ├── layout/                        # 새로운 레이아웃 컴포넌트
│   │   ├── SplitLayout.tsx            # 화면 분할 레이아웃
│   │   └── ResponsiveLayout.tsx       # 반응형 레이아웃
│   └── [기존 컴포넌트들 유지]
├── lib/
│   ├── google-drive.ts                # Drive API 유틸리티
│   ├── pdf-utils.ts                   # PDF 처리 유틸리티
│   ├── context-manager.ts             # 컨텍스트 관리
│   └── [기존 라이브러리들 유지]
├── hooks/                             # 새로운 커스텀 훅
│   ├── useGoogleDrive.ts              # Drive API 훅
│   ├── usePDFViewer.ts                # PDF 뷰어 훅
│   └── useContextChat.ts              # 컨텍스트 채팅 훅
└── types/
    ├── google-drive.ts                # Drive API 타입
    └── pdf.ts                         # PDF 관련 타입
```

---

## 🔧 기술 스택 상세

### 새로 추가할 Dependencies
```json
{
  "dependencies": {
    "googleapis": "^134.0.0",           // Google Drive API
    "react-pdf": "^7.7.0",             // PDF 뷰어 React 컴포넌트
    "pdfjs-dist": "^4.0.0",            // PDF.js 코어 라이브러리
    "react-dropzone": "^14.2.3",       // 파일 드래그앤드롭
    "react-split-pane": "^2.0.3",      // 화면 분할 레이아웃
    "react-window": "^1.8.8",          // 가상화 (파일 목록 최적화)
    "js-cookie": "^3.0.5",             // 쿠키 관리 (토큰 저장)
    "@types/js-cookie": "^3.0.6"       // 쿠키 타입
  }
}
```

---

## 🗂️ 데이터 모델 설계

### 1. Google Drive Files Collection (MongoDB)
```typescript
interface DriveFile {
  _id: ObjectId;
  userId: string;           // 사용자 식별자
  driveFileId: string;      // Google Drive 파일 ID
  name: string;             // 파일명
  mimeType: string;         // MIME 타입
  size: number;             // 파일 크기 (bytes)
  createdTime: Date;        // Drive 생성일
  modifiedTime: Date;       // Drive 수정일
  localCreatedAt: Date;     // 로컬 저장일
  lastAccessedAt: Date;     // 마지막 접근일
  isActive: boolean;        // 활성 상태
}
```

### 2. Chat Sessions with Context (기존 확장)
```typescript
interface ChatMessage {
  _id: ObjectId;
  sessionId: string;
  userId?: string;          // 새로 추가
  role: 'user' | 'assistant';
  content: string;
  contextInfo?: {           // 새로운 컨텍스트 정보
    driveFileId?: string;   // 참조 파일 ID
    fileName?: string;      // 파일명
    currentPage?: number;   // 현재 페이지
    selectedText?: string;  // 선택된 텍스트
    pageRange?: {           // 페이지 범위
      start: number;
      end: number;
    };
  };
  createdAt: Date;
}
```

### 3. User Sessions (새로 추가)
```typescript
interface UserSession {
  _id: ObjectId;
  sessionId: string;
  googleToken?: {           // Google OAuth 토큰
    access_token: string;
    refresh_token: string;
    expires_at: Date;
  };
  currentFile?: {           // 현재 보고 있는 파일
    driveFileId: string;
    fileName: string;
    currentPage: number;
  };
  createdAt: Date;
  lastActiveAt: Date;
}
```

---

## 🔌 API 엔드포인트 명세

### Google Drive 관련 API

#### 1. `GET /api/google/auth`
OAuth 인증 URL 생성
```typescript
// Response
{
  authUrl: string;
  state: string;
}
```

#### 2. `POST /api/google/auth/callback`
OAuth 콜백 처리
```typescript
// Request
{
  code: string;
  state: string;
}

// Response  
{
  success: boolean;
  sessionId: string;
  user: {
    email: string;
    name: string;
  };
}
```

#### 3. `GET /api/google/files`
Drive 파일 목록 조회
```typescript
// Query Parameters
{
  sessionId: string;
  mimeType?: string;        // 'application/pdf'
  q?: string;              // 검색 쿼리
  pageSize?: number;       // 기본값: 20
  pageToken?: string;      // 페이지네이션
}

// Response
{
  files: DriveFile[];
  nextPageToken?: string;
  totalFiles: number;
}
```

#### 4. `POST /api/google/files/upload`
파일 업로드
```typescript
// Request (multipart/form-data)
{
  file: File;
  sessionId: string;
  folderId?: string;       // 업로드할 폴더 ID
}

// Response
{
  success: boolean;
  file: DriveFile;
}
```

#### 5. `GET /api/google/files/[fileId]/download`
파일 다운로드 (PDF 스트리밍)
```typescript
// Headers
{
  'Content-Type': 'application/pdf';
  'Content-Disposition': 'inline; filename="document.pdf"';
}

// Response: PDF 바이너리 스트림
```

### 기존 Chat API 확장

#### 수정된 `POST /api/chat`
```typescript
// Request (기존 + 컨텍스트 추가)
{
  message: string;
  sessionId: string;
  contextInfo?: {           // 새로운 컨텍스트
    driveFileId?: string;
    fileName?: string;
    currentPage?: number;
    selectedText?: string;
    pageRange?: {
      start: number;
      end: number;
    };
  };
}

// Response (기존과 동일, 스트리밍)
```

---

## 🎨 React 컴포넌트 설계

### 1. 메인 레이아웃 컴포넌트

#### `SplitLayout.tsx`
```typescript
interface SplitLayoutProps {
  leftPanel: React.ReactNode;      // Drive + PDF 영역
  rightPanel: React.ReactNode;     // Chat 영역
  defaultSplit?: number;           // 기본 분할 비율 (0.6)
  minSize?: number;               // 최소 크기 (300px)
  resizerStyle?: React.CSSProperties;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ ... }) => {
  // react-split-pane 사용
  // 모바일에서는 탭 형태로 전환
};
```

#### `ResponsiveLayout.tsx`
```typescript
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  breakpoint?: number;             // 모바일 브레이크포인트 (768px)
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ ... }) => {
  // 데스크톱: 분할 레이아웃
  // 모바일: 탭 레이아웃 (PDF ↔ Chat 전환)
};
```

### 2. Google Drive 컴포넌트

#### `DriveAuth.tsx`
```typescript
interface DriveAuthProps {
  onAuthSuccess: (sessionId: string) => void;
  onAuthError: (error: string) => void;
}

const DriveAuth: React.FC<DriveAuthProps> = ({ ... }) => {
  // OAuth 플로우 처리
  // 로딩 상태 관리
  // 에러 처리
};
```

#### `FileList.tsx`
```typescript
interface FileListProps {
  sessionId: string;
  onFileSelect: (file: DriveFile) => void;
  selectedFileId?: string;
  searchQuery?: string;
}

const FileList: React.FC<FileListProps> = ({ ... }) => {
  // 파일 목록 가상화 (react-window)
  // 검색 및 필터링
  // 무한 스크롤 (페이지네이션)
};
```

#### `FileUpload.tsx`
```typescript
interface FileUploadProps {
  sessionId: string;
  onUploadSuccess: (file: DriveFile) => void;
  onUploadError: (error: string) => void;
  acceptedFileTypes?: string[];    // 기본값: ['.pdf']
}

const FileUpload: React.FC<FileUploadProps> = ({ ... }) => {
  // react-dropzone 사용
  // 업로드 진행률 표시
  // 다중 파일 업로드 지원
};
```

### 3. PDF 뷰어 컴포넌트

#### `PDFViewer.tsx`
```typescript
interface PDFViewerProps {
  fileUrl: string;
  initialPage?: number;
  onPageChange: (pageNumber: number) => void;
  onTextSelect: (selectedText: string, pageNumber: number) => void;
  onLoadSuccess: (numPages: number) => void;
  onLoadError: (error: Error) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ ... }) => {
  // react-pdf 사용
  // 텍스트 선택 기능
  // 페이지 네비게이션
  // 줌 기능
  // 모바일 터치 지원
};
```

#### `PDFControls.tsx`
```typescript
interface PDFControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  zoom: number;
}

const PDFControls: React.FC<PDFControlsProps> = ({ ... }) => {
  // 페이지 네비게이션
  // 줌 컨트롤
  // 검색 기능 (향후 확장)
};
```

### 4. 채팅 시스템 확장

#### 수정된 `ChatContainer.tsx`
```typescript
interface ChatContainerProps {
  sessionId: string;
  contextInfo?: ContextInfo;       // 새로운 컨텍스트
  onContextUpdate?: (context: ContextInfo) => void;
}

// 기존 기능 + 컨텍스트 관리 추가
```

#### 수정된 `MessageInput.tsx`  
```typescript
interface MessageInputProps {
  onSendMessage: (text: string, context?: ContextInfo) => void;
  contextInfo?: ContextInfo;       // 현재 컨텍스트 표시
  placeholder?: string;
  disabled?: boolean;
}

// 컨텍스트 표시 UI 추가
// "현재 문서: 화재안전.pdf (3페이지)" 표시
```

---

## 🔗 상태 관리 전략

### Context Providers 구조
```typescript
// 1. GoogleDriveProvider
interface DriveContextValue {
  isAuthenticated: boolean;
  sessionId: string | null;
  files: DriveFile[];
  selectedFile: DriveFile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  authenticate: () => Promise<void>;
  loadFiles: () => Promise<void>;
  selectFile: (file: DriveFile) => void;
  uploadFile: (file: File) => Promise<DriveFile>;
}

// 2. PDFProvider  
interface PDFContextValue {
  currentPage: number;
  totalPages: number;
  zoom: number;
  selectedText: string | null;
  loading: boolean;
  
  // Actions
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  selectText: (text: string) => void;
}

// 3. ContextChatProvider (새로운 통합 Provider)
interface ContextChatValue {
  contextInfo: ContextInfo | null;
  updateContext: (info: Partial<ContextInfo>) => void;
  generateContextPrompt: () => string;
}
```

### Custom Hooks

#### `useGoogleDrive.ts`
```typescript
const useGoogleDrive = () => {
  // Drive API 호출 로직
  // 인증 상태 관리
  // 파일 CRUD 작업
  // 에러 처리 및 재시도
};
```

#### `usePDFViewer.ts`
```typescript
const usePDFViewer = (fileUrl: string) => {
  // PDF 로딩 및 렌더링
  // 페이지 상태 관리
  // 텍스트 선택 처리
  // 성능 최적화
};
```

#### `useContextChat.ts`
```typescript
const useContextChat = () => {
  // 컨텍스트 기반 채팅
  // 프롬프트 생성
  // 메시지 히스토리 관리
};
```

---

## 🔄 핵심 비즈니스 로직

### 1. 컨텍스트 생성 알고리즘
```typescript
const generateContextPrompt = (contextInfo: ContextInfo, message: string): string => {
  let contextPrompt = `사용자가 현재 다음 문서를 보고 있습니다:\n`;
  
  if (contextInfo.fileName) {
    contextPrompt += `문서명: ${contextInfo.fileName}\n`;
  }
  
  if (contextInfo.currentPage && contextInfo.totalPages) {
    contextPrompt += `현재 페이지: ${contextInfo.currentPage}/${contextInfo.totalPages}\n`;
  }
  
  if (contextInfo.selectedText) {
    contextPrompt += `선택된 텍스트: "${contextInfo.selectedText}"\n`;
  }
  
  contextPrompt += `\n사용자 질문: ${message}\n\n`;
  contextPrompt += `위 컨텍스트를 고려하여 안전 관련 상담을 제공해주세요.`;
  
  return contextPrompt;
};
```

### 2. 텍스트 선택 처리
```typescript
const handleTextSelection = (selectedText: string, pageNumber: number) => {
  if (selectedText.length < 10) return; // 너무 짧은 선택 무시
  
  // 컨텍스트 업데이트
  updateContext({
    selectedText,
    currentPage: pageNumber
  });
  
  // 자동 질문 생성 (옵션)
  const suggestedQuestion = `"${selectedText.substring(0, 50)}..." 이 부분에 대해 자세히 설명해주세요.`;
  
  // 입력창에 미리 채워넣기 (UX 개선)
  setDraftMessage(suggestedQuestion);
};
```

### 3. 파일 캐싱 전략
```typescript
const fileCacheManager = {
  // 메모리 캐시 (작은 파일용)
  memoryCache: new Map<string, ArrayBuffer>(),
  
  // IndexedDB 캐시 (큰 파일용)
  async cacheFile(fileId: string, data: ArrayBuffer): Promise<void> {
    if (data.byteLength < 10 * 1024 * 1024) { // 10MB 미만
      this.memoryCache.set(fileId, data);
    } else {
      // IndexedDB에 저장
      await this.storeInIndexedDB(fileId, data);
    }
  },
  
  async getCachedFile(fileId: string): Promise<ArrayBuffer | null> {
    // 메모리 캐시 우선 확인
    const cached = this.memoryCache.get(fileId);
    if (cached) return cached;
    
    // IndexedDB 확인
    return await this.getFromIndexedDB(fileId);
  }
};
```

---

## ⚠️ 에러 처리 전략

### 1. Google Drive API 에러
```typescript
const handleDriveError = (error: any) => {
  switch (error.code) {
    case 401:
      // 토큰 만료 - 재인증 필요
      return { type: 'AUTH_EXPIRED', action: 'REAUTH_REQUIRED' };
    case 403:
      // 권한 부족
      return { type: 'PERMISSION_DENIED', action: 'SHOW_PERMISSION_GUIDE' };
    case 404:
      // 파일 없음
      return { type: 'FILE_NOT_FOUND', action: 'REFRESH_FILE_LIST' };
    case 429:
      // 할당량 초과
      return { type: 'QUOTA_EXCEEDED', action: 'RETRY_LATER' };
    default:
      return { type: 'UNKNOWN_ERROR', action: 'SHOW_GENERIC_ERROR' };
  }
};
```

### 2. PDF 렌더링 에러
```typescript
const handlePDFError = (error: Error) => {
  if (error.message.includes('Invalid PDF')) {
    return 'PDF 파일이 손상되었거나 지원되지 않는 형식입니다.';
  }
  
  if (error.message.includes('Password')) {
    return '비밀번호로 보호된 PDF는 지원되지 않습니다.';
  }
  
  return 'PDF를 로드하는 중 오류가 발생했습니다. 다시 시도해주세요.';
};
```

### 3. 네트워크 오류 재시도
```typescript
const retryWithBackoff = async <T>(
  fn: () => Promise<T>, 
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};
```

---

## 🚀 성능 최적화 방안

### 1. PDF 렌더링 최적화
```typescript
// 가상화된 페이지 렌더링
const PDFVirtualizedViewer = () => {
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  
  // Intersection Observer로 보이는 페이지만 렌더링
  const observerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const pageNum = parseInt(entry.target.getAttribute('data-page') || '0');
        if (entry.isIntersecting) {
          setVisiblePages(prev => new Set([...prev, pageNum]));
        } else {
          setVisiblePages(prev => {
            const newSet = new Set(prev);
            newSet.delete(pageNum);
            return newSet;
          });
        }
      });
    });
    
    observer.observe(node);
  }, []);
};
```

### 2. 파일 목록 가상화
```typescript
// react-window 사용
const VirtualizedFileList = ({ files }: { files: DriveFile[] }) => {
  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
    <div style={style}>
      <FileListItem file={files[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={400}
      itemCount={files.length}
      itemSize={80}
      overscanCount={5}
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 3. API 응답 캐싱
```typescript
// SWR 또는 React Query 패턴
const useFilesCache = (sessionId: string) => {
  const [cache, setCache] = useState<Map<string, DriveFile[]>>(new Map());
  
  const getFiles = useCallback(async (force = false) => {
    const cacheKey = `files_${sessionId}`;
    
    if (!force && cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }
    
    const files = await fetchFiles(sessionId);
    setCache(prev => new Map(prev).set(cacheKey, files));
    return files;
  }, [sessionId, cache]);
  
  return { getFiles };
};
```

---

*이 문서는 Claude Code가 작성한 기술 아키텍처 설계서입니다.*
*Gemini CLI의 구체적인 구현을 위한 완전한 기술 명세를 제공합니다.*