<script>
	import CircleType from './CircleType.svelte';
	import Footer from './Footer.svelte';
</script>

<template>
	<section>
		<a href="#top">
			<CircleType
				typeText="| &ensp; PORTFOLIO &ensp; || &ensp; SCROLL UP &ensp; || &ensp; BACK TO TOP &ensp; |"
				type="ending"
				direction="up"
			/>
		</a>
		<p>I am sorry ! Your scrolling have come to an end.</p>
		<Footer typew="ending" />
	</section>
</template>

<style lang="scss">
	@import '../style/helpers/variables';
	section {
		width: max-content;
		height: 100vh;
		margin: 0 auto;
		padding-right: 5em;
		padding-top: 25vh;
		@include breakpoint(tablet) {
			padding-right: 0;
			padding-top: 200px;
		}
		@include breakpoint(phone) {
			padding-right: 0;
			padding-top: 120px;
		}
	}
	p {
		margin-top: 5em;
		text-align: center;
		@include breakpoint(tablet) {
			font-size: $S;
			margin-top: 3em;
		}
	}
	a {
		color: $scroll;
	}
</style>
