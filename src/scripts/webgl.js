import { gsap } from "gsap";
import * as THREE from "three";

// @ts-ignore
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
// @ts-ignore
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
// @ts-ignore
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
// @ts-ignore
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";

import vertexGradient from "../shaders/gradient/vertex.glsl?raw";
import fragmentGradient from "../shaders/gradient/fragment.glsl?raw";

import vertexChaos from "../shaders/chaos/vertex.glsl?raw";
import fragmentChaos from "../shaders/chaos/fragment.glsl?raw";

import vertexNoise from "../shaders/noise/vertex.glsl?raw";
import fragmentNoise from "../shaders/noise/fragment.glsl?raw";

export default class webglEngine {
	constructor(options) {
		this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color("rgb(0,0,0)");

		this.camera = new THREE.PerspectiveCamera(
			70,
			window.innerWidth / window.innerHeight,
			0.001,
			1000
		);
		this.camera.position.set(0, 0, 5);
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.toneMapping = THREE.CineonToneMapping;
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.outputEncoding = THREE.sRGBEncoding;

		this.container = options.dom;
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;
		this.container.appendChild(this.renderer.domElement);

		this.composer = new EffectComposer(this.renderer);

		this.renderPass = new RenderPass(this.scene, this.camera);
		this.composer.addPass(this.renderPass);

		this.noiseEffect = {
			uniforms: {
				tDiffuse: { value: null },
				amount: { value: 0 },
			},
			vertexShader: vertexNoise,
			fragmentShader: fragmentNoise,
		};

		this.noisePass = new ShaderPass(this.noiseEffect);
		this.noisePass.renderToScreen = true;
		this.composer.addPass(this.noisePass);

		this.SMAAPass = new SMAAPass(
			window.innerWidth * this.renderer.getPixelRatio(),
			window.innerHeight * this.renderer.getPixelRatio()
		);
		this.composer.addPass(this.SMAAPass);

		this.addObjects();
		this.render();
		this.setupEventListeners();

		this.delta = 0;
	}

	setupEventListeners() {
		window.addEventListener("resize", () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.composer.setSize(window.innerWidth, window.innerHeight);
		});

		const pointer = { x: 0, y: 0 };

		document.addEventListener("pointermove", (event) => {
			pointer.x = event.clientX / window.innerWidth - 0.5;
			pointer.y = event.clientY / window.innerHeight - 0.5;

			let tl = gsap.timeline();

			tl.to(this.blob.position, {
				x: -pointer.x * 0.7,
				duration: 1,
			}).to(this.plane.rotation, {
				x: -pointer.x * 0.5,
				delay: -1,
			});
		});
	}

	render() {
		requestAnimationFrame(this.render.bind(this));
		this.delta = this.clock.getElapsedTime();
		this.composer.render(this.delta);
		this.noisePass.uniforms["amount"].value = this.delta;
		this.material.uniforms.utime.value = this.delta;
		if (this.blob) {
			this.blob.material.uniforms.uTime.value = this.delta;
		}
	}

	addObjects() {
		let that = this;
		this.material = new THREE.ShaderMaterial({
			extensions: {
				// @ts-ignore
				derivatives: "#extension GL_OES_standard_derivatives : enable",
			},
			side: THREE.DoubleSide,
			uniforms: {
				utime: { value: 0 },
				uColor: {
					value: [
						new THREE.Color(
							0.6549019607843137,
							0.7725490196078432,
							0.7411764705882353
						),
						new THREE.Color(
							0.9215686274509803,
							0.4823529411764706,
							0.34901960784313724
						),
						new THREE.Color(
							0.3215686274509804,
							0.27450980392156865,
							0.33725490196078434
						),
						new THREE.Color(
							0.3215686274509804,
							0.27450980392156865,
							0.33725490196078434
						),
						new THREE.Color(
							0.3215686274509804,
							0.27450980392156865,
							0.33725490196078434
						),
					],
				},
				resolution: { value: new THREE.Vector4() },
			},
			// wireframe: true,
			vertexShader: vertexGradient,
			fragmentShader: fragmentGradient,
		});

		// this.geometry = new THREE.PlaneGeometry(30, 10, 100, 100);
		this.geometry = new THREE.SphereGeometry(8, 100, 100);
		this.plane = new THREE.Mesh(this.geometry, this.material);
		this.plane.rotation.y += 1.5;
		this.scene.add(this.plane);

		this.blobGeometry = new THREE.IcosahedronGeometry(1, 65);
		this.blobMaterial = new THREE.ShaderMaterial({
			vertexShader: vertexChaos,
			fragmentShader: fragmentChaos,
			uniforms: {
				uTime: { value: 0 },
				uSpeed: { value: 0.15 },
				uNoiseDensity: { value: 2.0 },
				uNoiseStrength: { value: 0.3 },
				uFreq: { value: 3 },
				uAmp: { value: 6 },
				uHue: { value: 0.4 },
				uOffset: { value: Math.PI * 2 },
				red: { value: 0 },
				green: { value: 0 },
				blue: { value: 0 },
				uAlpha: { value: 1.0 },
			},
			defines: {
				PI: Math.PI,
			},
			transparent: true,
		});

		this.blob = new THREE.Mesh(this.blobGeometry, this.blobMaterial);
		this.blob.position.set(0, 0, 1.8);
		this.scene.add(this.blob);
	}
}
