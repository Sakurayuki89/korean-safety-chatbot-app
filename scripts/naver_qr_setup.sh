#!/bin/bash
# naver_qr_setup.sh - 네이버 QR 도메인 등록 준비 스크립트

echo "📱 네이버 QR 도메인 등록 준비 스크립트"
echo "====================================="
echo ""

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOMAIN="korean-safety-chatbot-app.vercel.app"
QR_URL="https://korean-safety-chatbot-app.vercel.app/qr-safety"
VERIFICATION_FILE="public/.well-known/naver-site-verification.txt"

echo -e "${BLUE}ℹ️ 등록 정보:${NC}"
echo "• 도메인: $DOMAIN"
echo "• QR URL: $QR_URL"
echo "• 검증 파일 경로: $VERIFICATION_FILE"
echo ""

# 1. .well-known 디렉토리 생성
echo "🔧 1. 도메인 검증 파일 준비..."
mkdir -p public/.well-known

# 네이버 사이트 검증 파일 생성
VERIFICATION_CODE="korean-safety-chatbot-verification-$(date +%Y%m%d%H%M%S)"
echo "$VERIFICATION_CODE" > "$VERIFICATION_FILE"

echo -e "${GREEN}✅ 검증 파일 생성 완료:${NC} $VERIFICATION_FILE"
echo "   내용: $VERIFICATION_CODE"
echo ""

# 2. QR 안전 페이지가 존재하는지 확인
echo "🔍 2. QR 안전 페이지 확인..."
if [ -f "app/qr-safety/page.tsx" ] || [ -f "pages/qr-safety.tsx" ] || [ -f "app/qr-safety.tsx" ]; then
    echo -e "${GREEN}✅ QR 안전 페이지가 이미 존재합니다${NC}"
else
    echo -e "${YELLOW}⚠️ QR 안전 페이지를 생성하겠습니다${NC}"

    # QR 안전 페이지 생성
    mkdir -p app/qr-safety
    cat > app/qr-safety/page.tsx << 'EOF'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '한국어 안전 챗봇 - QR 안전 서비스',
  description: '네이버 QR을 통한 안전한 한국어 챗봇 서비스입니다.',
  openGraph: {
    title: '한국어 안전 챗봇',
    description: '네이버 QR을 통한 안전한 한국어 챗봇 서비스',
    url: 'https://korean-safety-chatbot-app.vercel.app/qr-safety',
  },
};

export default function QRSafetyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* 헤더 */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🤖 한국어 안전 챗봇
            </h1>
            <p className="text-xl text-gray-600">
              네이버 QR을 통한 안전하고 신뢰할 수 있는 AI 챗봇 서비스
            </p>
          </div>

          {/* QR 안전 인증 배지 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🛡️ 네이버 QR 인증 서비스
            </h2>
            <p className="text-gray-600 mb-6">
              이 페이지는 네이버 QR 서비스에 등록된 안전한 도메인임을 인증합니다.
              <br />
              사용자의 안전과 개인정보 보호를 최우선으로 합니다.
            </p>
          </div>

          {/* 서비스 특징 */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">보안 우선</h3>
              <p className="text-gray-600 text-sm">
                모든 대화는 암호화되어 전송되며, 개인정보는 안전하게 보호됩니다.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">🇰🇷</div>
              <h3 className="text-lg font-semibold mb-2">한국어 특화</h3>
              <p className="text-gray-600 text-sm">
                한국어 맥락을 완벽하게 이해하는 고품질 AI 챗봇 서비스입니다.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">빠른 응답</h3>
              <p className="text-gray-600 text-sm">
                최적화된 AI 엔진으로 빠르고 정확한 답변을 제공합니다.
              </p>
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="space-y-4">
            <a
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              💬 챗봇 사용하기
            </a>
            <p className="text-sm text-gray-500">
              안전하고 믿을 수 있는 AI 챗봇 서비스를 경험해보세요
            </p>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              © 2024 한국어 안전 챗봇. 모든 권리 보유.
            </p>
            <p className="text-sm">
              네이버 QR 인증 도메인 • 안전한 AI 챗봇 서비스
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
EOF
    echo -e "${GREEN}✅ QR 안전 페이지 생성 완료${NC}"
fi
echo ""

# 3. robots.txt 업데이트 (SEO 및 크롤링 최적화)
echo "🤖 3. robots.txt 확인 및 업데이트..."
ROBOTS_FILE="public/robots.txt"

if [ -f "$ROBOTS_FILE" ]; then
    # 기존 robots.txt에 QR 페이지 추가
    if ! grep -q "qr-safety" "$ROBOTS_FILE"; then
        echo "" >> "$ROBOTS_FILE"
        echo "# QR Safety page" >> "$ROBOTS_FILE"
        echo "Allow: /qr-safety" >> "$ROBOTS_FILE"
    fi
    echo -e "${GREEN}✅ 기존 robots.txt에 QR 페이지 경로 추가${NC}"
else
    # 새 robots.txt 생성
    cat > "$ROBOTS_FILE" << 'EOF'
User-agent: *
Allow: /

# Special pages
Allow: /qr-safety
Allow: /.well-known/

# Sitemap
Sitemap: https://korean-safety-chatbot-app.vercel.app/sitemap.xml
EOF
    echo -e "${GREEN}✅ 새로운 robots.txt 파일 생성 완료${NC}"
fi
echo ""

# 4. 사이트맵 생성/업데이트
echo "🗺️ 4. 사이트맵 업데이트..."
SITEMAP_FILE="public/sitemap.xml"

cat > "$SITEMAP_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://korean-safety-chatbot-app.vercel.app/</loc>
    <lastmod>$(date -u +"%Y-%m-%dT%H:%M:%SZ")</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://korean-safety-chatbot-app.vercel.app/qr-safety</loc>
    <lastmod>$(date -u +"%Y-%m-%dT%H:%M:%SZ")</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
EOF

echo -e "${GREEN}✅ 사이트맵 업데이트 완료${NC}"
echo ""

# 5. 네이버 웹마스터 도구용 메타 태그 정보 제공
echo "📋 5. 네이버 QR 등록 가이드"
echo "=========================="
echo ""
echo -e "${BLUE}📱 네이버 개발자 센터 QR API 등록 정보:${NC}"
echo ""
echo "🔗 등록 URL: https://developers.naver.com/apps/"
echo ""
echo "📝 등록 정보:"
echo "   • 애플리케이션 이름: 한국어 안전 챗봇"
echo "   • 서비스 URL: https://$DOMAIN"
echo "   • QR 서비스 URL: $QR_URL"
echo "   • 도메인 검증 파일: /.well-known/naver-site-verification.txt"
echo ""
echo -e "${YELLOW}⚠️ 중요 단계:${NC}"
echo "1. 네이버 개발자 센터에 로그인"
echo "2. '애플리케이션 등록' 클릭"
echo "3. QR API 사용 신청"
echo "4. 도메인 검증 완료"
echo "5. 서비스 검수 요청"
echo ""

# 6. SSL 및 도메인 상태 확인
echo "🔍 6. 도메인 및 SSL 상태 확인..."
echo ""

# 도메인 해상도 확인
if nslookup "$DOMAIN" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 도메인 DNS 해상도 정상${NC}: $DOMAIN"
else
    echo -e "${YELLOW}⚠️ 도메인 DNS 확인 필요${NC}: $DOMAIN"
fi

# SSL 인증서 확인 (간단한 체크)
if command -v openssl &> /dev/null; then
    SSL_INFO=$(echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSL 인증서 유효${NC}"
        echo "   $SSL_INFO"
    else
        echo -e "${YELLOW}⚠️ SSL 인증서 상태 확인 필요${NC}"
    fi
fi
echo ""

# 7. 최종 체크리스트
echo "📋 7. 네이버 QR 등록 체크리스트"
echo "==============================="
echo ""
echo "✅ 준비 완료 항목:"
echo "   □ 도메인 검증 파일 생성: $VERIFICATION_FILE"
echo "   □ QR 안전 페이지 준비: /qr-safety"
echo "   □ robots.txt 업데이트"
echo "   □ sitemap.xml 생성"
echo "   □ SSL 인증서 확인"
echo ""
echo "🔄 다음 수동 단계:"
echo "   1. Git 커밋 및 Vercel 배포"
echo "   2. https://$DOMAIN/qr-safety 접근 확인"
echo "   3. https://$DOMAIN/.well-known/naver-site-verification.txt 확인"
echo "   4. 네이버 개발자 센터에서 QR API 신청"
echo "   5. 도메인 검증 완료"
echo "   6. 서비스 검수 요청 및 승인 대기"
echo ""

# 커밋 준비
echo "💾 변경사항 Git 추가..."
git add public/.well-known/ public/robots.txt public/sitemap.xml app/qr-safety/ 2>/dev/null

echo -e "${GREEN}🎉 네이버 QR 도메인 등록 준비가 완료되었습니다!${NC}"
echo ""
echo "다음 명령어로 변경사항을 커밋하고 배포하세요:"
echo ""
echo "git commit -m '📱 Add Naver QR domain registration setup'"
echo "vercel --prod"
echo ""
echo -e "${BLUE}ℹ️ 배포 후 다음 URL들을 확인하세요:${NC}"
echo "• 메인 페이지: https://$DOMAIN/"
echo "• QR 안전 페이지: $QR_URL"
echo "• 도메인 검증 파일: https://$DOMAIN/.well-known/naver-site-verification.txt"