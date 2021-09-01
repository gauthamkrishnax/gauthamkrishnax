<script>
	export let typew = 'footer';
</script>

<template>
	<nav class={typew}>
		<ul>
			<a rel="external" href="https://www.behance.net/gauthamkrishnax"><li>Behance</li></a>
			<a rel="external" href="https://github.com/gauthamkrishnax"><li>Github</li></a>
			<a rel="external" href="https://www.linkedin.com/in/gauthamkrishnas/"><li>LinkedIn</li></a>
		</ul>
	</nav>
</template>

<style lang="scss">
	@import '../style/helpers/variables';
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
	.footer {
		position: fixed;
		z-index: 10;
		bottom: 30px;
		left: 120px;
		@include breakpoint(tablet) {
			bottom: 20px;
			left: 64px;
		}
		@include breakpoint(phone) {
			bottom: 20px;
			left: 40px;
		}
	}
	.ending {
		position: static;
		display: flex;
		justify-content: center;
		margin-top: 3em;
		@include breakpoint(tablet) {
			margin-top: 1em;
		}
	}
</style>
