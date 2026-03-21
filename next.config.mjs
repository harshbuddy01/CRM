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
