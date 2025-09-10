'use client';

import React, { useState, useEffect } from 'react';
import ChatContainer from './ChatContainer';
import { ContextInfo } from '@/lib/context-manager';

// --- Type Definitions ---
interface Announcement {
  id: number; title: string; content: string; date: string; priority: 'important' | 'normal';
}

// --- Icon Components ---
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- Main ChatWidget Component ---
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contextInfo, setContextInfo] = useState<ContextInfo | null>(null);

  // Fetch data for context when the widget is first opened
  useEffect(() => {
    if (isOpen) {
      const fetchContextData = async () => {
        try {
          const announcementsRes = await fetch('/api/announcements');
          const announcementsData = await announcementsRes.json();
          setAnnouncements(announcementsData);
        } catch (error) {
          console.error("Failed to fetch context data:", error);
        }
      };
      fetchContextData();
    }
  }, [isOpen]);

  // Update contextInfo whenever the data changes
  useEffect(() => {
    if (announcements.length > 0) {
      setContextInfo({ announcements });
    }
  }, [announcements]);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border w-[400px] h-[600px] flex flex-col">
          <ChatContainer contextInfo={contextInfo} />
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 mt-4 ml-auto block"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
};

export default ChatWidget;