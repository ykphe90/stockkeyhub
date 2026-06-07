// // next.config.ts
// import type { NextConfig } from 'next'
// import { i18n } from './next-i18next.config'

// const nextConfig: NextConfig = {
//   i18n,
//   // App Router 早已稳定，去掉这个 experimental 以免控制台警告
//   // experimental: { appDir: true },
//   // 之后要做 Docker 部署/无服务器运行可加：
//   // output: 'standalone',
// }

// export default nextConfig

// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 先不要写 i18n 这块
  // App Router 下要用别的方式做多语言
};

export default nextConfig;