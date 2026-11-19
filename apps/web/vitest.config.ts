import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            'server-only': resolve(__dirname, 'src/test/server-only-mock.ts'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        setupFiles: ['src/test/setup.ts'],
        env: {
            AUTH0_DOMAIN: 'test.auth0.com',
            AUTH0_AUDIENCE: 'https://test-api',
        },
    },
});