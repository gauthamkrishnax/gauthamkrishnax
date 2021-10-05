<script>
	import SocialMediaLinks from '../elements/SocialMediaLinks.svelte';
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
				<button> 8.gautham@pm.me </button>
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
				<button>Feed the hungry</button>
			</div>
		</div>
	</section>
</template>

<style lang="scss">
	.talk {
		margin-top: 4em;
		p {
			color: $light-2;
			max-width: 500px;
		}
		button {
			border: 1px solid $light-1;
			font-size: 3rem;
			color: $light-1;
			padding: 0.2em 0.5em;
			margin: 1em 0 0.5em;
			cursor: pointer;
		}
	}
	hr {
		margin: 0 -14em;
		border: 1px solid $dark-3;
	}
	.thaagam {
		float: right;
		text-align: right;
		h3 {
			font-size: 3rem;
			margin: -0.5em 3em 1em 0;
		}
		p {
			max-width: 400px;
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
