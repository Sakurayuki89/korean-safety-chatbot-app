'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message) {
      setStatus({ type: 'error', message: '문의 내용을 입력해주세요.' });
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, message }),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: '문의가 성공적으로 접수되었습니다! 3초 후 메인 페이지로 이동합니다.' });
        setName('');
        setMessage('');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        const data = await res.json();
        throw new Error(data.message || '오류가 발생했습니다.');
      }
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' });
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  const statusStyles = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 shadow-2xl rounded-2xl p-8 md:p-12">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-100">문의하기</h1>
        <p className="text-center text-gray-400 mb-8">궁금한 점이나 개선 요청사항을 남겨 주세요. 이름 기입은 선택입니다!</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">문의 내용</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              rows={6}
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">이름 (선택)</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div className="flex flex-col sm:flex-row-reverse gap-4 pt-2">
            <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105">제출하기</button>
            <button type="button" onClick={handleCancel} className="w-full sm:w-auto px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition">취소</button>
          </div>
        </form>
        {status && (
          <div className={`mt-6 p-4 border-l-4 rounded-r-lg ${statusStyles[status.type]}`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;