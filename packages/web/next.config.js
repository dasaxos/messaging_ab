/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ab-predictor/shared'],
  serverExternalPackages: ['better-sqlite3'],
};

module.exports = nextConfig;
