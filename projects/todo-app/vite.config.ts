import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 部署说明（Vercel/Netlify/Cloudflare Pages 等）：
// - 构建命令: npm run build  输出目录: dist
// - 在平台中设置「根目录」为 projects/todo-app（若从仓库根部署）
// - 环境变量: VITE_SUPABASE_URL、VITE_SUPABASE_ANON_KEY（Supabase 项目设置 -> API）
// - 若部署到域名根路径，将 base 改为 '/'
export default defineConfig({
  plugins: [react()],
  root: '.',
  base: '/todo-app/',
})
