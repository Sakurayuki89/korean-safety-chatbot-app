
'use client';

import React, { useState, useEffect } from 'react';
import SplitPane from 'react-split-pane';
import './SplitLayout.css'; // CSS 파일은 다음에 생성합니다.

interface SplitLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultSplit?: number;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ leftPanel, rightPanel, defaultSplit = 60 }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'chat'

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="mobile-layout">
        <div className="mobile-tabs">
          <button onClick={() => setActiveTab('pdf')} className={activeTab === 'pdf' ? 'active' : ''}>PDF</button>
          <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'active' : ''}>채팅</button>
        </div>
        <div className="mobile-content">
          {activeTab === 'pdf' ? leftPanel : rightPanel}
        </div>
      </div>
    );
  }

  return (
    // @ts-expect-error - react-split-pane has type conflicts with React 19
    <SplitPane split="vertical" defaultSize={`${defaultSplit}%`} minSize={300} maxSize={-300}>
      <div className="pane-content">{leftPanel}</div>
      <div className="pane-content">{rightPanel}</div>
    </SplitPane>
  );
};

export default SplitLayout;
