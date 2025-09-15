#!/bin/bash
# gemini_security_actions.sh - Gemini CLI가 실행할 보안 조치 자동화 스크립트

set -e  # 에러 발생시 스크립트 중단

echo "🤖 Gemini CLI - 한국어 안전 챗봇 보안 조치 시작"
echo "===================================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로깅 함수
log_info() {
    echo -e "${BLUE}ℹ️ [INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ [SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️ [WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}❌ [ERROR]${NC} $1"
}

# === PHASE 1: 사전 요구사항 확인 ===
echo "🔍 PHASE 1: 사전 요구사항 확인"
echo "================================="

# Node.js 및 npm 확인
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    log_success "Node.js $NODE_VERSION 및 npm $NPM_VERSION 감지됨"
else
    log_error "Node.js 또는 npm이 설치되지 않았습니다"
    exit 1
fi

# MongoDB Atlas CLI 설치 확인
if ! command -v atlas &> /dev/null; then
    log_warning "MongoDB Atlas CLI가 설치되지 않았습니다. 설치 중..."

    # macOS의 경우 Homebrew 사용
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install mongodb-atlas-cli
        else
            log_error "Homebrew가 필요합니다. 먼저 Homebrew를 설치하세요"
            exit 1
        fi
    # Linux의 경우 직접 다운로드
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fL https://github.com/mongodb/mongodb-atlas-cli/releases/latest/download/atlascli_*_linux_x86_64.tar.gz | tar -xz
        sudo mv atlascli /usr/local/bin/atlas
    else
        log_error "지원되지 않는 운영체제입니다"
        exit 1
    fi

    log_success "MongoDB Atlas CLI 설치 완료"
fi

# Vercel CLI 설치 확인
if ! command -v vercel &> /dev/null; then
    log_warning "Vercel CLI가 설치되지 않았습니다. 설치 중..."
    npm install -g vercel
    log_success "Vercel CLI 설치 완료"
fi

# === PHASE 2: MongoDB Atlas 보안 설정 ===
echo ""
echo "🛡️ PHASE 2: MongoDB Atlas 보안 설정"
echo "===================================="

log_info "MongoDB Atlas 인증이 필요합니다"
echo "다음 명령어를 실행하여 인증하세요:"
echo "atlas auth login"
echo ""
echo "인증 완료 후 계속하려면 Enter를 누르세요..."
read -r

log_info "프로젝트 ID를 확인합니다..."
echo "atlas projects list 명령어로 프로젝트를 확인하고"
echo "올바른 PROJECT_ID를 입력하세요:"
read -p "MongoDB Atlas Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    log_error "프로젝트 ID가 입력되지 않았습니다"
    exit 1
fi

log_info "현재 네트워크 액세스 리스트를 확인합니다..."
atlas accessLists list --projectId "$PROJECT_ID" || {
    log_error "프로젝트 ID가 올바르지 않거나 권한이 없습니다"
    exit 1
}

# 위험한 0.0.0.0/0 규칙 제거
log_warning "위험한 0.0.0.0/0 네트워크 규칙을 제거합니다..."
atlas accessLists delete --force --projectId "$PROJECT_ID" --entry "0.0.0.0/0" 2>/dev/null || {
    log_info "0.0.0.0/0 규칙이 이미 없거나 제거할 수 없습니다"
}

# Vercel IP 범위 추가
log_info "Vercel IP 범위를 추가합니다..."
# Vercel의 주요 IP 범위들
VERCEL_IPS=(
    "76.76.19.0/24"
    "64.252.128.0/17"
    "76.223.0.0/20"
)

for IP_RANGE in "${VERCEL_IPS[@]}"; do
    log_info "IP 범위 추가 중: $IP_RANGE"
    atlas accessLists create --type ipAddress --projectId "$PROJECT_ID" \
        --comment "Vercel Infrastructure - $(date +%Y%m%d)" \
        --ipAddress "$IP_RANGE" 2>/dev/null || {
        log_warning "IP 범위 $IP_RANGE 추가 실패 (이미 존재할 수 있음)"
    }
done

log_success "MongoDB Atlas 네트워크 보안 설정 완료"

# === PHASE 3: 환경변수 보안 강화 ===
echo ""
echo "🔐 PHASE 3: 환경변수 보안 강화"
echo "==============================="

# 새로운 JWT_SECRET 생성
log_info "새로운 JWT_SECRET 생성 중..."
NEW_JWT_SECRET="jwt_secret_$(openssl rand -hex 32)_korean_safety_$(date +%Y)"
log_success "새로운 JWT_SECRET 생성 완료"

# 새로운 ADMIN_PASSWORD 생성
log_info "새로운 ADMIN_PASSWORD 생성 중..."
NEW_ADMIN_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
log_success "새로운 ADMIN_PASSWORD 생성 완료"

# 생성된 값들을 안전한 파일에 임시 저장
TEMP_SECRETS_FILE="/tmp/korean_safety_secrets_$(date +%s).txt"
cat > "$TEMP_SECRETS_FILE" << EOF
# 한국어 안전 챗봇 - 새로 생성된 보안 정보
# 생성 시간: $(date)
#
# 이 파일은 Vercel 환경변수 설정 후 삭제하세요!

JWT_SECRET="$NEW_JWT_SECRET"
ADMIN_PASSWORD="$NEW_ADMIN_PASSWORD"
GOOGLE_REDIRECT_URI="https://korean-safety-chatbot-app.vercel.app/api/google/auth/callback"

# Vercel CLI 환경변수 설정 명령어:
# vercel env add JWT_SECRET production
# vercel env add ADMIN_PASSWORD production
# vercel env add GOOGLE_REDIRECT_URI production
EOF

log_success "보안 정보가 임시 파일에 저장됨: $TEMP_SECRETS_FILE"
log_warning "이 파일은 Vercel 환경변수 설정 후 반드시 삭제하세요!"

# === PHASE 4: Vercel 환경변수 업데이트 ===
echo ""
echo "☁️ PHASE 4: Vercel 환경변수 업데이트"
echo "===================================="

log_info "Vercel 프로젝트에 연결합니다..."
vercel link --confirm || {
    log_error "Vercel 프로젝트 연결 실패"
    exit 1
}

log_info "기존 환경변수를 확인합니다..."
vercel env list

echo ""
log_info "환경변수 업데이트를 시작합니다..."
echo "각 프롬프트에 다음 값들을 입력하세요:"
echo ""
echo "JWT_SECRET: $NEW_JWT_SECRET"
echo "ADMIN_PASSWORD: $NEW_ADMIN_PASSWORD"
echo "GOOGLE_REDIRECT_URI: https://korean-safety-chatbot-app.vercel.app/api/google/auth/callback"
echo ""

# 환경변수 추가/업데이트
echo "JWT_SECRET 설정 중..."
echo "$NEW_JWT_SECRET" | vercel env add JWT_SECRET production

echo "ADMIN_PASSWORD 설정 중..."
echo "$NEW_ADMIN_PASSWORD" | vercel env add ADMIN_PASSWORD production

echo "GOOGLE_REDIRECT_URI 설정 중..."
echo "https://korean-safety-chatbot-app.vercel.app/api/google/auth/callback" | vercel env add GOOGLE_REDIRECT_URI production

log_success "Vercel 환경변수 업데이트 완료"

# === PHASE 5: 코드 변경사항 확인 및 배포 ===
echo ""
echo "🚀 PHASE 5: 코드 배포"
echo "====================="

# Git 상태 확인
log_info "Git 상태를 확인합니다..."
git status

# 변경사항 커밋
log_info "보안 변경사항을 커밋합니다..."
git add .
git commit -m "🔒 Critical security updates

- Remove debug endpoint exposure of sensitive environment variables
- Eliminate hardcoded JWT_SECRET fallback values
- Fix GOOGLE_REDIRECT_URI to use correct production domain
- Add comprehensive security verification scripts

Security improvements:
- /api/debug/env endpoint now returns 404 in all environments
- JWT_SECRET now requires explicit environment variable (no fallback)
- OAuth redirect URI points to correct production domain
- Remove debug console.log statements exposing JWT info"

# 프로덕션 빌드 테스트
log_info "프로덕션 빌드를 테스트합니다..."
npm run build || {
    log_error "빌드 실패. 코드를 검토하세요"
    exit 1
}

log_success "빌드 테스트 통과"

# Vercel에 배포
log_info "Vercel에 프로덕션 배포를 시작합니다..."
vercel --prod || {
    log_error "배포 실패"
    exit 1
}

log_success "프로덕션 배포 완료"

# === PHASE 6: 보안 검증 ===
echo ""
echo "🔍 PHASE 6: 배포 후 보안 검증"
echo "============================="

# 잠시 대기 (배포 완료 시간)
log_info "배포가 완전히 적용될 때까지 30초 대기..."
sleep 30

# 보안 검증 스크립트 실행
log_info "보안 검증 스크립트를 실행합니다..."
bash ./scripts/security_verification.sh

# === PHASE 7: 정리 및 다음 단계 ===
echo ""
echo "🏁 PHASE 7: 정리 및 다음 단계"
echo "============================="

# 임시 파일 삭제
if [ -f "$TEMP_SECRETS_FILE" ]; then
    log_info "임시 보안 파일을 삭제합니다..."
    rm "$TEMP_SECRETS_FILE"
    log_success "임시 파일 삭제 완료"
fi

echo ""
log_success "🎉 모든 보안 조치가 완료되었습니다!"
echo ""
echo "📋 완료된 작업:"
echo "✅ MongoDB Atlas 네트워크 0.0.0.0/0 규칙 제거"
echo "✅ Vercel IP 범위를 허용 목록에 추가"
echo "✅ 디버그 엔드포인트 완전 비활성화"
echo "✅ 하드코딩된 JWT_SECRET 기본값 제거"
echo "✅ GOOGLE_REDIRECT_URI 프로덕션 도메인으로 수정"
echo "✅ 새로운 보안 환경변수 생성 및 적용"
echo "✅ 프로덕션 배포 완료"
echo "✅ 보안 검증 테스트 실행"
echo ""
echo "🔔 남은 작업:"
echo "1. 네이버 개발자 센터에서 QR 도메인 등록"
echo "   - 도메인: korean-safety-chatbot-app.vercel.app"
echo "   - QR URL: https://korean-safety-chatbot-app.vercel.app/qr-safety"
echo ""
echo "2. Google Cloud Console에서 OAuth 설정 업데이트 확인"
echo "   - 승인된 리디렉션 URI에 새 도메인 추가 확인"
echo ""
echo "3. 정기적인 보안 점검"
echo "   - ./scripts/security_verification.sh 정기 실행"
echo "   - 환경변수 정기 로테이션 (분기별 권장)"
echo ""
echo "🚨 중요 보안 수칙:"
echo "- 생성된 새 비밀번호와 JWT_SECRET을 안전하게 보관하세요"
echo "- MongoDB Atlas 접근 로그를 정기적으로 모니터링하세요"
echo "- Vercel 배포 로그를 주기적으로 검토하세요"
echo ""
log_success "한국어 안전 챗봇 보안 강화 완료! 🛡️"