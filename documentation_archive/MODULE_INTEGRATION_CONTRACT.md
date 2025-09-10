# 🔗 모듈 간 통신 인터페이스 규약
> 완벽한 모듈 통합을 위한 통신 계약서

## 📑 목차
1. [통신 아키텍처 개요](#통신-아키텍처-개요)
2. [이벤트 기반 통신](#이벤트-기반-통신)
3. [API 통신 규약](#api-통신-규약)
4. [상태 동기화 패턴](#상태-동기화-패턴)
5. [에러 전파 메커니즘](#에러-전파-메커니즘)

---

## 🏗️ 통신 아키텍처 개요

### 통신 계층 구조
```
┌─────────────────────────────────────────┐
│                 UI Layer                │ ← React Components
├─────────────────────────────────────────┤
│            Integration Layer            │ ← Event Bus, State Sync
├─────────────────────────────────────────┤
│               Module Layer              │ ← Business Logic
├─────────────────────────────────────────┤
│             Transport Layer             │ ← HTTP, WebSocket, etc.
└─────────────────────────────────────────┘
```

### 통신 유형별 적용 원칙
```typescript
export enum CommunicationType {
  // 🔄 실시간 양방향 통신 (WebSocket)
  REALTIME_BIDIRECTIONAL = 'realtime_bidirectional',
  
  // 📡 이벤트 기반 통신 (EventBus)
  EVENT_DRIVEN = 'event_driven',
  
  // 🌐 HTTP API 통신 (REST/GraphQL)
  HTTP_API = 'http_api',
  
  // 🗃️ 상태 공유 통신 (Context/Redux)
  STATE_SHARING = 'state_sharing',
  
  // 🔌 Direct 함수 호출
  DIRECT_CALL = 'direct_call'
}

// 통신 유형 선택 가이드
export const COMMUNICATION_SELECTION_GUIDE = {
  realtime_chat: CommunicationType.REALTIME_BIDIRECTIONAL,
  module_events: CommunicationType.EVENT_DRIVEN,
  data_fetching: CommunicationType.HTTP_API,
  global_state: CommunicationType.STATE_SHARING,
  utility_functions: CommunicationType.DIRECT_CALL
} as const;
```

---

## 📡 이벤트 기반 통신

### 이벤트 정의 표준
```typescript
// shared/events/eventTypes.ts
export interface BaseEvent<TPayload = any> {
  readonly type: string;
  readonly payload: TPayload;
  readonly timestamp: number;
  readonly source: string;
  readonly correlationId?: string;
  readonly metadata?: EventMetadata;
}

export interface EventMetadata {
  readonly userId?: string;
  readonly sessionId?: string;
  readonly version: string;
  readonly environment: 'development' | 'staging' | 'production';
}

// 이벤트 타입 정의
export const EVENT_TYPES = {
  // 🔐 인증 관련 이벤트
  AUTH: {
    USER_LOGIN_REQUESTED: 'auth:user_login_requested',
    USER_LOGIN_SUCCESS: 'auth:user_login_success',  
    USER_LOGIN_FAILED: 'auth:user_login_failed',
    USER_LOGOUT: 'auth:user_logout',
    SESSION_EXPIRED: 'auth:session_expired',
    PERMISSION_CHANGED: 'auth:permission_changed'
  },
  
  // 💬 채팅 관련 이벤트
  CHAT: {
    SESSION_STARTED: 'chat:session_started',
    SESSION_ENDED: 'chat:session_ended',
    MESSAGE_SENT: 'chat:message_sent',
    MESSAGE_RECEIVED: 'chat:message_received',
    MESSAGE_TYPING: 'chat:message_typing',
    MESSAGE_READ: 'chat:message_read',
    CONNECTION_STATUS_CHANGED: 'chat:connection_status_changed'
  },
  
  // 📢 공지사항 관련 이벤트
  NOTICE: {
    NOTICE_CREATED: 'notice:notice_created',
    NOTICE_UPDATED: 'notice:notice_updated',
    NOTICE_DELETED: 'notice:notice_deleted',
    NOTICE_READ: 'notice:notice_read',
    URGENT_NOTICE_BROADCAST: 'notice:urgent_notice_broadcast'
  },
  
  // 🛡️ 안전 관련 이벤트
  SAFETY: {
    ALERT_TRIGGERED: 'safety:alert_triggered',
    INCIDENT_REPORTED: 'safety:incident_reported',
    SAFETY_CHECK_COMPLETED: 'safety:safety_check_completed',
    EMERGENCY_DECLARED: 'safety:emergency_declared'
  },
  
  // 🎛️ 시스템 이벤트
  SYSTEM: {
    MODULE_INITIALIZED: 'system:module_initialized',
    MODULE_ERROR: 'system:module_error',
    CONFIG_UPDATED: 'system:config_updated',
    HEALTH_CHECK_FAILED: 'system:health_check_failed'
  }
} as const;
```

### 이벤트 버스 구현
```typescript
// shared/events/EventBus.ts
export class EventBus {
  private listeners = new Map<string, Set<EventListener>>();
  private middlewares: EventMiddleware[] = [];
  private eventHistory: BaseEvent[] = [];
  private maxHistorySize = 1000;
  
  // 이벤트 리스너 등록
  on<TPayload>(
    eventType: string, 
    listener: EventListener<TPayload>,
    options?: ListenerOptions
  ): () => void {
    const listeners = this.listeners.get(eventType) || new Set();
    
    const wrappedListener = this.wrapListener(listener, options);
    listeners.add(wrappedListener);
    this.listeners.set(eventType, listeners);
    
    // 구독 해제 함수 반환
    return () => {
      listeners.delete(wrappedListener);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }
  
  // 일회성 리스너
  once<TPayload>(
    eventType: string,
    listener: EventListener<TPayload>
  ): Promise<BaseEvent<TPayload>> {
    return new Promise((resolve) => {
      const unsubscribe = this.on(eventType, (event) => {
        unsubscribe();
        listener(event);
        resolve(event);
      });
    });
  }
  
  // 이벤트 발생
  emit<TPayload>(event: BaseEvent<TPayload>): void {
    // 미들웨어 실행
    const processedEvent = this.applyMiddlewares(event);
    
    // 히스토리 저장
    this.addToHistory(processedEvent);
    
    // 리스너 실행
    const listeners = this.listeners.get(processedEvent.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(processedEvent);
        } catch (error) {
          console.error(`Error in event listener for ${processedEvent.type}:`, error);
        }
      });
    }
  }
  
  // 미들웨어 추가
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }
  
  // 이벤트 히스토리 조회
  getEventHistory(filterType?: string): BaseEvent[] {
    if (filterType) {
      return this.eventHistory.filter(event => event.type === filterType);
    }
    return [...this.eventHistory];
  }
  
  private wrapListener<TPayload>(
    listener: EventListener<TPayload>,
    options?: ListenerOptions
  ): EventListener<TPayload> {
    if (!options) return listener;
    
    let wrappedListener = listener;
    
    // 디바운싱 적용
    if (options.debounce) {
      wrappedListener = this.debounce(wrappedListener, options.debounce);
    }
    
    // 쓰로틀링 적용
    if (options.throttle) {
      wrappedListener = this.throttle(wrappedListener, options.throttle);
    }
    
    return wrappedListener;
  }
  
  private applyMiddlewares<TPayload>(event: BaseEvent<TPayload>): BaseEvent<TPayload> {
    return this.middlewares.reduce(
      (processedEvent, middleware) => middleware(processedEvent),
      event
    );
  }
  
  private addToHistory(event: BaseEvent): void {
    this.eventHistory.push(event);
    
    // 히스토리 크기 제한
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
  
  private debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }
  
  private throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T {
    let lastExecuted = 0;
    return ((...args: any[]) => {
      const now = Date.now();
      if (now - lastExecuted >= delay) {
        lastExecuted = now;
        func(...args);
      }
    }) as T;
  }
}

// 타입 정의
export interface EventListener<TPayload = any> {
  (event: BaseEvent<TPayload>): void | Promise<void>;
}

export interface EventMiddleware {
  <TPayload>(event: BaseEvent<TPayload>): BaseEvent<TPayload>;
}

export interface ListenerOptions {
  debounce?: number;
  throttle?: number;
  priority?: number;
}

// 글로벌 이벤트 버스 인스턴스
export const globalEventBus = new EventBus();
```

### 이벤트 생성 헬퍼
```typescript
// shared/events/eventCreators.ts
export function createEvent<TPayload>(
  type: string,
  payload: TPayload,
  source: string,
  metadata?: Partial<EventMetadata>
): BaseEvent<TPayload> {
  return {
    type,
    payload,
    timestamp: Date.now(),
    source,
    correlationId: generateCorrelationId(),
    metadata: {
      version: '1.0.0',
      environment: process.env.NODE_ENV as any || 'development',
      ...metadata
    }
  };
}

// 모듈별 이벤트 생성자
export const authEventCreators = {
  userLoginSuccess: (user: UserProfile): BaseEvent<UserProfile> =>
    createEvent(EVENT_TYPES.AUTH.USER_LOGIN_SUCCESS, user, 'auth-module'),
    
  userLogout: (userId: string): BaseEvent<{ userId: string }> =>
    createEvent(EVENT_TYPES.AUTH.USER_LOGOUT, { userId }, 'auth-module'),
    
  sessionExpired: (sessionId: string): BaseEvent<{ sessionId: string }> =>
    createEvent(EVENT_TYPES.AUTH.SESSION_EXPIRED, { sessionId }, 'auth-module')
};

export const chatEventCreators = {
  messageSent: (message: ChatMessage): BaseEvent<ChatMessage> =>
    createEvent(EVENT_TYPES.CHAT.MESSAGE_SENT, message, 'chat-module'),
    
  sessionStarted: (session: ChatSession): BaseEvent<ChatSession> =>
    createEvent(EVENT_TYPES.CHAT.SESSION_STARTED, session, 'chat-module'),
    
  connectionStatusChanged: (status: ConnectionStatus): BaseEvent<{ status: ConnectionStatus }> =>
    createEvent(EVENT_TYPES.CHAT.CONNECTION_STATUS_CHANGED, { status }, 'chat-module')
};

function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## 🌐 API 통신 규약

### HTTP 클라이언트 표준
```typescript
// shared/api/ApiClient.ts
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private interceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  
  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers
    };
  }
  
  // GET 요청
  async get<TResponse>(
    endpoint: string,
    params?: RequestParams,
    options?: RequestOptions
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse>({
      method: 'GET',
      endpoint,
      params,
      ...options
    });
  }
  
  // POST 요청
  async post<TRequest, TResponse>(
    endpoint: string,
    data?: TRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse>({
      method: 'POST',
      endpoint,
      data,
      ...options
    });
  }
  
  // PUT 요청
  async put<TRequest, TResponse>(
    endpoint: string,
    data?: TRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse>({
      method: 'PUT',
      endpoint,
      data,
      ...options
    });
  }
  
  // DELETE 요청
  async delete<TResponse>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse>({
      method: 'DELETE',
      endpoint,
      ...options
    });
  }
  
  // 통합 요청 메서드
  private async request<TResponse>(
    config: FullRequestConfig
  ): Promise<ApiResponse<TResponse>> {
    try {
      // 요청 인터셉터 적용
      const processedConfig = this.applyRequestInterceptors(config);
      
      // 실제 HTTP 요청
      const response = await fetch(
        this.buildURL(processedConfig.endpoint, processedConfig.params),
        {
          method: processedConfig.method,
          headers: { ...this.defaultHeaders, ...processedConfig.headers },
          body: processedConfig.data ? JSON.stringify(processedConfig.data) : undefined,
          signal: processedConfig.signal,
          ...processedConfig.fetchOptions
        }
      );
      
      // 응답 처리
      const apiResponse = await this.processResponse<TResponse>(response);
      
      // 응답 인터셉터 적용
      return this.applyResponseInterceptors(apiResponse);
      
    } catch (error) {
      return this.handleRequestError(error, config);
    }
  }
  
  private async processResponse<TResponse>(
    response: Response
  ): Promise<ApiResponse<TResponse>> {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    
    try {
      const data = isJson ? await response.json() : await response.text();
      
      if (response.ok) {
        return {
          success: true,
          data,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        };
      } else {
        return {
          success: false,
          data: null,
          error: {
            code: data.code || 'HTTP_ERROR',
            message: data.message || response.statusText,
            details: { status: response.status, data },
            timestamp: new Date().toISOString()
          },
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        };
      }
    } catch (parseError) {
      return {
        success: false,
        data: null,
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to parse response',
          details: { parseError },
          timestamp: new Date().toISOString()
        },
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    }
  }
  
  // 인터셉터 관리
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.interceptors.push(interceptor);
  }
  
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }
  
  private applyRequestInterceptors(config: FullRequestConfig): FullRequestConfig {
    return this.interceptors.reduce(
      (processedConfig, interceptor) => interceptor(processedConfig),
      config
    );
  }
  
  private applyResponseInterceptors<T>(
    response: ApiResponse<T>
  ): ApiResponse<T> {
    return this.responseInterceptors.reduce(
      (processedResponse, interceptor) => interceptor(processedResponse),
      response
    );
  }
}

// 타입 정의
export interface ApiClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
  fetchOptions?: RequestInit;
}

export interface FullRequestConfig extends RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  params?: RequestParams;
  data?: any;
}

export interface RequestInterceptor {
  (config: FullRequestConfig): FullRequestConfig;
}

export interface ResponseInterceptor {
  <T>(response: ApiResponse<T>): ApiResponse<T>;
}

export type RequestParams = Record<string, string | number | boolean>;
```

### 모듈별 API 서비스 계약
```typescript
// modules/chat/api/chatApi.ts
export interface ChatApiContract {
  // 세션 관리
  startSession(userId: string): Promise<ApiResponse<ChatSession>>;
  endSession(sessionId: string): Promise<ApiResponse<void>>;
  getSession(sessionId: string): Promise<ApiResponse<ChatSession>>;
  
  // 메시지 관리
  sendMessage(message: SendMessageRequest): Promise<ApiResponse<ChatMessage>>;
  getMessageHistory(request: MessageHistoryRequest): Promise<ApiResponse<ChatMessage[]>>;
  markMessageAsRead(messageId: string): Promise<ApiResponse<void>>;
  
  // 파일 업로드
  uploadFile(file: File, sessionId: string): Promise<ApiResponse<Attachment>>;
}

export class ChatApiService implements ChatApiContract {
  constructor(private apiClient: ApiClient) {}
  
  async startSession(userId: string): Promise<ApiResponse<ChatSession>> {
    return this.apiClient.post<{ userId: string }, ChatSession>(
      '/chat/sessions',
      { userId }
    );
  }
  
  async sendMessage(request: SendMessageRequest): Promise<ApiResponse<ChatMessage>> {
    return this.apiClient.post<SendMessageRequest, ChatMessage>(
      '/chat/messages',
      request
    );
  }
  
  // ... 기타 메서드 구현
}

// modules/notice/api/noticeApi.ts  
export interface NoticeApiContract {
  getNotices(filters: NoticeFilters): Promise<ApiResponse<Notice[]>>;
  getNotice(id: string): Promise<ApiResponse<Notice>>;
  createNotice(notice: CreateNoticeRequest): Promise<ApiResponse<Notice>>;
  updateNotice(id: string, updates: UpdateNoticeRequest): Promise<ApiResponse<Notice>>;
  deleteNotice(id: string): Promise<ApiResponse<void>>;
  markAsRead(id: string, userId: string): Promise<ApiResponse<void>>;
}
```

---

## 🔄 상태 동기화 패턴

### 전역 상태 관리 계약
```typescript
// shared/state/StateManager.ts
export interface StateManager<TState> {
  getState(): TState;
  setState(updater: StateUpdater<TState>): void;
  subscribe(listener: StateListener<TState>): () => void;
  dispatch(action: StateAction): void;
}

export interface StateModule<TModuleState> {
  name: string;
  initialState: TModuleState;
  reducer: StateReducer<TModuleState>;
  actions: Record<string, ActionCreator>;
  selectors: Record<string, StateSelector<any>>;
}

// 모듈 상태 정의
export interface AppState {
  auth: AuthState;
  chat: ChatState;
  notice: NoticeState;
  safety: SafetyState;
  ui: UIState;
}

// 상태 동기화 브릿지
export class StateSyncBridge {
  private stateManager: StateManager<AppState>;
  private eventBus: EventBus;
  
  constructor(stateManager: StateManager<AppState>, eventBus: EventBus) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.setupSyncListeners();
  }
  
  private setupSyncListeners(): void {
    // 상태 변경을 이벤트로 전파
    this.stateManager.subscribe((state, prevState) => {
      const changes = this.detectStateChanges(state, prevState);
      
      changes.forEach(change => {
        this.eventBus.emit(createEvent(
          `state:${change.module}:${change.field}_changed`,
          { newValue: change.newValue, oldValue: change.oldValue },
          'state-sync-bridge'
        ));
      });
    });
    
    // 이벤트를 상태 변경으로 반영
    this.eventBus.on('*', (event) => {
      if (this.isStateEvent(event)) {
        this.handleStateEvent(event);
      }
    });
  }
  
  private detectStateChanges(
    newState: AppState, 
    prevState: AppState
  ): StateChange[] {
    const changes: StateChange[] = [];
    
    Object.keys(newState).forEach(moduleKey => {
      const moduleName = moduleKey as keyof AppState;
      const newModuleState = newState[moduleName];
      const prevModuleState = prevState[moduleName];
      
      Object.keys(newModuleState).forEach(field => {
        if (newModuleState[field] !== prevModuleState[field]) {
          changes.push({
            module: moduleName,
            field,
            newValue: newModuleState[field],
            oldValue: prevModuleState[field]
          });
        }
      });
    });
    
    return changes;
  }
}

interface StateChange {
  module: keyof AppState;
  field: string;
  newValue: any;
  oldValue: any;
}
```

---

## ⚠️ 에러 전파 메커니즘

### 모듈 간 에러 전파 시스템
```typescript
// shared/errors/ErrorPropagation.ts
export class ErrorPropagationSystem {
  private eventBus: EventBus;
  private errorHandlers = new Map<string, ErrorHandler[]>();
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupErrorPropagation();
  }
  
  // 에러 핸들러 등록
  registerErrorHandler(
    moduleSource: string,
    handler: ErrorHandler
  ): void {
    const handlers = this.errorHandlers.get(moduleSource) || [];
    handlers.push(handler);
    this.errorHandlers.set(moduleSource, handlers);
  }
  
  // 에러 전파
  propagateError(error: ModuleError): void {
    // 1. 로깅
    console.error(`[${error.source}] ${error.code}: ${error.message}`, error.details);
    
    // 2. 이벤트 발생
    this.eventBus.emit(createEvent(
      EVENT_TYPES.SYSTEM.MODULE_ERROR,
      error,
      'error-propagation-system'
    ));
    
    // 3. 관련 모듈 핸들러 실행
    this.executeErrorHandlers(error);
    
    // 4. 글로벌 에러 처리
    this.handleGlobalError(error);
  }
  
  private setupErrorPropagation(): void {
    // 모듈별 에러 이벤트 구독
    Object.values(EVENT_TYPES).forEach(moduleEvents => {
      Object.values(moduleEvents).forEach(eventType => {
        if (eventType.includes('error') || eventType.includes('failed')) {
          this.eventBus.on(eventType, (event) => {
            this.handleModuleErrorEvent(event);
          });
        }
      });
    });
  }
  
  private executeErrorHandlers(error: ModuleError): void {
    const handlers = this.errorHandlers.get(error.source) || [];
    handlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }
  
  private handleGlobalError(error: ModuleError): void {
    // 심각한 에러의 경우 전체 시스템 알림
    if (error.severity === 'critical') {
      this.eventBus.emit(createEvent(
        'system:critical_error_detected',
        { error, timestamp: Date.now() },
        'error-propagation-system'
      ));
    }
  }
}

export interface ModuleError {
  code: string;
  message: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
  stack?: string;
  timestamp: string;
  correlationId?: string;
}

export interface ErrorHandler {
  (error: ModuleError): void | Promise<void>;
}

// 모듈별 에러 생성자
export const createModuleError = (
  source: string,
  code: string,
  message: string,
  severity: ModuleError['severity'] = 'medium',
  details?: Record<string, any>
): ModuleError => ({
  code,
  message,
  source,
  severity,
  details,
  stack: new Error().stack,
  timestamp: new Date().toISOString(),
  correlationId: generateCorrelationId()
});
```

---

## 🛠️ 실전 구현 예시

### 채팅 모듈 통합 예시
```typescript
// modules/chat/ChatModule.ts
export class ChatModule {
  private apiService: ChatApiService;
  private eventBus: EventBus;
  private stateManager: StateManager<ChatState>;
  
  constructor(dependencies: ChatModuleDependencies) {
    this.apiService = dependencies.apiService;
    this.eventBus = dependencies.eventBus;
    this.stateManager = dependencies.stateManager;
    
    this.setupEventListeners();
  }
  
  async initialize(): Promise<void> {
    // 모듈 초기화
    this.eventBus.emit(createEvent(
      EVENT_TYPES.SYSTEM.MODULE_INITIALIZED,
      { module: 'chat', version: '1.0.0' },
      'chat-module'
    ));
    
    // 인증 상태 확인 요청
    this.eventBus.emit(createEvent(
      'chat:auth_status_requested',
      {},
      'chat-module'
    ));
  }
  
  private setupEventListeners(): void {
    // 사용자 로그인 이벤트 처리
    this.eventBus.on(EVENT_TYPES.AUTH.USER_LOGIN_SUCCESS, (event) => {
      this.handleUserLogin(event.payload);
    });
    
    // 사용자 로그아웃 이벤트 처리
    this.eventBus.on(EVENT_TYPES.AUTH.USER_LOGOUT, (event) => {
      this.handleUserLogout(event.payload.userId);
    });
    
    // 긴급 공지 알림 처리
    this.eventBus.on(EVENT_TYPES.NOTICE.URGENT_NOTICE_BROADCAST, (event) => {
      this.handleUrgentNotice(event.payload);
    });
  }
  
  async sendMessage(content: string): Promise<void> {
    try {
      const result = await this.apiService.sendMessage({
        content,
        sessionId: this.stateManager.getState().currentSessionId,
        type: 'user'
      });
      
      if (result.success) {
        // 메시지 전송 성공 이벤트
        this.eventBus.emit(chatEventCreators.messageSent(result.data!));
      } else {
        // 에러 처리
        this.handleSendMessageError(result.error!);
      }
    } catch (error) {
      this.handleSendMessageError(error);
    }
  }
  
  private handleUserLogin(user: UserProfile): void {
    // 채팅 세션 시작
    this.startChatSession(user.id);
  }
  
  private handleUserLogout(userId: string): void {
    // 현재 세션 정리
    this.endCurrentSession();
  }
  
  private handleUrgentNotice(notice: Notice): void {
    // 채팅 창에 긴급 공지 표시
    this.displayUrgentNoticeInChat(notice);
  }
}
```

이 통신 규약을 따르면 **모듈 간 완벽한 통합**과 **견고한 에러 처리**를 보장할 수 있습니다! 🚀