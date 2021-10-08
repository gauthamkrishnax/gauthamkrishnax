<script>
	import SideMenu from '../elements/SideMenu.svelte';
	import LineIcon from '../svg/LineIcon.svelte';
	import LogoIcon from '../svg/LogoIcon.svelte';
	import MenuIcon from '../svg/MenuIcon.svelte';

	import { sideBarAnimation } from '../../animations/main';
	import { onMount } from 'svelte';

	let container;

	onMount(() => {
		sideBarAnimation(container);
	});

	let toogleMenu = 'hideSidebar';
	const hideMenu = () => {
		toogleMenu = 'hideSidebar';
	};
</script>

<template>
	<header bind:this={container}>
		<span><LogoIcon /></span>
		<button
			on:click={() => {
				toogleMenu === 'hideSidebar' ? (toogleMenu = 'showSidebar') : (toogleMenu = 'hideSidebar');
			}}
			id="menu"><MenuIcon {toogleMenu} /></button
		>
	</header>
	<SideMenu {hideMenu} {toogleMenu} />
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
			padding: 3em 1.5em 0;
		}
	}
</style>
