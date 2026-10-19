import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import { join } from 'node:path';
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  define: { 'process.env': {} },
  // Tailwind scans the stories as well, the package build (tailwind.config.cjs) does not.
  css: { postcss: { plugins: [postcssImport(), tailwindcss({ config: join(__dirname, 'tailwind.config.cjs') }), autoprefixer()] } },
});
