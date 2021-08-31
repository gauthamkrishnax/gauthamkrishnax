<script>
	export let project;
	export let no;
</script>

<template>
	<section class={project.name}>
		<div class="container">
			<h2>{project.name}</h2>
			<div class="projectNo">
				<h3>PROJECT-{no}</h3>
			</div>
		</div>
	</section>
</template>

<style lang="scss">
	section {
		@import '../style/helpers/variables';
		height: 68vh;
		margin: 10vh 120px;
		.container {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			grid-template-rows: auto 1fr;
			.projectNo {
				grid-row: 2;
				position: relative;
				h3 {
					transform: rotate(-90deg);
					position: absolute;
					top: 130px;
					left: -130px;
					font-size: $XL;
					letter-spacing: 0.15em;
				}
			}
			h2 {
				grid-column: 2 / 3;
				@include fluid-font(1280px, 1920px, 75px, 96px);
				font-family: $primary-font;
			}
		}
	}
</style>
