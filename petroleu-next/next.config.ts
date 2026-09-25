import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Prefer non-www canonical host for indexing.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.petroleu.com' }],
        destination: 'https://petroleu.com/:path*',
        permanent: true,
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Explicit alias so Coolify/production npm installs still resolve @/ imports
      // even if tsconfig path mapping is unavailable during the build.
      '@': path.join(process.cwd(), 'src'),
      'react-router-dom': path.join(process.cwd(), 'src/shims/react-router-dom.tsx'),
    }
    return config
  },
}

export default nextConfig
