<script>
	import SideMenu from '../elements/SideMenu.svelte';
	import LineIcon from '../svg/LineIcon.svelte';
	import LogoIcon from '../svg/LogoIcon.svelte';
	import MenuIcon from '../svg/MenuIcon.svelte';

	let toogleMenu = false;
	const hideMenu = () => {
		toogleMenu = false;
	};
</script>

<template>
	<header>
		<span><LogoIcon /></span>
		<button
			on:click={() => {
				toogleMenu = !toogleMenu;
			}}
			id="menu"><MenuIcon {toogleMenu} /></button
		>
	</header>
	{#if toogleMenu}
		<SideMenu {hideMenu} />
	{/if}
	<LineIcon />
</template>

<style lang="scss">
	header {
		position: fixed;
		max-width: 2000px;
		width: 100%;
		padding: 4em 8em 0;
		z-index: 50;
		#menu {
			float: right;
			cursor: pointer;
		}
		@include breakpoint(tablet) {
			padding: 5em 4em 0;
		}
		@include breakpoint(phone) {
			padding: 5em 1.5em 0;
		}
	}
</style>
