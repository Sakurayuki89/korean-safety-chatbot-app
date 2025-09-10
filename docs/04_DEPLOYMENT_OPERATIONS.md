# 🚀 배포 및 운영 가이드

## 📦 배포 전략 개요

### 배포 환경 구성
```
Development → Staging → Production
    ↓           ↓           ↓
  localhost   staging.   production.
   :3003      domain     domain
```

### 지원 플랫폼
- **Vercel** (권장) - 자동 배포, CDN, 서버리스
- **AWS ECS/Fargate** - 컨테이너 기반
- **Google Cloud Run** - 서버리스 컨테이너
- **Self-hosted** - 직접 서버 관리

---

## 🌟 Vercel 배포 (권장)

### 1. Vercel 계정 설정

#### 초기 설정
```bash
# Vercel CLI 설치
npm i -g vercel

# Vercel 로그인
vercel login

# 프로젝트 연결
cd korean-safety-chatbot
vercel link
```

#### 프로젝트 설정 파일
```json
{
  "name": "korean-safety-chatbot",
  "version": 2,
  "builds": [
    {
      "src": "next.config.js",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. 환경변수 설정

#### Vercel 대시보드에서 설정
```bash
# 또는 CLI로 설정
vercel env add GEMINI_API_KEY
vercel env add MONGODB_URI
vercel env add NEXT_PUBLIC_APP_URL
```

#### 환경별 변수 관리
```yaml
Development:
  GEMINI_API_KEY: dev_key_here
  MONGODB_URI: mongodb://localhost:27017/dev

Preview (Staging):
  GEMINI_API_KEY: staging_key_here
  MONGODB_URI: mongodb+srv://staging-cluster

Production:
  GEMINI_API_KEY: prod_key_here
  MONGODB_URI: mongodb+srv://prod-cluster
  NEXT_PUBLIC_APP_URL: https://your-domain.com
```

### 3. 배포 실행

#### 자동 배포 (Git 연동)
```bash
# GitHub 저장소와 Vercel 연결 후
# main 브랜치 푸시 시 자동 배포

git push origin main
# → 자동으로 프로덕션 배포

git push origin develop  
# → 자동으로 프리뷰 배포
```

#### 수동 배포
```bash
# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod

# 특정 브랜치 배포
vercel --prod --branch main
```

### 4. 도메인 설정

#### 커스텀 도메인 연결
```bash
# 도메인 추가
vercel domains add your-domain.com

# DNS 설정 확인
vercel dns ls your-domain.com

# SSL 인증서 자동 발급 (Let's Encrypt)
```

---

## 🐳 Docker 배포

### 1. Docker 설정

#### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 의존성 설치 스테이지
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 빌드 스테이지
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 프로덕션 실행 스테이지
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3003
ENV PORT 3003
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - MONGODB_URI=${MONGODB_URI}
      - NEXT_PUBLIC_APP_URL=http://localhost:3003
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: korean-safety-chatbot
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongodb_data:
```

### 2. Docker 배포 명령어

```bash
# Docker 이미지 빌드
docker build -t korean-safety-chatbot .

# 컨테이너 실행
docker run -p 3003:3003 --env-file .env.local korean-safety-chatbot

# Docker Compose 사용
docker-compose up -d

# 로그 확인
docker-compose logs -f app

# 컨테이너 상태 확인
docker-compose ps
```

---

## ☁️ AWS 배포

### 1. AWS ECS/Fargate 배포

#### ECS 클러스터 설정
```yaml
# ecs-cluster.yml (CloudFormation)
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: korean-safety-chatbot-cluster
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT
      
  TaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      Family: korean-safety-chatbot-task
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - FARGATE
      Cpu: '256'
      Memory: '512'
      ExecutionRoleArn: !GetAtt TaskExecutionRole.Arn
      TaskRoleArn: !GetAtt TaskRole.Arn
      ContainerDefinitions:
        - Name: korean-safety-chatbot
          Image: your-account.dkr.ecr.region.amazonaws.com/korean-safety-chatbot:latest
          PortMappings:
            - ContainerPort: 3003
              Protocol: tcp
          Environment:
            - Name: NODE_ENV
              Value: production
          Secrets:
            - Name: GEMINI_API_KEY
              ValueFrom: !Ref GeminiAPIKeySecret
            - Name: MONGODB_URI
              ValueFrom: !Ref MongoDBURISecret
          LogConfiguration:
            LogDriver: awslogs
            Options:
              awslogs-group: !Ref CloudWatchLogGroup
              awslogs-region: !Ref AWS::Region
              awslogs-stream-prefix: ecs
```

#### 배포 스크립트
```bash
#!/bin/bash
# deploy-aws.sh

# ECR 로그인
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# 이미지 빌드 및 푸시
docker build -t korean-safety-chatbot .
docker tag korean-safety-chatbot:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/korean-safety-chatbot:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/korean-safety-chatbot:latest

# ECS 서비스 업데이트
aws ecs update-service --cluster korean-safety-chatbot-cluster --service korean-safety-chatbot-service --force-new-deployment

echo "배포가 완료되었습니다!"
```

### 2. AWS 리소스 관리

#### CloudFormation 템플릿
```yaml
# infrastructure.yml
Parameters:
  GeminiAPIKey:
    Type: String
    NoEcho: true
  MongoDBURI:
    Type: String
    NoEcho: true

Resources:
  # VPC 설정
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true

  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: korean-safety-chatbot-alb
      Scheme: internet-facing
      Type: application
      Subnets: 
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup

  # Auto Scaling Group
  AutoScalingGroup:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      MinSize: 1
      MaxSize: 10
      DesiredCapacity: 2
      TargetGroupARNs:
        - !Ref TargetGroup
      LaunchTemplate:
        LaunchTemplateId: !Ref LaunchTemplate
        Version: !GetAtt LaunchTemplate.LatestVersionNumber
```

---

## 📊 모니터링 및 로깅

### 1. 애플리케이션 모니터링

#### Health Check 엔드포인트
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    // 데이터베이스 연결 확인
    const client = await clientPromise
    await client.db().admin().ping()
    
    // 애플리케이션 상태 정보
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      database: 'connected',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
    
    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}
```

#### 성능 메트릭 수집
```typescript
// lib/monitoring.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  
  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }
  
  trackAPICall(endpoint: string, duration: number, success: boolean) {
    // 메트릭 수집 로직
    console.log(`API ${endpoint}: ${duration}ms, success: ${success}`)
    
    // 외부 모니터링 서비스에 전송 (예: DataDog, New Relic)
    if (process.env.MONITORING_ENABLED === 'true') {
      this.sendMetric('api.response_time', duration, {
        endpoint,
        success: success.toString()
      })
    }
  }
  
  trackError(error: Error, context: Record<string, any>) {
    console.error('Application Error:', error, context)
    
    // 에러 트래킹 서비스에 전송 (예: Sentry)
    if (process.env.ERROR_TRACKING_ENABLED === 'true') {
      this.sendError(error, context)
    }
  }
  
  private sendMetric(name: string, value: number, tags: Record<string, string>) {
    // 실제 메트릭 전송 구현
  }
  
  private sendError(error: Error, context: Record<string, any>) {
    // 실제 에러 전송 구현
  }
}
```

### 2. 로깅 시스템

#### 구조화된 로깅
```typescript
// lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'korean-safety-chatbot',
    version: process.env.npm_package_version 
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
```

#### API 요청 로깅 미들웨어
```typescript
// lib/middleware/logging.ts
import { NextRequest, NextResponse } from 'next/server'
import logger from '@/lib/logger'

export function logRequest(request: NextRequest) {
  const start = Date.now()
  
  return {
    onComplete: (response: NextResponse) => {
      const duration = Date.now() - start
      
      logger.info('API Request', {
        method: request.method,
        url: request.url,
        status: response.status,
        duration,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
    }
  }
}
```

### 3. 외부 모니터링 서비스 연동

#### Sentry 에러 트래킹
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ]
})

export default Sentry
```

#### Grafana 대시보드 설정
```yaml
# grafana-dashboard.json
{
  "dashboard": {
    "title": "Korean Safety Chatbot Monitoring",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ]
  }
}
```

---

## 🔒 보안 및 운영 설정

### 1. SSL/TLS 설정

#### Nginx 설정
```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://app:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. 환경별 보안 설정

#### 프로덕션 환경 변수
```bash
# .env.production
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# API Keys (실제 배포 시 보안 관리 도구 사용)
GEMINI_API_KEY=prod_key_from_secrets_manager
MONGODB_URI=mongodb+srv://prod_cluster_from_secrets_manager

# 보안 설정
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# 모니터링
MONITORING_ENABLED=true
ERROR_TRACKING_ENABLED=true
LOG_LEVEL=warn
```

### 3. 백업 및 재해 복구

#### MongoDB 백업 스크립트
```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DATABASE_NAME="korean-safety-chatbot"

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# MongoDB 덤프
mongodump \
  --uri="$MONGODB_URI" \
  --db="$DATABASE_NAME" \
  --out="$BACKUP_DIR/backup_$DATE"

# 압축
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "backup_$DATE"
rm -rf "$BACKUP_DIR/backup_$DATE"

# 30일 이상된 백업 삭제
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

#### 자동화 백업 (Crontab)
```bash
# 매일 새벽 2시 백업 실행
0 2 * * * /path/to/backup-mongodb.sh

# 매주 일요일 새벽 3시 전체 시스템 백업
0 3 * * 0 /path/to/full-system-backup.sh
```

---

## 🚨 장애 대응 및 복구

### 1. 장애 감지 및 알림

#### 모니터링 알림 설정
```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@your-domain.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  email_configs:
  - to: 'admin@your-domain.com'
    subject: '[ALERT] {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}

inhibit_rules:
- source_match:
    severity: 'critical'
  target_match:
    severity: 'warning'
  equal: ['alertname', 'dev', 'instance']
```

### 2. 장애 복구 절차

#### 데이터베이스 복구
```bash
#!/bin/bash
# restore-mongodb.sh

BACKUP_FILE=$1
DATABASE_NAME="korean-safety-chatbot"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.tar.gz>"
  exit 1
fi

# 백업 파일 압축 해제
tar -xzf "$BACKUP_FILE"

# 데이터베이스 복구
mongorestore \
  --uri="$MONGODB_URI" \
  --db="$DATABASE_NAME" \
  --drop \
  "./backup_*/$DATABASE_NAME"

echo "Database restored from $BACKUP_FILE"
```

#### 애플리케이션 롤백
```bash
#!/bin/bash
# rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "Usage: $0 <previous_version_tag>"
  exit 1
fi

# Docker 이미지 롤백
docker pull your-registry/korean-safety-chatbot:$PREVIOUS_VERSION
docker stop korean-safety-chatbot
docker run -d --name korean-safety-chatbot \
  --env-file .env.production \
  -p 3003:3003 \
  your-registry/korean-safety-chatbot:$PREVIOUS_VERSION

echo "Application rolled back to version $PREVIOUS_VERSION"
```

### 3. 성능 튜닝

#### 데이터베이스 최적화
```javascript
// MongoDB 인덱스 최적화
db.chat_history.createIndex({ sessionId: 1, createdAt: -1 })
db.announcements.createIndex({ title: "text", content: "text" }, { weights: { title: 10, content: 5 } })

// 쿼리 성능 분석
db.chat_history.find({ sessionId: "session123" }).explain("executionStats")

// 슬로우 쿼리 모니터링
db.setProfilingLevel(2, { slowms: 100 })
```

#### 애플리케이션 최적화
```typescript
// 캐싱 전략
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function getCachedResponse(key: string): Promise<string | null> {
  return await redis.get(key)
}

export async function setCachedResponse(key: string, value: string, ttl: number = 3600): Promise<void> {
  await redis.setex(key, ttl, value)
}

// 응답 캐싱 미들웨어
export function withCache(handler: Function, ttl: number = 3600) {
  return async (req: NextRequest) => {
    const cacheKey = `api:${req.method}:${req.url}`
    const cached = await getCachedResponse(cacheKey)
    
    if (cached) {
      return new Response(cached, {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const response = await handler(req)
    const responseText = await response.text()
    
    await setCachedResponse(cacheKey, responseText, ttl)
    
    return new Response(responseText, response)
  }
}
```

---

## 📋 운영 체크리스트

### 배포 전 체크리스트
- [ ] 모든 테스트 통과 확인
- [ ] 환경변수 설정 검증
- [ ] 데이터베이스 연결 테스트
- [ ] SSL/TLS 인증서 확인
- [ ] 백업 시스템 작동 확인
- [ ] 모니터링 시스템 설정
- [ ] 로그 수집 시스템 확인
- [ ] 성능 테스트 수행
- [ ] 보안 스캔 실행
- [ ] 문서 업데이트

### 배포 후 체크리스트
- [ ] Health Check 엔드포인트 확인
- [ ] 주요 기능 테스트
- [ ] 성능 메트릭 모니터링
- [ ] 에러 로그 확인
- [ ] 사용자 피드백 수집
- [ ] 트래픽 패턴 분석
- [ ] 리소스 사용량 모니터링
- [ ] 백업 자동화 확인
- [ ] 알림 시스템 테스트
- [ ] 롤백 계획 검토

### 정기 운영 작업
#### 일간 작업
- [ ] 시스템 상태 확인
- [ ] 에러 로그 검토
- [ ] 성능 지표 분석
- [ ] 사용자 피드백 검토

#### 주간 작업
- [ ] 백업 무결성 확인
- [ ] 보안 패치 검토
- [ ] 용량 계획 검토
- [ ] 성능 트렌드 분석

#### 월간 작업
- [ ] 전체 시스템 백업
- [ ] 보안 감사 수행
- [ ] 용량 계획 업데이트
- [ ] 재해 복구 테스트
- [ ] 비용 최적화 검토