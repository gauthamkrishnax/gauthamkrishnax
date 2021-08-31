<script>
	import Navspot from '../svg/navspot.svelte';
	import { page } from '$app/stores';
</script>

<template>
	<header>
		<a class="logo" href="/"> <h3>GAUTHAM KRISHNA</h3></a>
		<nav>
			<ul class={`${$page.path}P`.slice(1)}>
				<a href="/"><li>HOME</li></a>
				<a href="/about"><li>ABOUT</li></a>
				<a href="/contact"><li>CONTACT</li></a>
			</ul>
		</nav>
		<Navspot />
	</header>
</template>

<slot />

<style lang="scss">
	@import '../style/helpers/variables';
	@import '../style/base/typography';
	:global {
		@import '../style/global';
	}
	header {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		height: 12vh;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		align-items: end;
		margin: 0 120px 0;
		@include breakpoint(tablet) {
			margin: 0 64px 0;
			min-height: 150px;
			grid-template-rows: 1fr 0.5fr;
		}
		@include breakpoint(phone) {
			margin: 0 40px 0;
			min-height: 100px;
		}
	}
	.logo {
		@include breakpoint(tablet) {
			grid-area: 1 / 1 / 2 / 4;
		}
	}
	h3 {
		font-family: $primary-font;
		color: $gray1;
		text-decoration: none;
		font-size: $M;
		letter-spacing: 0.25em;
		@include breakpoint(tablet) {
			grid-area: 1 / 1 / 2 / 4;
			font-size: $N;
		}
		@include breakpoint(phone) {
			font-size: $S;
		}
	}
	nav {
		@include breakpoint(tablet) {
			grid-area: 2 / 1 / 3 / 3;
			justify-content: start;
		}
	}
	ul {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-right: 4em;
		@include breakpoint(tablet) {
			justify-content: flex-start;
		}
		a {
			font-size: $M;
			padding-top: 5px;
			color: $gray2;
			letter-spacing: 0.15em;
			@include breakpoint(tablet) {
				margin-right: 5em;
				font-size: $N;
			}
			@include breakpoint(phone) {
				margin-right: 3em;
				font-size: $S;
			}
		}
	}

	.P {
		a:nth-child(1) {
			border-top: 2px solid black;
		}
	}
	.aboutP {
		a:nth-child(2) {
			border-top: 2px solid black;
		}
	}
	.contactP {
		a:nth-child(3) {
			border-top: 2px solid black;
		}
	}
</style>
