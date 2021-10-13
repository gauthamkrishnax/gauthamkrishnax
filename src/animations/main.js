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
				x: '-5em',
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

//CIRCLES ANIMATION

export function circleAnimation(e, h, w, container) {
	const q = gsap.utils.selector(container);
	let cx = Math.ceil(w * 0.5);
	let cy = Math.ceil(h * 0.5);
	let dx = e.pageX - cx;
	let dy = e.pageY - cy;

	let tiltx = dy / cy;
	let tilty = -(dx / cx);
	let radius = Math.sqrt(Math.pow(tiltx, 2) + Math.pow(tilty, 2));
	let degree = radius * 20;
	gsap.to(q('#bigCircle'), {
		transform: 'rotate3d(' + tilty + ', ' + tiltx + ', 0, ' + degree + 'deg)',
		ease: 'power2.easeInOut'
	});
	gsap.to(q('#smallCircle'), {
		transform: 'rotate3d(' + tiltx + ', ' + tilty + ', 0, ' + (degree - 5) + 'deg)',
		ease: 'power2.easeInOut'
	});
}
