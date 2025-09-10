# 🤖 한국어 안전 상담 챗봇

> **Gemini API 기반 "안전이" 전문 상담 시스템** - 24시간 한국어 안전 전문가

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://mongodb.com)
[![Gemini](https://img.shields.io/badge/Gemini-AI-orange?logo=google)](https://ai.google.dev)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com)

## ⚡ 빠른 시작

```bash
# 1. 저장소 클론
git clone https://github.com/your-repo/korean-safety-chatbot.git
cd korean-safety-chatbot

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local에 실제 API 키 입력

# 4. 개발서버 실행
npm run dev

# 5. 브라우저에서 확인
# http://localhost:3003
```

## 📖 프로젝트 소개

### 🎯 목표
**한국어에 특화된 AI 안전 전문가 "안전이"**가 산업안전, 생활안전, 화재안전 등 모든 안전 관련 질문에 전문적이고 친근한 답변을 제공합니다.

### ✨ 주요 특징
- **🔥 실시간 스트리밍 응답** - 타이핑 효과로 자연스러운 대화
- **🧠 전문 안전 지식** - 산업안전보건법, 소방법 등 법규 기반 상담
- **📱 반응형 디자인** - 모든 기기에서 최적화된 사용자 경험
- **📊 피드백 시스템** - 답변 품질 개선을 위한 실시간 평가
- **📢 공지사항 게시판** - 중요한 안전 정보 및 업데이트 제공

### 🛠️ 기술 스택
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + CSS Modules  
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **AI**: Google Gemini 1.5 Pro
- **Deployment**: Vercel

## 🚀 현재 완성도

### ✅ 완료된 기능 (85%)
- [x] **핵심 채팅 시스템** - Gemini AI 연동, 스트리밍 응답
- [x] **공지사항 시스템** - CRUD 기능, 실시간 검색
- [x] **연락 및 피드백** - 사용자 문의, 답변 품질 평가
- [x] **관리자 인터페이스** - 문의 관리, PDF 관리 (모의)
- [x] **반응형 UI/UX** - 모바일/데스크톱 최적화
- [x] **데이터베이스 연동** - MongoDB Atlas 완전 연동

### 🔄 진행 중 (10%)
- [ ] PDF 문서 업로드 및 분석 기능
- [ ] 관리자 대시보드 확장
- [ ] 고급 검색 필터

### 📋 계획 예정 (5%)
- [ ] 음성 인터페이스
- [ ] 모바일 앱 (React Native)
- [ ] 다국어 지원

## 📚 문서 센터

> **완전한 프로젝트 문서를 `docs/` 디렉토리에서 제공합니다.**

### 📋 주요 문서

| 문서 | 설명 | 대상자 |
|------|------|---------|
| [📚 문서 센터](./docs/README.md) | 전체 문서 목차 및 가이드 | 모든 사용자 |
| [🏗️ 프로젝트 개요](./docs/01_PROJECT_OVERVIEW.md) | 프로젝트 소개, 아키텍처, 기능 | 기획자, 개발자 |
| [🔧 기술 아키텍처](./docs/02_TECHNICAL_ARCHITECTURE.md) | 시스템 설계, DB 스키마, API | 개발자, 아키텍트 |
| [💻 개발 워크플로우](./docs/03_DEVELOPMENT_WORKFLOW.md) | 개발 환경, Git, 테스트 | 개발자 |
| [🚀 배포 및 운영](./docs/04_DEPLOYMENT_OPERATIONS.md) | 배포 가이드, 모니터링 | DevOps, 관리자 |
| [📖 사용자 가이드](./docs/05_USER_GUIDE.md) | 사용법, FAQ, 고객지원 | 사용자, 지원팀 |
| [🛠️ 문제해결 가이드](./docs/06_TROUBLESHOOTING.md) | 버그 해결, 성능 튜닝 | 개발자, 운영팀 |

### 🎯 역할별 추천 문서
```bash
# 🆕 신규 개발자
docs/01_PROJECT_OVERVIEW.md → docs/03_DEVELOPMENT_WORKFLOW.md

# 🏗️ 시스템 아키텍트  
docs/01_PROJECT_OVERVIEW.md → docs/02_TECHNICAL_ARCHITECTURE.md

# 🚀 DevOps 엔지니어
docs/02_TECHNICAL_ARCHITECTURE.md → docs/04_DEPLOYMENT_OPERATIONS.md

# 👥 사용자 지원팀
docs/05_USER_GUIDE.md → docs/06_TROUBLESHOOTING.md
```

## 🛠️ 개발 환경 설정

### 필수 요구사항
- **Node.js**: 18.17.0 이상
- **npm**: 9.0.0 이상  
- **MongoDB**: Atlas 클러스터 또는 로컬 설치

### 환경변수 설정
```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/korean-safety-chatbot
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

### 개발 명령어
```bash
npm run dev          # 개발 서버 실행 (포트 3003)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # 코드 품질 검사
npm run type-check   # TypeScript 타입 검사
npm test             # 테스트 실행
```

## 🌐 배포

### Vercel 배포 (권장)
```bash
# Vercel CLI 설치 및 배포
npm i -g vercel
vercel login
vercel --prod
```

### Docker 배포
```bash
# Docker 이미지 빌드 및 실행
docker build -t korean-safety-chatbot .
docker run -p 3003:3003 --env-file .env.local korean-safety-chatbot
```

### 환경별 URL
- **개발**: http://localhost:3003
- **스테이징**: https://staging-korean-safety-chatbot.vercel.app
- **프로덕션**: https://korean-safety-chatbot.vercel.app

## 🤝 기여하기

### 개발 참여 절차
1. **Fork** 저장소
2. **브랜치** 생성 (`git checkout -b feature/amazing-feature`)
3. **커밋** 작성 (`git commit -m 'feat: Add amazing feature'`)
4. **푸시** (`git push origin feature/amazing-feature`)
5. **Pull Request** 생성

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포매팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 기타 작업
```

### 코드 품질 기준
- **TypeScript** 100% 적용
- **ESLint** 규칙 준수
- **Prettier** 코드 포매팅
- **테스트 커버리지** 80% 이상

## 📊 프로젝트 상태

### 성능 지표
- **응답 속도**: < 3초 (평균 1.5초)
- **업타임**: 99.9% 목표
- **테스트 커버리지**: 80%+
- **TypeScript 적용**: 100%

### 브라우저 지원
- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅  
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅
- **모바일**: iOS 14+, Android 8+ ✅

## 📞 지원 및 연락처

### 📧 연락 방법
- **기술 지원**: support@korean-safety-chatbot.com
- **버그 신고**: [GitHub Issues](https://github.com/your-repo/korean-safety-chatbot/issues)
- **기능 제안**: [GitHub Discussions](https://github.com/your-repo/korean-safety-chatbot/discussions)

### 📋 지원 시간
- **일반 지원**: 영업일 09:00-18:00 (KST)
- **긴급 지원**: 24시간 (시스템 중단 시)
- **응답 시간**: 24시간 이내

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

---

<div align="center">

**🛡️ 안전한 세상을 만들어가는 기술 파트너**

[![Star](https://img.shields.io/github/stars/your-repo/korean-safety-chatbot?style=social)](https://github.com/your-repo/korean-safety-chatbot/stargazers)
[![Fork](https://img.shields.io/github/forks/your-repo/korean-safety-chatbot?style=social)](https://github.com/your-repo/korean-safety-chatbot/network)
[![Contributors](https://img.shields.io/github/contributors/your-repo/korean-safety-chatbot)](https://github.com/your-repo/korean-safety-chatbot/graphs/contributors)

Made with ❤️ for Korean Safety Community

</div>