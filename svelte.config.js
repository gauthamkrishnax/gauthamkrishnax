import sveltePreprocess from 'svelte-preprocess';
import autoprefixer from 'autoprefixer';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess({
		postcss: {
			plugins: [autoprefixer]
		}
	}),
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte'
	}
};

export default config;
