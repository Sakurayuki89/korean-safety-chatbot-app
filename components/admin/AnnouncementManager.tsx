'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  priority: 'important' | 'normal';
}

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'important' | 'normal'>('normal');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const res = await fetch(`/api/announcements?search=${searchTerm}`);
    const data = await res.json();
    setAnnouncements(data);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    const method = editingId ? 'PUT' : 'POST';
    const body = JSON.stringify(editingId ? { id: editingId, title, content, priority } : { title, content, priority });
    const res = await fetch('/api/announcements', { method, headers: { 'Content-Type': 'application/json' }, body });
    if (res.ok) {
      resetForm();
      fetchAnnouncements();
    }
  };

  const handleEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setPriority(ann.priority);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;
    const res = await fetch('/api/announcements', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (res.ok) {
      fetchAnnouncements();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setPriority('normal');
  };

  return (
    <>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold mb-4">{editingId ? '공지사항 수정' : '새 공지사항 작성'}</h2>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">제목</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" required />
          </div>
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">내용</label>
            <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" rows={4} required></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">중요도</label>
            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as 'important' | 'normal')} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
              <option value="normal">일반</option>
              <option value="important">중요</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold">{editingId ? '수정 완료' : '작성'}</button>
            {editingId && <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md font-semibold">취소</button>}
          </div>
        </form>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">공지사항 목록</h2>
          <input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/3 p-2 bg-gray-700 border border-gray-600 rounded-md"
          />
        </div>
        <div className="space-y-4">
          {announcements.sort((a, b) => b.id - a.id).map((ann) => (
            <div key={ann.id} className="p-4 bg-gray-700 rounded-md flex justify-between items-start">
              <div>
                <div className="flex items-center mb-1">
                  <h3 className="text-xl font-bold">{ann.title}</h3>
                  {ann.priority === 'important' && <span className="ml-3 px-2 py-0.5 bg-yellow-500 text-black text-xs font-semibold rounded-full">중요</span>}
                </div>
                <p className="text-gray-300 mt-1">{ann.content}</p>
                <p className="text-xs text-gray-400 mt-2">{ann.date}</p>
              </div>
              <div className="flex space-x-2 flex-shrink-0 ml-4">
                <button onClick={() => handleEdit(ann)} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-sm">수정</button>
                <button onClick={() => handleDelete(ann.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm">삭제</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AnnouncementManager;
