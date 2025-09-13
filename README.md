# 🛡️ 한국 안전보건용품 관리 시스템

> **AI 기반 통합 안전보건용품 관리 플랫폼** - Google Drive 연동 이미지 프록시, 스마트 신청 시스템, AI 안전 상담

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.19.0-green?logo=mongodb)](https://mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)
[![Google APIs](https://img.shields.io/badge/Google_APIs-Drive%2BSheets-red?logo=google)](https://developers.google.com)

## ⚡ 빠른 시작

```bash
# 1. 저장소 클론
git clone https://github.com/your-repo/korean-safety-system.git
cd korean-safety-system

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local에 실제 API 키와 설정값 입력

# 4. 개발서버 실행
npm run dev

# 5. 브라우저에서 확인
# http://localhost:3000
```

## 📖 프로젝트 소개

### 🎯 핵심 목표
**한국형 안전보건용품 관리의 디지털 혁신**을 통해 효율적이고 투명한 안전용품 신청, 관리, 배포 시스템을 제공합니다.

### ✨ 주요 기능

#### 🏗️ **안전보건용품 관리 시스템**
- **용품 등록/관리**: 이미지, 설명, 규격 정보 포함 완전 관리
- **스마트 신청 시스템**: 사용자 친화적 신청 프로세스
- **실시간 재고 관리**: MongoDB 기반 정확한 재고 추적

#### 🖼️ **Google Drive 이미지 프록시 시스템**
- **고속 이미지 로딩**: 최적화된 이미지 프록시로 빠른 표시
- **권한 관리**: 자동 파일 권한 설정 및 보안 관리
- **CDN 수준 성능**: 캐싱과 압축으로 웹급 성능 구현

#### 📊 **Google Sheets 연동**
- **원클릭 내보내기**: 신청 데이터를 Google Sheets로 즉시 내보내기
- **실시간 동기화**: 데이터 변경 시 자동 업데이트
- **관리자 대시보드**: 통계와 분석을 위한 시각적 인터페이스

#### 🤖 **AI 안전 상담 시스템**
- **전문 상담**: Gemini AI 기반 실시간 안전 상담
- **스트리밍 응답**: 자연스러운 대화형 인터페이스
- **상황별 맞춤**: 산업안전, 생활안전, 화재안전 전문 지식

#### 📢 **공지사항 & 관리 시스템**
- **실시간 공지**: 중요도별 공지사항 관리
- **관리자 패널**: 전체 시스템 통합 관리
- **사용자 피드백**: 개선사항 수집 및 반영

### 🛠️ 기술 아키텍처

#### **Frontend**
- **Next.js 15** - App Router, React Server Components
- **React 19** - 최신 동시성 기능 활용
- **TypeScript** - 타입 안전성 및 개발 효율성
- **Tailwind CSS** - 유틸리티 우선 스타일링

#### **Backend & API**
- **Next.js API Routes** - 서버리스 백엔드
- **MongoDB 6.19** - NoSQL 문서 데이터베이스
- **Google APIs** - Drive, Sheets, OAuth 2.0 통합

#### **AI & 외부 서비스**
- **Google Gemini 1.5 Pro** - 대화형 AI 엔진
- **Google Drive API** - 파일 저장 및 관리
- **Google Sheets API** - 데이터 내보내기

#### **배포 & 인프라**
- **Vercel** - 최적화된 Next.js 배포 (권장)
- **Railway/Netlify** - 대안 배포 플랫폼 지원
- **MongoDB Atlas** - 관리형 클라우드 데이터베이스

## 🏗️ 프로젝트 구조

```
korean-safety-system/
├── 📱 app/                          # Next.js App Router
│   ├── admin/                       # 관리자 패널
│   ├── contact/                     # 문의 페이지
│   ├── debug-images/               # 이미지 디버깅 도구
│   └── api/                        # API 엔드포인트
│       ├── admin/                  # 관리자 API
│       ├── google/                 # Google 서비스 연동
│       ├── image-proxy/           # 이미지 프록시
│       └── safety-items/          # 안전용품 관리
├── 🧩 components/                   # React 컴포넌트
│   ├── admin/                      # 관리자 컴포넌트
│   ├── layout/                     # 레이아웃 컴포넌트
│   └── pdf/                       # PDF 뷰어
├── 🎣 hooks/                        # 커스텀 React 훅
├── 📚 lib/                          # 유틸리티 라이브러리
│   ├── mongodb.ts                  # 데이터베이스 연결
│   ├── google-drive.ts            # Google Drive API
│   └── constants.ts               # 상수 정의
├── 🔧 types/                        # TypeScript 타입 정의
└── 📄 docs/                         # 프로젝트 문서
```

## 🚀 배포 가이드

### 1. 환경변수 설정
필수 환경변수들을 설정하세요:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth
- `MONGODB_URI`: MongoDB Atlas 연결
- `GEMINI_API_KEY`: Google Gemini AI API
- `GOOGLE_APPLICATION_CREDENTIALS`: 서비스 계정 JSON

### 2. Google Cloud 설정
1. Google Cloud Console에서 프로젝트 생성
2. Drive API, Sheets API 활성화
3. OAuth 2.0 클라이언트 ID 생성
4. 서비스 계정 생성 및 키 다운로드

### 3. MongoDB Atlas 설정
1. MongoDB Atlas 클러스터 생성
2. 데이터베이스 사용자 추가
3. 네트워크 액세스 설정
4. 연결 문자열 획득

### 4. 배포 플랫폼별 가이드
- **Vercel** (권장): 원클릭 배포, 자동 최적화
- **Railway**: 풀스택 앱 배포에 적합
- **Netlify**: JAMstack 특화, Functions 지원

자세한 배포 가이드는 [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)를 참조하세요.

## 🔒 보안 기능

- **Google OAuth 2.0**: 안전한 사용자 인증
- **환경변수 보호**: 민감한 정보 암호화 저장
- **API 키 검증**: 모든 외부 API 요청 인증
- **CORS 보안**: 적절한 도메인 제한
- **입력 검증**: SQL/NoSQL 인젝션 방지

## ⚡ 성능 최적화

- **이미지 프록시**: Google Drive 이미지 고속 캐싱
- **번들 최적화**: 102KB 기본 로드 크기
- **서버리스 아키텍처**: 자동 스케일링
- **정적 생성**: 17개 페이지 사전 렌더링
- **코드 분할**: 지연 로딩으로 초기 로드 최적화

## 🧪 개발 & 테스트

```bash
# 개발 서버 (클린 시작)
npm run dev:clean

# 프로덕션 빌드 테스트
npm run build
npm run start

# 코드 품질 검사
npm run lint

# 포트 관리
npm run clean-port    # 포트 3000 정리
npm run check-port    # 포트 상태 확인
```

## 🤝 기여 가이드

1. 이슈 등록 또는 기능 제안
2. 브랜치 생성: `git checkout -b feature/새기능`
3. 커밋: `git commit -m "✨ 새로운 기능 추가"`
4. 푸시: `git push origin feature/새기능`
5. Pull Request 생성

### 커밋 컨벤션
- `✨ feat`: 새로운 기능
- `🐛 fix`: 버그 수정
- `📚 docs`: 문서 수정
- `💄 style`: 스타일 변경
- `♻️ refactor`: 코드 리팩토링
- `⚡ perf`: 성능 개선
- `✅ test`: 테스트 추가
- `🔧 chore`: 빌드/설정 변경

## 📋 추가 문서

- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**: 문제 해결 가이드 및 개발 과정에서 해결된 주요 이슈들
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: 상세한 배포 가이드 및 프로덕션 환경 설정
- **[PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)**: 배포 전 체크리스트

### 🔧 주요 해결된 이슈

프로젝트 개발 과정에서 해결된 중요한 기술적 이슈들:

#### Google OAuth 인증 시스템
- **문제**: 로그인 성공 후 관리자 페이지 진입 실패 및 세션 유지 문제
- **해결**: 동적 리디렉션 URI 생성, CSRF 보호 강화, 쿠키 설정 최적화
- **결과**: 완벽한 OAuth 플로우 구현 및 안정적인 세션 관리

#### Next.js 15 호환성
- **문제**: Next.js 15의 변경된 API로 인한 빌드 오류
- **해결**: cookies() 함수의 async/await 패턴 적용, App Router 최적화
- **결과**: 최신 Next.js 버전과 완벽 호환

#### 환경별 배포 최적화
- **문제**: 개발/프로덕션 환경 간 설정 불일치
- **해결**: 환경 감지 로직 구현, 동적 설정 시스템 도입
- **결과**: 모든 환경에서 일관된 동작 보장

자세한 내용은 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)를 참조하세요.

## 📊 프로젝트 현황

### 완성도: 95% ✅
- **✅ 완료**: 모든 핵심 기능 구현 및 테스트 완료
- **✅ 완료**: Google OAuth 로그인 시스템 완전 구현
- **✅ 완료**: 관리자 대시보드 및 모든 CRUD 기능
- **✅ 완료**: AI 채팅봇 및 사용자 인터페이스
- **✅ 완료**: 프로덕션 배포 준비 완료
- **🔄 진행중**: 최종 UI/UX 폴리싱 및 성능 최적화

### 즉시 배포 가능 🚀
모든 핵심 기능이 완성되어 즉시 프로덕션 환경에 배포할 수 있습니다.

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 있습니다.

## 🆘 지원 & 문의

- **이슈 신고**: [GitHub Issues](https://github.com/your-repo/korean-safety-system/issues)
- **기능 제안**: [GitHub Discussions](https://github.com/your-repo/korean-safety-system/discussions)
- **기술 지원**: [이메일 문의](mailto:support@example.com)

### 🔍 개발 과정 문의

프로젝트 개발 과정에서 발생한 기술적 이슈나 해결 과정에 대한 문의는 TROUBLESHOOTING.md를 먼저 참조한 후 GitHub Issues를 통해 문의해 주세요.

---

<div align="center">

**🛡️ 더 안전한 대한민국을 위한 디지털 혁신 🛡️**

Made with ❤️ by Korean Safety System Team

</div># Trigger rebuild
