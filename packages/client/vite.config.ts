import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tailwindcss2 from '@tailwindcss/vite';
// import tailwindcss from 'tailwindcss';
// import autoprefixer from 'autoprefixer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss2()],
  css: {
    postcss: {
      // plugins: [tailwindcss, autoprefixer],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/pages': path.resolve(__dirname, './src/pages'),
    },
  },
  // 为 Vercel 部署优化
  build: {
    outDir: 'dist',
    sourcemap: false,
    // minify: 'terser',
    // 🔥 关闭构建时的类型检查
    emptyOutDir: true,
    rollupOptions: {
      onwarn(warning, warn) {
        // 忽略特定警告
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
