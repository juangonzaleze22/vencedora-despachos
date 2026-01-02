import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    root: '.',
    publicDir: 'public',
    base: './', // IMPORTANTE: Usar rutas relativas en producción para Electron
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            }
        }
    },
    server: {
        port: 5173,
        strictPort: true
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    }
});
