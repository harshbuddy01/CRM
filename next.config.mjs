/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // TODO: Remove once all ESLint warnings/errors are resolved
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TODO: Remove once all TypeScript errors are resolved — this hides real type errors in production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
