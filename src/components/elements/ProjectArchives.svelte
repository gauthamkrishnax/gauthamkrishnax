<script>
	import projectArchive from '../../data/projectArchive';
	import Githubv2Icon from '../svg/Githubv2Icon.svelte';
	import VisitSiteIcon from '../svg/VisitSiteIcon.svelte';
</script>

<div class="archivesContainer">
	<h4>Project Archives</h4>
	<div class="subContainer">
		{#each projectArchive as project}
			<div class="aProjectContainer">
				<span>Project {project.no}</span>
				<h5>{project.name}</h5>
				<p>{project.desc}</p>
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
		{/each}
	</div>
</div>

<style lang="scss">
	.archivesContainer {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 4em;
		@include breakpoint(tablet) {
			margin: 2em;
		}
		h4 {
			letter-spacing: 0.05em;
			@include breakpoint(tablet) {
				text-align: center;
			}
		}
		div.subContainer {
			padding-right: 1em;
			padding-bottom: 4em;
			margin-top: 1em;
			width: 100%;
			max-width: 800px;
			min-width: 230px;
			// max-height: 350px;
			height: 257px;
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1em;
			overflow-y: scroll;
			@include breakpoint(tablet) {
				grid-template-columns: 1fr;
				height: 470px;
			}
			@include breakpoint(phone) {
				height: 340px;
			}
			@media only screen and (min-width: 1600px) {
				height: 350px;
			}

			.aProjectContainer {
				background-color: $dark-2;
				padding: 1.5em;
				span:first-child {
					font-size: 0.8rem;
				}
				p {
					font-size: 0.8rem;
					max-width: 250px;
				}
				h5 {
					font-size: 1.2rem;
					margin-top: 0.2em;
					margin-bottom: 0.5em;
					letter-spacing: 0.05em;
				}
			}
		}
		.btncontainer {
			display: flex;
			justify-content: flex-start;
			gap: 2em;
			margin-top: 2em;
			@include breakpoint(tablet) {
				gap: 1em;
			}
		}
		button {
			cursor: pointer;
			color: $light-1;
			display: flex;
			align-items: center;
			span {
				margin-top: 0.3em;
				margin-left: 0.3em;
				font-size: 1rem;
				@include breakpoint(phone) {
					font-size: 0.8rem;
				}
			}
		}
	}
</style>
