import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화 설정
  images: {
    domains: [
      'drive.google.com',
      'lh3.googleusercontent.com', 
      'docs.google.com',
      'googleusercontent.com'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  
  // 실험적 기능
  experimental: {
    optimizePackageImports: [
      '@google/generative-ai',
      'googleapis'
    ]
  },

  // 개발 서버 최적화 설정 (HMR 안정화)
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // 페이지를 메모리에 유지하는 시간 (ms)
      maxInactiveAge: 25 * 1000,
      // 동시에 유지할 페이지 수
      pagesBufferLength: 2,
    }
  }),

  

  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Webpack 설정 (번들 최적화)
  webpack: (config, { dev, isServer }) => {
    // 프로덕션 환경에서 번들 분석 활성화
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }

    return config;
  },

  // TypeScript 설정
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint 설정
  eslint: {
    ignoreDuringBuilds: false,
  },

  // 환경변수 설정
  env: {
    NEXT_PUBLIC_APP_NAME: '한국 안전보건용품 관리 시스템',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  }
};

export default nextConfig;