# Firebase Authentication 설정 가이드

## 🔥 Firebase Console 설정

### 1단계: Firebase 프로젝트 확인

이미 Firebase 프로젝트가 있으므로 이 단계는 건너뛸 수 있습니다.
- 프로젝트 ID: `motg-protocheck`
- [Firebase Console](https://console.firebase.google.com/) 접속

### 2단계: Authentication 활성화

1. Firebase Console에서 프로젝트 선택
2. 왼쪽 메뉴에서 **"Build" > "Authentication"** 클릭
3. **"Get started"** 클릭 (처음 사용시)
4. **"Sign-in method"** 탭 선택
5. **"Google"** 선택
6. **"Enable"** 토글 활성화
7. **"Project support email"** 선택 (본인 이메일)
8. **"Save"** 클릭

### 3단계: Google Cloud Console 추가 설정

Firebase Authentication으로 Google 로그인을 사용하려면 Google Cloud Console에서 추가 권한 설정이 필요합니다.

#### 3-1. OAuth Consent Screen 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 (Firebase와 연동된 프로젝트)
3. **"APIs & Services" > "OAuth consent screen"** 이동
4. User Type: **"External"** 선택 후 **"CREATE"**
5. 앱 정보 입력:
   - App name: **ProtoCheck**
   - User support email: 본인 이메일
   - Developer contact information: 본인 이메일
6. **"SAVE AND CONTINUE"** 클릭
7. Scopes 단계에서 **"ADD OR REMOVE SCOPES"** 클릭
8. 다음 scope 추가:
   ```
   https://www.googleapis.com/auth/drive.file
   ```
9. **"UPDATE"** 클릭 후 **"SAVE AND CONTINUE"**
10. Test users 추가 (개발 단계에서는 본인 이메일만)
11. **"SAVE AND CONTINUE"** 클릭

#### 3-2. Google Drive API 활성화

1. **"APIs & Services" > "Library"** 이동
2. **"Google Drive API"** 검색
3. **"ENABLE"** 클릭

#### 3-3. 승인된 도메인 추가

1. **"APIs & Services" > "Credentials"** 이동
2. OAuth 2.0 Client IDs 목록에서 Firebase가 자동 생성한 클라이언트 찾기
   - 이름에 "firebase" 또는 프로젝트 이름 포함
3. 클라이언트 클릭하여 편집
4. **"Authorized JavaScript origins"** 섹션에 추가:
   ```
   http://localhost:5173
   ```
5. **"Authorized redirect URIs"** 섹션 확인 (Firebase가 자동 추가함):
   ```
   https://motg-protocheck.firebaseapp.com/__/auth/handler
   ```
6. **"SAVE"** 클릭

### 4단계: 환경 변수 확인

프로젝트 루트의 `.env` 파일에 이미 설정되어 있어야 합니다:

```bash
VITE_FIREBASE_API_KEY=AIzaSyDs82gPHjaHBfB4WcGJze71Wj3JICRsbbE
VITE_FIREBASE_AUTH_DOMAIN=motg-protocheck.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=motg-protocheck
VITE_FIREBASE_APP_ID=1:1096054858484:web:00dfe8370d759ad4cf74a1
```

**주의:** `VITE_GOOGLE_CLIENT_ID`는 더 이상 필요하지 않습니다 (Firebase가 자동 처리).

## 🚀 실행하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 테스트

1. http://localhost:5173 접속
2. **"시작하기"** 버튼 클릭
3. Google 로그인 팝업에서 계정 선택
4. **Google Drive 접근 권한** 승인
5. 로그인 완료! 🎉

## 🔍 문제 해결

### "Access blocked: Authorization Error" 발생 시

**원인:** OAuth consent screen에 Test user로 추가되지 않았거나 Drive API Scope가 없음

**해결:**
1. Google Cloud Console > OAuth consent screen > Test users에 본인 이메일 추가
2. Scopes에 `https://www.googleapis.com/auth/drive.file` 추가 확인

### 팝업이 차단되는 경우

**해결:**
- 브라우저 주소창 옆 팝업 차단 아이콘 클릭
- 이 사이트의 팝업 허용

### "Drive API has not been used" 에러

**해결:**
1. Google Cloud Console > APIs & Services > Library
2. "Google Drive API" 검색 후 ENABLE

### 로그인 후 Drive 저장이 안되는 경우

**해결:**
- OAuth consent screen의 Scopes에 Drive API가 추가되어 있는지 확인
- 로그아웃 후 다시 로그인 (새로운 권한 요청)

## 📦 배포 시 (Vercel)

### 1. Vercel 환경 변수 설정

Vercel 프로젝트 Settings > Environment Variables에 추가:

```
VITE_FIREBASE_API_KEY=AIzaSyDs82gPHjaHBfB4WcGJze71Wj3JICRsbbE
VITE_FIREBASE_AUTH_DOMAIN=motg-protocheck.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=motg-protocheck
VITE_FIREBASE_APP_ID=1:1096054858484:web:00dfe8370d759ad4cf74a1
```

### 2. Firebase 도메인 설정

1. Firebase Console > Authentication > Settings
2. "Authorized domains" 탭에서 배포 도메인 추가:
   ```
   your-app.vercel.app
   ```

### 3. Google Cloud Console 도메인 추가

1. APIs & Services > Credentials > OAuth 2.0 Client 편집
2. Authorized JavaScript origins에 추가:
   ```
   https://your-app.vercel.app
   ```

## 🎯 Firebase vs 기존 방식 비교

### Firebase Authentication ✅ (현재)
- ✅ 로그인/로그아웃 자동 관리
- ✅ 토큰 자동 갱신
- ✅ 보안성 향상
- ✅ 세션 관리 자동화
- ✅ 간단한 코드

### 기존 방식 (Serverless Functions) ❌
- ❌ 수동 토큰 관리 필요
- ❌ 서버리스 함수 배포 필요
- ❌ 복잡한 OAuth 플로우
- ❌ 에러 처리 복잡

## 🔐 보안 참고사항

- Firebase API Key는 공개되어도 안전합니다 (Firebase 보안 규칙으로 보호)
- 실제 민감한 데이터는 Firestore Security Rules로 보호
- 현재는 로컬 IndexedDB + Google Drive만 사용

