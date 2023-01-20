<script>
	const projectList = [
		{
			name: "Sermobot",
			link: "http://sermo.gauthamkrishnax.me/",
		},
		{
			name: "Lofidom",
			link: "https://lofidom.gauthamkrishnax.me/",
		},
		{
			name: "Kanakoot",
			link: "https://kanakoot.netlify.app/",
		},
		{
			name: "Clocktab",
			link: "https://clocktabs.netlify.app/",
		},
	];
</script>

<div data-scroll-section class="navigation-wrapper works">
	<h3 class="works-heading">Selected Works</h3>
	<ul class="navigation-list">
		{#each projectList as project}
			<li class="navigation-item">
				<a class="navigation-link navigation-link-1" href={project.link}>
					<span data-text={project.name}>
						{project.name}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	.works {
		position: relative;
		z-index: 3;
		min-height: 100vh;
		margin: 0 1em;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		padding-top: 2em;
		/* border-bottom: 1px #555 solid; */
		margin-bottom: 1em;
	}
	h3 {
		font-weight: 400;
		text-align: right;
		font-size: 2rem;
		/* margin-right: 1em; */
		opacity: 0.3;
	}
	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		width: 100%;
	}

	.navigation-wrapper ul {
		list-style: none;
		/* position: absolute; */
	}

	.navigation-item {
		user-select: none;
		position: relative;
		width: 100%;
		display: flex;
		justify-content: flex-end;
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
	}

	a {
		text-decoration: none;
		font-size: 6rem;
		color: rgba(255, 255, 255, 0.3);
	}

	.navigation-item span:hover:before {
		width: 100%;
	}

	span {
		position: relative;
		display: block;
		z-index: 3;
	}

	.navigation-item span:before {
		width: 0;
		color: #ffffff;
		overflow: hidden;
		position: absolute;
		content: attr(data-text);
		transition: all 1s cubic-bezier(0.84, 0, 0.08, 0.99);
	}

	@media only screen and (max-width: 1400px) {
		h3 {
			font-size: 2rem;
		}
		a {
			font-size: 4rem;
		}
	}

	@media only screen and (max-width: 720px) {
		h3 {
			font-size: 1.5rem;
		}
		a {
			font-size: 3rem;
			color: rgba(255, 255, 255, 0.8);
		}
	}

	@media only screen and (max-width: 400px) {
		h3 {
			font-size: 1rem;
		}
	}
	@media only screen and (max-width: 300px) {
		h3 {
			font-size: 1rem;
		}
		a {
			font-size: 2rem;
		}
	}
</style>
