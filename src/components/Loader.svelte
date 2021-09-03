<script>
	export let pageName = 'GAUTHAM KRISHNA';
</script>

<template>
	<div class="loader">
		<h3>
			{pageName}
		</h3>
	</div>
</template>

<style lang="scss">
	@import '../style/helpers/variables';
	.loader {
		background-color: $background-color;
		position: fixed;
		overflow: hidden;
		z-index: 50;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		h3 {
			font-family: $primary-font;
			letter-spacing: 0.15em;
			position: absolute;
			width: 100%;
			text-align: center;
			top: 45%;
		}
	}
</style>
