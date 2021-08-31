<script>
	import { onMount } from 'svelte';
	let eyeBall, pupil, centerX, centerY, R, r;

	onMount(() => {
		let eyeArea = eyeBall.getBoundingClientRect(),
			pupilArea = pupil.getBoundingClientRect();
		R = eyeArea.width / 2;
		r = pupilArea.width / 2 + 4;
		centerX = eyeArea.left + R;
		centerY = eyeArea.top + R;
	});

	const followEye = (e) => {
		let x = e.clientX - centerX,
			y = e.clientY - centerY,
			theta = Math.atan2(y, x),
			angle = (theta * 180) / Math.PI + 360;
		pupil.style.transform = `translateX(${R - r + 'px'}) rotate(${angle + 'deg'})`;
		pupil.style.transformOrigin = `${r + 'px'} center`;
	};
</script>

<svelte:window on:mousemove={(e) => followEye(e)} />

<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
	<circle bind:this={eyeBall} cx="13" cy="13" r="12" stroke="#505050" stroke-width="2" />
	<circle class="pupil" bind:this={pupil} cx="13" cy="13" r="3" fill="black" />
</svg>

<style lang="scss">
	@import '../style/helpers/variables';
	svg {
		justify-self: end;
		@include breakpoint(tablet) {
			grid-area: 1 / 3 / 2 / 4;
		}
	}
	.pupil {
		margin: 10px;
	}
</style>
