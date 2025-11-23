import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // mode가 없으면 'production'으로 기본값 설정
  const buildMode = mode || process.env.NODE_ENV || 'production';
  const env = loadEnv(buildMode, process.cwd(), '');
  
  // 환경 변수 우선순위: loadEnv로 로드된 값 > 시스템 환경 변수
  const getEnvVar = (key: string) => env[key] || process.env[key] || '';
  
  // 빌드 시 환경 변수 확인 (디버깅용)
  const kakaoKey = getEnvVar('VITE_KAKAO_MAP_APP_KEY');
  if (kakaoKey) {
    console.log(`✅ VITE_KAKAO_MAP_APP_KEY 로드됨 (${kakaoKey.substring(0, 8)}...)`);
  } else {
    console.warn('⚠️ VITE_KAKAO_MAP_APP_KEY가 설정되지 않았습니다.');
    console.warn('   Netlify 대시보드에서 환경 변수를 설정해주세요.');
  }
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          // HTML에 환경 변수 주입
          const kakaoKey = getEnvVar('VITE_KAKAO_MAP_APP_KEY');
          if (!kakaoKey) {
            console.warn('⚠️ VITE_KAKAO_MAP_APP_KEY가 설정되지 않았습니다.');
          }
          return html.replace(
            /%VITE_KAKAO_MAP_APP_KEY%/g,
            kakaoKey
          );
        },
      },
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(getEnvVar('GEMINI_API_KEY')),
      'process.env.GEMINI_API_KEY': JSON.stringify(getEnvVar('GEMINI_API_KEY'))
      // VITE_ 접두사가 붙은 환경 변수는 Vite가 자동으로 import.meta.env에 주입하므로 define에 추가하지 않음
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      minify: "esbuild",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            ui: ["lucide-react"],
          },
        },
      },
    },
  };
});

