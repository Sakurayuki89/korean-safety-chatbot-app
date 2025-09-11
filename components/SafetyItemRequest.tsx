'use client';

import { useState, useEffect, FormEvent } from 'react';
import ImageModal from './ImageModal'; // Import the new component

interface SafetyItem {
  _id: string;
  name?: string;
  size?: string;
  description: string;
  imageUrl: string;
}

interface SafetyItemRequestProps {
  onClose: () => void;
}

export default function SafetyItemRequest({ onClose }: SafetyItemRequestProps) {
  console.log('🚀 SafetyItemRequest component loaded - NEW VERSION');
  const [items, setItems] = useState<SafetyItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SafetyItem | null>(null);
  const [userName, setUserName] = useState('');
  const [size, setSize] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    // When a new item is selected, clear the size field for user input
    setSize('');
  }, [selectedItem]);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/api/safety-items');
        if (res.ok) {
          const data = await res.json();
          console.log('Fetched items:', data);
          setItems(data);
        } else {
          setMessage('안전용품 목록을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setMessage('오류가 발생했습니다.');
      }
    }
    fetchItems();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 선택된 아이템이 신청 가능한지 확인
    if (!selectedItem) {
      setMessage('아이템을 선택해주세요.');
      return;
    }
    
    // 알림 전용 아이템인지 확인
    const hasValidName = selectedItem.name && 
                        selectedItem.name !== null && 
                        selectedItem.name !== undefined && 
                        typeof selectedItem.name === 'string' && 
                        selectedItem.name.trim().length > 0;
    
    if (!hasValidName) {
      setMessage('이 아이템은 알림 전용입니다. 신청할 수 없습니다.');
      return;
    }
    
    if (!userName || !size) {
      setMessage('이름과 사이즈를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/item-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          itemName: selectedItem.description,
          itemSize: size,
          itemId: selectedItem._id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('신청이 완료되었습니다.');
        setUserName('');
        setSize('');
        setSelectedItem(null);
      } else {
        setMessage(result.error || '신청 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setMessage('네트워크 오류 또는 서버 문제 발생');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  const convertGoogleDriveUrl = (url: string) => {
    // Convert Google Drive URL to use our image proxy
    if (url.includes('drive.google.com')) {
      // Handle different Google Drive URL formats
      let fileId = null;
      
      // Format 1: https://drive.google.com/file/d/FILE_ID/view
      const fileIdMatch1 = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch1) {
        fileId = fileIdMatch1[1];
      }
      
      // Format 2: https://drive.google.com/uc?id=FILE_ID
      const fileIdMatch2 = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
      if (fileIdMatch2) {
        fileId = fileIdMatch2[1];
      }
      
      if (fileId) {
        console.log(`Converting Google Drive URL: ${url} -> /api/image-proxy?fileId=${fileId}`);
        return `/api/image-proxy?fileId=${fileId}`;
      }
    }
    return url;
  };

  // Pagination Logic
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <button type="button" onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50">처음</button>
        <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50">이전</button>
        <span className="text-gray-700">{currentPage} / {totalPages}</span>
        <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50">다음</button>
        <button type="button" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50">마지막</button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">안전보건용품 신청</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
        </div>

        {message && <p className={`text-center mb-4 ${message.includes('완료') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}

        <div className="flex-grow overflow-y-auto pr-4 -mr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length > 0 ? paginatedItems.map((item) => (
              <div
                key={item._id}
                className={`border-4 rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedItem?._id === item._id ? 'border-blue-500 shadow-xl' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}`}>
                {imageErrors.has(item._id) ? (
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                    <div className="text-gray-500 text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm">이미지를 불러올 수 없습니다</div>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={convertGoogleDriveUrl(item.imageUrl)} 
                    alt={item.description} 
                    className="w-full h-48 object-contain rounded-md mb-4 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent selecting the item
                      setModalImageUrl(convertGoogleDriveUrl(item.imageUrl));
                    }}
                    onError={() => {
                      console.log(`Image failed to load: ${item.description}, URL: ${convertGoogleDriveUrl(item.imageUrl)}`);
                      handleImageError(item._id);
                    }}
                    onLoad={() => console.log(`Image loaded successfully: ${item.description}`)}
                  />
                )}
                <div className="text-center">
                  <p className="text-gray-800 font-bold">{item.name || item.description}</p>
                  
                  {/* 아이템 상태에 따른 UI 표시 */}
                  {(!item.name || item.name === null || (typeof item.name === 'string' && item.name.trim() === '')) ? (
                    // 알림 전용 아이템
                    <div className="mt-3">
                      <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                        📢 알림 전용
                      </div>
                      <p className="text-xs text-gray-500 mt-1">문의사항은 별도로 연락해주세요</p>
                    </div>
                  ) : (
                    // 신청 가능한 아이템
                    <div className="mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        📝 신청하기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 text-lg">등록된 안전용품이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {renderPagination()}

        {selectedItem && (
          <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t">
            <h3 className="text-xl font-bold mb-4 text-gray-800">신청서 작성: <span className='text-blue-600'>{selectedItem.name || selectedItem.description}</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                  {selectedItem.name && selectedItem.name.trim() !== '' ? selectedItem.name : '신청자 이름'}
                </label>
                <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                  {selectedItem.size && selectedItem.size.trim() !== '' ? selectedItem.size : ''}
                </label>
                <input 
                  type="text" 
                  id="size" 
                  value={size} 
                  onChange={(e) => setSize(e.target.value)} 
                  className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required 
                  placeholder=""
                />
              </div>
            </div>
            <div className="mt-6 text-right">
              <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-gray-400">
                {isLoading ? '신청 중...' : '신청하기'}
              </button>
            </div>
          </form>
        )}
      </div>
      {modalImageUrl && <ImageModal imageUrl={modalImageUrl} onClose={() => setModalImageUrl(null)} />}
    </div>
  );
}
