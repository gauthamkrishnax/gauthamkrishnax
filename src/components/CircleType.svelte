<script>
	import CircleType from 'circletype';
	import { onMount } from 'svelte';
	import Arrow from '../svg/arrow.svelte';
	export let typeText,
		type = 'footer',
		direction = '';
	let circle;
	onMount(() => {
		new CircleType(circle);
	});
</script>

<template>
	<div class="container {type}">
		<div>
			<span bind:this={circle}>{typeText}</span>
		</div>
		<Arrow --left-margin="-10px" {direction} />
	</div>
</template>

<style lang="scss">
	@import '../style/helpers/variables';
	.container.footer {
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
	.container.ending {
		position: static;
		display: flex;
		align-items: center;
		justify-content: center;
		div {
			animation: rotation 15s linear infinite;
			font-size: $L;
			@include breakpoint(tablet) {
				font-size: $N;
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
