'use client';
import React, { useState, useEffect } from 'react';
import './../styles/NoticeBoard.css';

import Link from 'next/link';

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  priority: 'important' | 'normal';
}

const NoticeBoard: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedNotices, setExpandedNotices] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/announcements?search=${searchTerm}`);
        if (!res.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }
        const data = await res.json();
        setAnnouncements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [searchTerm]);

  const toggleExpanded = (noticeId: number) => {
    const newExpanded = new Set(expandedNotices);
    if (newExpanded.has(noticeId)) {
      newExpanded.delete(noticeId);
    } else {
      newExpanded.add(noticeId);
    }
    setExpandedNotices(newExpanded);
  };

  const renderNoticeItem = (notice: Announcement) => {
    const isExpanded = expandedNotices.has(notice.id);
    
    return (
      <div key={notice.id} className="notice-item" onClick={() => toggleExpanded(notice.id)}>
        <div className="notice-header">
          <div className="notice-title-row">
            <div className="flex items-center">
              <h3 className="notice-title">{notice.title}</h3>
              {notice.priority === 'important' && (
                <span className="ml-3 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">중요</span>
              )}
            </div>
            <svg 
              className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
          <div className="notice-meta">
            <span className="notice-date">{notice.date}</span>
            <span className="expand-text">{isExpanded ? '접기' : '펼치기'}</span>
          </div>
        </div>
        {isExpanded && (
          <div className="notice-content">
            <p>{notice.content}</p>
          </div>
        )}
      </div>
    );
  };

  const importantNotices = announcements.filter(n => n.priority === 'important').sort((a, b) => b.id - a.id);
  const normalNotices = announcements.filter(n => n.priority === 'normal').sort((a, b) => b.id - a.id);

  return (
    <div className="notice-board">
       <header className="notice-header-main">
        <div className="header-content">
          <div className="header-left">
            <div className="shield-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                </svg>
            </div>
            <div className="header-text">
              <h1>안전종합 게시판</h1>
              <p style={{ color: 'yellow', fontWeight: 'bold' }}>상세 내용은 해당 관리자에게 문의</p>
            </div>
          </div>
          <div className="header-right">
            <input
              type="text"
              placeholder="공지사항 검색..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="notification-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"/>
              </svg>
              {announcements.length > 0 && <span className="badge-count">{announcements.length}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="notice-content-main">
        {loading && <p className="text-center text-gray-400">로딩 중...</p>}
        {error && <p className="text-center text-red-500">오류: {error}</p>}
        {!loading && !error && (
          <>
            {importantNotices.length > 0 && (
              <section className="notice-section">
                <div className="section-header">
                  <h2>주요 공지사항</h2>
                  <Link href="/contact" className="inquiry-button">문의사항 남기기</Link>
                </div>
                <div className="notice-list">
                  {importantNotices.map(renderNoticeItem)}
                </div>
              </section>
            )}

            {normalNotices.length > 0 && (
              <section className="notice-section">
                <h2>일반 공지사항</h2>
                <div className="notice-list">
                  {normalNotices.map(renderNoticeItem)}
                </div>
              </section>
            )}

            {announcements.length === 0 && (
              <div className="empty-state">
                <p>검색 결과가 없습니다.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default NoticeBoard;

