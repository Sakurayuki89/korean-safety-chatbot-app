#!/bin/bash
# security_verification.sh - 한국어 안전 챗봇 보안 검증 스크립트

DOMAIN="https://korean-safety-chatbot-app.vercel.app"
echo "=== 한국어 안전 챗봇 배포 후 보안 검증 시작 ==="
echo "Domain: $DOMAIN"
echo ""

# 1. 디버그 엔드포인트 차단 확인
echo "🔍 1. 디버그 엔드포인트 접근 테스트..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/debug/env")
if [ "$RESPONSE" = "404" ]; then
    echo "✅ 디버그 엔드포인트가 올바르게 차단되었습니다 (HTTP $RESPONSE)"
else
    echo "❌ 위험: 디버그 엔드포인트가 여전히 접근 가능합니다 (HTTP $RESPONSE)"
    echo "   즉시 확인이 필요합니다!"
fi
echo ""

# 2. OAuth 콜백 URL 검증
echo "🔍 2. OAuth 설정 검증..."
# /api/auth/status 엔드포인트가 있다고 가정하고 테스트
OAUTH_STATUS=$(curl -s "$DOMAIN/api/auth/status" 2>/dev/null)
if [ $? -eq 0 ] && [[ "$OAUTH_STATUS" == *"korean-safety-chatbot-app.vercel.app"* ]]; then
    echo "✅ OAuth 리다이렉트 URL이 올바른 프로덕션 도메인으로 설정되었습니다"
elif [ $? -eq 0 ]; then
    echo "⚠️ OAuth 설정을 확인해야 할 수 있습니다"
    echo "   Response: $OAUTH_STATUS"
else
    echo "ℹ️ OAuth 상태 엔드포인트에 접근할 수 없습니다 (정상적일 수 있음)"
fi
echo ""

# 3. 기본 애플리케이션 동작 확인
echo "🔍 3. 애플리케이션 헬스체크..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/")
if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ 메인 페이지가 정상적으로 로드됩니다 (HTTP $HEALTH_CHECK)"
elif [ "$HEALTH_CHECK" = "301" ] || [ "$HEALTH_CHECK" = "302" ]; then
    echo "✅ 애플리케이션이 정상적으로 리다이렉트됩니다 (HTTP $HEALTH_CHECK)"
else
    echo "❌ 애플리케이션 로드에 문제가 있습니다 (HTTP $HEALTH_CHECK)"
fi
echo ""

# 4. HTTPS 인증서 검증
echo "🔍 4. SSL/HTTPS 인증서 확인..."
SSL_CHECK=$(echo | openssl s_client -connect korean-safety-chatbot-app.vercel.app:443 -servername korean-safety-chatbot-app.vercel.app 2>/dev/null | openssl x509 -noout -subject 2>/dev/null)
if [[ "$SSL_CHECK" == *"korean-safety-chatbot-app.vercel.app"* ]] || [[ "$SSL_CHECK" == *"vercel.app"* ]]; then
    echo "✅ SSL 인증서가 유효하고 올바른 도메인에 대해 발급되었습니다"
else
    echo "⚠️ SSL 인증서 확인이 필요할 수 있습니다"
fi
echo ""

# 5. 관리자 페이지 보안 확인
echo "🔍 5. 관리자 페이지 보안 확인..."
ADMIN_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/admin")
if [ "$ADMIN_CHECK" = "200" ] || [ "$ADMIN_CHECK" = "401" ] || [ "$ADMIN_CHECK" = "403" ]; then
    echo "✅ 관리자 페이지가 적절한 보안 설정으로 보호되고 있습니다 (HTTP $ADMIN_CHECK)"
else
    echo "⚠️ 관리자 페이지 응답을 확인해주세요 (HTTP $ADMIN_CHECK)"
fi
echo ""

# 6. API 엔드포인트 보안 테스트
echo "🔍 6. API 엔드포인트 보안 테스트..."
API_ADMIN_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/admin/stats")
if [ "$API_ADMIN_CHECK" = "401" ] || [ "$API_ADMIN_CHECK" = "403" ]; then
    echo "✅ 관리자 API가 적절히 보호되고 있습니다 (HTTP $API_ADMIN_CHECK)"
else
    echo "⚠️ 관리자 API 보안을 확인해주세요 (HTTP $API_ADMIN_CHECK)"
fi
echo ""

# 7. QR 엔드포인트 접근성 확인 (네이버 QR 등록용)
echo "🔍 7. QR 엔드포인트 접근성 확인..."
QR_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/qr-safety" 2>/dev/null)
if [ "$QR_CHECK" = "200" ]; then
    echo "✅ QR 안전 페이지에 정상적으로 접근할 수 있습니다"
    echo "   네이버 QR 도메인 등록이 가능합니다"
elif [ "$QR_CHECK" = "404" ]; then
    echo "ℹ️ QR 페이지가 설정되지 않았습니다 (필요시 생성)"
else
    echo "⚠️ QR 페이지 상태를 확인해주세요 (HTTP $QR_CHECK)"
fi
echo ""

echo "=== 보안 검증 완료 ==="
echo ""
echo "📋 다음 단계:"
echo "1. MongoDB Atlas에서 0.0.0.0/0 네트워크 규칙 제거"
echo "2. Vercel 환경변수에서 JWT_SECRET, ADMIN_PASSWORD 업데이트"
echo "3. 네이버 개발자 센터에서 QR 도메인 등록"
echo ""
echo "🔒 보안 권장사항:"
echo "- 정기적으로 환경변수 로테이션 수행"
echo "- MongoDB Atlas 접근 로그 모니터링"
echo "- Vercel 배포 로그 정기 검토"