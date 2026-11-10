import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load all env vars, including OTP_BACKEND_URL
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.OTP_BACKEND_URL || 'http://localhost:4000', // Fallback just in case
          changeOrigin: true,
          // No rewrite, so /api/otp/send -> http://localhost:4000/api/otp/send
        },
      },
    },
  };
});