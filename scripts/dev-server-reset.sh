#!/bin/bash

# Next.js 개발 서버 완전 재설정 스크립트
# Usage: ./scripts/dev-server-reset.sh

echo "🔄 Next.js 개발 서버 완전 재설정 시작..."

# 1. 기존 개발 서버 프로세스 종료
echo "📵 기존 서버 프로세스 종료 중..."
pkill -f 'next-server' 2>/dev/null || true
pkill -f 'next dev' 2>/dev/null || true
lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true

# 2. Next.js 캐시 완전 삭제
echo "🗑️  Next.js 캐시 삭제 중..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc

# 3. TypeScript 캐시 삭제
echo "📝 TypeScript 캐시 삭제 중..."
rm -rf tsconfig.tsbuildinfo
rm -rf .tsbuildinfo

# 4. 브라우저 캐시 정리 알림
echo "🌐 브라우저에서 다음 작업을 수행해주세요:"
echo "   - 개발자 도구 열기 (F12)"
echo "   - 새로고침 버튼 우클릭 → '하드 새로고침 및 캐시 비우기'"
echo "   - 또는 Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)"

# 5. Node.js 모듈 재설치 (선택사항)
read -p "📦 node_modules를 재설치하시겠습니까? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 node_modules 재설치 중..."
    rm -rf node_modules package-lock.json
    npm install
fi

# 6. 포트 상태 확인
echo "🔍 포트 3000 상태 확인..."
if lsof -i:3000 > /dev/null 2>&1; then
    echo "⚠️  포트 3000이 여전히 사용 중입니다. 수동으로 종료해주세요."
else
    echo "✅ 포트 3000이 사용 가능합니다."
fi

echo "🎯 재설정 완료! 이제 'npm run dev'로 서버를 시작하세요."
echo ""
echo "💡 문제가 지속되면 다음을 시도해보세요:"
echo "   1. 터미널 재시작"
echo "   2. 시스템 재부팅"
echo "   3. Node.js 버전 확인 (권장: Node 18+ LTS)"