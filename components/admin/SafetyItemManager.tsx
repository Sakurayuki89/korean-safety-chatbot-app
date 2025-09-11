"use client";

import { useState, FormEvent, useEffect } from 'react';

export default function SafetyItemManager() {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isFixingPermissions, setIsFixingPermissions] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/safety-items', {
        method: 'GET', // Just check if we can access without actual data
      });
      setIsAuthenticated(response.status !== 401);
    } catch (error) {
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
        const successCount = result.results.filter((r: any) => r.status === 'success').length;
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description || !image) {
      setMessage('설명과 이미지를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
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
        setDescription('');
        setImage(null);
        // Reset file input
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
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

  if (!isAuthenticated) {
    return (
      <div className="mt-8 p-6 border rounded-lg shadow-md bg-gray-800 text-white">
        <h2 className="text-2xl font-bold mb-4">안전보건용품 등록</h2>
        <div className="text-center py-8">
          <p className="mb-4 text-gray-300">
            안전보건용품을 등록하려면 Google 계정으로 로그인해야 합니다.
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
    <div className="mt-8 p-6 border rounded-lg shadow-md bg-gray-800 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">안전보건용품 등록</h2>
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
            용품 설명
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
  );
}
