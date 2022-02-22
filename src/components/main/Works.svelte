<script>
	import Project from '../elements/Project.svelte';
	import ProjectCircles from '../elements/ProjectCircles.svelte';
	import ArrowIcon from '../svg/ArrowIcon.svelte';
	import projects from '../../data/projects';
	import ProjectArchives from '../elements/ProjectArchives.svelte';
	import ArrowCircleIcon from '../svg/ArrowCircleIcon.svelte';

	let current = 1,
		projectCount = projects.length;

	function handleNextProjectBtn() {
		current = current + 1;
		if (current == projectCount + 2) {
			current = 1;
		}
	}
	function handlePrevProjectBtn() {
		current = current - 1;
		if (current == 0) {
			current = projectCount + 1;
		}
		console.log(current);
	}
</script>

<template>
	<section id="works" class="main">
		<div class="container">
			<h2>WORKS</h2>
			<button on:click={() => handlePrevProjectBtn()}>
				<ArrowCircleIcon type="left" />
			</button>
			<button on:click={() => handleNextProjectBtn()}>
				<ArrowCircleIcon type="right" />
			</button>
			<div class="workContent">
				<div class="projectCarousel">
					{#each projects as pitem}
						<Project
							{current}
							project={pitem}
							projectPosition={`${
								current == pitem.no ? 'center' : current > pitem.no ? 'left' : 'right'
							}`}
						/>
					{/each}
					<div>
						<ProjectArchives
							projectPosition={`${
								current == projectCount + 1
									? 'center'
									: current > projectCount + 1
									? 'left'
									: 'right'
							}`}
						/>
					</div>
				</div>
				<div class="carouselButtonContainer">
					<ProjectCircles count={projectCount + 2} {current} />
					<div class="nextProjectBtn">
						<button class="btn-anim" on:click={() => handleNextProjectBtn()}>
							<span>Next Project</span><ArrowIcon />
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss">
	.container {
		position: relative;
	}
	.projectCarousel {
		width: 100%;
		height: 100%;
		position: relative;
		// overflow: hidden;
	}
	.nextProjectBtn {
		display: flex;
		justify-content: center;
		margin-top: 1.5em;
		@include breakpoint(phone) {
			margin-top: 1em;
		}
		button {
			cursor: pointer;
			margin-left: 1em;
			display: flex;
			align-items: center;
			span {
				margin-bottom: -0.3px;
				transition: $transition;
			}
			color: $light-2;
		}
	}
	.workContent {
		min-height: 300px;
	}
</style>
