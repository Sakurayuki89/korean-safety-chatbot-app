'use client';

import { useState } from 'react';

export default function QrCodeGenerator() {
  const [text, setText] = useState<string>('https://korean-safety-chatbot-app.vercel.app');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const generateQrCode = () => {
    if (!text.trim()) {
      setError('QR 코드로 만들 텍스트나 URL을 입력하세요.');
      return;
    }
    setError('');
    setIsLoading(true);
    // Add a timestamp to prevent browser caching of the image
    const url = `/api/qr?text=${encodeURIComponent(text)}&t=${Date.now()}`;
    setQrCodeUrl(url);
    // The browser will request the image, and we can know it's loaded via the <img> onLoad event
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">🔒 네이버 QR 코드 생성기</h1>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
            <label className="text-lg font-medium mb-2">
              QR 코드로 변환할 내용:
            </label>
            <textarea
              className="p-4 border border-gray-600 rounded-lg w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="QR 코드로 변환할 텍스트 또는 URL을 입력하세요&#10;예: https://korean-safety-chatbot-app.vercel.app/safety-info"
            />

            <button
              onClick={generateQrCode}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isLoading ? '🔄 생성 중...' : '📱 QR 코드 생성'}
            </button>

            {error && (
              <div className="bg-red-900 border border-red-600 text-red-200 p-4 rounded-lg">
                ⚠️ {error}
              </div>
            )}
          </div>

          {qrCodeUrl && (
            <div className="mt-12 text-center">
              <h2 className="text-2xl font-semibold mb-4">✅ 생성된 QR 코드</h2>
              <div className="bg-white p-6 rounded-lg inline-block shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt="Generated QR Code"
                  className="mx-auto"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setError('QR 코드 이미지 로딩에 실패했습니다. 네이버 API 키를 확인하세요.');
                    setIsLoading(false);
                  }}
                />
              </div>
              <p className="text-gray-300 mt-4">
                💾 이미지를 우클릭하여 저장하거나, 스크린샷을 촬영하세요
              </p>

              <div className="mt-6 p-4 bg-yellow-900 border border-yellow-600 rounded-lg text-yellow-200">
                <h3 className="font-semibold mb-2">🔐 보안 주의사항</h3>
                <ul className="text-sm space-y-1 text-left">
                  <li>• 생성된 QR 코드는 관계자만 스캔하도록 안내하세요</li>
                  <li>• 현장에 부착 시 &quot;관계자 외 스캔 금지&quot; 안내문을 추가하세요</li>
                  <li>• QR 코드 내용이 민감한 정보인 경우 접근 제한을 설정하세요</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}