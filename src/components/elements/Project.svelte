<script>
	import Githubv2Icon from '../svg/Githubv2Icon.svelte';
	import VisitSiteIcon from '../svg/VisitSiteIcon.svelte';
	export let project, current;
</script>

<div class="projectContainer">
	<div class="preveiewImageContainer">
		<img src={project.img} alt={project.Name} />
	</div>
	<div class="details">
		<span class="projectno">Project {current + 1}</span>
		<h3>{project.Name}</h3>
		<p>{@html project.desc}</p>
		<div class="btncontainer">
			<a href={project.repo}>
				<button class="btn-anim" tabindex="-1">
					<Githubv2Icon />
					<span>Visit Repo</span>
				</button>
			</a>
			<a href={project.site}>
				<button class="btn-anim" tabindex="-1">
					<VisitSiteIcon />
					<span>Visit Site</span>
				</button>
			</a>
		</div>
	</div>
</div>

<style lang="scss">
	.preveiewImageContainer {
		width: 40%;
		max-width: 460px;
		position: relative;
		z-index: 2;
		@include breakpoint(tablet) {
			width: 100%;
		}
		img {
			position: relative;
			width: 100%;
			height: 100%;
		}
	}
	.projectContainer {
		width: 100%;
		height: 350px;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		text-align: right;
		margin-top: 4em;
		@include breakpoint(tablet) {
			flex-direction: column;
			align-items: center;
			justify-content: flex-start;
			text-align: left;
			height: 500px;
		}
		@include breakpoint(phone) {
			margin-top: 2em;
			height: 400px;
		}
		@media only screen and (min-width: 1600px) {
			height: 440px;
		}
	}
	.details {
		z-index: 3;
		margin-left: -8em;
		margin-bottom: 2em;
		@include breakpoint(tablet) {
			margin-left: 0;
			margin-top: -8em;
			padding-top: 1em;
			background-color: rgba(0, 0, 0, 0.7);
		}
		.projectno {
			font-size: 0.8rem;
			@include breakpoint(tablet) {
				margin-left: 0.5em;
			}
		}
		h3 {
			margin: 0.2em 0 0.6em;
			@include breakpoint(tablet) {
				margin-left: 0.2em;
			}
		}
		p {
			font-size: 0.8rem;
			color: $light-2;
			max-width: 550px;
			line-height: 140%;
			text-align: left;
			background-color: $dark-2;
			padding: 2em 2.5em;
			box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
			@include breakpoint(phone) {
				padding: 1em 1.2em;
				line-height: 120%;
			}
		}
		.btncontainer {
			display: flex;
			justify-content: flex-end;
			gap: 2em;
			@include breakpoint(tablet) {
				justify-content: center;
			}
		}
		button {
			cursor: pointer;
			color: $light-1;
			display: flex;
			align-items: center;
			span {
				transition: $transition;
				margin-top: 0.3em;
				margin-left: 0.3em;
				font-size: 1.2rem;
				@include breakpoint(phone) {
					font-size: 0.8rem;
					margin-top: 1em;
				}
			}
		}
	}
</style>
