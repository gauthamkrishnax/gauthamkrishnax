/** @type {import('@sveltejs/kit').Config} */

import sveltePreprocess from 'svelte-preprocess';
import autoprefixer from 'autoprefixer';
import adapter from '@sveltejs/adapter-cloudflare-workers';

const config = {
	preprocess: sveltePreprocess({
		scss: {
			prependData: `@import 'src/styles/_variables.scss';`
		},
		postcss: {
			plugins: [autoprefixer]
		}
	}),
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: adapter() // currently the adapter does not take any options
	}
};

export default config;
