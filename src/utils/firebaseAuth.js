import { 
  signInWithPopup,
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

// Google 로그인 (팝업 방식 - 더 안정적)
export async function loginWithGoogle() {
  try {
    console.log('🔐 Google 로그인 시도...');
    
    const result = await signInWithPopup(auth, googleProvider);
    
    console.log('✅ Firebase 인증 완료');
    
    // Access Token 가져오기
    const credential = result._tokenResponse;
    const accessToken = credential.oauthAccessToken;
    
    if (!accessToken) {
      console.error('❌ Access Token을 가져올 수 없습니다');
      throw new Error('Failed to get access token');
    }
    
    console.log('✅ Access Token 획득');
    
    // Access Token 저장
    localStorage.setItem('google_access_token', accessToken);
    localStorage.setItem('google_access_token_expires', 
      new Date(Date.now() + 3600000).toISOString() // 1시간 후 만료
    );
    
    const user = result.user;
    
    // 사용자 정보 구성
    const userInfo = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      picture: user.photoURL
    };
    
    console.log('✅ 사용자 정보:', userInfo);
    
    // 사용자 정보 저장
    saveUserInfo(userInfo);
    
    return {
      user: userInfo,
      accessToken
    };
  } catch (error) {
    console.error('❌ 로그인 실패:', error);
    
    // 사용자가 팝업을 닫은 경우
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('로그인 창이 닫혔습니다. 다시 시도해주세요.');
    }
    
    // 팝업 차단된 경우
    if (error.code === 'auth/popup-blocked') {
      throw new Error('팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.');
    }
    
    throw error;
  }
}

// 리다이렉트 결과 처리 (호환성 유지용 - 더 이상 사용 안 함)
export async function handleRedirectResult() {
  // Popup 방식으로 변경되어 이 함수는 null 반환
  return null;
}

// 로그아웃
export async function logout() {
  try {
    console.log('🚪 로그아웃 시작...');
    
    await signOut(auth);
    
    // 로컬 스토리지 정리
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_access_token_expires');
    localStorage.removeItem('google_user_info');
    
    console.log('✅ 로그아웃 완료');
  } catch (error) {
    console.error('❌ 로그아웃 실패:', error);
    throw error;
  }
}

// 인증 상태 변경 감지
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      console.log('🔐 Firebase 사용자 인증됨:', firebaseUser.email);
      
      const userInfo = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        picture: firebaseUser.photoURL
      };
      
      // Access Token 확인
      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.warn('⚠️ Access Token 없음 - 재로그인 필요할 수 있음');
      }
      
      callback(userInfo);
    } else {
      console.log('🔓 로그아웃 상태');
      callback(null);
    }
  });
}

// 현재 로그인된 사용자 가져오기
export function getCurrentUser() {
  return auth.currentUser;
}

// 로그인 여부 확인
export function isLoggedIn() {
  return !!auth.currentUser;
}

// Access Token 가져오기 (Drive API용)
export async function getAccessToken() {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ 로그인되지 않음');
    return null;
  }
  
  try {
    // 로컬 스토리지에서 가져오기
    const stored = localStorage.getItem('google_access_token');
    const expires = localStorage.getItem('google_access_token_expires');
    
    if (!stored) {
      console.warn('⚠️ Access Token이 저장되어 있지 않음');
      return null;
    }
    
    // 만료 확인
    if (expires && new Date(expires) < new Date()) {
      console.warn('⚠️ Access Token 만료됨 - 재로그인 필요');
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_access_token_expires');
      return null;
    }
    
    return stored;
  } catch (error) {
    console.error('❌ Access Token 가져오기 실패:', error);
    return null;
  }
}

// 사용자 정보 저장
export function saveUserInfo(userInfo) {
  try {
    localStorage.setItem('google_user_info', JSON.stringify(userInfo));
    console.log('✅ 사용자 정보 저장됨');
  } catch (error) {
    console.error('❌ 사용자 정보 저장 실패:', error);
  }
}

// 저장된 사용자 정보 가져오기
export function getSavedUserInfo() {
  try {
    const saved = localStorage.getItem('google_user_info');
    if (!saved) return null;
    
    return JSON.parse(saved);
  } catch (error) {
    console.error('❌ 사용자 정보 가져오기 실패:', error);
    return null;
  }
}

// Firebase ID Token 가져오기 (백엔드 인증용)
export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('❌ ID Token 가져오기 실패:', error);
    return null;
  }
}

// Access Token 새로고침 (필요시)
export async function refreshAccessToken() {
  try {
    console.log('🔄 Access Token 새로고침 시도...');
    
    // 현재 사용자의 ID Token으로 새 Access Token 요청
    // 실제로는 백엔드 서버를 통해 처리하는 것이 안전함
    // 여기서는 재로그인을 권장
    
    console.warn('⚠️ Access Token 만료 - 재로그인이 필요합니다');
    return null;
  } catch (error) {
    console.error('❌ Access Token 새로고침 실패:', error);
    return null;
  }
}
