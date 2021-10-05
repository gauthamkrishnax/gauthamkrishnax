<script>
	import AnimatedCircles from '../elements/AnimatedCircles.svelte';

	import ArrowIcon from '../svg/ArrowIcon.svelte';
</script>

<template>
	<section id="home" class="main">
		<div class="container">
			<div class="hero">
				<h1>Gautham Krishna</h1>
				<span>I create simply beautiful code.</span>
				<p>
					I’m a freelance <strong>developer</strong> and <strong>designer</strong> specializing in
					building
					<strong>artisan digital experiances</strong> and <strong>passionate</strong> about
					building <strong>creative</strong>, <strong>user-centered designs</strong>.
				</p>
			</div>
			<a href="#works">My Works<ArrowIcon direction="down" /></a>
			<svg
				width="470"
				height="838"
				viewBox="0 0 470 838"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect
					x="50.2046"
					y="468.757"
					width="70"
					height="591.923"
					transform="rotate(-135 50.2046 468.757)"
					stroke="#353535"
				/>
				<rect
					x="51.0638"
					y="468.561"
					width="70"
					height="520.708"
					transform="rotate(-45 51.0638 468.561)"
					stroke="#353535"
				/>
			</svg>
			<AnimatedCircles />
		</div>
	</section>
</template>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		position: relative;
	}
	.hero {
		z-index: 5;
		margin: auto 0;
		span {
			color: $light-3;
			font-family: $font-bold;
			font-weight: bolder;
			font-size: 3.5rem;
		}
		p {
			max-width: 500px;
			color: $light-3;
			margin-top: 1.5rem;
		}
	}
	a {
		width: max-content;
		text-decoration: none;
		color: $light-2;
		display: flex;
		align-items: center;
	}
	svg {
		position: absolute;
		bottom: -420px;
		right: -300px;
	}
</style>
