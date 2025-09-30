'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import NoticeBoard from '@/components/NoticeBoard';

// Dynamically import heavy components
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { ssr: false });
const SafetyItemRequest = dynamic(() => import('@/components/SafetyItemRequest'));

export default function HomePage() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // 🚧 긴급 사이트 차단 - 즉시 적용
  const SITE_BLOCKED = true; // 차단 해제하려면 false로 변경

  if (SITE_BLOCKED) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">🚧 시스템 점검 중</h1>
          <p className="text-lg mb-8">
            현재 시스템 점검을 진행하고 있습니다.<br />
            잠시 후 다시 접속해 주세요.
          </p>
          <div className="text-sm text-gray-400">
            불편을 드려 죄송합니다.
          </div>
          <div className="text-xs text-gray-500 mt-4">
            {new Date().toLocaleString('ko-KR')} 업데이트
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* 메인 콘텐츠: 공지사항 게시판 */}
        <NoticeBoard />

        <div className="mt-8 text-center space-x-4">
          <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">
            관리자에게 문의하기
          </a>
          <span className="text-gray-400">|</span>
          <a href="/admin" className="text-green-400 hover:text-green-300 underline">
            관리자 페이지
          </a>
        </div>
      </div>

      {/* 플로팅 위젯들 */}
      <div className="fixed bottom-8 right-8 z-40">
        <Suspense fallback={<div className="w-16 h-16 bg-gray-700 rounded-full" />}>
          <ChatWidget />
        </Suspense>
      </div>

      <div className="fixed bottom-3 left-3 z-40">
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="안전보건용품 신청"
        >
          <Image src="/safety.svg" alt="Safety Item Request" width={32} height={32} priority />
        </button>
      </div>

      {/* 안전보건용품 신청 모달 */}
      {isRequestModalOpen && (
        <Suspense fallback={null}>
          <SafetyItemRequest onClose={() => setIsRequestModalOpen(false)} />
        </Suspense>
      )}
    </main>
  );
}
