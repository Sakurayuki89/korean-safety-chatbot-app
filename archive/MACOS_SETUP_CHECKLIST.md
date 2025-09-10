# 🍎 macOS 설정 체크리스트

## 📦 **이전 완료된 파일**
✅ **korean-safety-chatbot.tar.gz** (14.6KB) 생성 완료

## 🚀 **macOS에서 실행할 단계별 명령어**

### **1단계: 파일 이전 및 압축 해제**
```bash
# 1. Desktop으로 이동
cd ~/Desktop

# 2. 압축 파일 해제 (korean-safety-chatbot.tar.gz를 Desktop에 복사 후)
tar -xzf korean-safety-chatbot.tar.gz
mkdir korean-safety-chatbot
mv *.md .env .gitignore korean-safety-chatbot/
cd korean-safety-chatbot

# 3. 파일 확인
ls -la
```

### **2단계: 개발 환경 설정**
```bash
# Node.js 설치 확인
node --version  # v18+ 필요
npm --version   # v9+ 필요

# 없다면 설치:
# brew install node

# Gemini API 키 설정 확인
cat .env
# GEMINI_API_KEY가 설정되어 있는지 확인
```

### **3단계: CURSOR IDE 설정**
```bash
# CURSOR IDE로 프로젝트 열기
cursor .

# 또는 CURSOR 앱에서 "Open Folder" → korean-safety-chatbot 선택
```

### **4단계: 프로젝트 초기화**
```bash
# Git 초기화
git init
git add .
git commit -m "Initial Korean Safety Chatbot project setup"

# Next.js 프로젝트 생성 준비
# (이 단계는 Gemini CLI가 실행할 예정)
```

## 📋 **필수 확인 사항**

### **환경 체크리스트**
- [ ] **Node.js v18+** 설치됨
- [ ] **npm v9+** 작동함  
- [ ] **CURSOR IDE** 설치됨
- [ ] **Gemini API 키** .env에 설정됨
- [ ] **모든 .md 파일들** 정상 이전됨

### **파일 체크리스트**
- [ ] AI_WORKFLOW.md
- [ ] KOREAN_CHATBOT_DESIGN.md  
- [ ] SIMPLE_CHATBOT_STRUCTURE.md
- [ ] OPTIMAL_WORKFLOW.md
- [ ] CURRENT_TASK.md
- [ ] MACOS_MIGRATION_GUIDE.md
- [ ] .env
- [ ] .gitignore

## 🎯 **다음 단계: Gemini CLI 작업**

### **Gemini CLI에게 전달할 핵심 파일 3개**
1. **CURRENT_TASK.md** - 작업 지시서
2. **SIMPLE_CHATBOT_STRUCTURE.md** - 구조 설계
3. **KOREAN_CHATBOT_DESIGN.md** - 한국어 특화 설계

### **첫 번째 Gemini CLI 실행 명령어**
```bash
npx create-next-app@latest korean-safety-chatbot-app --typescript --tailwind --eslint --app
cd korean-safety-chatbot-app
npm install @google/generative-ai
mkdir -p components lib data
```

## ⏰ **예상 소요 시간**
- **파일 이전**: 5분
- **환경 설정**: 10분  
- **CURSOR 설정**: 5분
- **총 소요 시간**: 20분

## 🎉 **성공 확인 방법**
```bash
# 터미널에서 이 명령어들이 모두 성공하면 준비 완료!
node --version
npm --version
cat .env | grep GEMINI_API_KEY
ls *.md | wc -l  # 10개 파일 확인
```

---
**🚀 macOS 설정이 완료되면 기존 3일 완성 계획을 그대로 진행하면 됩니다!**