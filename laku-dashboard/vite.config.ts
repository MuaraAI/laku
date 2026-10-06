import { defineConfig } from 'vite';
// postcss inline kosong: cegah Vite menyedot postcss.config.mjs milik Next.js root (parent dir)
export default defineConfig({ base: './', css: { postcss: {} } });
