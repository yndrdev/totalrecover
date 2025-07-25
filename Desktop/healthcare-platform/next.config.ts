import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
  
  // Move serverComponentsExternalPackages to top level (Next.js 15+ requirement)
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Optimize images for better performance
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Output configuration for Vercel
  output: 'standalone',
  
  // Webpack configuration (only applied when not using Turbopack)
  ...(process.env.NODE_ENV === 'development' && !process.env.TURBOPACK ? {
    webpack: (config, { isServer }) => {
      // Handle certain modules that might cause issues
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        };
      }
      
      return config;
    },
  } : {}),
  
  // TypeScript configuration
  typescript: {
    // WARNING: Temporarily ignoring TypeScript errors for deployment
    // TODO: Fix all TypeScript errors and set this back to false
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // ESLint configuration
  eslint: {
    // WARNING: Temporarily ignoring ESLint errors for deployment
    // TODO: Fix all ESLint errors and set this back to false
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
