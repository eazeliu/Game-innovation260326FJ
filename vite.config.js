import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Game-innovation260326FJ/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000
  }
}));
