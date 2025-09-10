# 📚 프로젝트 문서 허브 (INDEX)
> 🎯 **"무엇을 찾고 계신가요?"** - 상황별 똑똑한 문서 가이드

## 🚀 빠른 시작

### 💡 지금 당장 필요한 것은?

| 상황 | 클릭 한 번으로 이동 |
|------|------------------|
| 🆕 **프로젝트 처음 시작** | → [전체 아키텍처 이해하기](#프로젝트-첫-시작) |
| ⚡ **새 기능 개발** | → [개발 가이드](#새-기능-개발-가이드) |
| 🔗 **모듈 연결/통합** | → [통합 가이드](#모듈-통합-가이드) |
| 🐛 **버그 수정/디버깅** | → [문제 해결 가이드](#문제-해결-가이드) |
| ✅ **테스트 & 배포** | → [품질 검증 가이드](#품질-검증-가이드) |

---

## 🧭 상황별 스마트 가이드

### 🆕 프로젝트 첫 시작
**"전체 그림을 이해하고 싶어요"**

```
📖 읽기 순서:
1️⃣ MODULAR_DEVELOPMENT_GUIDE.md (전체 아키텍처)
2️⃣ CODING_STANDARDS.md (개발 규칙)
3️⃣ MODULE_INTEGRATION_CONTRACT.md (모듈 간 통신)
4️⃣ 이 INDEX.md (계속 참조)
```

**💎 핵심 포인트:**
- 📁 [프로젝트 구조](MODULAR_DEVELOPMENT_GUIDE.md#모듈식-아키텍처-설계) 먼저 파악
- 🎯 [개발 원칙](CODING_STANDARDS.md#네이밍-규칙) 숙지
- 🔗 [통신 방식](MODULE_INTEGRATION_CONTRACT.md#이벤트-기반-통신) 이해

### ⚡ 새 기능 개발 가이드
**"새로운 기능을 만들어야 해요"**

#### 🎭 역할별 최적화된 가이드

<details>
<summary><strong>🎨 Frontend 개발자</strong></summary>

**우선순위 문서:**
1. **[CODING_STANDARDS.md § 컴포넌트명 규칙](CODING_STANDARDS.md#컴포넌트명-규칙)**
   - React 컴포넌트 네이밍 + 구조 패턴
2. **[MODULE_INTEGRATION_CONTRACT.md § API 통신 규약](MODULE_INTEGRATION_CONTRACT.md#api-통신-규약)**
   - HTTP 클라이언트 사용법 + 에러 처리
3. **[CODING_STANDARDS.md § 커스텀 훅 패턴](CODING_STANDARDS.md#고차-함수-패턴)**
   - 상태 관리 + 비동기 처리

**체크리스트:**
- [ ] 컴포넌트명이 PascalCase + 목적 명시인가?
- [ ] API 호출이 표준 에러 처리를 포함하는가?
- [ ] 타입 정의가 완료되었는가?

</details>

<details>
<summary><strong>⚙️ Backend 개발자</strong></summary>

**우선순위 문서:**
1. **[MODULAR_DEVELOPMENT_GUIDE.md § 모듈 내부 구조](MODULAR_DEVELOPMENT_GUIDE.md#모듈-내부-구조-표준)**
   - 서비스 레이어 + 비즈니스 로직 구성
2. **[CODING_STANDARDS.md § 함수 설계 원칙](CODING_STANDARDS.md#함수-설계-원칙)**
   - 순수 함수 + Result 패턴 적용
3. **[MODULE_INTEGRATION_CONTRACT.md § 이벤트 생성 헬퍼](MODULE_INTEGRATION_CONTRACT.md#이벤트-생성-헬퍼)**
   - 모듈 간 이벤트 발생 방법

**체크리스트:**
- [ ] Result<Success, Error> 패턴을 사용하는가?
- [ ] 이벤트 기반 통신이 구현되었는가?
- [ ] 에러가 적절히 전파되는가?

</details>

<details>
<summary><strong>🔧 Full-stack 개발자</strong></summary>

**통합 워크플로우:**
```
MODULAR_DEVELOPMENT_GUIDE.md (아키텍처 설계)
         ↓
CODING_STANDARDS.md (구현 표준)
         ↓  
MODULE_INTEGRATION_CONTRACT.md (통신 구현)
         ↓
INTEGRATION_VALIDATION_CHECKLIST.md (검증)
```

**핵심 체크포인트:**
- [ ] 프론트-백엔드 API 계약이 일치하는가?
- [ ] 이벤트 기반 통신이 양쪽에서 동작하는가?
- [ ] 타입 정의가 공유되는가?

</details>

### 🔗 모듈 통합 가이드
**"모듈들을 연결해야 해요"**

**필수 문서:**
- **[MODULE_INTEGRATION_CONTRACT.md](MODULE_INTEGRATION_CONTRACT.md)** (메인 가이드)
- **[INTEGRATION_VALIDATION_CHECKLIST.md § 모듈 간 통신 테스트](INTEGRATION_VALIDATION_CHECKLIST.md#모듈-간-상호작용-매트릭스)** (검증)

**단계별 프로세스:**
```
1️⃣ 이벤트 타입 정의 → EVENT_TYPES 상수 정의
2️⃣ 이벤트 리스너 구현 → EventBus.on() 사용  
3️⃣ 이벤트 발생 구현 → createEvent() 헬퍼 사용
4️⃣ 통합 테스트 실행 → 체크리스트 따라 검증
5️⃣ 에러 처리 확인 → ErrorPropagation 시스템 점검
```

### 🐛 문제 해결 가이드
**"버그를 고치거나 문제를 해결해야 해요"**

#### 🔍 문제 유형별 접근법

| 문제 유형 | 주요 참조 문서 | 핵심 섹션 |
|----------|-------------|----------|
| **타입 에러** | [CODING_STANDARDS.md](CODING_STANDARDS.md) | § 타입 정의 표준 |
| **API 통신 오류** | [MODULE_INTEGRATION_CONTRACT.md](MODULE_INTEGRATION_CONTRACT.md) | § HTTP 통신 규약 |
| **모듈 간 통신 실패** | [MODULE_INTEGRATION_CONTRACT.md](MODULE_INTEGRATION_CONTRACT.md) | § 에러 전파 메커니즘 |
| **성능 이슈** | [CODING_STANDARDS.md](CODING_STANDARDS.md) | § 함수 설계 원칙 |
| **통합 테스트 실패** | [INTEGRATION_VALIDATION_CHECKLIST.md](INTEGRATION_VALIDATION_CHECKLIST.md) | § 통합 테스트 매트릭스 |

#### 🚨 긴급 디버깅 체크리스트
```
□ 에러 메시지에서 모듈명 확인 → 해당 모듈 문서 참조
□ API 호출인가? → HTTP 클라이언트 표준 확인
□ 이벤트 통신인가? → EventBus 구현 상태 점검
□ 타입 에러인가? → 인터페이스 정의 재확인
□ 성능 문제인가? → 순수 함수 패턴 적용 여부 점검
```

### ✅ 품질 검증 가이드
**"테스트하고 배포하고 싶어요"**

**메인 문서:** [INTEGRATION_VALIDATION_CHECKLIST.md](INTEGRATION_VALIDATION_CHECKLIST.md)

**자동화 명령어:**
```bash
# 전체 검증 실행
npm run validate:all

# 단계별 검증
npm run validate:modules      # 모듈 구조 검증
npm run validate:integration  # 통합 검증  
npm run validate:performance  # 성능 검증

# 배포 전 최종 검증
npm run pre-deploy
```

**수동 체크포인트:**
- [ ] [모듈별 단위 테스트](INTEGRATION_VALIDATION_CHECKLIST.md#개발-단계별-체크리스트) 80% 이상
- [ ] [API 통합 테스트](INTEGRATION_VALIDATION_CHECKLIST.md#통합-테스트-매트릭스) 통과
- [ ] [성능 기준](INTEGRATION_VALIDATION_CHECKLIST.md#성능-및-품질-기준) 충족
- [ ] [보안 검사](INTEGRATION_VALIDATION_CHECKLIST.md#배포-전-최종-검증) 통과

---

## 🤔 의사결정 트리

### "어떤 문서를 봐야 할지 모르겠어요"

```
❓ 무엇을 하려고 하시나요?

├── 📋 **계획 단계**
│   ├── 전체 시스템 설계? 
│   │   └── 📖 MODULAR_DEVELOPMENT_GUIDE.md 
│   └── 세부 구현 계획?
│       └── 📖 CODING_STANDARDS.md
│
├── 💻 **구현 단계**  
│   ├── 새 모듈 개발?
│   │   ├── Frontend? → CODING_STANDARDS.md + MODULE_INTEGRATION_CONTRACT.md
│   │   ├── Backend? → MODULAR_DEVELOPMENT_GUIDE.md + CODING_STANDARDS.md  
│   │   └── Full-stack? → 모든 문서 순차 참조
│   └── 기존 코드 수정?
│       └── 📖 해당 모듈 관련 문서 + CODING_STANDARDS.md
│
├── 🔗 **통합 단계**
│   └── 📖 MODULE_INTEGRATION_CONTRACT.md → INTEGRATION_VALIDATION_CHECKLIST.md
│
└── ✅ **검증 단계** 
    └── 📖 INTEGRATION_VALIDATION_CHECKLIST.md
```

---

## 📊 완전 참조 매트릭스

### 🎯 상황 × 역할 × 문서 매핑

| 상황 \ 역할 | 🎨 Frontend | ⚙️ Backend | 🔧 Full-stack | 🚀 DevOps | 🧪 QA |
|------------|------------|-----------|-------------|----------|-------|
| **🏗️ 프로젝트 시작** | CODING_STANDARDS → MODULAR_DEVELOPMENT_GUIDE | MODULAR_DEVELOPMENT_GUIDE → CODING_STANDARDS | 모든 문서 순차 | INTEGRATION_VALIDATION_CHECKLIST | INTEGRATION_VALIDATION_CHECKLIST |
| **⚡ 새 기능 개발** | CODING_STANDARDS + MODULE_INTEGRATION_CONTRACT | MODULAR_DEVELOPMENT_GUIDE + CODING_STANDARDS | 통합 워크플로우 | 아키텍처 가이드 | 테스트 전략 |
| **🔗 모듈 통합** | API 통신 규약 | 이벤트 시스템 | MODULE_INTEGRATION_CONTRACT (전체) | 통합 자동화 | 통합 테스트 |
| **🐛 문제 해결** | 컴포넌트 + API 디버깅 | 서비스 + 이벤트 디버깅 | 전체 스택 디버깅 | 인프라 디버깅 | 테스트 디버깅 |
| **✅ 품질 검증** | UI 테스트 가이드 | API 테스트 가이드 | E2E 테스트 가이드 | 배포 자동화 | INTEGRATION_VALIDATION_CHECKLIST |

---

## 🤖 자동화 & 도구 연동

### 📱 CLI 도구 사용법
```bash
# 문서 추천 받기 (향후 구현)
doc-helper suggest                    # 현재 상황 기반 추천
doc-helper --task "새 모듈 개발"       # 특정 작업 기반 추천  
doc-helper --role frontend           # 역할 기반 추천

# 빠른 문서 열기
doc-helper open architecture         # 아키텍처 가이드
doc-helper open standards            # 코딩 표준
doc-helper open integration          # 통합 규약
doc-helper open validation           # 검증 체크리스트
```

### 🔧 개발 도구 통합
```javascript
// VSCode settings.json에 추가
{
  "files.associations": {
    "*.md": "markdown"
  },
  "markdown.preview.linkify": true,
  "markdown.links.openLocation": "currentGroup"
}
```

### 🎣 Git Hook 자동 추천 (선택적 설치)
```bash
# .git/hooks/pre-commit에 추가
#!/bin/bash
echo "📚 작업 관련 문서 추천:"
echo "수정된 파일: $(git diff --cached --name-only)"
echo "→ 관련 문서를 확인하세요: INDEX.md"
```

---

## 📈 문서 학습 경로

### 🎓 레벨별 학습 순서

#### 🥉 **초급 (프로젝트 이해)**
1. **INDEX.md** (이 문서) - 전체 구조 파악
2. **MODULAR_DEVELOPMENT_GUIDE.md** - 아키텍처 이해  
3. **CODING_STANDARDS.md** - 기본 규칙 학습

#### 🥈 **중급 (실제 개발)**  
4. **MODULE_INTEGRATION_CONTRACT.md** - 모듈 간 통신
5. **역할별 특화 섹션** 집중 학습
6. **실습 프로젝트** 진행

#### 🥇 **고급 (품질 관리)**
7. **INTEGRATION_VALIDATION_CHECKLIST.md** - 검증 프로세스
8. **자동화 스크립트** 활용
9. **팀 멘토링** 및 가이드 개선

---

## 🔄 문서 유지보수

### 📝 문서 업데이트 규칙
- 새 모듈 추가 시 → 이 INDEX.md 업데이트
- 프로세스 변경 시 → 관련 매트릭스 수정
- 도구 추가 시 → 자동화 섹션 업데이트

### 🤝 기여 방법
- 문서 개선 제안 → Issues 등록
- 새로운 패턴 발견 → Pull Request
- 자동화 도구 개발 → 별도 Repository

---

## 🆘 긴급 상황 빠른 참조

| 상황 | 즉시 확인할 곳 |
|------|-------------|
| 🚨 **빌드 실패** | [CODING_STANDARDS.md § 에러 처리](CODING_STANDARDS.md#에러-처리-전략) |
| 🚨 **타입 에러** | [CODING_STANDARDS.md § 타입 정의](CODING_STANDARDS.md#타입-정의-표준) |  
| 🚨 **API 오류** | [MODULE_INTEGRATION_CONTRACT.md § HTTP 클라이언트](MODULE_INTEGRATION_CONTRACT.md#http-클라이언트-표준) |
| 🚨 **배포 실패** | [INTEGRATION_VALIDATION_CHECKLIST.md § 배포 전 검증](INTEGRATION_VALIDATION_CHECKLIST.md#배포-전-최종-검증) |

---

## 📞 도움이 필요하시면

- **문서 관련 질문**: 팀 채널 #docs
- **기술적 문제**: 각 모듈 담당자에게 문의  
- **프로세스 개선**: 프로젝트 매니저에게 제안

---

*마지막 업데이트: $(date)*
*이 INDEX.md는 살아있는 문서입니다. 프로젝트와 함께 계속 발전합니다! 🌱*