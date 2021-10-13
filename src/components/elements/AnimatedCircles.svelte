<script>
</script>

<div class="animCircles" id="animCircles">
	<svg
		id="smallCircle"
		width="449"
		height="449"
		viewBox="0 0 449 449"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<circle cx="224.5" cy="224.5" r="224" stroke="#00365C" />
	</svg>
	<svg
		id="bigCircle"
		width="585"
		height="585"
		viewBox="0 0 585 585"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<circle cx="292.5" cy="292.5" r="292" stroke="#424242" />
	</svg>
</div>

<style lang="scss">
	div {
		z-index: 0;
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		// margin-left: -10em;
		margin-top: -8em;
		svg:last-child {
			// position: absolute;
			// top: 50%;
			// left: 20%;
			// transform: translate(-50%, -50%);
			margin-left: -20em;
		}
	}
</style>
