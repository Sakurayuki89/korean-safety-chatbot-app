'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SafetyItem {
  _id: string;
  description: string;
  imageUrl: string;
  googleFileId: string;
  createdAt: string;
}

interface ImageStatus {
  [key: string]: {
    googleImages: 'loading' | 'success' | 'failed';
    proxy: 'loading' | 'success' | 'failed';
  };
}

export default function DebugImagesPage() {
  const [items, setItems] = useState<SafetyItem[]>([]);
  const [imageStatus, setImageStatus] = useState<ImageStatus>({});

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/api/safety-items');
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    }
    fetchItems();
  }, []);

  const testUrls = (originalUrl: string) => {
    const fileIdMatch = originalUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const fileId = fileIdMatch ? fileIdMatch[1] : 'NO_ID_FOUND';
    
    return {
      original: originalUrl,
      directDownload: `https://drive.google.com/uc?id=${fileId}`,
      thumbnail: `https://drive.google.com/thumbnail?id=${fileId}`,
      googleImages: `https://lh3.googleusercontent.com/d/${fileId}`,
      proxy: `/api/image-proxy?fileId=${fileId}`,
      fileId: fileId
    };
  };

  return (
    <div className="container mx-auto p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">이미지 URL 디버깅</h1>
      
      {items.map((item) => {
        const urls = testUrls(item.imageUrl);
        
        return (
          <div key={item._id} className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">{item.description}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">URL 정보:</h3>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Original:</strong><br/>
                  <span className="break-all">{urls.original}</span>
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Direct Download:</strong><br/>
                  <span className="break-all">{urls.directDownload}</span>
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Google Images:</strong><br/>
                  <span className="break-all">{urls.googleImages}</span>
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Proxy URL:</strong><br/>
                  <span className="break-all">{urls.proxy}</span>
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>File ID:</strong> {urls.fileId}
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">이미지 테스트:</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-1">Google Images URL:</p>
                    <div className="border border-gray-600 rounded p-2">
                      <div className="relative w-32 h-32 bg-gray-700 rounded mb-2">
                        <Image 
                          src={urls.googleImages} 
                          alt="Google Images"
                          fill
                          className="object-contain rounded"
                          onError={() => {
                            setImageStatus(prev => ({
                              ...prev,
                              [item._id]: { ...prev[item._id], googleImages: 'failed' }
                            }));
                          }}
                          onLoad={() => {
                            setImageStatus(prev => ({
                              ...prev,
                              [item._id]: { ...prev[item._id], googleImages: 'success' }
                            }));
                          }}
                        />
                      </div>
                      <p className="text-sm">
                        {imageStatus[item._id]?.googleImages === 'success' && '✅ Success'}
                        {imageStatus[item._id]?.googleImages === 'failed' && '❌ Failed'}
                        {(!imageStatus[item._id]?.googleImages || imageStatus[item._id]?.googleImages === 'loading') && '⏳ Loading...'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm mb-1">Proxy URL (CORS-free):</p>
                    <div className="border border-gray-600 rounded p-2">
                      <div className="relative w-32 h-32 bg-gray-700 rounded mb-2">
                        <Image 
                          src={urls.proxy} 
                          alt="Proxy"
                          fill
                          className="object-contain rounded"
                          onError={() => {
                            setImageStatus(prev => ({
                              ...prev,
                              [item._id]: { ...prev[item._id], proxy: 'failed' }
                            }));
                          }}
                          onLoad={() => {
                            setImageStatus(prev => ({
                              ...prev,
                              [item._id]: { ...prev[item._id], proxy: 'success' }
                            }));
                          }}
                        />
                      </div>
                      <p className="text-sm">
                        {imageStatus[item._id]?.proxy === 'success' && '✅ Success'}
                        {imageStatus[item._id]?.proxy === 'failed' && '❌ Failed'}
                        {(!imageStatus[item._id]?.proxy || imageStatus[item._id]?.proxy === 'loading') && '⏳ Loading...'}
                      </p>
                      <div className="mt-2">
                        <a 
                          href={urls.proxy} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs underline"
                        >
                          새 탭에서 열기
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}