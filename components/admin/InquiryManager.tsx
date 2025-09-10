
'use client';

import { useState, useEffect } from 'react';

interface Inquiry {
  _id: string;
  name: string;
  message: string;
  createdAt: string;
}

const InquiryManager = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/inquiries');
      if (!res.ok) throw new Error('Failed to fetch inquiries');
      const data = await res.json();
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 문의를 삭제하시겠습니까? 데이터는 복구할 수 없습니다.')) return;

    try {
      const res = await fetch(`/api/admin/inquiries`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchInquiries(); // Refresh the list after deletion
      } else {
        const data = await res.json();
        alert(`삭제 실패: ${data.message}`);
      }
    } catch (err) {
      alert(`삭제 중 오류 발생: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) return <p className="text-center text-gray-400">문의사항을 불러오는 중...</p>;
  if (error) return <p className="text-center text-red-500">오류: {error}</p>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">문의사항 목록</h2>
      {inquiries.length === 0 ? (
        <p className="text-gray-400">아직 접수된 문의사항이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry._id} className="p-4 bg-gray-700 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">From: <span className="font-medium text-yellow-400">{inquiry.name}</span></p>
                  <p className="text-xs text-gray-500">Received: {new Date(inquiry.createdAt).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleDelete(inquiry._id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold transition-colors"
                >
                  삭제
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-600">
                <p className="text-gray-200 whitespace-pre-wrap">{inquiry.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InquiryManager;
