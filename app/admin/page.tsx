'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8 min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Dynamically import manager components
const DynamicAnnouncementManager = dynamic(() => import('@/components/admin/AnnouncementManager'), { 
  loading: () => <LoadingSpinner /> 
});
const DynamicPdfManager = dynamic(() => import('@/components/admin/PdfManager'), { 
  loading: () => <LoadingSpinner /> 
});
const DynamicInquiryManager = dynamic(() => import('@/components/admin/InquiryManager'), { 
  loading: () => <LoadingSpinner /> 
});
const DynamicSafetyItemManager = dynamic(() => import('@/components/admin/SafetyItemManager'), { 
  loading: () => <LoadingSpinner /> 
});
const DynamicItemRequestManager = dynamic(() => import('@/components/admin/ItemRequestManager'), {
  loading: () => <LoadingSpinner />
});
const DynamicQrGenerator = dynamic(() => import('../admin/qr/page'), {
  loading: () => <LoadingSpinner />
});

// Main Admin Page Component
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'google'

  useEffect(() => {
    // Check authentication status when the component mounts
    const checkAuth = async () => {
      try {
        console.log('[AdminPage] Checking authentication status...');
        const response = await fetch('/api/auth/status', {
          credentials: 'include', // 이것이 핵심! 쿠키 전송을 위해 필요
          cache: 'no-store'
        });
        
        console.log('[AdminPage] Auth status response:', response.status, response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[AdminPage] Auth data:', data);
          setIsAuthenticated(data.isAuthenticated);
        } else {
          console.error('[AdminPage] Auth check failed with status:', response.status);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[AdminPage] Auth check failed with error:', error);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    
    // 약간의 지연을 두어 쿠키가 완전히 설정될 시간 확보
    setTimeout(checkAuth, 500);
  }, []);

  const handleLogout = async () => {
    try {
      console.log('[AdminPage] Logging out...');
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // 쿠키 전송을 위해 필요
      });
      setIsAuthenticated(false);
      console.log('[AdminPage] Logout successful');
    } catch (error) {
      console.error('[AdminPage] Logout failed:', error);
      // 로그아웃 실패해도 클라이언트에서는 인증 해제
      setIsAuthenticated(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'announcements': return <DynamicAnnouncementManager />;
      case 'pdfs': return <DynamicPdfManager />;
      case 'inquiries': return <DynamicInquiryManager />;
      case 'safety-items': return <DynamicSafetyItemManager />;
      case 'item-requests': return <DynamicItemRequestManager />;
      case 'qr': return <DynamicQrGenerator />;
      default: return null;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ password })
        });

        if (response.ok) {
          setIsAuthenticated(true);
          window.location.reload();
        } else {
          const data = await response.json();
          setLoginError(data.error || '로그인 실패');
        }
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('로그인 중 오류가 발생했습니다.');
      }
    };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">관리자 로그인</h2>
            <p className="text-gray-300">시스템 관리 기능에 액세스하세요</p>
          </div>

          {/* Login Method Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => setLoginMethod('password')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                loginMethod === 'password'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
              }`}
            >
              비밀번호 로그인
            </button>
            <button
              onClick={() => setLoginMethod('google')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                loginMethod === 'google'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
              }`}
            >
              Google 로그인
            </button>
          </div>

          {loginMethod === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  관리자 비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>

              {loginError && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition"
              >
                로그인
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/google/auth?returnPath=/admin');
                    const data = await response.json();
                    if (data.authUrl) {
                      window.location.href = data.authUrl;
                    }
                  } catch (error) {
                    console.error('Authentication failed:', error);
                    alert('로그인 중 오류가 발생했습니다.');
                  }
                }}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 로그인
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Google OAuth 설정 가이드:</p>
                <div className="text-xs text-gray-500 bg-gray-800 rounded-lg p-3 text-left">
                  <p>1. Google Cloud Console → APIs & Services → OAuth consent screen</p>
                  <p>2. User Type: External → Testing 모드 설정</p>
                  <p>3. Test users에 sakurasolwind@gmail.com 추가</p>
                  <p>4. 또는 비밀번호 로그인을 사용하세요</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">통합 관리 대시보드</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          로그아웃
        </button>
      </div>
      
      <div className="mb-6 border-b border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('announcements')} className={`${activeTab === 'announcements' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>공지사항 관리</button>
          <button onClick={() => setActiveTab('pdfs')} className={`${activeTab === 'pdfs' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>PDF 파일 관리</button>
          <button onClick={() => setActiveTab('inquiries')} className={`${activeTab === 'inquiries' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>문의사항 관리</button>
          <button onClick={() => setActiveTab('safety-items')} className={`${activeTab === 'safety-items' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>안전보건용품 관리</button>
          <button onClick={() => setActiveTab('item-requests')} className={`${activeTab === 'item-requests' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>용품 신청 내역</button>
          <button onClick={() => setActiveTab('qr')} className={`${activeTab === 'qr' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>📱 QR 생성기</button>
        </nav>
      </div>

      <div>
        {renderTabContent()}
      </div>
    </div>
  );
}