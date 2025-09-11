'use client';

import { useState, useEffect, FormEvent } from 'react';

interface SafetyItem {
  _id: string;
  description: string;
  imageUrl: string;
}

interface SafetyItemRequestProps {
  onClose: () => void;
}

export default function SafetyItemRequest({ onClose }: SafetyItemRequestProps) {
  const [items, setItems] = useState<SafetyItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SafetyItem | null>(null);
  const [userName, setUserName] = useState('');
  const [size, setSize] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/api/safety-items');
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        } else {
          setMessage('안전용품 목록을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        setMessage('오류가 발생했습니다.');
      }
    }
    fetchItems();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !userName || !size) {
      setMessage('모든 필드를 입력해주세요.');
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
    // Convert Google Drive share URL to direct image URL
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        return `https://drive.google.com/uc?id=${fileIdMatch[1]}`;
      }
    }
    return url;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">안전보건용품 신청</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
        </div>

        {message && <p className={`text-center mb-4 ${message.includes('완료') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}

        <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length > 0 ? items.map((item) => (
            <div
              key={item._id}
              onClick={() => setSelectedItem(item)}
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
                  className="w-full h-48 object-contain rounded-md mb-4" 
                  onError={() => handleImageError(item._id)}
                  onLoad={() => console.log(`Image loaded: ${item.description}`)}
                />
              )}
              <p className="text-center text-gray-700 font-semibold">{item.description}</p>
            </div>
          )) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">등록된 안전용품이 없습니다.</p>
            </div>
          )}
        </div>

        {selectedItem && (
          <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t">
            <h3 className="text-xl font-bold mb-4 text-gray-800">신청서 작성: <span className='text-blue-600'>{selectedItem.description}</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700">이름</label>
                <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">사이즈 (e.g., L, 270mm)</label>
                <input type="text" id="size" value={size} onChange={(e) => setSize(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
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
    </div>
  );
}
