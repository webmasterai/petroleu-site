import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-router-dom': path.join(process.cwd(), 'src/shims/react-router-dom.tsx'),
    }
    return config
  },
}

export default nextConfig
