'use client';

import { useState, useEffect } from 'react';

interface SafetyItem {
  _id: string;
  description: string;
  imageUrl: string;
  googleFileId: string;
  createdAt: string;
}

export default function DebugImagesPage() {
  const [items, setItems] = useState<SafetyItem[]>([]);

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
                    <p className="text-sm mb-1">Original URL:</p>
                    <img 
                      src={urls.original} 
                      alt="Original"
                      className="w-32 h-32 object-contain bg-gray-700 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.textContent = '❌ Failed';
                      }}
                      onLoad={(e) => {
                        e.currentTarget.nextElementSibling!.textContent = '✅ Success';
                      }}
                    />
                    <p className="text-sm">Loading...</p>
                  </div>
                  
                  <div>
                    <p className="text-sm mb-1">Direct Download URL:</p>
                    <img 
                      src={urls.directDownload} 
                      alt="Direct"
                      className="w-32 h-32 object-contain bg-gray-700 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.textContent = '❌ Failed';
                      }}
                      onLoad={(e) => {
                        e.currentTarget.nextElementSibling!.textContent = '✅ Success';
                      }}
                    />
                    <p className="text-sm">Loading...</p>
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