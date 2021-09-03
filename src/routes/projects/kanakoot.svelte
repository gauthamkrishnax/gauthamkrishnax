<script>
	import Loader from '../../components/Loader.svelte';
	import Footer from '../../components/Footer.svelte';
	import CircleType from '../../components/CircleType.svelte';
	import { projects } from '../../Projects/ProjectDetails';
	import Ending from '../../components/Ending.svelte';
	import Card from '../../components/Card.svelte';
	import Link from '../../svg/link.svelte';
	import { onMount } from 'svelte';
	let project = projects[0];
	let loader = '';
	let content = 'hide';
	onMount(() => {
		loader = 'hide';
		content = '';
	});
</script>

<svelte:head>
	<title>Gautham Krishna - Kanakoot</title>
</svelte:head>

<template>
	<Loader {loader} />
	<Footer />
	<CircleType
		typeText="| &ensp; PORTFOLIO &ensp; || &ensp; SCROLL DOWN &ensp; || &ensp; MY WORKS &ensp; |"
	/>
	<main>
		<div class="{content} content">
			<h1>{project.name}</h1>
			<span class="role">BRANDING | UX DESIGN | DEVELOPMENT</span>
			<section class="hero">
				<ul>
					<li>
						<h5>Problem Statement</h5>
						<p>
							{project.ProblemStatement}
						</p>
					</li>
					<li>
						<h5>Goal/Idea</h5>
						<p>{project.Goal}</p>
					</li>
					<li>
						<h5>About</h5>
						<p>
							{project.about}
						</p>
					</li>
				</ul>
				<div>
					<img class="img1" src={project.previewImage[5]} alt="ui wireframe" />
					<img class="img2" src={project.previewImage[4]} alt="ui wireframe" />
				</div>
			</section>
			<section class="designdev">
				<h2>Design</h2>
				<div>
					<Card img={project.designImage[0]} heading="Logo" para={project.design.logo} />
					<Card
						img={project.designImage[1]}
						heading="Typography"
						para={project.design.typography}
					/>
					<Card
						img={project.designImage[2]}
						heading="Color Palette"
						para={project.design.colorPalette}
					/>
					<Card img={project.designImage[3]} heading="Component" para={project.design.components} />
					<Card img={project.designImage[4]} heading="Elevation" para={project.design.Elevation} />
					<Card img={project.designImage[5]} heading="Animation" para={project.design.Animation} />
				</div>
			</section>
			<section class="screenshots">
				<div>
					<img class="s1" src={project.previewImage[0]} alt="ui" /><img
						class="s3"
						src={project.previewImage[2]}
						alt="ui"
					/>
				</div>
				<div>
					<img class="s2" src={project.previewImage[3]} alt="ui" />
					<img class="s4" src={project.previewImage[1]} alt="ui" />
				</div>
			</section>
			<section class="designdev">
				<h2>Development</h2>
				<p class="devinfo">
					Kanakoot does not need any server applications and therefore I chose to develop a
					serverless website. All the data is computed in the frontend. Used Test Driven Development
					the whole project.
				</p>
				<img class="devtools" src={project.dev.tools} alt="tools logo" />
				<div>
					<Card heading="Programming Langauges" para={project.dev.programmingLangauges} />
					<Card heading="Frontend Frameworks" para={project.dev.frontendFrameworks} />
					<Card heading="Styling and Assets" para={project.dev.styling} />
					<Card heading="Testing" para={project.dev.testing} />
					<Card heading="Other dependencies" para={project.dev.other} />
					<Card heading="Hosting and Analytics" para={project.dev.hosting} />
				</div>
				<div />
			</section>
			<section class="extras">
				<h2>Extras</h2>
				<div>
					<p>{project.extras}</p>
					<article class="links">
						<span><a rel="external" href={project.link}>Visit Site</a><Link /></span>
						<span><a rel="external" href={project.behance}>Visit Behance</a><Link /></span>
						<span><a rel="external" href={project.github}>Visit Github</a><Link /></span>
					</article>
				</div>
			</section>
		</div>
	</main>
	<Ending />
</template>

<style lang="scss">
	@import '../../style/helpers/variables';
	main {
		overflow: hidden;
	}
	.content {
		min-height: 100vh;
		margin: 14vh 120px 0 120px;
		@include breakpoint(tablet) {
			margin: 180px 64px 20px 64px;
		}
		@include breakpoint(phone) {
			margin: 120px 40px 10px 40px;
		}
		.role {
			@include breakpoint(phone) {
				font-size: $XS;
			}
		}
		.hero {
			min-height: 100vh;
			display: grid;
			grid-template-columns: 1fr 1fr;
			ul {
				margin-top: 2em;
				margin-left: 1em;
				li {
					list-style: circle;
					margin-top: 2em;
					p {
						color: $gray2;
						margin-top: 0.5em;
						max-width: 450px;
						line-height: 18px;
						@include breakpoint(phone) {
							line-height: 1em;
							font-size: $XS;
						}
					}
				}
				h5 {
					font-family: $primary-font;
					color: $gray1;
					font-size: $L;
					@include breakpoint(tablet) {
						font-size: $M;
					}
					@include breakpoint(phone) {
						font-size: $N;
					}
				}
			}
			div {
				position: relative;
				// overflow: hidden;
				img {
					width: 450px;
					position: absolute;
					@include breakpoint(tablet) {
						width: 200px;
					}
				}
				.img1 {
					top: -70px;
					right: 0;
					@include breakpoint(tablet) {
						top: 10px;
					}
					@include breakpoint(phone) {
						top: 30px;
						right: -120px;
					}
				}
				.img2 {
					top: 100px;
					right: 150px;
					@include breakpoint(tablet) {
						right: 40px;
						top: 90px;
					}
					@include breakpoint(phone) {
						right: -180px;
					}
				}
			}
		}
		.designdev {
			margin-top: 8em;
			@include breakpoint(tablet) {
				margin-top: 6em;
			}
			.devtools {
				margin-top: 1em;
				@include breakpoint(tablet) {
					width: 200px;
				}
			}
			.devinfo {
				max-width: 1000px;
				color: $gray2;
				line-height: 1.2em;
				@include breakpoint(phone) {
					font-size: $XS;
				}
			}

			div {
				display: grid;
				grid-template-columns: 1fr 1fr 1fr;
				max-width: 1200px;
				margin-top: 2em;
				grid-gap: 3em;
				@include breakpoint(tablet) {
					grid-template-columns: 1fr 1fr;
				}
				@include breakpoint(phone) {
					//
				}
			}
		}
	}
	.screenshots {
		margin-top: 8em;
		display: grid;
		grid-template-columns: 1fr 1fr;
		max-width: 1200px;
		grid-gap: 3em;
		img {
			display: block;
			width: 100%;
			margin-bottom: 3em;
		}
	}
	.extras {
		margin-top: 8em;
		min-height: 70vh;
		max-width: 1000px;
		@include breakpoint(tablet) {
			margin-top: 6em;
		}
		div {
			display: grid;
			grid-template-columns: 1fr 1fr;
			align-items: center;
			@include breakpoint(phone) {
				grid-template-columns: 1fr;
			}
			p {
				color: $gray2;
				font-size: $M;
				line-height: 1.2em;
				max-width: 550px;
				@include breakpoint(tablet) {
					font-size: $N;
				}
				@include breakpoint(phone) {
					font-size: $S;
				}
			}
		}
		.links {
			margin: 0 auto;
			@include breakpoint(phone) {
				margin: 0 0;
			}
			span {
				display: flex;
				align-items: center;
				margin-top: 2em;
			}
			a {
				color: $gray1;
				font-family: $primary-font;
				color: $gray1;
				font-size: $L;
				@include breakpoint(tablet) {
					font-size: $M;
				}
				@include breakpoint(phone) {
					font-size: $N;
				}
			}
		}
	}
	h1 {
		font-family: $primary-font;
		@include fluid-font(1280px, 1920px, 75px, 96px);
		line-height: 119px;
		letter-spacing: 0.015em;
		color: $gray1;
		@include breakpoint(tablet) {
			font-size: $XL;
			line-height: 60px;
		}
		@include breakpoint(phone) {
			font-size: $L;
			line-height: 30px;
		}
	}
	h2 {
		font-family: $primary-font;
		font-size: $XL;
		color: $gray1;
		margin-bottom: 0.2em;
		@include breakpoint(tablet) {
			font-size: $L;
		}
		@include breakpoint(phone) {
			font-size: $L;
		}
	}
</style>
