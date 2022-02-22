<script>
	export let type;
</script>

<svg
	class={type}
	width="112"
	height="112"
	viewBox="0 0 112 112"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<path
		d="M44.5272 34.5293C44.1892 34.8753 44 35.3398 44 35.8235C44 36.3072 44.1892 36.7718 44.5272 37.1178L63.4101 56.4889L44.5272 75.8562C44.1892 76.2022 44 76.6667 44 77.1504C44 77.6341 44.1892 78.0986 44.5272 78.4447C44.6915 78.6134 44.8879 78.7475 45.1049 78.8391C45.3218 78.9306 45.555 78.9778 45.7905 78.9778C46.026 78.9778 46.2591 78.9306 46.476 78.8391C46.693 78.7475 46.8894 78.6134 47.0537 78.4447L67.134 57.8413C67.4866 57.4795 67.684 56.9942 67.684 56.4889C67.684 55.9836 67.4866 55.4984 67.134 55.1365L47.0537 34.5332C46.8894 34.3644 46.693 34.2303 46.476 34.1387C46.2591 34.0472 46.026 34 45.7905 34C45.555 34 45.3218 34.0472 45.1049 34.1387C44.8879 34.2303 44.6915 34.3644 44.5272 34.5332V34.5293Z"
		fill="#CCCCCC"
	/>
	<circle cx="56" cy="56" r="55.5" stroke="#ABABAB" />
</svg>

<style lang="scss">
	svg {
		position: absolute;
		top: 40%;
		opacity: 0.5;
		cursor: pointer;
		&:hover {
			opacity: 1;
		}
		@include breakpoint(tablet) {
			width: 4em;
			top: 30%;
		}
		@include breakpoint(phone) {
			top: 10%;
		}
	}
	.right {
		right: 6em;
		@include breakpoint(phone) {
			right: 2em;
		}
	}
	.left {
		left: 6em;
		transform: rotate(180deg);
		@include breakpoint(phone) {
			left: 2em;
		}
	}
</style>
