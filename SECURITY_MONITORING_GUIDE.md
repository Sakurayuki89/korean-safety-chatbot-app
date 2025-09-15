# 🔍 Korean Safety Chatbot - 보안 모니터링 가이드

> **프로젝트**: Korean Safety Chatbot
> **마지막 업데이트**: 2025년 9월 15일
> **보안 레벨**: 서비스 운영 단계

---

## 📋 목차

1. [보안 모니터링 개요](#보안-모니터링-개요)
2. [일일 보안 점검](#일일-보안-점검)
3. [주간 보안 검토](#주간-보안-검토)
4. [월간 보안 감사](#월간-보안-감사)
5. [비상 대응 절차](#비상-대응-절차)
6. [자동화 도구 활용](#자동화-도구-활용)

---

## 🛡️ 보안 모니터링 개요

### 목표
- 실시간 보안 위협 탐지 및 대응
- 정기적인 보안 상태 점검 및 개선
- 보안 사고 예방 및 신속한 복구
- 지속적인 보안 수준 향상

### 모니터링 대상
1. **인증 시스템**: 로그인 시도, 실패 패턴
2. **API 보안**: Rate Limiting, 비정상 요청
3. **데이터베이스**: 접근 로그, 성능 이상
4. **환경변수**: 노출 위험, 만료 일정
5. **의존성**: NPM 취약점, 라이브러리 업데이트

---

## 📅 일일 보안 점검 (5분)

### ✅ 매일 확인할 항목

#### 1. 인증 로그 모니터링
```bash
# Vercel 로그에서 실패한 로그인 시도 확인
vercel logs --team=your-team | grep "Failed login attempt"

# Rate Limiting 발동 확인
vercel logs --team=your-team | grep "Rate limit exceeded"
```

**정상 범위**: 하루 5회 이하 실패 로그인
**경고 기준**: 같은 IP에서 10회 이상 시도
**위험 기준**: 여러 IP에서 동시 브루트 포스

#### 2. 서비스 상태 확인
```bash
# 데이터베이스 연결 상태
curl -s https://korean-safety-chatbot-app.vercel.app/api/db-status

# 응답 시간 확인 (2초 이하 정상)
time curl -s https://korean-safety-chatbot-app.vercel.app/ > /dev/null
```

#### 3. 보안 헤더 검증
```bash
# 보안 헤더 확인
curl -I https://korean-safety-chatbot-app.vercel.app/ | grep -E "X-Frame|X-Content|Strict-Transport"
```

### 🚨 즉시 대응이 필요한 징후
- 5분 내 10회 이상 로그인 실패
- 데이터베이스 연결 실패
- 응답 시간 5초 이상
- 보안 헤더 누락

---

## 📊 주간 보안 검토 (30분)

### 🔍 매주 월요일 실시

#### 1. NPM 취약점 스캔
```bash
# 프로젝트 루트에서 실행
npm audit

# 자동 수정 가능한 취약점 해결
npm audit fix

# 수동 검토 필요한 항목 문서화
npm audit --json > security-audit-$(date +%Y%m%d).json
```

#### 2. 의존성 업데이트 검토
```bash
# 오래된 패키지 확인
npm outdated

# 보안 업데이트만 선별적으로 적용
npm update --depth 0
```

#### 3. 접근 로그 분석
**Vercel Analytics 또는 로그에서 확인할 항목:**
- 비정상적인 트래픽 패턴
- 알려진 악성 IP 접근
- API 엔드포인트 남용
- 404 에러 패턴 (스캐닝 시도)

#### 4. 환경변수 점검
```bash
# 환경변수 강도 재검증
node scripts/check-env-security.js  # (별도 생성 필요)

# 만료 예정 API 키 확인
# - Google API 키 만료일
# - MongoDB Atlas 비밀번호 생성일
# - JWT Secret 생성일
```

---

## 🗓️ 월간 보안 감사 (2시간)

### 📋 매월 첫째 주 실시

#### 1. 종합 보안 테스트
```bash
# 비밀번호 교체 (3개월 주기)
node scripts/generate-secrets.js all

# 보안 헤더 전체 검증
node scripts/security-headers-test.js  # (별도 생성 필요)

# HTTPS 인증서 상태 확인
openssl s_client -connect korean-safety-chatbot-app.vercel.app:443 -servername korean-safety-chatbot-app.vercel.app < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

#### 2. 코드 보안 검토
- **수동 코드 리뷰**: 새로 추가된 인증 관련 코드
- **SQL Injection 점검**: 데이터베이스 쿼리 검토
- **XSS 취약점**: 사용자 입력 처리 로직 검토
- **CSRF 보호**: 폼 제출 보안 검토

#### 3. 백업 및 복구 테스트
```bash
# 데이터베이스 백업 생성
mongodump --uri="$MONGODB_URI" --out=backup-$(date +%Y%m%d)

# 백업 복구 테스트 (테스트 환경에서)
# mongorestore --uri="$TEST_MONGODB_URI" backup-20250915/
```

#### 4. 접근 권한 검토
- **MongoDB Atlas**: 사용자 권한 최소화
- **Vercel**: 팀 멤버 권한 검토
- **Google Cloud**: OAuth 앱 권한 확인
- **GitHub**: Repository 접근 권한

---

## 🚨 비상 대응 절차

### 단계별 대응 매뉴얼

#### 🔴 Level 1: 즉각적인 위협 (5분 내 대응)
**징후**: 대량 브루트 포스, 데이터베이스 침입 시도, 서비스 다운

**즉시 조치**:
1. **서비스 보호**: Rate Limiting 강화 또는 임시 차단
2. **MongoDB Atlas**: 의심스러운 IP 즉시 차단
3. **Vercel**: 필요시 배포 일시 중단
4. **백업 확인**: 최신 백업 상태 검증

```bash
# 긴급 Rate Limiting 강화 (lib/rate-limiter.ts 수정)
# AUTH_LOGIN: { limit: 3, windowMs: 30 * 60 * 1000 }  // 30분에 3회로 축소

# MongoDB Atlas 긴급 조치
# 1. Network Access에서 의심 IP 제거
# 2. 필요시 전체 접근 일시 차단 (0.0.0.0/0 제거)
```

#### 🟡 Level 2: 보안 취약점 발견 (1시간 내 대응)
**징후**: 새로운 NPM 취약점, 코드 취약점 발견, 설정 오류

**대응 절차**:
1. **영향 범위 평가**: 취약점의 실제 영향도 분석
2. **임시 완화**: 즉시 적용 가능한 보안 조치
3. **근본 해결**: 코드 수정 또는 패키지 업데이트
4. **테스트 및 배포**: Preview 환경에서 검증 후 프로덕션 적용

#### 🟢 Level 3: 예방적 조치 (24시간 내 대응)
**징후**: 의심스러운 패턴, 성능 이상, 정기 점검 결과

### 비상 연락 체계
```
1차 대응자: 시스템 관리자
2차 대응자: 개발팀 리더
3차 대응자: 프로젝트 매니저

비상 시 연락 순서:
1. 즉시 대응 (5분)
2. 상황 보고 (15분)
3. 해결 방안 수립 (30분)
4. 사후 분석 (24시간)
```

---

## 🤖 자동화 도구 활용

### 생성된 보안 도구

#### 1. 비밀번호 생성 도구
```bash
# 모든 비밀 키 새로 생성
node scripts/generate-secrets.js all

# 특정 비밀 키만 생성
node scripts/generate-secrets.js admin
node scripts/generate-secrets.js jwt
node scripts/generate-secrets.js mongodb
```

#### 2. 보안 점검 스크립트 (생성 권장)
```bash
# 일일 보안 점검
node scripts/daily-security-check.js

# 주간 취약점 스캔
node scripts/weekly-security-scan.js

# 월간 종합 감사
node scripts/monthly-security-audit.js
```

### GitHub Actions 자동화 (선택사항)
```yaml
# .github/workflows/security-check.yml
name: Security Check
on:
  schedule:
    - cron: '0 9 * * 1'  # 매주 월요일 9시

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: NPM Audit
        run: npm audit --audit-level moderate
      - name: Dependency Check
        run: npm outdated
```

---

## 📊 보안 메트릭 및 KPI

### 추적할 보안 지표

#### 월간 보안 스코어카드
```
✅ 취약점 관리
- 고위험 취약점: 0개 (목표)
- 중위험 취약점: <3개
- 취약점 해결 시간: <7일

✅ 인증 보안
- 브루트 포스 차단율: >99%
- 평균 로그인 실패율: <5%
- Rate Limiting 효과성: >95%

✅ 시스템 안정성
- 평균 응답 시간: <2초
- 서비스 가용성: >99.9%
- 데이터베이스 연결 성공률: >99.5%

✅ 보안 운영
- 비밀 키 교체 주기 준수: 100%
- 보안 점검 완료율: 100%
- 보안 사고 대응 시간: <1시간
```

---

## 🔧 도구 및 리소스

### 필수 도구
- **NPM Audit**: `npm audit`
- **Vercel CLI**: `vercel logs`
- **MongoDB Compass**: 데이터베이스 모니터링
- **Browser Dev Tools**: 보안 헤더 검증

### 외부 보안 서비스 (선택사항)
- **Snyk**: 자동 취약점 스캔
- **Uptime Robot**: 서비스 가용성 모니터링
- **LogRocket**: 사용자 세션 모니터링
- **Cloudflare**: DDoS 보호 및 WAF

### 학습 리소스
- **OWASP Top 10**: 웹 애플리케이션 보안
- **Node.js Security**: https://nodejs.org/en/security/
- **Next.js Security**: https://nextjs.org/docs/advanced-features/security-headers

---

## 📞 지원 및 문의

### 보안 사고 신고
- **긴급**: 프로젝트 관리자에게 즉시 연락
- **일반**: GitHub Issues에 `security` 라벨로 등록
- **익명**: 별도 보안 신고 채널 (설정 시)

### 외부 지원
- **Vercel Support**: https://vercel.com/help
- **MongoDB Support**: https://docs.atlas.mongodb.com/
- **Google Cloud Support**: https://cloud.google.com/support

---

**⚠️ 중요 알림**: 이 가이드는 정기적으로 업데이트되어야 하며, 새로운 위협이나 도구 변경사항을 반영해야 합니다.