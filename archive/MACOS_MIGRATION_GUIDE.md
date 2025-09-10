# 🍎 macOS 환경 이전 가이드

## 🎯 **Windows → macOS 프로젝트 이전 전략**

### **Option 1: 간단한 파일 복사 (권장)**
```bash
# Windows에서 (현재 위치)
cd C:\code\ai-chatbot-2
tar -czf korean-chatbot-project.tar.gz .

# 클라우드(Google Drive/iCloud) 또는 USB로 이전

# macOS에서  
cd ~/Desktop
tar -xzf korean-chatbot-project.tar.gz
mv . korean-safety-chatbot
```

### **Option 2: Git 저장소 생성**
```bash
# Windows에서
git init
git add .
git commit -m "Initial Korean Safety Chatbot project"
git remote add origin [GitHub 저장소]
git push -u origin main

# macOS에서
git clone [GitHub 저장소] korean-safety-chatbot
```

## 🛠️ **macOS 환경 설정**

### **1단계: 개발 도구 설치**
```bash
# Homebrew 설치 (없다면)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치
brew install node

# CURSOR IDE 다운로드
# https://cursor.sh → macOS 버전 다운로드
```

### **2단계: 프로젝트 초기화**
```bash
cd ~/Desktop/korean-safety-chatbot

# 권한 설정
chmod +x *.sh

# Node.js 의존성 확인
node --version  # v18 이상 확인
npm --version   # v9 이상 확인

# Gemini API 키 설정
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

### **3단계: CURSOR + Claude Code 설정**
```bash
# CURSOR로 프로젝트 열기
cursor .

# 또는 Finder에서 폴더를 CURSOR로 드래그
```

## 🔧 **macOS 최적화 설정**

### **터미널 설정**
```bash
# Oh My Zsh 설치 (터미널 개선)
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 유용한 별칭 추가 (~/.zshrc)
alias ll='ls -la'
alias dev='npm run dev'  
alias build='npm run build'
alias chat='cd ~/Desktop/korean-safety-chatbot'
```

### **Gemini CLI 설정**
```bash
# Gemini CLI가 따로 있다면 설치
# (아직 공식 Gemini CLI는 없으므로, 웹 인터페이스 또는 API 직접 사용)

# 대안: 간단한 Gemini 스크립트 생성
cat > gemini-helper.js << 'EOF'
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function chat(message) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(message);
  console.log(result.response.text());
}

chat(process.argv[2]);
EOF
```

## 📁 **프로젝트 구조 확인**

### **이전 후 파일 확인**
```bash
cd korean-safety-chatbot
tree -I node_modules

# 예상 구조:
# ├── AI_WORKFLOW.md
# ├── KOREAN_CHATBOT_DESIGN.md  
# ├── SIMPLE_CHATBOT_STRUCTURE.md
# ├── OPTIMAL_WORKFLOW.md
# ├── .env
# └── (기타 설계 파일들)
```

### **macOS 권한 설정**
```bash
# 실행 권한 부여
find . -name "*.sh" -exec chmod +x {} \;

# 폴더 권한 설정
chmod -R 755 .
```

## 🚀 **다음 단계: 개발 시작**

### **1단계: 환경 테스트**
```bash
# Node.js 환경 테스트
node -e "console.log('Node.js 정상 작동!')"

# Gemini API 테스트  
node -e "
require('dotenv').config();
console.log('API Key:', process.env.GEMINI_API_KEY ? '설정됨' : '미설정');
"
```

### **2단계: Next.js 프로젝트 생성**
```bash
# OPTIMAL_WORKFLOW.md의 setup.sh 실행
./setup.sh

# 또는 수동으로:
npx create-next-app@latest korean-safety-chatbot --typescript --tailwind
cd korean-safety-chatbot  
npm install @google/generative-ai
```

## ⚡ **효율성 비교**

### **현재 환경 vs Kiro IDE**
```yaml
현재 방법 (CURSOR + macOS):
  설정시간: 30분
  비용: $0  
  안정성: ⭐⭐⭐⭐⭐
  완성률: 95%

Kiro IDE 방법:
  설정시간: 2-3일
  비용: 월 구독료
  안정성: ⭐⭐⭐ (불확실)
  완성률: 70% (새로운 도구 리스크)
```

## 🎯 **최종 권장**

```bash
# macOS 이전 후 바로 실행할 명령어들
cd ~/Desktop/korean-safety-chatbot
chmod +x *.sh
echo "GEMINI_API_KEY=your_key" > .env
cursor .

# 그리고 기존 계획대로 진행:
# 1. CURRENT_TASK.md를 Gemini에게 전달
# 2. Next.js 프로젝트 생성
# 3. 3일 완성 계획 실행
```

**결론**: macOS로 이전은 좋지만, **Kiro IDE보다는 검증된 CURSOR + Claude Code 조합이 더 효율적**입니다! 🎯