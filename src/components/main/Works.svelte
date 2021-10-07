<script>
	import Project from '../elements/Project.svelte';
	import ProjectCircles from '../elements/ProjectCircles.svelte';
	import ArrowIcon from '../svg/ArrowIcon.svelte';
	import projects from '../../data/projects';
	import ProjectArchives from '../elements/ProjectArchives.svelte';

	let current = 0,
		projectCount = projects.length;

	function handleNextProjectBtn() {
		current = current + 1;
		if (current == projectCount + 1) {
			current = 0;
		}
	}
</script>

<template>
	<section id="works" class="main">
		<div class="container">
			<h2>WORKS</h2>
			<div class="workContent">
				{#if current < projectCount}
					<div class="projectCarousel"><Project {current} project={projects[current]} /></div>
				{:else}
					<div><ProjectArchives /></div>
				{/if}
				<div class="carouselButtonContainer">
					<ProjectCircles count={projectCount + 1} {current} />
					<div class="nextProjectBtn">
						<button on:click={() => handleNextProjectBtn()}>
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
			}
			color: $light-2;
		}
	}
	.workContent {
		min-height: 300px;
	}
</style>
