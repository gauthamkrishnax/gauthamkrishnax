<script context="module">
	export const prerender = true;
</script>

<script>
	import Flower from '../svg/flower.svelte';
	import Footer from '../components/Footer.svelte';
	let mail = '8.gautham@pm.me';
	const copyMail = () => {
		mail = 'Mail ID Copied !';
		window.open('mailto:8.gautham@pm.me', '_top');
		setTimeout(() => {
			mail = '8.gautham@pm.me';
			var r = document.createRange();
			r.selectNode(document.getElementById('mail'));
			window.getSelection().removeAllRanges();
			window.getSelection().addRange(r);
			document.execCommand('copy');
			window.getSelection().removeAllRanges();
		}, 2000);
	};
</script>

<svelte:head>
	<title>Gautham Krishna - Contact</title>
	<meta
		name="description"
		content="Gautham Krishna (Portfolio - Contact) - developer and designer | Whatever the problem, being part of the solution | Kerala, India. "
	/>
</svelte:head>

<template>
	<section>
		<span>I would love to hear from you ! </span>
		<h1 title="📧 Open Mail Client / Copy Text" on:click={() => copyMail()} id="mail">
			{mail}
		</h1>
		<nav class="ending">
			<ul>
				<a rel="external" href="https://www.behance.net/gauthamkrishnax"><li>Behance</li></a>
				<a rel="external" href="https://github.com/gauthamkrishnax"><li>Github</li></a>
				<a rel="external" href="https://www.linkedin.com/in/gauthamkrishnas/"><li>LinkedIn</li></a>
			</ul>
		</nav>
		<Flower type="back" />
	</section>
</template>

<style lang="scss">
	@import '../style/helpers/variables';
	section {
		padding-top: 25vh;
		text-align: center;
		font-size: $M;
		padding-right: 5em;
		width: max-content;
		margin: 0 auto;
		@include breakpoint(tablet) {
			text-align: left;
			margin: 0 64px;
			padding-right: 0;
			padding-top: 220px;
			font-size: $S;
		}
		@include breakpoint(phone) {
			margin: 0 40px;
			padding-right: 0;
			padding-top: 130px;
		}
		span {
			color: $gray2;
		}
	}
	h1 {
		position: relative;
		z-index: 30;
		margin-top: 0.5em;
		font-family: $primary-font;
		font-size: $XXL;
		cursor: pointer;
		transition: all 0.15s ease-in;
		&:hover {
			color: $scroll;
		}
		@include breakpoint(tablet) {
			// max-width: 400px;
			margin: 0 auto;
			margin-top: 1em;
			font-size: $XL;
		}
		@include breakpoint(phone) {
			// max-width: 200px;
			margin: 0 auto;
			margin-top: 0.5em;
			font-size: $L;
		}
	}
	.ending {
		ul {
			display: flex;
			z-index: 10;
			a {
				color: $gray1;
				@include breakpoint(tablet) {
					font-size: $N;
				}
				@include breakpoint(phone) {
					font-size: $XS;
				}
			}
			a:nth-child(2) {
				margin: 0 40px;
				@include breakpoint(tablet) {
					margin: 0 20px;
				}
			}
		}
		position: static;
		display: flex;
		justify-content: center;
		margin-top: 3em;
		@include breakpoint(tablet) {
			justify-content: flex-start;
			margin-top: 2em;
		}
	}
</style>
