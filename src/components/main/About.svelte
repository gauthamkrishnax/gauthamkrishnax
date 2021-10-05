<script>
	import PicSupportIcon from '../svg/PicSupportIcon.svelte';
</script>

<template>
	<section id="about" class="main">
		<div class="container">
			<h2>ABOUT</h2>
			<div class="aboutInfoContainer">
				<div>
					<PicSupportIcon />
					<div class="imageContainer">
						<img src="/images/me.jpg" alt="" />
					</div>
				</div>
				<div class="content">
					<p>
						<strong>Hello!</strong> My name is <strong>Gautham</strong> and I love creating things.
						I taught myself designing when I was 16 and started freelancing. My Intrest in coding
						started when I wanted to make my mockup UI designs real. Now I love combining both of
						the skills to build <strong>creative</strong> softwares and designs.
					</p>
					<p>
						Currently I am a <strong>Computer Science</strong> middler in Vellore Instistute of
						Technology, Chennai while I reside in Kerala, India. My main focus these days is to
						learn <strong>new technology</strong> and create
						<strong>user-centered products</strong>.
					</p>
					<p>Here are a few technologies I’ve been working with recently :</p>
					<ul>
						<li>Javascript</li>
						<li>Sass</li>
						<li>Mongo DB</li>
						<li>Typescript</li>
						<li>React.js</li>
						<li>GSAP</li>
						<li>Node.js</li>
						<li>Svelte</li>
						<li>Docker</li>
					</ul>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss">
	.aboutInfoContainer {
		padding-top: 4em;
		height: 100%;
		display: grid;
		grid-template-columns: 0.7fr 1fr;
		position: relative;
		z-index: 0;
		// overflow: hidden;
	}
	.imageContainer {
		height: 17em;
		width: 17em;
		border-radius: 50em;
		overflow: hidden;
		position: relative;
		z-index: 4;
		img {
			width: 17em;
			// margin-left: -3em;
			object-fit: contain;
		}
	}
	.content {
		p {
			color: $light-2;
			font-weight: normal;
			margin-bottom: 2em;
			line-height: 140%;
		}
		p:first-child {
			strong:first-child {
				font-size: 2rem;
			}
		}
		ul {
			padding: 2em;
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			gap: 2em;
			li {
				letter-spacing: 0.05em;
				list-style: circle;
			}
		}
	}
</style>
