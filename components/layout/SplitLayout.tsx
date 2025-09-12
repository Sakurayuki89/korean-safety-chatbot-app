
'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SplitLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultSplit?: number;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ leftPanel, rightPanel, defaultSplit = 60 }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'chat'
  const [leftWidth, setLeftWidth] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain between 20% and 80%
      const constrainedWidth = Math.min(Math.max(newWidth, 20), 80);
      setLeftWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex border-b border-gray-300">
          <button 
            onClick={() => setActiveTab('pdf')} 
            className={`flex-1 py-2 px-4 ${activeTab === 'pdf' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            PDF
          </button>
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`flex-1 py-2 px-4 ${activeTab === 'chat' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            채팅
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {activeTab === 'pdf' ? leftPanel : rightPanel}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full">
      <div style={{ width: `${leftWidth}%` }} className="overflow-hidden">
        {leftPanel}
      </div>
      <div 
        className="w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400 transition-colors"
        onMouseDown={handleMouseDown}
      />
      <div style={{ width: `${100 - leftWidth}%` }} className="overflow-hidden">
        {rightPanel}
      </div>
    </div>
  );
};

export default SplitLayout;
