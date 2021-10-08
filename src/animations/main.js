//HOME SCREEN ANIMATION

export function homeAnimation(gsap, container) {
	const q = gsap.utils.selector(container);
	const tl = gsap.timeline();

	tl.from(q('.hero'), {
		y: 100,
		duration: 1,
		opacity: 0
	})
		.from(q('.animComeTop'), {
			stagger: 0.2,
			y: 50,
			opacity: 0.2,
			duration: 1
		})
		.from(
			q('.animCircles'),
			{
				left: '5em',
				opacity: 0,
				duration: 2,
				ease: 'power2.out'
			},
			'-=1'
		)
		.from(
			q('.animMyWorksBtn'),
			{
				opacity: 0,
				duration: 0.5,
				y: 10
			},
			'-=.5'
		);
}

// SIDE BAR ANIMATION

export function sideBarAnimation(container) {
	// const q = gsap.utils.selector(container);
	// const sidebarEntry = gsap.timeline();
	// gsap.from(container, {
	// 	y: -50,
	// 	opacity: 0
	// });
	// sidebarEntry.from(q('.showSidebar'), {
	// 	x: 400
	// });
}
