<script>
	import HorizontalLineIcon from '../svg/HorizontalLineIcon.svelte';
	import MenuFlagIcon from '../svg/MenuFlagIcon.svelte';
	import SocialMediaLinks from './SocialMediaLinks.svelte';

	export let hideMenu, toogleMenu;
</script>

<aside id="menuContainer" class={toogleMenu}>
	<div class="flagContainer">
		<MenuFlagIcon />
		<span class="flagYear">20<br />21</span>
	</div>
	<nav>
		<div>
			<h3 class="sidebarHeading">portfolio</h3>
			<ul>
				<li class="sidebarLinks">
					<a href="#home" on:click={hideMenu()}><HorizontalLineIcon />Home</a>
				</li>
				<li class="sidebarLinks">
					<a href="#works" on:click={hideMenu()}><HorizontalLineIcon />Works</a>
				</li>
				<li class="sidebarLinks">
					<a href="#about" on:click={hideMenu()}><HorizontalLineIcon />About</a>
				</li>
				<li class="sidebarLinks">
					<a href="#contact" on:click={hideMenu()}><HorizontalLineIcon />Contact</a>
				</li>
			</ul>
		</div>
		<SocialMediaLinks />
	</nav>
</aside>

<style lang="scss">
	aside {
		position: fixed;
		display: flex;
		justify-content: space-between;
		top: 0;
		right: 0;
		z-index: 49;
		min-width: 50%;
		height: 100vh;
		color: $dark-1;
		background-color: $light-1;
		padding: 8em 8em 2em 1em;
		@include breakpoint(tablet) {
			min-width: 100%;
			padding: 8em 4em 2em 1em;
		}
		@include breakpoint(phone) {
			padding: 5em 2em 2em 1em;
		}
		nav {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}
		h3 {
			font-size: 3rem;
			font-weight: normal;
			font-family: $font-normal;
			text-align: right;
			@include breakpoint(tablet) {
				font-size: 2rem;
			}
		}
		ul {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			padding-top: 3em;
			li {
				margin-bottom: 2.5em;
				@include breakpoint(phone) {
					margin-bottom: 1rem;
				}
				a {
					transition: $transition;
					font-size: 1.5rem;
					@include breakpoint(phone) {
						font-size: 1rem;
					}
				}
			}
		}
		.flagContainer {
			display: flex;
			span {
				font-size: 1.5rem;
				letter-spacing: 0.4em;
				margin-left: 0.5em;
			}
		}
	}
	// .hideSidebar {
	// 	display: none;
	// }
</style>
