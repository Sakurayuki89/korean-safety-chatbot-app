'use client';

import { useState, useEffect } from 'react';

interface ItemRequest {
  _id: string;
  userName: string;
  itemName: string;
  itemSize: string;
  itemId: string;
  requestDate: string;
  status: string;
}

export default function ItemRequestManager() {
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/item-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        console.error('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('정말로 이 신청 내역을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/item-requests`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: requestId }),
      });

      if (response.ok) {
        fetchRequests(); // Refresh the list after deletion
      } else {
        const data = await response.json();
        alert(`삭제 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleExportToSheets = async () => {
    if (requests.length === 0) {
      setMessage('다운로드할 신청 내역이 없습니다.');
      return;
    }

    setIsExporting(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/export-requests', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`구글 시트가 성공적으로 생성되었습니다! (${result.requestCount}개 신청)`);
        // 새 창에서 스프레드시트 열기
        window.open(result.spreadsheetUrl, '_blank');
      } else {
        setMessage(result.error || '구글 시트 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error exporting to sheets:', error);
      setMessage('구글 시트 생성 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">안전용품 신청 내역</h2>
        <p className="text-gray-300">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">안전용품 신청 내역</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleExportToSheets}
            disabled={isExporting || requests.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? '구글 시트 생성 중...' : '📊 구글 시트로 다운로드'}
          </button>
          <button
            onClick={fetchRequests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            새로고침
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md text-center ${
          message.includes('성공적으로') 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-gray-300 text-center py-8">신청 내역이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4">신청일</th>
                <th className="text-left py-3 px-4">신청자</th>
                <th className="text-left py-3 px-4">용품명</th>
                <th className="text-left py-3 px-4">사이즈</th>
                <th className="text-left py-3 px-4">작업</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4">
                    {new Date(request.requestDate).toLocaleString('ko-KR')}
                  </td>
                  <td className="py-3 px-4 font-medium">{request.userName}</td>
                  <td className="py-3 px-4">{request.itemName}</td>
                  <td className="py-3 px-4">{request.itemSize}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(request._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-400">
        총 {requests.length}개의 신청이 있습니다.
      </div>
    </div>
  );
}
