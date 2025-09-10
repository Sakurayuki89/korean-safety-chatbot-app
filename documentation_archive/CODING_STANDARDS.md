# 🎯 코딩 표준 & 함수/값 정의 지침서
> 완벽한 모듈 통합을 위한 코딩 네트워크 표준

## 📖 목차
1. [네이밍 규칙](#네이밍-규칙)
2. [타입 정의 표준](#타입-정의-표준)
3. [함수 설계 원칙](#함수-설계-원칙)
4. [상태 관리 패턴](#상태-관리-패턴)
5. [에러 처리 전략](#에러-처리-전략)

---

## 🏷️ 네이밍 규칙

### 변수명 컨벤션
```typescript
// ✅ 올바른 명명법
const userAuthToken = 'jwt-token';           // camelCase
const MAX_RETRY_COUNT = 3;                   // 상수는 SCREAMING_SNAKE_CASE
const isUserLoggedIn = false;                // boolean은 is/has/can 접두사
const hasPermission = true;
const canAccessAdmin = false;

// ❌ 잘못된 명명법  
const token = 'jwt';                         // 너무 짧음
const userAuthenticationTokenValue = '';     // 너무 길음
const loggedIn = false;                      // boolean 의미 불명확
```

### 함수명 설계 패턴
```typescript
// ✅ 동사 + 명사 + 목적 패턴
async function fetchUserProfile(userId: string): Promise<UserProfile> {}
async function validateEmailAddress(email: string): Promise<boolean> {}
async function sendChatMessage(message: ChatMessage): Promise<void> {}
function parseApiResponse<T>(response: Response): Promise<ApiResult<T>> {}

// ✅ 핸들러 함수는 handle/on 접두사
function handleUserLogin(credentials: LoginCredentials): void {}
function onMessageReceived(message: ChatMessage): void {}
function handleApiError(error: ApiError): void {}

// ✅ 유틸리티 함수는 목적 명시
function formatTimestamp(timestamp: number, format?: string): string {}
function validateRequired(value: any, fieldName: string): boolean {}
function debounce<T extends (...args: any[]) => any>(
  func: T, 
  delay: number
): (...args: Parameters<T>) => void {}
```

### 컴포넌트명 규칙
```typescript
// ✅ 컴포넌트: PascalCase + 목적/역할 명시
export const ChatMessageInput: React.FC<ChatInputProps> = () => {};
export const UserProfileCard: React.FC<ProfileCardProps> = () => {};
export const NotificationBanner: React.FC<BannerProps> = () => {};

// ✅ 커스텀 훅: use 접두사 + 기능명
export function useUserAuthentication() {
  // 인증 로직
}

export function useChatWebSocket(roomId: string) {
  // WebSocket 연결 로직  
}

export function useApiRequest<T>(endpoint: string) {
  // API 요청 로직
}
```

---

## 🧬 타입 정의 표준

### 기본 타입 구조
```typescript
// shared/types/base.ts
export interface BaseEntity {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ApiResponse<TData = unknown> {
  readonly success: boolean;
  readonly data: TData | null;
  readonly message?: string;
  readonly error?: ApiError;
  readonly metadata?: ResponseMetadata;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, any>;
  readonly timestamp: string;
}

export interface ResponseMetadata {
  readonly requestId: string;
  readonly timestamp: string;
  readonly version: string;
}
```

### 도메인별 타입 정의
```typescript
// modules/chat/types.ts
export interface ChatMessage extends BaseEntity {
  readonly content: string;
  readonly senderId: string;
  readonly recipientId?: string;
  readonly type: MessageType;
  readonly status: MessageStatus;
  readonly attachments?: readonly Attachment[];
  readonly replyTo?: string;
}

export type MessageType = 
  | 'user'
  | 'bot' 
  | 'system'
  | 'notification';

export type MessageStatus = 
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface ChatSession extends BaseEntity {
  readonly userId: string;
  readonly botId: string;
  readonly status: SessionStatus;
  readonly context: ChatContext;
  readonly messages: readonly ChatMessage[];
  readonly metadata: SessionMetadata;
}

export interface ChatContext {
  readonly topic?: string;
  readonly userProfile: UserProfile;
  readonly sessionVariables: Record<string, any>;
  readonly conversationHistory: readonly string[];
}
```

### 설정 및 상수 타입
```typescript
// shared/types/config.ts
export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly ssl: boolean;
  readonly connectionTimeout: number;
  readonly maxConnections: number;
}

export interface ApiConfig {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retryCount: number;
  readonly headers: Record<string, string>;
  readonly rateLimiting: RateLimitConfig;
}

export interface RateLimitConfig {
  readonly requestsPerMinute: number;
  readonly burstLimit: number;
  readonly windowSizeMs: number;
}
```

---

## ⚙️ 함수 설계 원칙

### 순수 함수 우선 원칙
```typescript
// ✅ 순수 함수 - 예측 가능하고 테스트 용이
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  return Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export function formatCurrency(
  amount: number, 
  currency: string = 'KRW',
  locale: string = 'ko-KR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

// ✅ 불변성 유지
export function addMessageToHistory(
  history: readonly ChatMessage[],
  newMessage: ChatMessage
): readonly ChatMessage[] {
  return [...history, newMessage];
}

export function updateUserProfile(
  currentProfile: UserProfile,
  updates: Partial<UserProfile>
): UserProfile {
  return {
    ...currentProfile,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}
```

### 비동기 함수 패턴
```typescript
// ✅ Result 패턴으로 에러 처리
export type Result<TSuccess, TError = Error> = 
  | { success: true; data: TSuccess }
  | { success: false; error: TError };

export async function fetchUserData(userId: string): Promise<Result<UserProfile, ApiError>> {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: response.statusText,
          details: { status: response.status },
          timestamp: new Date().toISOString()
        }
      };
    }
    
    const userData = await response.json();
    return { success: true, data: userData };
    
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { error },
        timestamp: new Date().toISOString()
      }
    };
  }
}

// ✅ 재시도 로직 포함
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = { maxAttempts: 3, delay: 1000 }
): Promise<T> {
  const { maxAttempts, delay, backoffMultiplier = 2 } = options;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Retry attempts exceeded');
}

interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoffMultiplier?: number;
}
```

### 고차 함수 패턴
```typescript
// ✅ 함수 조합을 통한 재사용성 향상
export function pipe<T>(...fns: Array<(arg: T) => T>) {
  return (value: T): T => fns.reduce((acc, fn) => fn(acc), value);
}

export function compose<T>(...fns: Array<(arg: T) => T>) {
  return (value: T): T => fns.reduceRight((acc, fn) => fn(acc), value);
}

// 사용 예시
const processUserInput = pipe(
  (input: string) => input.trim(),
  (input: string) => input.toLowerCase(), 
  (input: string) => input.replace(/[^a-z0-9]/g, ''),
  (input: string) => input.substring(0, 50)
);

// ✅ 커링을 통한 부분 적용
export function createValidator<T>(
  validationRules: ValidationRule<T>[]
) {
  return function validate(data: T): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of validationRules) {
      const result = rule(data);
      if (!result.isValid) {
        errors.push(result.message);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
}

interface ValidationRule<T> {
  (data: T): { isValid: boolean; message: string };
}
```

---

## 🗃️ 상태 관리 패턴

### Context + Reducer 패턴
```typescript
// shared/contexts/AppContext.tsx
interface AppState {
  user: UserProfile | null;
  session: ChatSession | null;
  notifications: Notification[];
  ui: UIState;
}

type AppAction = 
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'CLEAR_USER' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_UI'; payload: Partial<UIState> };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
      
    case 'CLEAR_USER':
      return { ...state, user: null, session: null };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case 'UPDATE_UI':
      return {
        ...state,
        ui: { ...state.ui, ...action.payload }
      };
      
    default:
      return state;
  }
}

export const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
} | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
```

### 커스텀 훅 패턴
```typescript
// hooks/useApiRequest.ts
export function useApiRequest<TData>(
  endpoint: string,
  options: RequestOptions = {}
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const execute = useCallback(async (params?: RequestParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.request<TData>(endpoint, {
        ...options,
        params: { ...options.params, ...params }
      });
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError({
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);
  
  return { data, loading, error, execute };
}

// hooks/useWebSocket.ts
export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<WebSocketState>('disconnected');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  
  const connect = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) return;
    
    const ws = new WebSocket(url);
    
    ws.onopen = () => setConnectionState('connected');
    ws.onclose = () => setConnectionState('disconnected');
    ws.onerror = () => setConnectionState('error');
    ws.onmessage = (event) => setLastMessage(event);
    
    setSocket(ws);
  }, [url, socket]);
  
  const disconnect = useCallback(() => {
    socket?.close();
    setSocket(null);
    setConnectionState('disconnected');
  }, [socket]);
  
  const sendMessage = useCallback((message: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, [socket]);
  
  useEffect(() => {
    return () => {
      socket?.close();
    };
  }, [socket]);
  
  return {
    connectionState,
    lastMessage,
    connect,
    disconnect,
    sendMessage
  };
}
```

---

## ⚠️ 에러 처리 전략

### 통합 에러 처리 시스템
```typescript
// shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, any>,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
  
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
      timestamp: new Date().toISOString()
    };
  }
}

// 특정 에러 타입들
export class ValidationError extends AppError {
  constructor(field: string, value: any, message: string) {
    super('VALIDATION_ERROR', message, { field, value }, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super('AUTH_ERROR', message, {}, 401);
  }
}

export class NetworkError extends AppError {
  constructor(url: string, status?: number) {
    super('NETWORK_ERROR', `Network request failed: ${url}`, { url }, status);
  }
}

// 에러 처리 유틸리티
export function handleAsyncError<T>(
  promise: Promise<T>
): Promise<[Error | null, T | null]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[Error, null]>((error: Error) => [error, null]);
}

// 글로벌 에러 핸들러
export function setupGlobalErrorHandler() {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // 에러 리포팅 서비스로 전송
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // 에러 리포팅 서비스로 전송
    event.preventDefault();
  });
}
```

### React 에러 바운더리
```typescript
// components/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // 에러 리포팅
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>문제가 발생했습니다</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## 🎯 실전 적용 템플릿

### 새 모듈 생성 템플릿
```typescript
// modules/[module-name]/index.ts
export { default } from './[ModuleName]';
export * from './types';
export * from './constants';
export * from './utils';
export * from './hooks';

// modules/[module-name]/types.ts
import { BaseEntity } from '../../shared/types';

export interface [ModuleName]Entity extends BaseEntity {
  // 모듈별 필드 정의
}

export interface [ModuleName]Config {
  // 설정 인터페이스
}

// modules/[module-name]/constants.ts  
export const [MODULE_NAME]_CONSTANTS = {
  // 모듈별 상수들
} as const;

// modules/[module-name]/services.ts
export class [ModuleName]Service {
  constructor(private config: [ModuleName]Config) {}
  
  async initialize(): Promise<void> {
    // 초기화 로직
  }
  
  async cleanup(): Promise<void> {
    // 정리 로직
  }
}
```

이 표준을 따르면 **모듈 간 완벽한 호환성**과 **확장 가능한 아키텍처**를 보장할 수 있습니다! 🚀