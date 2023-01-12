<script>
	export let name;
	let heading;
</script>

<section data-scroll-section>
	<h2 bind:this={heading} class="heading">{name}</h2>
</section>

<style>
	section {
		width: 100%;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.4);
	}
	h2 {
		color: white;
		line-height: 100.5%;
		letter-spacing: 0.02em;
		font-size: 94px;
		font-weight: 400;
		font-feature-settings: "liga";
		/* font-variant-ligatures: no-common-ligatures; */
		/* font-variant: common-ligatures tabular-nums; */
	}
</style>
