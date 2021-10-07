<script>
	import BehanceIcon from '../svg/BehanceIcon.svelte';
	import CodepenIcon from '../svg/CodepenIcon.svelte';
	import GithubIcon from '../svg/GithubIcon.svelte';
	import HackerrankIcon from '../svg/HackerrankIcon.svelte';
	import InstagramIcon from '../svg/InstagramIcon.svelte';
	import LinkedinIcon from '../svg/LinkedinIcon.svelte';
	import TwitterIcon from '../svg/TwitterIcon.svelte';

	export let type = 'sidemenu';
</script>

<ul class={type}>
	<li><a rel="external" href="https://github.com/gauthamkrishnax"><GithubIcon {type} /></a></li>
	<li>
		<a rel="external" href="https://www.behance.net/gauthamkrishnax"><BehanceIcon {type} /></a>
	</li>
	<li>
		<a rel="external" href="https://www.linkedin.com/in/gauthamkrishnas/"><LinkedinIcon {type} /></a
		>
	</li>
	<li><a rel="external" href="https://codepen.io/gauthamkrishnax"><CodepenIcon {type} /></a></li>
	<li>
		<a rel="external" href="https://www.hackerrank.com/gauthamkrishnax"><HackerrankIcon {type} /></a
		>
	</li>
	<li><a rel="external" href="https://twitter.com/8thumbi"><TwitterIcon {type} /></a></li>
	<li>
		<a rel="external" href="https://www.instagram.com/aestheticvisu4ls/"><InstagramIcon {type} /></a
		>
	</li>
</ul>

<style lang="scss">
	.sidemenu {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		li {
			margin: 1em;
		}
		@include breakpoint(tablet) {
			margin-bottom: 4em;
		}
		@include breakpoint(phone) {
			margin-bottom: 5em;
			margin-left: -4em;
			flex-wrap: wrap;
			li {
				margin: 1em;
			}
		}
	}
	.contact {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		margin-bottom: 1em;
		li {
			margin-right: 2em;
		}
		li:last-child {
			margin-right: 0;
		}
		@include breakpoint(tablet) {
			margin-bottom: 4em;
		}
		@include breakpoint(phone) {
			margin-bottom: 2em;
			flex-wrap: wrap;
			margin-top: 1em;
			li {
				margin-right: 1.2em;
			}
		}
	}
</style>
