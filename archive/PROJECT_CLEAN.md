# 🧹 프로젝트 정리 가이드

## ❌ 삭제할 불필요한 파일들

### Next.js 기본 생성 파일 중 불필요
```bash
# 삭제 대상
public/next.svg
public/vercel.svg
app/favicon.ico (기본)
app/globals.css (기본 스타일)
app/page.module.css
README.md (기본)

# Gemini CLI 실행 명령어
rm -rf public/next.svg public/vercel.svg app/page.module.css
```

### 개발 중 생성되는 임시 파일
```bash
# 항상 삭제
.DS_Store
*.log
.env.local (개발용, 운영 시 주의)
node_modules/.cache/
```

## ✅ 꼭 필요한 파일들

### 프로젝트 핵심
```
package.json          # 의존성 관리
next.config.js       # Next.js 설정
.env                 # 환경변수 (운영)
.env.example         # 환경변수 템플릿
```

### 개발 문서 (토큰 효율용)
```
AI_WORKFLOW.md       # AI 협업 가이드
PROJECT_STATUS.md    # 현재 상태
CURRENT_TASK.md      # 현재 작업
ERROR_LOG.md         # 에러 기록
```

### 소스코드 구조
```
app/
├── layout.js       # 전역 레이아웃
├── page.js         # 홈페이지
├── admin/          # 관리자 페이지
├── chat/           # 챗봇 페이지
└── api/            # API 엔드포인트

lib/
├── supabase.js     # DB 연결
├── gemini.js       # AI 연결
└── utils.js        # 유틸리티

components/         # 재사용 컴포넌트
data/              # PDF, JSON 데이터
```

## 🔄 정리 자동화 스크립트

```bash
# cleanup.sh (Gemini CLI가 실행)
echo "🧹 프로젝트 정리 시작..."

# 불필요한 기본 파일 삭제
rm -f public/next.svg public/vercel.svg
rm -f app/page.module.css
rm -f app/favicon.ico

# 개발 임시 파일 정리
rm -rf .next/cache/
rm -f *.log
find . -name ".DS_Store" -delete

# 필수 디렉토리 생성
mkdir -p lib components data ai-docs gemini-context

echo "✅ 정리 완료!"
```

## 📊 파일 크기 모니터링

### 큰 파일 체크 (100KB 이상)
```bash
find . -size +100k -type f | grep -v node_modules
```

### 토큰 효율을 위한 파일 크기 제한
- 📄 단일 코드 파일: **< 500줄**
- 📋 문서 파일: **< 200줄**  
- 🖼️ 이미지: **< 1MB**
- 📑 PDF: **< 5MB**

## 🎯 정리된 프로젝트의 장점

1. **AI 첨부 최적화**: 필요한 파일만 선별적 첨부
2. **토큰 절약**: 불필요한 내용 제거로 컨텍스트 효율화
3. **빠른 분석**: 핵심 파일만 남겨 AI가 빠르게 이해
4. **유지보수 용이**: 깔끔한 구조로 문제 해결 시간 단축