<script>
	import Flower from '../svg/flower.svelte';
	import Footer from '../components/Footer.svelte';
</script>

<template>
	<section>
		<p>Please check your URL or try after some time</p>
		<h1>I am sorry, I think you are lost !</h1>
		<Footer typew="ending" />
		<Flower type="back" />
	</section>
</template>

<style lang="scss">
	@import '../style/helpers/variables';
	section {
		padding-top: 25vh;
		text-align: center;
		font-size: $M;
		padding-right: 5em;
		width: 80%;
		margin: 0 auto;
		@include breakpoint(tablet) {
			width: 100%;
			margin: 0 64px;
			text-align: left;
			padding-right: 0;
			padding-top: 200px;
			font-size: $S;
		}
		@include breakpoint(phone) {
			margin: 0 40px;
			padding-right: 0;
			padding-top: 120px;
		}
	}
	h1 {
		position: relative;
		z-index: 30;
		margin-top: 0.5em;
		font-family: $primary-font;
		font-size: $XXL;
		@include breakpoint(tablet) {
			max-width: 400px;
			// margin: 0 auto;
			margin-top: 1em;
			font-size: $XL;
		}
		@include breakpoint(phone) {
			max-width: 200px;
			// margin: 0 auto;
			margin-top: 0.5em;
			font-size: $L;
		}
	}
</style>
