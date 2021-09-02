<script>
	import Star from '../svg/star.svelte';
	import Flower from '../svg/flower.svelte';
	import Loader from '../components/Loader.svelte';
	import Footer from '../components/Footer.svelte';
	import CircleType from '../components/CircleType.svelte';
	import { projects } from '../Projects/ProjectDetails';
	import { onMount } from 'svelte';
	import ProjectPreview from '../components/ProjectPreview.svelte';
	import Ending from '../components/Ending.svelte';
	let loader = '';
	let content = 'hide';
	onMount(() => {
		loader = 'hide';
		content = '';
	});
</script>

<svelte:head>
	<title>Gautham Krishna - Portfolio - Home</title>
</svelte:head>

<template>
	<Loader {loader} />
	<Footer />
	<CircleType
		typeText="| &ensp; PORTFOLIO &ensp; || &ensp; SCROLL DOWN &ensp; || &ensp; MY WORKS &ensp; |"
	/>
	<main class={content}>
		<div class="hero">
			<h1>Whatever the problem, being part of the solution.</h1>
			<div>
				<span>Designer</span>
				<Star />
				<span>Developer</span>
			</div>
		</div>
		<div class="hero-illu">
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
		</div>
		<Flower />
	</main>
	<ProjectPreview project={projects[0]} no={1} />
	<Ending />
</template>

<style lang="scss">
	@import '../style/helpers/variables';

	main {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		margin-top: 12vh;
		height: 100vh;
		@include breakpoint(tablet) {
			margin-top: 100px;
			height: 100vh;
			grid-template-columns: 1fr;
			grid-template-rows: 1.5fr 1fr;
		}
		@include breakpoint(phone) {
			margin-top: 30px;
		}
		.hero {
			margin: 8vh 20px 0 120px;
			max-width: 1000px;
			div {
				margin-top: 10px;
				display: flex;
				align-items: center;
				font-size: $L;
				color: $gray2;
				letter-spacing: 0.15em;
				@include breakpoint(tablet) {
					margin-top: 10px;
					font-size: $M;
				}
				@include breakpoint(phone) {
					margin-top: 5px;
					font-size: $N;
				}
			}
			@include breakpoint(tablet) {
				max-width: 500px;
				margin: 100px 20px 20px 64px;
			}
			@include breakpoint(phone) {
				max-width: 250px;
				margin: 100px 10px 10px 40px;
			}
		}
		.hero-illu {
			position: absolute;
			width: 35%;
			top: 0;
			right: 0;
			bottom: 0;
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			grid-template-rows: 1fr 2fr 2fr;
			@include breakpoint(tablet) {
				opacity: 30%;
				top: auto;
				bottom: 0;
				right: 0;
				width: 100%;
				height: 40%;
				grid-template-columns: 1fr 1fr 1fr;
				grid-template-rows: 1fr 1fr;
			}
			div {
				border-top: 1px solid $light1;
				border-left: 1px solid $light1;
			}
		}
	}
	h1 {
		font-family: $primary-font;
		@include fluid-font(1280px, 1920px, 75px, 96px);
		line-height: 119px;
		letter-spacing: 0.015em;
		color: $gray1;
		@include breakpoint(tablet) {
			font-size: $XL;
			line-height: 60px;
		}
		@include breakpoint(phone) {
			font-size: $L;
			line-height: 30px;
		}
	}
</style>
