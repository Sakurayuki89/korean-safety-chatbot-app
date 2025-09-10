'use client';

import NoticeBoard from '@/components/NoticeBoard';
import ChatWidget from '@/components/ChatWidget';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* 메인 콘텐츠: 공지사항 게시판 */}
        <NoticeBoard />

        <div className="mt-8 text-center">
          <a href="/contact-admin" className="text-blue-400 hover:text-blue-300 underline">
            관리자에게 문의하기
          </a>
        </div>
      </div>

      {/* 플로팅 챗봇 위젯 */}
      <div className="fixed bottom-8 right-8 z-50">
        <ChatWidget />
      </div>
    </main>
  );
}