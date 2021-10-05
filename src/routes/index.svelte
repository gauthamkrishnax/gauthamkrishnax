<script>
	import { onMount, afterUpdate } from 'svelte';

	import About from '../components/main/About.svelte';
	import Home from '../components/main/Home.svelte';
	import Works from '../components/main/Works.svelte';
	import Contact from '../components/main/Contact.svelte';
	import Header from '../components/main/Header.svelte';
	import LogoIcon from '../components/svg/LogoIcon.svelte';
</script>

<template>
	<Header />
	<main>
		<Home />
		<Works />
		<About />
		<Contact />
	</main>
	<footer class="footer">
		<p>
			Designed and Built by <strong>Gautham Krishna</strong>
			<LogoIcon />,<br />
			Inspired from <strong>brittanychiang.com</strong> & <strong>mylesnguyen.com.</strong>
		</p>
	</footer>
</template>

<style lang="scss">
	:global {
		@import '../styles/global';
	}
	@import '../styles/fonts';
	// INDEX PAGE SCOPED STYLES
	footer {
		margin-left: 2em;
		p {
			font-size: 0.7rem;
			color: $light-3;
		}
	}
</style>
