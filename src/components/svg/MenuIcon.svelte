<script>
	export let toogleMenu;
</script>

<!-- <svg
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
</svg> -->

<!-- <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<line x1="3.41421" y1="2.00003" x2="18.2635" y2="16.8493" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
<line x1="2.36816" y1="16.7175" x2="17.2174" y2="1.86829" stroke="#121212" stroke-width="2" stroke-linecap="round"/>
</svg> -->

<div class={`menu-icon ${toogleMenu === 'showSidebar' ? 'active' : ''}`}>
	<input class="menu-icon__cheeckbox" type="checkbox" aria-label="Menu Button" title="Menu" />
	<div>
		<span class={toogleMenu} />
		<span class={toogleMenu} />
	</div>
</div>

<style lang="scss">
	// svg {
	// 	position: relative;
	// 	z-index: 50;
	// }
	// .showSidebar {
	// 	line {
	// 		stroke: $dark-1;
	// 	}
	// }

	.showSidebar {
		background-color: #000;
	}
	.hideSidebar {
		background-color: #cdcdcd;
	}

	:root {
		--bar-bg: #cdcdcd;
	}

	.menu-icon {
		z-index: 50;
		transform: scale(1.2);
		position: relative;
		width: 25px;
		height: 25px;
		cursor: pointer;

		.menu-icon__cheeckbox {
			display: block;
			width: 100%;
			height: 100%;
			position: relative;
			cursor: pointer;
			z-index: 2;
			-webkit-touch-callout: none;
			position: absolute;
			opacity: 0;
		}
		div {
			margin: auto;
			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			bottom: 0;
			width: 22px;
			height: 15px;
		}
		span {
			position: absolute;
			display: block;
			width: 100%;
			height: 2px;
			// background-color: var(--bar-bg, #000);
			border-radius: 1px;
			transition: all 0.2s cubic-bezier(0.1, 0.82, 0.76, 0.965);

			&:first-of-type {
				top: 0;
			}
			&:last-of-type {
				bottom: 0;
			}
		}
		&.active,
		+ div {
			span {
				&:first-of-type {
					transform: rotate(45deg);
					top: 5px;
				}
				&:last-of-type {
					transform: rotate(-45deg);
					bottom: 5px;
				}
			}
		}

		&.active:hover span:first-of-type,
		&.active:hover span:last-of-type,
		&:hover + div span:first-of-type,
		&:hover + div span:last-of-type {
			width: 22px;
		}

		&:hover {
			// no need hover effect on mobile.
			@media (min-width: 1024px) {
				span:first-of-type {
					width: 26px;
				}

				span:last-of-type {
					width: 12px;
				}
			}
		}
	}
</style>
