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
	}
</style>
