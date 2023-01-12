import "./app.css";
import App from "./App.svelte";
import LocomotiveScroll from "locomotive-scroll";
import webglEngine from "./scripts/webgl";

// @ts-ignore
const app = new App({
	target: document.getElementById("app"),
});

export default app;

const scroll = new LocomotiveScroll({
	el: document.querySelector("[data-scroll-container]"),
	smooth: true,
});

new webglEngine({
	dom: document.getElementById("webgl"),
});
