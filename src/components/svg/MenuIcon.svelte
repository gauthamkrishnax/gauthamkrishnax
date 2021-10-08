<script>
	export let toogleMenu;
</script>

<svg
	class={toogleMenu}
	width="23"
	height="23"
	viewBox="0 0 23 23"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<line
		id="menuline1"
		x1="1"
		y1="7"
		x2="23"
		y2="7"
		stroke="white"
		stroke-width="2"
		stroke-linecap="round"
	/>
	<line
		id="menuline2"
		x1="1"
		y1="14"
		x2="23"
		y2="14"
		stroke="white"
		stroke-width="2"
		stroke-linecap="round"
	/>
</svg>

<!-- <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<line x1="3.41421" y1="2.00003" x2="18.2635" y2="16.8493" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
<line x1="2.36816" y1="16.7175" x2="17.2174" y2="1.86829" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
</svg> -->
<style lang="scss">
	.showSidebar {
		line {
			stroke: $dark-1;
		}
	}
</style>
