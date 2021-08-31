<script>
	import CircleType from 'circletype';
	import { onMount } from 'svelte';
	import Arrow from '../svg/arrow.svelte';
	export let typeText;
	let circle;
	onMount(() => {
		new CircleType(circle);
	});
</script>

<template>
	<div class="container">
		<div>
			<span bind:this={circle}>{typeText}</span>
		</div>
		<Arrow --left-margin="-10px" />
	</div>
</template>

<style lang="scss">
	@import '../style/helpers/variables';
	.container {
		position: fixed;
		z-index: 10;
		bottom: 30px;
		right: 5vw;
		display: flex;
		align-items: center;
		@include breakpoint(tablet) {
			right: 50px;
			bottom: 10px;
		}
		div {
			font-family: $secondary-font;
			font-size: $S;
			animation: rotation 15s linear infinite;
			animation-delay: 1s;
			@include breakpoint(tablet) {
				font-size: $XS;
			}
		}
	}

	//ANIMATION

	@keyframes rotation {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(359deg);
		}
	}
</style>
