import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // 1. Import plugin tailwind v4

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Thêm vào mảng plugins
  ],
  server: {
    port: 5173,
    open: true, // <--- Dòng lệnh giúp tự động bật trình duyệt mặc định của máy
  },
});
