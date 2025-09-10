# 🤖 AI 서비스별 파일 첨부 최적화 가이드

## 🎯 서비스별 특성 분석

### Claude Code (구조 분석 특화)
- **강점**: 프로젝트 전체 구조 이해, 아키텍처 분석
- **첨부 최적**: 설정 파일, 스키마, 문서화 파일
- **토큰 효율**: 압축된 요약 문서 선호

### Gemini CLI (실행 특화)  
- **강점**: 코드 생성, 터미널 명령어, 패키지 관리
- **첨부 최적**: 구체적 명세서, 에러 로그, TODO 리스트
- **토큰 효율**: JSON 형태 구조화된 지시사항

### 웹 AI (검색/서포트 특화)
- **강점**: 에러 해결, 라이브러리 검색, UI/UX 제안  
- **첨부 최적**: 에러 메시지, 스크린샷, 간단한 코드 조각
- **토큰 효율**: 짧은 텍스트, 핵심 키워드

## 📁 첨부 파일 매트릭스

### 계획/분석 단계
```
Claude Code 첨부:
├── PROJECT_STATUS.md      # 전체 현황
├── ARCHITECTURE.md        # 시스템 구조
├── REQUIREMENTS.md        # 기능 요구사항  
└── ISSUES.md             # 발견된 문제점

Gemini CLI: 받지 않음 (계획 단계는 Claude 담당)
웹 AI: 받지 않음
```

### 구현 단계  
```
Gemini CLI 첨부:
├── CURRENT_TASK.md       # 현재 작업 지시
├── code-spec.json        # 구체적 코딩 명세
├── package.json          # 의존성 정보
└── .env.example          # 환경 설정

Claude Code 첨부:
├── PROGRESS.md           # 진행 상황
└── 새로 생성된 코드 파일들

웹 AI: 받지 않음 (구현 단계는 Gemini 담당)
```

### 디버깅 단계
```
Claude Code 첨부:
├── ERROR_LOG.md          # 에러 분석
├── 문제가 된 코드 파일      # 버그 위치
└── SOLUTION_PLAN.md      # 해결 계획

Gemini CLI 첨부:  
├── DEBUG_TASK.md         # 수정 지시사항
└── error-logs.txt        # 터미널 에러

웹 AI 첨부:
├── error-message.txt     # 에러 메시지만
└── minimal-code.js       # 핵심 문제 코드만
```

## 🔄 토큰 효율 최적화 전략

### 📊 파일 크기 가이드라인
```yaml
Claude Code:
  - 단일파일: < 1000줄 (구조 분석용)
  - 문서파일: < 500줄 (계획서, 분석서)  
  - 전체첨부: < 10개 파일

Gemini CLI:
  - 명세서: < 200줄 (구체적 작업 지시)
  - 코드파일: < 300줄 (참조용)
  - 전체첨부: < 5개 파일

웹 AI:
  - 텍스트: < 100줄 (에러, 질문)
  - 코드조각: < 50줄 (핵심만)
  - 전체첨부: < 3개 파일
```

### 🎭 압축 커뮤니케이션  
```javascript
// ❌ 비효율적
"현재 Next.js 프로젝트에서 Supabase 데이터베이스 연결 설정을 구현하고 있는데, 환경변수 설정과 클라이언트 초기화 코드가 필요합니다..."

// ✅ 효율적  
"TASK: Supabase 연결 설정
FILES: lib/supabase.js, .env.example
REQ: DB 클라이언트 초기화 + 환경변수"
```

## 🔗 연속성 유지 전략

### Session Context 파일들
```
📁 session-context/
├── CURRENT_STATE.md      # 현재 상태 (모든 AI가 읽음)
├── NEXT_ACTIONS.md       # 다음 할 일
├── COMPLETED.md          # 완료된 작업들
└── BLOCKERS.md           # 막힌 부분들
```

### 핸드오프 프로토콜
```yaml
Claude → Gemini:
  전달파일: [TASK_SPEC.md, 관련코드파일]
  형식: JSON 구조 + 구체적 지시사항

Gemini → Claude:  
  전달파일: [RESULT.md, 생성된파일들]
  형식: 실행결과 + 발생한 이슈

Claude → 웹 AI:
  전달파일: [ERROR_SUMMARY.txt]  
  형식: 핵심 키워드 + 간단한 컨텍스트
```

## 📈 효율성 측정

### KPI 지표
- **토큰 사용량**: 이전 대비 30-50% 절약 목표
- **응답 정확도**: 첫 시도 성공률 80%+  
- **핸드오프 속도**: AI간 전환 < 2분
- **컨텍스트 유지**: 3회 이상 연속 작업

### 최적화 체크리스트
- [ ] 파일 크기 가이드라인 준수
- [ ] 필요한 파일만 선별적 첨부  
- [ ] 압축된 커뮤니케이션 사용
- [ ] Session Context 정기 업데이트