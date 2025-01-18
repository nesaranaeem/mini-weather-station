/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_DEFAULT_LATITUDE: process.env.NEXT_PUBLIC_DEFAULT_LATITUDE,
    NEXT_PUBLIC_DEFAULT_LONGITUDE: process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE,
  },
}

module.exports = nextConfig
