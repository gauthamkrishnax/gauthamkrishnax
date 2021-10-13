/* eslint-disable no-undef */
//HOME SCREEN ANIMATION

export function homeAnimation(container) {
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

export function headerAnimation(container) {
	gsap.from(container, {
		y: -50,
		opacity: 0
	});
}

export function SidebarAnimation(container, sideBartl) {
	const q = gsap.utils.selector(container);

	gsap.set(q('#menuContainer'), {
		x: '100vw'
	});

	sideBartl
		.to(q('#menuContainer'), {
			x: 0,
			duration: 0.5,
			ease: 'power3.easeInOut'
		})
		.from(
			q('.sidebarHeading'),
			{
				opacity: 0
			},
			'-=.1'
		)
		.from(
			q('.sidebarLinks'),
			{
				y: 30,
				opacity: 0,
				stagger: 0.1,
				duration: 0.2,
				ease: 'power2.easeInOut'
			},
			'-=.3'
		)
		.from(
			q('.socialmedialinks-anim'),
			{
				x: 20,
				opacity: 0,
				stagger: 0.1,
				duration: 0.2,
				ease: 'power2.easeInOut'
			},
			'-=.3'
		)
		.from(
			q('.flagContainer'),
			{
				x: -50
			},
			'-=1'
		)
		.from(
			q('.flagYear'),
			{
				opacity: 0
			},
			'-=1'
		)
		.reverse();
}
