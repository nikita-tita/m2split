/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to support dynamic routes
  basePath: process.env.NODE_ENV === 'production' ? '/m2split' : '',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
