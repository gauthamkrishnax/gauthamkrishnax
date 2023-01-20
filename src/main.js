import "./app.css";
import App from "./App.svelte";

import ASScroll from "@ashthornton/asscroll";

import webglEngine from "./scripts/webgl";

import { magicMouse } from "magicmouse.js";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

//GSAP-SCROLL-TRIGGER AND ASSCROLL SCROLL PROXY

// https://github.com/ashthornton/asscroll
const asscroll = new ASScroll({
	disableRaf: true,
	touchScrollType: "scrollTop",
	disableResize: true,
});

gsap.ticker.add(asscroll.update);

ScrollTrigger.defaults({
	scroller: asscroll.containerElement,
});

ScrollTrigger.scrollerProxy(asscroll.containerElement, {
	scrollTop(value) {
		return arguments.length
			? (asscroll.currentPos = value)
			: asscroll.currentPos;
	},
	getBoundingClientRect() {
		return {
			top: 0,
			left: 0,
			width: window.innerWidth,
			height: window.innerHeight,
		};
	},
});

asscroll.on("update", ScrollTrigger.update);
ScrollTrigger.addEventListener("refresh", asscroll.resize);

gsap.ticker.add(asscroll.update);

window.addEventListener("load", () => {
	asscroll.enable();
});

//END

let webgl = new webglEngine({
	asscroll: asscroll,
	dom: document.getElementById("webgl"),
});

// @ts-ignore
const app = new App({
	target: document.getElementById("app"),
});

export default app;

magicMouse({
	cursorOuter: "circle-basic",
	hoverEffect: "pointer-overlay",
	hoverItemMove: false,
	defaultCursor: false,
	outerWidth: 30,
	outerHeight: 30,
});

let tlinit = gsap.timeline({
	ease: "power1.out",
});

tlinit
	.from(webgl.blob.position, {
		y: -4,
		ease: "elastic.out(0.5, 0.5)",
		duration: 2,
		delay: 0.5,
	})
	.from(
		".anim-home-circle",
		{
			width: 0,
			height: 0,
			opacity: 0,
			duration: 0.5,
			stagger: 0.1,
		},
		"-=100%"
	)
	.from(".anime-home", {
		opacity: 0,
		stagger: 0.5,
		duration: 1,
	});

let tl = gsap.timeline({
	scrollTrigger: {
		trigger: ".works",
		scrub: true,
		start: "top bottom",
		end: "top top",
		// markers: true,
	},
	ease: "none",
});

// mm.add("(max-width: 999px)", () => {
// 	tl.to(
// 		webgl.camera.position,
// 		{
// 			z: 5,
// 		},
// 		"-=100%"
// 	).to(
// 		webgl.camera.rotation,
// 		{
// 			y: 0,
// 		},
// 		"-=100%"
// 	);
// });

let mm = gsap.matchMedia(),
	breakPoint = 1000;

mm.add(
	{
		isDesktop: `(min-width: ${breakPoint}px)`,
		isMobile: `(max-width: ${breakPoint - 1}px)`,
		reduceMotion: "(prefers-reduced-motion: reduce)",
	},
	(context) => {
		// context.conditions has a boolean property for each condition defined above indicating if it's matched or not.
		let { isDesktop, isMobile, reduceMotion } = context.conditions;

		tl.to(
			webgl.blob.rotation,
			{
				y: isDesktop ? 2 : 3,
				z: isDesktop ? 1 : 3,
			},
			"-100%"
		)
			.to(
				webgl.camera.position,
				{
					z: isDesktop ? 4 : 5,
				},
				"-=100%"
			)
			.to(
				webgl.camera.rotation,
				{
					y: isDesktop ? -1.2 : 0,
				},
				"-=100%"
			)
			.to(
				webgl.plane.position,
				{
					x: -2,
				},
				"-=100%"
			)
			.to(
				".circle-1",
				{
					x: -100,
				},
				"-100%"
			)
			.to(
				".circle-2",
				{
					x: 200,
				},
				"-100%"
			);

		return () => {
			// optionally return a cleanup function that will be called when none of the conditions match anymore (after having matched)
			// it'll automatically call context.revert() - do NOT do that here . Only put custom cleanup code here.
		};
	}
);

let tl2 = gsap.timeline({
	scrollTrigger: {
		trigger: ".navigation-list",
		scrub: true,
		start: "top bottom",
		end: "top top",
		// markers: true,
	},
	ease: "none",
});

tl2
	.from(".works-heading", {
		opacity: 0,
	})
	.from(
		".navigation-item",
		{
			opacity: 0,
			y: -50,
			stagger: 0.2,
		},
		"<"
	);

let tl3 = gsap.timeline({
	scrollTrigger: {
		trigger: ".about-section",
		scrub: true,
		start: "-=300 center",
		end: "max",
	},
	ease: "none",
});

tl3
	.from(".about-heading", {
		opacity: 0,
		y: 100,
	})
	.from(
		".about-link",
		{
			opacity: 0,
			y: -50,
			stagger: 0.1,
		},
		"<"
	)
	.to(".rotating-star", {
		animationDuration: "5s",
	});
