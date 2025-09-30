export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🚧 시스템 점검 중
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          현재 시스템 점검을 진행하고 있습니다.<br />
          잠시 후 다시 접속해 주세요.
        </p>
        <div className="text-sm text-gray-500">
          불편을 드려 죄송합니다.
        </div>
      </div>
    </div>
  );
}