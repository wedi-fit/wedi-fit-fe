import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:3001",
        changeOrigin: true,
        // rewrite 제거: /api/v1/composite → http://localhost:3001/api/v1/composite
      }
    }
  },
  build: {
    // 빌드 최적화 설정
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false, // 프로덕션에서는 소스맵 비활성화 (보안)
    minify: "esbuild", // esbuild로 최소화 (기본값)
    chunkSizeWarningLimit: 1000, // 청크 크기 경고 임계값 (KB)
    rollupOptions: {
      output: {
        // 청크 분할 최적화
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["lucide-react", "sonner"],
        },
      },
    },
  },
});

