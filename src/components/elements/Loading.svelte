<div>
	<svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="10" cy="10" r="9.5" stroke="#CDCDCD" />
		<circle cx="20" cy="10" r="9.5" stroke="#0094FF" />
	</svg>
	<span>Hmm...This is strange, My Site usually Loads Fast.</span>
</div>

<style lang="scss">
	div {
		z-index: 10;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: $dark-1;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	svg {
		width: 4em;
		height: 4em;
	}
	span {
		position: absolute;
		bottom: 1em;
		color: $dark-3;
		font-size: 0.8rem;
		text-align: center;
	}
</style>
