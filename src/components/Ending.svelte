<script context="module">
	export let ending;
</script>

<script>
	import CircleType from './CircleType.svelte';
</script>

<template>
	<section bind:this={ending}>
		<a href="#top">
			<CircleType
				typeText="| &ensp; PORTFOLIO &ensp; || &ensp; SCROLL UP &ensp; || &ensp; BACK TO TOP &ensp; |"
				type="ending"
				direction="up"
			/>
		</a>
		<p>I am sorry ! Your scrolling have come to an end.</p>
		<nav class="ending">
			<ul>
				<a rel="external" href="https://www.behance.net/gauthamkrishnax"><li>Behance</li></a>
				<a rel="external" href="https://github.com/gauthamkrishnax"><li>Github</li></a>
				<a rel="external" href="https://www.linkedin.com/in/gauthamkrishnas/"><li>LinkedIn</li></a>
			</ul>
		</nav>
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
			margin: 0 64px;
			padding-right: 0;
			margin-top: 30px;
			padding-top: 220px;
		}
		@include breakpoint(phone) {
			margin: 0 40px;
			padding-right: 0;
			padding-top: 200px;
			padding-bottom: 100px;
			margin-bottom: 10px;
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
	.ending {
		ul {
			display: flex;
			z-index: 10;
			a {
				color: $gray1;
				@include breakpoint(tablet) {
					font-size: $N;
				}
				@include breakpoint(phone) {
					font-size: $XS;
				}
			}
			a:nth-child(2) {
				margin: 0 40px;
				@include breakpoint(tablet) {
					margin: 0 20px;
				}
			}
		}
		position: static;
		display: flex;
		justify-content: center;
		margin-top: 3em;
		@include breakpoint(tablet) {
			justify-content: flex-start;
			margin-top: 2em;
		}
	}
</style>
