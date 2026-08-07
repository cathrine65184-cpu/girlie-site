import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative paths keep this build portable between Netlify Drop and GitHub Pages.
  base: './',
  plugins: [react()],
  build: { target: 'es2020', sourcemap: false },
});
