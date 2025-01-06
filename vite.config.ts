import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@ffmpeg/ffmpeg"],
  },
  server: {
    proxy: {
      "/ads_svp_video": {
        target: "https://adsmind.gdtimg.com", // 目标服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ads_svp_video/, "/ads_svp_video"), // 重写路径
      },
    },
  },
});
