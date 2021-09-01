<script>
	export let pageName = 'GAUTHAM KRISHNA',
		loader;
</script>

<template>
	<div class="{loader} loader">
		<span>{pageName}</span>
	</div>
</template>

<style lang="scss">
	@import '../style/helpers/variables';
	.loader {
		background-color: $background-color;
		position: fixed;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		z-index: 20;
		top: 0;
		span {
			font-family: $primary-font;
			letter-spacing: 0.15em;
			position: absolute;
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
