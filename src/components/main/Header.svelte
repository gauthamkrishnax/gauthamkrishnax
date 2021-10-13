<script>
	import SideMenu from '../elements/SideMenu.svelte';
	import LineIcon from '../svg/LineIcon.svelte';
	import LogoIcon from '../svg/LogoIcon.svelte';
	import MenuIcon from '../svg/MenuIcon.svelte';

	import gsap from 'gsap';

	import { headerAnimation, SidebarAnimation } from '../../animations/main';
	import { onMount } from 'svelte';

	let container, animateSidebar;

	const sideBartl = gsap.timeline();
	onMount(() => {
		headerAnimation(container);
		SidebarAnimation(container, sideBartl);
	});

	let toogleMenu = 'hideSidebar';
	const hideMenu = () => {
		sideBartl.reversed(!sideBartl.reversed());
		toogleMenu = 'hideSidebar';
	};
</script>

<template>
	<header bind:this={container}>
		<span><LogoIcon /></span>
		<button
			on:click={() => {
				if (toogleMenu === 'hideSidebar') {
					sideBartl.reversed(!sideBartl.reversed());
					toogleMenu = 'showSidebar';
				} else {
					sideBartl.reversed(!sideBartl.reversed());
					toogleMenu = 'hideSidebar';
				}
			}}
			id="menu"><MenuIcon {toogleMenu} /></button
		>
		<SideMenu {hideMenu} {toogleMenu} />
	</header>
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
			z-index: 50;
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
