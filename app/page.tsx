'use client';

// 🚧 사이트 차단 상태 - 즉시 적용
export default function HomePage() {
  // 네이버 QR 연동 주소 차단
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">🚧 시스템 점검 중</h1>
        <p className="text-lg mb-8">
          현재 시스템 점검을 진행하고 있습니다.<br />
          잠시 후 다시 접속해 주세요.
        </p>
        <div className="text-sm text-gray-400">
          불편을 드려 죄송합니다.
        </div>
        <div className="text-xs text-gray-500 mt-4">
          {new Date().toLocaleString('ko-KR')} 차단 활성화
        </div>
      </div>
    </div>
  );
}