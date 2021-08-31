<script>
	export let direction = '';
</script>

<svg
	class={direction}
	width="20"
	height="30"
	viewBox="0 0 20 30"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<path
		d="M19.1 19.9L9.69998 29.7L0.0999756 19.9L0.599976 19.4L7.59998 23.5V0H11.8V23.4L18.6 19.4L19.1 19.9Z"
		fill="#3c3c3c"
	/>
</svg>

<style lang="scss">
	svg {
		width: var(--width-size);
		margin-left: var(--left-margin);
	}
	.left {
		transform: rotate(90deg);
	}

	.right {
		transform: rotate(-90deg);
	}

	.up {
		transform: rotate(180deg);
	}
</style>
