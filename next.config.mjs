/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    // Tree-shake these heavy libraries — only import the icons/components
    // actually used instead of the entire library. Saves ~150KB+ from
    // the initial JS bundle.
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
