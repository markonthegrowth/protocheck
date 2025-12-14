import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Shield, Cloud, Zap, CheckCircle } from 'lucide-react';
import { loginWithGoogle, isLoggedIn, getSavedUserInfo } from './utils/firebaseAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState(null);

  // 이미 로그인되어 있으면 프로젝트 페이지로 리다이렉트
  useEffect(() => {
    if (isLoggedIn()) {
      const user = getSavedUserInfo();
      if (user) {
        console.log('✅ 이미 로그인됨, /my-project로 이동');
        navigate('/my-project', { replace: true });
      }
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);

    try {
      console.log('🔐 Google 로그인 시작...');
      const result = await loginWithGoogle();

      if (result && result.user) {
        console.log('✅ 로그인 성공:', result.user.email);
        
        // 프로젝트 목록 페이지로 이동
        navigate('/my-project', { replace: true });
      }
    } catch (err) {
      console.error('❌ 로그인 실패:', err);
      setError(err.message || '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">ProtoCheck</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-900 transition"
          >
            홈으로
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                ProtoCheck에 오신 것을 환영합니다
              </h1>
              <p className="text-slate-600">
                Google 계정으로 간편하게 시작하세요
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full py-4 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  로그인 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google로 계속하기
                </>
              )}
            </button>

            {/* Features */}
            <div className="pt-4 space-y-3 border-t border-slate-100">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>모든 기능 무료 사용</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Cloud className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>Google Drive에 안전하게 저장</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Zap className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>AI 기반 패턴 분석</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Shield className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>개인정보 보호 보장</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="mt-6 text-center text-sm text-slate-500">
            로그인하면{' '}
            <a href="#" className="text-blue-600 hover:underline">
              이용약관
            </a>
            과{' '}
            <a href="#" className="text-blue-600 hover:underline">
              개인정보처리방침
            </a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
