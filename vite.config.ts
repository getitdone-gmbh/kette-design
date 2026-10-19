/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import preserveDirectives from 'rollup-plugin-preserve-directives';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

// Dependencies and peers stay imports in the output, so the consumer bundler dedupes and tree-shakes them.
const externalPackages = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies), 'react/jsx-runtime'];
const isExternal = (id: string) => externalPackages.some((name) => id === name || id.startsWith(`${name}/`));

export default defineConfig({
  publicDir: false,
  plugins: [react(), dts({ tsconfigPath: './tsconfig.build.json', include: ['src'], exclude: ['**/*.test.*', '**/*.stories.*', 'src/lib/assert-compiled.ts', 'src/lib/token-contrast.ts'], entryRoot: 'src' })],
  build: {
    lib: { entry: resolve(__dirname, 'src/index.ts'), formats: ['es'], fileName: () => 'index.js' },
    rollupOptions: {
      plugins: [preserveDirectives({ supressPreserveModulesWarning: true })],
      output: { preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' },
      external: isExternal,
    },
    target: 'es2020',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.js',
  },
});
