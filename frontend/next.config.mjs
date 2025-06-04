/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true, // 在较新的 Next.js 中默认为 true
  // 可选: 如果你的电影海报来自外部域名
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org', // TMDB 图片示例
        port: '',
        pathname: '/t/p/original/**',
      },
      {
        protocol: 'https',
        hostname: 'www.themoviedb.org', // TMDB 图片示例
        port: '',
        pathname: '/t/p/w500/**',
      },
      // 如果你使用其他域名获取海报，请在此添加
    ],
  },
  env: {
    BACKEND_API_URL: process.env.BACKEND_API_URL, // 用于服务端组件
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL, // 用于客户端组件
  }
};

export default nextConfig;