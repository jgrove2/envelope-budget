import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit(),
	],
	server: {
		host: '0.0.0.0',
		port: 5173
	},
	optimizeDeps: {
		esbuildOptions: {
			target: 'es2022'
		}
	},
	esbuild: {
		supported: {
			'top-level-await': true
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});