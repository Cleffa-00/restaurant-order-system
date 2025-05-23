/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
  },
}

module.exports = nextConfig 