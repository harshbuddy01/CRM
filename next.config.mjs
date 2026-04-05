/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // TODO: Remove once all ESLint warnings/errors are resolved
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript errors are now resolved — enforcing strict type safety in production builds
    ignoreBuildErrors: false,
  },
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@tabler/icons-react'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ],
    minimumCacheTTL: 31536000,
  },
  cleanDistDir: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Vary',
            value: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
