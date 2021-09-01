<script>
	import Arrow from '../svg/arrow.svelte';

	export let project;
	export let no;
</script>

<template>
	<section class="{project.name} top">
		<div class="container">
			<h2>{project.name}</h2>
			<div class="content">
				<div class="projectNo">
					<h3>PROJECT-{no}</h3>
				</div>
				<section>
					<article>
						<h5>About</h5>
						<p>{project.about}</p>
					</article>
					<article>
						<h5>Role</h5>
						<ul>
							{#each project.role as role}
								<li>{role}</li>
							{/each}
						</ul>
					</article>
					<article class="links">
						<h4>
							<span><a href="/">Learn more</a><Arrow direction="right" --left-margin=".5em" /></span
							>
						</h4>
						<p>
							<span
								><a href={project.link}>Visit Site</a><Arrow
									direction="right"
									--left-margin=".5em"
									--width-size="15px"
								/></span
							>
						</p>
					</article>
					<article class="progress">
						<h5>Progress</h5>
						<p>{project.progress}</p>
					</article>
				</section>
			</div>
		</div>
		<div class="previewContainer">
			<img class="preview2" src={project.previewImage[1]} alt="Screenshot" />
			<img class="preview1" src={project.previewImage[0]} alt="Screenshot" />
		</div>
	</section>
</template>

<style lang="scss">
	section.top {
		@import '../style/helpers/variables';
		position: relative;
		// overflow: hidden;
		height: 88vh;
		padding: 5em 120px;
		@include breakpoint(tablet) {
			min-height: 100vh;
			height: 100%;
			padding: 160px 64px;
		}
		@include breakpoint(phone) {
			// height: 97vh;
			height: 100%;
			padding: 115px 40px;
		}
		.container {
			display: grid;
			position: relative;
			z-index: 5;
			grid-template-columns: 1fr 1fr 1fr;
			grid-template-rows: auto 1fr;
			@include breakpoint(tablet) {
				grid-template-columns: 1fr 1fr;
				grid-template-rows: auto 1fr;
			}
			.projectNo {
				position: relative;
				h3 {
					transform: rotate(-90deg);
					position: absolute;
					top: 130px;
					left: -130px;
					font-size: $XL;
					letter-spacing: 0.15em;
					@include breakpoint(tablet) {
						top: 90px;
						left: -65px;
						font-size: $L;
					}
					@include breakpoint(phone) {
						left: -40px;
						font-size: $S;
					}
				}
			}
			h2 {
				grid-column: 2 / 3;
				@include fluid-font(1280px, 1920px, 75px, 96px);
				font-family: $primary-font;
				color: $gray1;
				@include breakpoint(tablet) {
					font-size: $XL;
					grid-column: 1/3;
				}
				@include breakpoint(phone) {
					font-size: $L;
				}
			}
		}
		.content {
			grid-area: 2 / 1 / 3 / 4;
			section {
				margin: 0 auto;
				margin-top: 3em;
				padding-left: 8em;
				display: grid;
				grid-template-columns: 1fr 1fr 1fr;
				grid-template-rows: 150px 150px;
				max-width: 1750px;
				@include breakpoint(tablet) {
					grid-template-columns: 1fr 1fr;
					grid-template-rows: auto auto auto;
					margin: 0 0;
					margin-top: 1em;
					padding-left: 3em;
				}
				@include breakpoint(phone) {
					margin-top: 0.2em;
					padding-left: 0.2em;
				}

				article {
					height: 100px;
					margin-left: 2em;
					h5 {
						font-family: $primary-font;
						font-size: $L;
						color: $gray1;
						margin-bottom: 0.2em;
						@include breakpoint(tablet) {
							font-size: $L;
						}
						@include breakpoint(phone) {
							font-size: $N;
						}
					}
					h4 {
						font-family: $primary-font;
						font-size: 36px;
						color: $gray1;
						margin-bottom: 0.2em;
						@include breakpoint(phone) {
							font-size: $N;
						}
					}
					p {
						line-height: 1.1em;
						max-width: 300px;
						color: $gray2;
						@include breakpoint(tablet) {
							font-size: $N;
						}
						@include breakpoint(phone) {
							font-size: $XS;
						}
					}
					ul {
						li {
							margin-bottom: 0.3em;
							list-style: circle;
							margin-left: 1em;
							color: $gray2;
							@include breakpoint(phone) {
								font-size: $XS;
							}
						}
					}
				}
				.links {
					span {
						display: flex;
						align-items: center;
					}
					a {
						color: $gray1;
					}
					grid-column: 1 / 2;
					p {
						font-size: $M;
						margin-left: 0.2em;
						@include breakpoint(phone) {
							font-size: $S;
						}
					}
					@include breakpoint(tablet) {
						grid-area: 2 / 1 / 3 / 3;
					}
				}
				.progress {
					grid-column: 2 / 3;
					@include breakpoint(tablet) {
						grid-area: 3 / 1 / 4 / 3;
					}
				}
			}
		}
		.previewContainer {
			position: absolute;
			overflow: hidden;
			// height: 100%;
			width: 50vw;
			right: 0;
			bottom: 0;
			top: 0;
			z-index: 0;
			img {
				transform: rotate(30deg);
				position: absolute;
				overflow: none;
				bottom: -180px;
				@include breakpoint(phone) {
					bottom: -60px;
					transform: rotate(0);
				}
			}
			.preview1 {
				right: -15%;
				width: 70%;
				@include breakpoint(tablet) {
					width: 400px;
					right: -150px;
				}
				@include breakpoint(phone) {
					width: 250px;
				}
			}
			.preview2 {
				right: 15%;
				bottom: 160px;
				width: 45%;
				@include breakpoint(tablet) {
					width: 250px;
					right: 0px;
					bottom: 50px;
				}
				@include breakpoint(phone) {
					width: 200px;
					bottom: -50px;
					right: -60px;
				}
			}
		}
	}
</style>
