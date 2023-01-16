import "./app.css";
import App from "./App.svelte";
import LocomotiveScroll from "locomotive-scroll";
import webglEngine from "./scripts/webgl";
import { magicMouse } from "magicmouse.js";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

let webgl = new webglEngine({
	dom: document.getElementById("webgl"),
});

// @ts-ignore
const app = new App({
	target: document.getElementById("app"),
});

export default app;

const options = {
	cursorOuter: "circle-basic",
	hoverEffect: "pointer-overlay",
	hoverItemMove: false,
	defaultCursor: false,
	outerWidth: 30,
	outerHeight: 30,
};
magicMouse(options);

// --- SETUP START ---
// Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll
const locoScroll = new LocomotiveScroll({
	el: document.querySelector(".smooth-scroll"),
	smooth: true,
	reloadOnContextChange: true,
});
// each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
locoScroll.on("scroll", ScrollTrigger.update);

// tell ScrollTrigger to use these proxy methods for the ".smooth-scroll" element since Locomotive Scroll is hijacking things
ScrollTrigger.scrollerProxy(".smooth-scroll", {
	scrollTop(value) {
		return arguments.length
			? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
			: // @ts-ignore
			  locoScroll.scroll.instance.scroll.y;
	}, // we don't have to define a scrollLeft because we're only scrolling vertically.
	getBoundingClientRect() {
		return {
			top: 0,
			left: 0,
			width: window.innerWidth,
			height: window.innerHeight,
		};
	},
	// LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
	// @ts-ignore
	pinType: document.querySelector(".smooth-scroll").style.transform
		? "transform"
		: "fixed",
});

// each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll.
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
ScrollTrigger.defaults({ scroller: ".smooth-scroll" });
// --- SETUP END ---

// function is_touch_enabled() {
// 	return (
// 		"ontouchstart" in window ||
// 		navigator.maxTouchPoints > 0 ||
// 		// @ts-ignore
// 		navigator.msMaxTouchPoints > 0
// 	);
// }

// if (is_touch_enabled()) {
// 	document.querySelector("#wrapper").classList.add("wrapper-touch");
// }

var uagent = navigator.userAgent.toLowerCase();
if (
	uagent.search("iphone") > -1 ||
	uagent.search("ipad") > -1 ||
	uagent.search("android") > -1 ||
	uagent.search("blackberry") > -1 ||
	uagent.search("webos") > -1
) {
	document.querySelector("#wrapper").classList.add("wrapper-touch");
}

let tlinit = gsap.timeline({
	ease: "power1.out",
	delay: 1,
});

tlinit
	.from(webgl.blob.position, {
		y: -4,
		ease: "elastic.out(0.5, 0.5)",
		duration: 2,
	})
	.from(".anim-home-circle", {
		width: 0,
		height: 0,
		opacity: 0,
		duration: 1,
		stagger: 0.1,
	})
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

tl.to(
	webgl.blob.rotation,
	{
		y: 2,
		z: 1,
	},
	"-100%"
)
	.to(
		webgl.camera.position,
		{
			z: 4,
		},
		"-=100%"
	)
	.to(
		webgl.camera.rotation,
		{
			y: -1.2,
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
