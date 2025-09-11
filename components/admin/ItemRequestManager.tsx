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

  const updateStatus = async (requestId: string, newStatus: string) => {
    // TODO: Implement status update API
    console.log(`Update ${requestId} to ${newStatus}`);
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
        <button
          onClick={fetchRequests}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          새로고침
        </button>
      </div>

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
                <th className="text-left py-3 px-4">상태</th>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-500 text-black' :
                      request.status === 'approved' ? 'bg-green-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {request.status === 'pending' ? '대기' :
                       request.status === 'approved' ? '승인' : '거부'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateStatus(request._id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        disabled={request.status !== 'pending'}
                      >
                        승인
                      </button>
                      <button
                        onClick={() => updateStatus(request._id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        disabled={request.status !== 'pending'}
                      >
                        거부
                      </button>
                    </div>
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