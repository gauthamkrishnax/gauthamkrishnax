<script>
	import { onMount, afterUpdate } from 'svelte';

	import About from '../components/main/About.svelte';
	import Home from '../components/main/Home.svelte';
	import Works from '../components/main/Works.svelte';
	import Contact from '../components/main/Contact.svelte';

	import { index } from '../animations/mainAnimations';

	let mainContainer, offsetWidth;
	onMount(() => {
		index(mainContainer, offsetWidth);
	});
</script>

<template>
	<main bind:this={mainContainer} bind:offsetWidth>
		<Home />
		<Works />
		<About />
		<Contact />
	</main>
</template>

<style lang="scss">
	:global {
		@import '../styles/global';
	}
	@import '../styles/fonts';
	// INDEX PAGE SCOPED STYLES
</style>
