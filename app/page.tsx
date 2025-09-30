'use client';

// Next.js 캐시 완전 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 🚧 긴급 사이트 차단 - 에러 방식으로 강제 적용
export default function HomePage() {
  // 즉시 에러를 발생시켜 차단 효과
  throw new Error('🚧 시스템 점검 중입니다. 잠시 후 다시 접속해 주세요.');
}