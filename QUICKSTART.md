# 🚀 ProtoCheck - Firebase 버전 빠른 시작

## ✅ 변경 사항

### 이전 (Serverless Functions)
- ❌ 복잡한 OAuth 설정
- ❌ Vercel Functions 필요
- ❌ 수동 토큰 관리

### 지금 (Firebase Authentication)
- ✅ 간단한 Firebase 설정
- ✅ 자동 인증 관리
- ✅ Google Drive 연동

---

## 📋 5분 안에 시작하기

### 1️⃣ 파일 압축 해제
```bash
unzip protocheck-firebase.zip
cd protocheck-deploy
```

### 2️⃣ 패키지 설치
```bash
npm install
```

### 3️⃣ Firebase Console 설정 (2분)

#### A. Firebase Authentication 활성화
1. [Firebase Console](https://console.firebase.google.com/) → 프로젝트 선택
2. **Build > Authentication** 클릭
3. **"Get started"** 클릭
4. **Sign-in method** 탭
5. **Google** 선택 → **Enable** 토글
6. Support email 선택 → **Save**

#### B. Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **APIs & Services > OAuth consent screen**
3. **Scopes** 탭에서 **ADD OR REMOVE SCOPES**
4. 다음 추가:
   ```
   https://www.googleapis.com/auth/drive.file
   ```
5. **UPDATE** → **SAVE AND CONTINUE**

#### C. Drive API 활성화
1. **APIs & Services > Library**
2. "Google Drive API" 검색
3. **ENABLE** 클릭

#### D. Test Users 추가
1. **OAuth consent screen > Test users**
2. 본인 Google 이메일 추가

### 4️⃣ 환경 변수 설정

`.env` 파일이 이미 있으므로 **바로 사용 가능**:
```bash
VITE_FIREBASE_API_KEY=AIzaSyDs82gPHjaHBfB4WcGJze71Wj3JICRsbbE
VITE_FIREBASE_AUTH_DOMAIN=motg-protocheck.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=motg-protocheck
VITE_FIREBASE_APP_ID=1:1096054858484:web:00dfe8370d759ad4cf74a1
```

### 5️⃣ 실행!
```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

---

## 🎯 테스트하기

1. **"시작하기"** 버튼 클릭
2. Google 계정 선택
3. **Google Drive 접근 권한** 승인
4. 로그인 완료! 🎉

---

## ❗ 문제 해결

### 팝업이 차단되는 경우
- 브라우저 주소창 옆의 팝업 차단 아이콘 클릭
- 이 사이트의 팝업 허용

### "Access blocked" 에러
- Firebase Console > OAuth consent screen에서 Test users에 본인 이메일 추가 확인
- Google Cloud Console > OAuth consent screen > Scopes에 Drive API 추가 확인

### "Drive API has not been used"
- Google Cloud Console > APIs & Services > Library에서 Drive API 활성화

---

## 📖 더 자세한 가이드

`GOOGLE_OAUTH_SETUP.md` 파일 참고

---

## 🆚 기존 버전과의 차이

| 항목 | 기존 (OAuth Direct) | 지금 (Firebase) |
|------|---------------------|----------------|
| 설정 난이도 | 복잡 | 간단 |
| 코드 복잡도 | 높음 | 낮음 |
| 토큰 관리 | 수동 | 자동 |
| 에러 처리 | 복잡 | 간단 |
| 보안 | 보통 | 우수 |
| 서버 필요 | ✅ Vercel Functions | ❌ 필요 없음 |

---

## ✨ 추가된 기능

- ✅ 자동 로그인 상태 유지
- ✅ 토큰 자동 갱신
- ✅ 세션 관리 자동화
- ✅ 더 나은 에러 처리
- ✅ Firebase 보안 규칙 적용 가능

---

궁금한 점이 있으면 `GOOGLE_OAUTH_SETUP.md`를 참고하세요!
