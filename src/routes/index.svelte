<script context="module">
	export const prerender = true;
</script>

<script>
	import About from '../components/main/About.svelte';
	import Home from '../components/main/Home.svelte';
	import Works from '../components/main/Works.svelte';
	import Contact from '../components/main/Contact.svelte';
	import Header from '../components/main/Header.svelte';
	import LogoIcon from '../components/svg/LogoIcon.svelte';
	import Loading from '../components/elements/Loading.svelte';

	// import { makePageScrollSmooth } from '../animations/scroll';
	import { onMount } from 'svelte';
	let showLoader = true;
	let section;
	onMount(() => {
		showLoader = false;
	});
</script>

<svelte:head>
	<title>Gautham Krishna | Portfolio</title>
	<meta
		name="description"
		content="Gautham Krishna (Portfolio) - I’m a freelance developer and designer specializing in building artisan digital experiances and passionate about building creative, user-centered designs."
	/>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.8.0/gsap.min.js"></script>
</svelte:head>

<template>
	{#if showLoader}
		<Loading />
	{:else}
		<div bind:this={section}>
			<Header />
			<main>
				<Home />
				<Works />
				<About />
				<Contact />
			</main>
			<footer class="footer">
				<p>
					{@html `Designed and Built by <strong>Gautham Krishna</strong>`}
					<LogoIcon />
					{@html `&nbsp; , <br />
			Inspired from <strong>brittanychiang.com</strong> & <strong>mylesnguyen.com.</strong>`}
				</p>
			</footer>
		</div>
	{/if}
</template>

<style lang="scss">
	:global {
		@import '../styles/global';
	}
	@import '../styles/fonts';
	// INDEX PAGE SCOPED STYLES
	footer {
		background-color: $dark-1;
		z-index: 4;
		position: relative;
		bottom: 1;
		margin-left: 0.2em;
		p {
			font-size: 0.7rem;
			color: $light-3;
		}
		@include breakpoint(tablet) {
			background: none;
			margin-left: 1.2em;
		}
		@media only screen and (max-height: 650px) {
			display: none;
		}
	}
</style>
