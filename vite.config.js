import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 청크 사이즈 경고 한도 (KB)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 수동 청크 분리로 번들 최적화
        manualChunks: {
          // React 핵심
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 라이브러리
          'ui-vendor': ['framer-motion', 'lucide-react'],
          // Supabase
          'supabase': ['@supabase/supabase-js'],
          // Three.js (3D 뷰어) - 별도 분리
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // 마크다운 에디터
          'editor': ['@uiw/react-md-editor', 'react-markdown']
        }
      }
    },
    // 소스맵 (프로덕션에서는 비활성화)
    sourcemap: false,
    // 압축 최적화
    minify: 'esbuild',
    // 타겟 브라우저
    target: 'es2020'
  },
  // 개발 서버 설정
  server: {
    port: 3000,
    open: true
  },
  // 미리보기 서버 설정
  preview: {
    port: 4173
  }
})
