'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center text-white max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">🚧 시스템 점검 중</h1>
        <p className="text-lg mb-8">
          현재 시스템 점검을 진행하고 있습니다.<br />
          잠시 후 다시 접속해 주세요.
        </p>
        <div className="text-sm text-gray-400 mb-6">
          불편을 드려 죄송합니다.
        </div>
        <div className="text-xs text-gray-500">
          차단 시간: {new Date().toLocaleString('ko-KR')}
        </div>
        <div className="text-xs text-red-400 mt-2">
          Error-Based Block: {Date.now()}
        </div>
      </div>
    </div>
  );
}