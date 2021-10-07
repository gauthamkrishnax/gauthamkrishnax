<script>
	import SocialMediaLinks from '../elements/SocialMediaLinks.svelte';

	let mail = '8.gautham@pm.me';

	const copyMail = () => {
		mail = 'Mail ID Copied !';
		window.open('mailto:8.gautham@pm.me', '_top');
		setTimeout(() => {
			mail = '8.gautham@pm.me';
			navigator.clipboard
				.writeText(mail)
				.then(() => {
					console.log('Mail Copied !');
				})
				.catch(() => {
					console.error('Error Copying Mail !');
				});
		}, 2000);
	};
</script>

<template>
	<section id="contact" class="main">
		<div class="container">
			<h2>CONTACT</h2>
			<div class="talk">
				<h3>Let's talk.</h3>
				<p>
					One little click of a button away from your big stuff & my future. I promise I’ll get back
					to you as soon as possible.
				</p>
				<button title="📧 Open Mail Client / Copy Text" on:click={() => copyMail()} id="mail">
					{mail}
				</button>
				<SocialMediaLinks type="contact" />
			</div>
			<hr />
			<div class="thaagam">
				<h3>Or</h3>
				<p>
					<em
						>“It is an eternal obligation toward the human being not to let him suffer from hunger
						when one has a chance of coming to his assistance.”</em
					> –Simone Weil
				</p>
				<a href="https://www.thaagam.org/" rel="external">
					<button>Feed the hungry</button>
				</a>
			</div>
		</div>
	</section>
</template>

<style lang="scss">
	.container {
		background-color: $dark-1;
		z-index: 4;
		position: relative;
		@include breakpoint(phone) {
			margin-bottom: 2em;
		}
	}
	.talk {
		margin-top: 4em;
		p {
			color: $light-2;
			max-width: 500px;
			@include breakpoint(phone) {
				font-size: 0.8rem;
			}
		}
		button {
			border: 1px solid $light-1;
			font-size: 3rem;
			color: $light-1;
			padding: 0.2em 0.5em;
			margin: 1em 0 0.5em;
			cursor: pointer;
			@include breakpoint(tablet) {
				font-size: 2rem;
			}
			@include breakpoint(phone) {
				font-size: 1.5rem;
			}
		}
	}
	hr {
		margin: 0 -14em;
		border: 1px solid $dark-3;
	}
	.thaagam {
		float: right;
		text-align: right;
		@include breakpoint(phone) {
			margin-bottom: 1em;
		}
		h3 {
			font-size: 3rem;
			margin: -0.5em 3em 0.5em 0;
		}
		p {
			max-width: 400px;
			@include breakpoint(phone) {
				font-size: 0.8rem;
			}
		}
		button {
			border: 1px solid $light-1;
			font-size: 1.5rem;
			cursor: pointer;
			color: $light-1;
			padding: 0.2em 0.5em;
			margin: 1em 0;
		}
	}
</style>
