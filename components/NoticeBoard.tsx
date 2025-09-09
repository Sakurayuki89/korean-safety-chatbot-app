"use client";
import React, { useState } from 'react';
import './../app/NoticeBoard.css';

interface Notice {
  id: number;
  title: string;
  category: string;
  priority: 'urgent' | 'important' | 'normal';
  date: string;
  content: string;
  isExpanded?: boolean;
}

interface NoticeBoardProps {
  notices?: Notice[];
}

const CATEGORY_COLORS = {
  '안전공지': '#ef4444', // 빨간색
  '안전규정': '#f59e0b', // 주황색  
  '사내공지': '#3b82f6', // 파란색
  '노조소식': '#10b981'  // 초록색
};

const PRIORITY_LABELS = {
  urgent: '긴급',
  important: '중요', 
  normal: '일반'
};

const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices = [] }) => {
  const [expandedNotices, setExpandedNotices] = useState<Set<number>>(new Set());

  const toggleExpanded = (noticeId: number) => {
    const newExpanded = new Set(expandedNotices);
    if (newExpanded.has(noticeId)) {
      newExpanded.delete(noticeId);
    } else {
      newExpanded.add(noticeId);
    }
    setExpandedNotices(newExpanded);
  };

  const urgentNotices = notices.filter(notice => notice.priority === 'urgent');
  const importantNotices = notices.filter(notice => notice.priority === 'important');
  const normalNotices = notices.filter(notice => notice.priority === 'normal');

  const renderNoticeItem = (notice: Notice) => {
    const isExpanded = expandedNotices.has(notice.id);
    const categoryColor = CATEGORY_COLORS[notice.category as keyof typeof CATEGORY_COLORS] || '#6b7280';
    
    return (
      <div key={notice.id} className="notice-item" onClick={() => toggleExpanded(notice.id)}>
        <div className="notice-header">
          <div className="notice-title-row">
            <h3 className="notice-title">{notice.title}</h3>
            <div className="notice-badge-group">
              <span 
                className="notice-category" 
                style={{ backgroundColor: categoryColor }}
              >
                {notice.category}
              </span>
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

  return (
    <div className="notice-board">
      <header className="notice-header-main">
        <div className="header-content">
          <div className="header-left">
            <div className="shield-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C13.1 2 14 2.9 14 4V8C14 9.1 13.1 10 12 10S10 9.1 10 8V4C10 2.9 10.9 2 12 2ZM21 9V7L20 6V4C20 2.9 19.1 2 18 2C16.9 2 16 2.9 16 4V6L15 7V9C15 10.1 15.9 11 17 11H19C20.1 11 21 10.1 21 9ZM9 7L8 6V4C8 2.9 7.1 2 6 2C4.9 2 4 2.9 4 4V6L3 7V9C3 10.1 3.9 11 5 11H7C8.1 11 9 10.1 9 9V7Z"/>
              </svg>
            </div>
            <div className="header-text">
              <h1>현대ITC 정비2팀 안심봇</h1>
              <p>실시간 공지사항</p>
            </div>
          </div>
          <div className="header-right">
            <div className="notification-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"/>
              </svg>
              <span className="badge-count">5</span>
            </div>
          </div>
        </div>
      </header>

      <main className="notice-content-main">
        {urgentNotices.length > 0 && (
          <section className="notice-section">
            <h2>긴급 공지사항</h2>
            <div className="notice-list">
              {urgentNotices.map(renderNoticeItem)}
            </div>
          </section>
        )}

        {importantNotices.length > 0 && (
          <section className="notice-section">
            <h2>주요 공지사항</h2>
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

        {notices.length === 0 && (
          <div className="empty-state">
            <p>등록된 공지사항이 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default NoticeBoard;
