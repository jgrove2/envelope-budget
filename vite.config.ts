import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit(),
	],
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