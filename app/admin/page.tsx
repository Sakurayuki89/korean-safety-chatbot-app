'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import PasswordAuth from '../../components/auth/PasswordAuth';

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8 min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Dynamically import manager components
const DynamicAnnouncementManager = dynamic(() => import('../../components/admin/AnnouncementManager'), { suspense: true });
const DynamicPdfManager = dynamic(() => import('../../components/admin/PdfManager'), { suspense: true });
const DynamicInquiryManager = dynamic(() => import('../../components/admin/InquiryManager'), { suspense: true });
const DynamicSafetyItemManager = dynamic(() => import('../../components/admin/SafetyItemManager'), { suspense: true });
const DynamicItemRequestManager = dynamic(() => import('../../components/admin/ItemRequestManager'), { suspense: true });

// Main Admin Page Component
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');

  useEffect(() => {
    // Check authentication status when the component mounts
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status'); // This API needs to be created
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
        }
      } catch (error) {
        console.error('Auth check failed', error);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'announcements': return <DynamicAnnouncementManager />;
      case 'pdfs': return <DynamicPdfManager />;
      case 'inquiries': return <DynamicInquiryManager />;
      case 'safety-items': return <DynamicSafetyItemManager />;
      case 'item-requests': return <DynamicItemRequestManager />;
      default: return null;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <PasswordAuth onAuthSuccess={() => setIsAuthenticated(true)} />;
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
        </nav>
      </div>

      <div>
        <Suspense fallback={<LoadingSpinner />}>
          {renderTabContent()}
        </Suspense>
      </div>
    </div>
  );
}