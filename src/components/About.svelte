<div data-scroll-section class="about-container container">
	<div class="hero about-section">
		<svg
			class="rotating-star"
			width="300"
			height="300"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M11.758 10.6358L19.6875 9.84375L11.758 9.05067L16.8046 2.88291L10.6365 7.9298L9.84375 0L9.05067 7.9298L2.88291 2.88291L7.92947 9.05067L0 9.84375L7.92947 10.6358L2.88291 16.8043L9.05067 11.758L9.84375 19.6875L10.6365 11.758L16.8046 16.8043L11.758 10.6358Z"
				fill="#333"
			/>
		</svg>
		<h3 class="about-heading">
			Crafting with dedication. Developing relevant skills to stand out and give
			back.
		</h3>
		<span>
			<ul>
				<li class="about-link">
					<a href="https://www.linkedin.com/in/gauthamkrishnas/">LinkedIn</a>
				</li>
				<li class="about-link">
					<a href="https://github.com/gauthamkrishnax">Github</a>
				</li>
				<li class="about-link">
					<a href="https://www.behance.net/gauthamkrishnax">Behance</a>
				</li>
			</ul>
		</span>
	</div>
</div>

<style>
	svg {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 500px;
		z-index: 1;
		opacity: 0.3;
		animation: rotate 10s infinite linear;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	.container {
		margin-left: 1em;
		min-height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.hero {
		position: relative;
	}
	h3 {
		font-size: 6rem;
		font-weight: 400;
		max-width: 1200px;
		line-height: 100px;
		position: relative;
		z-index: 3;
	}
	ul {
		position: relative;
		z-index: 3;
		display: flex;
		justify-self: end;
		padding-left: 0;
		list-style: none;
		margin-top: 3em;
	}
	li {
		margin-right: 2em;
		font-size: 2rem;
	}

	li:last-child {
		margin-right: 0;
	}

	li a {
		text-decoration: none;
		color: #ccc;
	}

	li a:hover {
		color: #fff;
		text-decoration: overline;
		transition: all 0.5s ease-in;
	}

	@media only screen and (max-width: 1400px) {
		h3 {
			font-size: 3rem;
			max-width: 600px;
			line-height: 70px;
		}
		li {
			font-size: 1.5rem;
		}
	}

	@media only screen and (max-width: 720px) {
		h3 {
			font-size: 2rem;
			max-width: 400px;
		}
	}
	@media only screen and (max-width: 400px) {
		h3 {
			font-size: 1.5rem;
			max-width: 300px;
			line-height: 40px;
		}
		li {
			font-size: 1rem;
		}
	}
</style>
