<script>
	export let img, heading, para;
</script>

<template>
	<article>
		{#if img}
			<img src={img} alt={heading} />
		{/if}
		<h6>{heading}</h6>
		<p>{para}</p>
	</article>
</template>

<style lang="scss">
	@import '../style/helpers/variables';
	img {
		width: 80%;
	}
	h6 {
		font-family: $primary-font;
		font-size: $L;
		color: $gray1;
		margin-bottom: 0.5em;
		@include breakpoint(tablet) {
			font-size: $M;
		}
		@include breakpoint(phone) {
			font-size: $N;
		}
	}
	p {
		color: $gray2;
		// width: 80%;
		max-width: 450px;
		line-height: 18px;
		@include breakpoint(phone) {
			line-height: 1em;
			font-size: $XXS;
		}
	}
</style>
