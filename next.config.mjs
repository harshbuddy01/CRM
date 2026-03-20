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
  output: 'standalone',
};

export default nextConfig;
