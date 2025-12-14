# ProtoCheck

나만의 사업 아이디어를 체계적으로 검증하는 4단계 프레임워크

## 🚀 빠른 시작

### 1. 설치
```bash
npm install
```

### 2. Firebase 설정
1. `.env.example` 파일을 `.env`로 복사
2. Firebase Console에서 프로젝트 설정 값으로 업데이트
3. 상세 가이드: `GOOGLE_OAUTH_SETUP.md` 참고

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173` 접속

### 4. 빌드 (배포용)
```bash
npm run build
```

## 🔐 인증 & 저장 시스템

### Firebase Authentication (Google 로그인)
- 🔑 Google 계정으로 간편 로그인
- 🔄 자동 세션 관리
- 🔒 보안 강화

### 데이터 저장 (Hybrid)
- 💾 **로컬**: IndexedDB (오프라인 가능)
- ☁️ **클라우드**: Google Drive (로그인 시)
- 🔄 자동 동기화

**장점:**
- 로그인 없이도 사용 가능 (로컬 저장)
- 로그인하면 Drive에 자동 백업
- 여러 기기에서 동기화

## 🤖 AI 기능 설정 (Groq API - 무료)

### Step 1: Groq API 키 발급
1. [console.groq.com](https://console.groq.com) 접속
2. 회원가입 (Google 계정으로 간편 가입)
3. "API Keys" 메뉴 클릭
4. "Create API Key" 클릭
5. 키 복사해두기 (gsk_로 시작하는 문자열)

### Step 2: Vercel 환경 변수 설정
1. Vercel 대시보드 → 프로젝트 선택
2. "Settings" → "Environment Variables"
3. 추가:
   - Name: `GROQ_API_KEY`
   - Value: 복사한 API 키
   - Name: `VITE_FIREBASE_API_KEY`
   - Value: Firebase API Key
   - Name: `VITE_FIREBASE_AUTH_DOMAIN`
   - Value: Firebase Auth Domain
   - Name: `VITE_FIREBASE_PROJECT_ID`
   - Value: Firebase Project ID
   - Name: `VITE_FIREBASE_APP_ID`
   - Value: Firebase App ID
4. "Save" 클릭

### Step 3: 재배포
환경 변수 추가 후 "Deployments" → "Redeploy" 클릭

## 📦 Vercel 배포 방법

### Step 1: GitHub에 업로드
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/protocheck.git
git push -u origin main
```

### Step 2: Vercel 연결
1. [vercel.com](https://vercel.com) 접속
2. "Sign up with GitHub" 클릭
3. "Add New..." → "Project" 클릭
4. GitHub 레포지토리 선택 (protocheck)
5. Framework Preset: "Vite" 자동 감지됨
6. Environment Variables 추가 (위 참고)
7. "Deploy" 클릭
8. 완료! → `protocheck.vercel.app` 주소 받음

## 🎯 주요 기능

- **Google 로그인** - 간편 인증 & Drive 연동
- **1단계: 불편함 수집** - 일상의 불편함을 기록
- **2단계: 패턴 분석** - AI 기반 패턴 자동 분석
- **3단계: 아이디어 검증** - 인터뷰 & 온라인 리서치
- **4단계: MVP 테스트** - AI 기반 테스트 플랜 생성
- **내 프로젝트** - 여러 프로젝트 동시 관리
- **클라우드 백업** - Google Drive 자동 저장

## 🔒 AI 사용 제한

- 유저당 하루 3회 제한
- 자정에 자동 리셋
- Groq 무료 티어: 분당 30회 요청

## 💾 데이터 저장

### 로컬 저장 (기본)
- IndexedDB를 사용한 브라우저 로컬 저장
- 자동 저장 (1초 debounce)
- 페이지 새로고침해도 데이터 유지
- 로그인 없이도 사용 가능

### 클라우드 저장 (로그인 시)
- Google Drive에 자동 백업
- 여러 기기에서 동기화
- 프로젝트별 JSON 파일로 저장
- 백업/복원 기능

## 🔧 기술 스택

- React 18
- Vite
- Tailwind CSS
- Lucide React Icons
- **Firebase Authentication** (Google 로그인)
- IndexedDB (로컬 저장)
- **Google Drive API** (클라우드 백업)
- Groq API (Llama 3.1)
- Vercel (호스팅)

## 📝 라이선스

MIT License
