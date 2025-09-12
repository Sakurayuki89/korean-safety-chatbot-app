"use client";

import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';

interface SafetyItem {
  _id: string;
  name?: string;
  size?: string;
  description: string;
  imageUrl: string;
  googleFileId: string;
  createdAt: string;
}

export default function SafetyItemManager() {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isFixingPermissions, setIsFixingPermissions] = useState(false);
  const [safetyItems, setSafetyItems] = useState<SafetyItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSafetyItems();
    }
  }, [isAuthenticated]);

  const fetchSafetyItems = async () => {
    try {
      const res = await fetch('/api/safety-items');
      if (res.ok) {
        const data = await res.json();
        setSafetyItems(data);
      } else {
        setMessage('안전용품 목록을 불러오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching safety items:', error);
      setMessage('안전용품 목록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/safety-items', {
        method: 'GET',
      });
      setIsAuthenticated(response.status !== 401);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    try {
      const response = await fetch('/api/google/auth');
      const result = await response.json();
      
      if (result.authUrl) {
        window.location.href = result.authUrl;
      } else {
        setMessage('인증 URL을 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setMessage('인증 과정에서 오류가 발생했습니다.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleFixPermissions = async () => {
    setIsFixingPermissions(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/fix-permissions', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok) {
        const successCount = result.results.filter((r: { status: string }) => r.status === 'success').length;
        setMessage(`권한 수정 완료: ${successCount}/${result.totalItems}개 파일 처리됨`);
      } else {
        setMessage(`권한 수정 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Permission fix error:', error);
      setMessage('권한 수정 중 오류가 발생했습니다.');
    } finally {
      setIsFixingPermissions(false);
    }
  };

  const convertGoogleDriveUrl = (url: string) => {
    if (!url || !url.includes('drive.google.com')) {
      return url;
    }
    let fileId = null;
    const fileIdMatch1 = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch1) {
      fileId = fileIdMatch1[1];
    }
    const fileIdMatch2 = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (fileIdMatch2) {
      fileId = fileIdMatch2[1];
    }
    if (fileId) {
      return `/api/image-proxy?fileId=${fileId}`;
    }
    return url;
  };

  // Pagination Logic
  const totalPages = Math.ceil(safetyItems.length / itemsPerPage);
  const paginatedItems = safetyItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="px-3 py-1 bg-gray-600 rounded-md disabled:opacity-50">처음</button>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 bg-gray-600 rounded-md disabled:opacity-50">이전</button>
        <span className="text-white">{currentPage} / {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-600 rounded-md disabled:opacity-50">다음</button>
        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-600 rounded-md disabled:opacity-50">마지막</button>
      </div>
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description || !image) {
      setMessage('설명과 이미지를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    // 빈 문자열이어도 전송 (선택적 필드이므로)
    formData.append('name', name);
    formData.append('size', size);
    formData.append('description', description);
    formData.append('image', image);

    try {
      const response = await fetch('/api/admin/safety-items', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('안전보건용품이 성공적으로 등록되었습니다.');
        setName('');
        setSize('');
        setDescription('');
        setImage(null);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
        fetchSafetyItems(); // Re-fetch the list
      } else {
        setMessage(result.error || '등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error uploading safety item:', error);
      setMessage('네트워크 오류 또는 서버 문제 발생');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: SafetyItem) => {
    if (!confirm(`'${item.description}' 항목을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setMessage('');
    try {
      const response = await fetch('/api/admin/safety-items', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: item._id, googleFileId: item.googleFileId }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('성공적으로 삭제되었습니다.');
        setSafetyItems(safetyItems.filter(i => i._id !== item._id));
      } else {
        setMessage(result.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error deleting safety item:', error);
      setMessage('네트워크 오류 또는 서버 문제 발생');
    }
  };

  const handleExportToSheets = async () => {
    if (safetyItems.length === 0) {
      setMessage('다운로드할 데이터가 없습니다.');
      return;
    }

    setIsExporting(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/export-sheets', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`구글 시트가 성공적으로 생성되었습니다! (${result.itemCount}개 항목)`);
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

  if (!isAuthenticated) {
    return (
      <div className="mt-8 p-6 border rounded-lg shadow-md bg-gray-800 text-white">
        <h2 className="text-2xl font-bold mb-4">안전보건용품 관리</h2>
        <div className="text-center py-8">
          <p className="mb-4 text-gray-300">
            안전보건용품을 관리하려면 Google 계정으로 로그인해야 합니다.
          </p>
          <button
            onClick={handleGoogleAuth}
            disabled={isAuthenticating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isAuthenticating ? '인증 중...' : 'Google로 로그인'}
          </button>
          {message && <p className="mt-4 text-red-400">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 p-6 border rounded-lg shadow-md bg-gray-800 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">새 안전보건용품 등록</h2>
          <div className="flex space-x-2">
            <button
              onClick={checkAuthStatus}
              className="text-sm bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
            >
              인증 상태 확인
            </button>
            <button
              onClick={handleFixPermissions}
              disabled={isFixingPermissions}
              className="text-sm bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded disabled:opacity-50"
            >
              {isFixingPermissions ? '권한 수정 중...' : '이미지 권한 수정'}
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-300 font-bold mb-2">
              상세 설명 (필수)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          {!showOptionalFields && (
            <button 
              type="button"
              onClick={() => setShowOptionalFields(true)}
              className="text-sm text-blue-400 hover:text-blue-300 mb-4"
            >
              + 이름/사이즈 추가 정보 입력
            </button>
          )}

          {showOptionalFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-gray-300 font-bold mb-2">
                  용품 이름 (선택)
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="size" className="block text-gray-300 font-bold mb-2">
                  사이즈 (선택)
                </label>
                <input
                  id="size"
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          <div className="mb-6">
            <label htmlFor="image-upload" className="block text-gray-300 font-bold mb-2">
              용품 이미지
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center text-sm text-green-400">{message}</p>}
      </div>

      <div className="mt-8 p-6 border rounded-lg shadow-md bg-gray-800 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">등록된 안전보건용품 목록</h2>
          <button
            onClick={handleExportToSheets}
            disabled={isExporting || safetyItems.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? '구글 시트 생성 중...' : '📊 구글 시트로 다운로드'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((item) => (
            <div key={item._id} className="bg-gray-700 rounded-lg shadow-lg overflow-hidden flex flex-col">
              <div className="relative w-full h-48">
                <Image src={convertGoogleDriveUrl(item.imageUrl)} alt={item.description} fill className="object-cover" />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white">{item.name || 'N/A'}</h3>
                {item.size && <p className="text-sm text-gray-400 mb-2">사이즈: {item.size}</p>}
                <p className="text-gray-300 text-sm mb-2 flex-grow">{item.description}</p>
                <p className="text-xs text-gray-400 mt-auto">등록일: {new Date(item.createdAt).toLocaleDateString()}</p>
                <button
                  onClick={() => handleDelete(item)}
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
        {safetyItems.length === 0 && (
          <p className="text-center text-gray-400 mt-4">등록된 안전보건용품이 없습니다.</p>
        )}
        {renderPagination()}
      </div>
    </>
  );
}
