<script>
</script>

<span class="line">
	<svg fill="none" xmlns="http://www.w3.org/2000/svg">
		<line x1="0.5" y1="0" x2="0.500031" y2="100%" stroke="#555" />
	</svg>
</span>
<div class="container">
	<div class="header">
		<span>GAUTHAM KRISHNA</span>
	</div>
	<div class="center">
		<div class="hero">
			<span class="hero-1">I make</span>
			<h1>Artisan Digital Experiences</h1>
			<div class="hero-3">
				<span>Developer</span>
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M11.758 10.6358L19.6875 9.84375L11.758 9.05067L16.8046 2.88291L10.6365 7.9298L9.84375 0L9.05067 7.9298L2.88291 2.88291L7.92947 9.05067L0 9.84375L7.92947 10.6358L2.88291 16.8043L9.05067 11.758L9.84375 19.6875L10.6365 11.758L16.8046 16.8043L11.758 10.6358Z"
						fill="#CCCCCC"
					/>
				</svg>
				<span>Designer</span>
			</div>
		</div>
	</div>
	<div class="footer">
		<span>2023 <br /> Portfolio </span>
		<span class="arrow">
			<svg
				width="21"
				height="12"
				viewBox="0 0 21 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M20.5824 2.44923L11.5082 11.5798C10.9514 12.1401 10.0486 12.1401 9.49176 11.5798L0.417625 2.44923C-0.139208 1.88894 -0.139208 0.980517 0.417625 0.420222C0.974459 -0.140074 1.87727 -0.140074 2.4341 0.420222L10.5 8.53626L18.5659 0.420222C19.1227 -0.140074 20.0255 -0.140074 20.5824 0.420222C21.1392 0.980517 21.1392 1.88894 20.5824 2.44923Z"
					fill="#CCCCCC"
				/>
			</svg>
		</span>
		<span>
			<ul>
				<li class="button k-hover1">
					<a href="https://www.linkedin.com/in/gauthamkrishnas/">LinkedIn</a>
				</li>
				<li><a href="https://github.com/gauthamkrishnax">Github</a></li>
				<li><a href="https://www.behance.net/gauthamkrishnax">Behance</a></li>
			</ul>
		</span>
	</div>
</div>

<style>
	.line {
		display: block;
		position: absolute;
		top: 0;
		left: 0.5em;
		bottom: 0;
	}
	.line svg {
		height: 100%;
	}
	.container {
		min-height: 100vh;
		padding: 1em;
		/* background-color: rgba(0.1, 0.1, 0.1, 0.3); */
		display: grid;
		grid-template-rows: 0.1fr 1fr 0.11fr;
		grid-auto-columns: 1fr;
		gap: 0px 0px;
	}

	.header {
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}
	.header span {
		font-weight: 400;
		font-size: 1rem;
		line-height: 17px;
		letter-spacing: 0.25em;
	}

	.center {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
	.hero {
		display: flex;
		flex-direction: column;
		font-size: 1.2rem;
		letter-spacing: 0.075em;
		position: relative;
		z-index: 2;
	}
	.hero-1 {
		/* align-self: center; */
		margin-left: 1em;
		color: #ccc;
	}
	.hero-3 {
		align-self: flex-end;
		display: flex;
		justify-content: center;
		margin-top: 0.5em;
		color: #ccc;
	}

	.hero-3 svg {
		margin: 3px 0.5em 0;
	}

	h1 {
		color: white;
		text-align: center;
		font-size: 6rem;
		font-weight: 400;
		font-feature-settings: "liga";
		line-height: 100.5%;
		letter-spacing: 0.02em;
	}

	.footer {
		display: grid;
		grid-auto-columns: 1fr;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 0px 0px;
		font-size: 14px;
		color: #ccc;
	}

	.footer span {
		display: flex;
		align-items: flex-end;
	}

	.footer span:nth-child(2) {
		justify-self: center;
		align-self: center;
	}

	.footer span:nth-child(3) {
		justify-self: flex-end;
	}

	.footer svg {
		width: 15px;
	}

	.footer ul {
		display: flex;
		justify-self: end;
		padding-left: 0;
		list-style: none;
	}

	.footer li {
		margin-right: 2em;
	}

	.footer li:last-child {
		margin-right: 0;
	}

	.footer li a {
		text-decoration: none;
		color: #ccc;
	}

	.footer li a:hover {
		color: #fff;
		text-decoration: overline;
		transition: all 0.5s ease-in;
	}

	@media only screen and (max-width: 1400px) {
		h1 {
			font-size: 3.5rem;
		}
	}

	@media only screen and (max-width: 720px) {
		h1 {
			font-size: 3rem;
		}
		.hero {
			margin-bottom: 1em;
			font-size: 1rem;
		}

		.hero-1 {
			align-self: center;
			margin-left: 0;
		}
		.hero-3 {
			align-self: center;
		}

		.footer {
			display: grid;
			grid-auto-columns: 1fr;
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;
			gap: 0px 0px;
		}

		.footer span {
			display: none;
		}
		.footer span:nth-child(3) {
			display: flex;
			justify-self: center;
			font-size: 12px;
		}

		.center {
			padding-top: 2em;
		}
	}

	@media only screen and (max-width: 400px) {
		.header span {
			font-size: 12px;
		}
		h1 {
			font-size: 2.5rem;
		}
		.line {
			display: none;
		}
	}
</style>
