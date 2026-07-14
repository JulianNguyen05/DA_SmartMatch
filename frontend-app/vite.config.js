import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // 1. Import plugin Tailwind v4

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(), // 2. Kích hoạt plugin Tailwind tại đây
  ],
  // Một số thư viện (react-draggable, dùng bên trong react-grid-layout) đọc
  // process.env.NODE_ENV để log debug. Vite không polyfill biến `process`
  // như Webpack/CRA, nên nếu thiếu dòng này sẽ bị "process is not defined"
  // ngay khi bắt đầu kéo (crash trước khi kịp di chuyển block).
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  server: {
    port: 5173, // Ép chạy đúng cổng này
  },
  resolve: {
    alias: {
      '@': '/src', // Cấu hình đường dẫn tuyệt đối (khớp với jsconfig.json)
    },
  },
}));