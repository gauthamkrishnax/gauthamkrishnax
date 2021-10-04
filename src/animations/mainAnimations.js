import { gsap } from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function index(container, offsetWidth) {
	const q = gsap.utils.selector(container);
	let sections = gsap.utils.toArray(q('.main'));
	ScrollTrigger.matchMedia({
		'(min-height: 700px) and (min-width: 1280px)': function () {
			//Scroll Trigger responsive
			gsap.to(sections, {
				xPercent: -100 * (sections.length - 1),
				ease: 'none',
				scrollTrigger: {
					trigger: container,
					pin: true,
					scrub: 0.5,
					snap: {
						snapTo: 1 / (sections.length - 1),
						duration: { min: 0.1, max: 0.3 },
						delay: 0,
						// inertia: false,
						ease: 'none'
					},
					end: () => '+=' + offsetWidth
				}
			});
		}
	});
}
