<script>
	import Loader from '../components/Loader.svelte';
	import Footer from '../components/Footer.svelte';
	import CircleType from '../components/CircleType.svelte';
	import Arrow from '../svg/arrow.svelte';
	import MyPhoto from '../assets/myPhoto.png';
	import { onMount } from 'svelte';
	import Ending from '../components/Ending.svelte';
	import { devTools, designTools } from '../Projects/ToolsandTech';
	let loader = '';
	let content = 'hide';
	onMount(() => {
		loader = 'hide';
		content = '';
	});
</script>

<svelte:head>
	<title>Gautham Krishna - About</title>
</svelte:head>

<template>
	<Loader {loader} />
	<Footer />
	<CircleType
		typeText="| &ensp; PORTFOLIO &ensp; || &ensp; SCROLL DOWN &ensp; || &ensp; MY WORKS &ensp; |"
	/>
	<main class={content}>
		<div class="hero">
			<h2>About</h2>
			<div>
				<p>
					Hello, my name is Gautham Krishna S and I am currently an undergradute in Electronics and
					Computer Engineering from Kerala, India.<br /> <br />I can Design and Code and I am
					passionate about creating artisan digital experiances. I have 2+ years of freelancing
					experiance and have worked with many teams.
				</p>
			</div>
			<div>
				<nav class="heroLinks">
					<a href="#design">
						<li><span>Design <Arrow --left-margin="10px" direction="right" /></span></li></a
					>
					<a href="#development">
						<li><span>Development <Arrow --left-margin="10px" direction="right" /></span></li></a
					>
					<a href="#resume">
						<li><span>Resume <Arrow --left-margin="10px" direction="right" /></span></li></a
					>
				</nav>
			</div>
		</div>
		<div class="myPhoto">
			<span />
			<img src={MyPhoto} alt="My potrait" />
		</div>
		<div class="hero-illu">
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
		</div>
	</main>
	<section id="development">
		<h2>Development</h2>
		<div>
			<p>
				I am really passionate to code. I started learning Javascript to implement the user
				interfaces and mockups that I design. With the designer’s eye for details I am passionate
				about implementing designs into highly interactive experiances by paying close attention to
				details, assesibility and performance.
			</p>
			<article>
				<h4>Tools and Technologies</h4>
				<ul class="tools">
					{#each devTools as devTool}
						<li>{devTool}</li>
					{/each}
				</ul>
			</article>
			<article>
				<h4>Certifications and Achievements</h4>
				<ul>
					<li>
						Web Design for Everybody: Basics of Web Development & Coding, University of Michigan
					</li>
					<li>Responsive Web Design Developer Certification, FreeCodeCamp</li>
					<li>Front End Libraries Developer Certification, FreeCodeCamp</li>
				</ul>
			</article>
			<article>
				<h4>Experiance</h4>
				<ul>
					<li>Web developer, KMV</li>
				</ul>
			</article>
		</div>
	</section>
	<section id="design">
		<h2>Design</h2>
		<div>
			<p>
				My creative journey started with graphics design. I started learning Adobe Photoshop when I
				was sixteen and has since then worked hard to stay relevant in the field. I have collabrated
				with many clients and have a lot of freelancing experiance. I now love to design simple,
				beautiful and emotional websites.
			</p>
			<article>
				<h4>Tools and Technologies</h4>
				<ul class="tools">
					{#each designTools as designTool}
						<li>{designTool}</li>
					{/each}
				</ul>
			</article>
			<article>
				<h4>Certifications and Achievements</h4>
				<ul>
					<li>Graphics Design Specialization, CAL ARTS</li>
					<li>Adobe UX Foundation learning Journey, Adobe</li>
				</ul>
			</article>
			<article>
				<h4>Experiance</h4>
				<ul>
					<li>Freelance Graphics Designer, MIO</li>
					<li>UX design, CodeGreenBack</li>
					<li>UX design / PR , VayuPure</li>
					<li>Design Team Lead, Hack Club VIT Chennai</li>
				</ul>
			</article>
		</div>
	</section>
	<Ending />
</template>

<style lang="scss">
	@import '../style/helpers/variables';

	main {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		margin-top: 12vh;
		height: 100vh;
		@include breakpoint(tablet) {
			margin-top: 100px;
			height: 110vh;
			grid-template-columns: 1.8fr 1fr;
			grid-template-rows: 1.5fr 1fr;
		}
		@include breakpoint(phone) {
			margin-top: 20px;
		}
		.hero {
			z-index: 30;
			margin: 8vh -20px 0 120px;
			max-width: 1000px;
			@include breakpoint(tablet) {
				max-width: 500px;
				margin: 100px 20px 20px 64px;
			}
			@include breakpoint(phone) {
				max-width: 250px;
				margin: 100px 10px 10px 40px;
			}
			div {
				margin-top: 10px;
				// font-size: $N;
				color: $gray2;
				letter-spacing: 0.01em;
				line-height: 22px;
				@include breakpoint(tablet) {
					line-height: 15px;
					margin-top: 10px;
					font-size: $N;
				}
				@include breakpoint(phone) {
					margin-top: 5px;
					font-size: $S;
				}
			}
			.heroLinks {
				height: 200px;
				margin-top: 2em;
				display: flex;
				flex-direction: column;
				justify-content: space-around;
				@include breakpoint(phone) {
					height: 150px;
				}
				span {
					display: flex;
					align-items: center;
					color: $gray1;
					font-family: $primary-font;
					font-size: $L;
					@include breakpoint(tablet) {
						font-size: $M;
					}
				}
				li {
					list-style: none;
				}
			}
		}
		.myPhoto {
			position: relative;
			margin-left: 80px;
			@include breakpoint(tablet) {
				margin-left: 40px;
			}
			@include breakpoint(phone) {
				margin-left: 10px;
			}
			img {
				position: absolute;
				top: 8vh;
				// left: 40px;
				width: 250px;
				@include breakpoint(tablet) {
					top: 120px;
					width: 180px;
				}
				@include breakpoint(phone) {
					width: 100px;
				}
			}
			span {
				display: block;
				position: absolute;
				top: 12vh;
				left: 20px;
				width: 250px;
				height: 250px;
				border: 1px solid black;
				@include breakpoint(tablet) {
					width: 180px;
					height: 180px;
					top: 140px;
				}

				@include breakpoint(phone) {
					top: 130px;
					left: 10px;
					width: 100px;
					height: 100px;
				}
			}
		}
		.hero-illu {
			position: absolute;
			width: 35%;
			top: 0;
			right: 0;
			bottom: 0;
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			grid-template-rows: 1fr 2fr 2fr;
			@include breakpoint(tablet) {
				opacity: 30%;
				top: auto;
				bottom: 0;
				right: 0;
				width: 100%;
				height: 40%;
				grid-template-columns: 1fr 1fr 1fr;
				grid-template-rows: 1fr 1fr;
			}
			div {
				border-top: 1px solid $light1;
				border-left: 1px solid $light1;
			}
		}
	}
	h2 {
		font-family: $primary-font;
		@include fluid-font(1280px, 1920px, 48px, 60px);
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
	section {
		min-height: 100vh;
		padding-top: 16vh;
		z-index: 30;
		margin: 0 -20px 0 120px;
		max-width: 1000px;
		@include breakpoint(tablet) {
			// max-width: 500px;
			padding-top: 22vh;
			margin: 10px 20px 0 64px;
		}
		@include breakpoint(phone) {
			max-width: 250px;
			padding-top: 14vh;
			margin: 10px 10px 0 40px;
		}
		div {
			display: grid;
			margin-top: 10px;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr 1fr;
			justify-content: space-around;
			grid-gap: 40px;
			@include breakpoint(tablet) {
				// grid-gap: 20px;
			}
			@include breakpoint(phone) {
				grid-template-columns: 1fr;
				grid-template-rows: auto;
			}
			h4 {
				font-family: $primary-font;
				font-size: $L;
				@include breakpoint(tablet) {
					font-size: $M;
				}
				@include breakpoint(phone) {
					font-size: $N;
				}
			}
			p {
				// margin-top: 10px;
				// font-size: $M;
				color: $gray2;
				letter-spacing: 0.01em;
				line-height: 22px;
				width: 450px;
				@include breakpoint(tablet) {
					width: auto;
					line-height: 15px;
					margin-top: 10px;
					font-size: $N;
				}
				@include breakpoint(phone) {
					margin-top: 5px;
					font-size: $S;
				}
			}
			ul {
				margin-top: 1.5em;
				margin-left: 1em;
				color: $gray2;
				line-height: 18px;
				@include breakpoint(tablet) {
					line-height: 15px;
					margin-top: 10px;
					font-size: $N;
				}
				@include breakpoint(phone) {
					margin-top: 5px;
					font-size: $S;
				}
				li {
					list-style: circle;
					margin-top: 1em;
				}
			}
		}
	}
	.tools {
		display: flex;
		flex-wrap: wrap;
		margin: 0 0 0 0;
		li {
			margin-right: 1em;
			list-style: none;
		}
	}
</style>
