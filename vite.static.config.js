import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Build estático que abre com duplo clique em index.html (sem servidor).
export default defineConfig({ plugins: [react()], base: './', build: { outDir: 'site-pronto', emptyOutDir: true, rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } } } })
