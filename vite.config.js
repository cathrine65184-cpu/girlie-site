import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative paths keep this build portable between Netlify Drop and GitHub Pages.
  base: './',
  plugins: [react()],
  // Source-photo backups are local only, even while the dev server is running.
  server: { fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.private/**'] } },
  build: { target: 'es2020', sourcemap: false },
});
