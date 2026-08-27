import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'url';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, '..', '');
  const backendUrl = process.env.VITE_BACKEND_URL ?? rootEnv.VITE_BACKEND_URL ?? 'http://localhost:8000';

  return {
    envDir: '..',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev'],
      proxy: {
        '/analyze': backendUrl,
        '/export': backendUrl,
      },
    },
  };
});
