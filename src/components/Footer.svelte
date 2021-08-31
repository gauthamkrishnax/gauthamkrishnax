<nav>
	<ul>
		<a rel="external" href="https://www.behance.net/gauthamkrishnax"><li>Behance</li></a>
		<a rel="external" href="https://github.com/gauthamkrishnax"><li>Github</li></a>
		<a rel="external" href="https://www.linkedin.com/in/gauthamkrishnas/"><li>LinkedIn</li></a>
	</ul>
</nav>

<style lang="scss">
	@import '../style/helpers/variables';
	nav {
		position: fixed;
		z-index: 10;
		bottom: 30px;
		left: 120px;
		@include breakpoint(tablet) {
			bottom: 20px;
			left: 64px;
		}
		@include breakpoint(phone) {
			bottom: 20px;
			left: 40px;
		}
		ul {
			display: flex;
			z-index: 30;
			a {
				color: $gray1;
				@include breakpoint(tablet) {
					font-size: $N;
				}
				@include breakpoint(phone) {
					font-size: $XS;
				}
			}
			a:nth-child(2) {
				margin: 0 40px;
				@include breakpoint(tablet) {
					margin: 0 20px;
				}
			}
		}
	}
</style>
