<script>
	export let count;
	export let current;

	let arr = [];
	for (let i = 0; i < count; i++) {
		arr.push(i);
	}
</script>

<div class="circlesContainer">
	{#each arr as circleNo}
		<svg
			class={circleNo === current ? 'current' : ''}
			width="20"
			height="20"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx="10" cy="10" r="9.5" stroke="#A9A9A9" />
		</svg>
	{/each}
</div>

<style lang="scss">
	.circlesContainer {
		width: 100%;
		display: flex;
		justify-content: center;
		margin-top: 2em;
		gap: 2em;
		@include breakpoint(phone) {
			margin-top: 3em;
		}
		svg {
			margin: 0;
		}
		.current {
			transform: scale(1.2);
			circle {
				stroke: $color-primary;
			}
		}
	}
</style>
