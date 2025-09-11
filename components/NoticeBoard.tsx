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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

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
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
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

  // 페이징 로직
  const getPaginatedData = (notices: Announcement[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return notices.slice(startIndex, endIndex);
  };

  const importantNotices = announcements.filter(n => n.priority === 'important').sort((a, b) => b.id - a.id);
  const normalNotices = announcements.filter(n => n.priority === 'normal').sort((a, b) => b.id - a.id);
  
  // 전체 공지사항을 합치고 페이징 적용
  const allNotices = [...importantNotices, ...normalNotices];
  const totalPages = Math.ceil(allNotices.length / itemsPerPage);
  const paginatedNotices = getPaginatedData(allNotices);
  
  // 페이지별로 중요/일반 공지사항 분류
  const paginatedImportant = paginatedNotices.filter(n => n.priority === 'important');
  const paginatedNormal = paginatedNotices.filter(n => n.priority === 'normal');

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 페이지네이션 컴포넌트
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button 
          className="page-btn"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          처음
        </button>
        <button 
          className="page-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>
        
        {pageNumbers.map(number => (
          <button
            key={number}
            className={`page-btn ${number === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </button>
        ))}
        
        <button 
          className="page-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
        <button 
          className="page-btn"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          마지막
        </button>
      </div>
    );
  };

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
          </div>
        </div>
      </header>

      <main className="notice-content-main">
        {loading && <p className="text-center text-gray-400">로딩 중...</p>}
        {error && <p className="text-center text-red-500">오류: {error}</p>}
        {!loading && !error && (
          <>
            {announcements.length === 0 ? (
              <div className="empty-state">
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              <>
                {/* 페이지 정보 표시 */}
                <div className="page-info">
                  <p className="text-sm text-gray-600 mb-4">
                    전체 {announcements.length}개 | {currentPage}/{totalPages} 페이지 
                    {searchTerm && <span className="ml-2 text-blue-600">검색: "{searchTerm}"</span>}
                  </p>
                  <div className="section-header">
                    <h2>공지사항</h2>
                    <Link href="/contact" className="inquiry-button">문의사항 남기기</Link>
                  </div>
                </div>

                {/* 중요 공지사항 (페이지네이션 적용) */}
                {paginatedImportant.length > 0 && (
                  <section className="notice-section">
                    <h3 className="text-lg font-semibold mb-3 text-red-600">🔴 주요 공지사항</h3>
                    <div className="notice-list">
                      {paginatedImportant.map(renderNoticeItem)}
                    </div>
                  </section>
                )}

                {/* 일반 공지사항 (페이지네이션 적용) */}
                {paginatedNormal.length > 0 && (
                  <section className="notice-section">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">📢 일반 공지사항</h3>
                    <div className="notice-list">
                      {paginatedNormal.map(renderNoticeItem)}
                    </div>
                  </section>
                )}

                {/* 페이지네이션 */}
                {renderPagination()}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default NoticeBoard;

