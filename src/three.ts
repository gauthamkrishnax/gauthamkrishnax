import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Timer,
  Uniform,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
// ─── Config (all tunable) ─────────────────────────────────────────────────────
const CONFIG = {
  containerId: 'three-canvas',

  grid: {
    segments: 20,
    opacity: 1,
    /** B&W scene — no accent on lines/points */
    lineColor: 0xbababa,
    pointColor: 0xdadada,
    pointSize: 10,
    position: { x: 0, y: -0.55, z: -0.88 },
    rotation: { x: Math.PI * 25/ 180, y: -Math.PI * 60/ 180, z: 0 }, // radians
    /** Slow idle motion — updates group matrix only, same 3 draw calls */
    idleMotion: {
      amp: { x: 0.024, y: 0.028, z: 0.016 },
      speed: { x: 0.2, y: 0.17, z: 0.23 },
    },
    plane: {
      enabled: true,
      color: 0xfafafa,
      opacity: 0.38,
      /** Fragment-only scrolled sine lattice — “living” surface, no extra geometry */
      surfaceNoise: {
        scale: 4.2,
        scrollSpeed: 0.038,
        strength: 0.07,
      },
      /** Grayscale highlight; uPointer follows viewport-normalized body pointer */
      pointerSpot: 0.36,
    },
    /** Grid lines/points stay gray */
    accentMix: 0,
    /** Extra tilt when pointer is over the canvas rect (radians at edge) */
    pointerParallax: { x: 0.11, y: 0.13 },
    /**
     * Exponential follow rates (1/s), frame-rate independent via Timer delta.
     * Higher = snappier; rotation rate lower than UV = smoother tilt.
     */
    pointerFollowRate: 16,
    pointerRotFollowRate: 9,
    fresnelPower: 2.35,
    /**
     * Stacked “sheets”: same plane mesh + grid lines + points repeated, offset per layer.
     * Layer i is translated by (i * step.x, i * step.y, i * step.z) in the grid group’s space.
     */
    stack: {
      count: 5,
      step: { x: -0.22, y: 0.18, z: -0.28 },
    },
  },

  wave: {
    amplitude: 0.1,
    speed: 0.9,
  },

  camera: {
    fov: 50,
    near: 0.01,
    far: 10,
    position: { x: 0.5, y: 0.4, z: 1.4 },
    lookAt: { x: 0, y: 0, z: 0 },
    scroll: {
      thresholdPixels: 400,
      positionWhenScrolled: { x: 0.5, y: 1, z: 0.8 },
      lerpSpeed: 0.08, // 0–1: higher = faster catch-up per frame
    },
  },

  renderer: {
    maxPixelRatio: 2.2,
    antialias: true,
    powerPreference: 'high-performance' as const,
  },
} as const;

/** Resolved once at init — matches `tokens.css` accent without parsing `var()` chains */
function readAccentRgb(): Vector3 {
  if (typeof document === 'undefined') {
    return new Vector3(0, 0.482, 1);
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-blue-500')
    .trim();
  const hex = raw.match(/^#([\da-f]{6})$/i);
  if (hex) {
    const h = hex[1];
    return new Vector3(
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255
    );
  }
  return new Vector3(0, 0.482, 1);
}

// ─── Grid geometry ────────────────────────────────────────────────────────────
function createGridLineGeometry(segments: number): BufferGeometry {
  const n = segments + 1;
  const positions: number[] = [];

  for (let j = 0; j < n; j++) {
    for (let i = 0; i < segments; i++) {
      const x0 = (i / segments) * 2 - 1;
      const x1 = ((i + 1) / segments) * 2 - 1;
      const z = (j / segments) * 2 - 1;
      positions.push(x0, 0, z, x1, 0, z);
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < segments; j++) {
      const x = (i / segments) * 2 - 1;
      const z0 = (j / segments) * 2 - 1;
      const z1 = ((j + 1) / segments) * 2 - 1;
      positions.push(x, 0, z0, x, 0, z1);
    }
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geo;
}

function createGridPointsGeometry(segments: number): BufferGeometry {
  const n = segments + 1;
  const positions: number[] = [];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = (i / segments) * 2 - 1;
      const z = (j / segments) * 2 - 1;
      positions.push(x, 0, z);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geo;
}

function createGridPlaneGeometry(segments: number): BufferGeometry {
  const geo = new PlaneGeometry(2, 2, segments, segments);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createPlaneMaterial(
  overrides?: Partial<{
    color: number;
    opacity: number;
    surfaceNoise: {
      scale: number;
      scrollSpeed: number;
      strength: number;
    };
    pointerSpot: number;
  }>
): ShaderMaterial {
  const { grid, wave } = CONFIG;
  const basePlane = grid.plane ?? { enabled: true, color: 0xe8e8e8, opacity: 0.22 };
  const planeConfig = { ...basePlane, ...overrides };
  const c = new Color(planeConfig.color);
  const noise = planeConfig.surfaceNoise ?? {
    scale: 4.2,
    scrollSpeed: 0.045,
    strength: 0.11,
  };
  const spot = planeConfig.pointerSpot ?? 0.32;

  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: wave.amplitude },
      uSpeed: { value: wave.speed },
      uColor: { value: new Vector3(c.r, c.g, c.b) },
      uOpacity: { value: planeConfig.opacity },
      uFresnelPower: { value: grid.fresnelPower },
      uNoiseScale: { value: noise.scale },
      uNoiseScroll: { value: noise.scrollSpeed },
      uNoiseStrength: { value: noise.strength },
      uPointer: { value: new Vector2(0.5, 0.5) },
      uPointerSpot: { value: spot },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uAmplitude;
      uniform float uSpeed;
      varying float vDisp;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      void main() {
        float t = uTime * uSpeed;
        float y = uAmplitude * (
          sin(position.x * 3.0 + t) * cos(position.z * 2.5 + t * 0.8) +
          sin(position.x * 5.0 + t * 1.3) * 0.4 * cos(position.z * 4.0 + t * 0.6) +
          sin((position.x + position.z) * 2.0 + t * 0.7) * 0.5
        );
        vec3 pos = position + vec3(0.0, y, 0.0);
        vDisp = y / max(uAmplitude, 0.0001);
        vUv = uv;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uFresnelPower;
      uniform float uTime;
      uniform float uNoiseScale;
      uniform float uNoiseScroll;
      uniform float uNoiseStrength;
      uniform vec2 uPointer;
      uniform float uPointerSpot;
      varying float vDisp;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;

      float hash21(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float ndv = max(dot(normalize(vWorldNormal), viewDir), 0.0);
        float fresnel = pow(1.0 - ndv, uFresnelPower);
        float crest = smoothstep(0.12, 1.0, vDisp * 0.5 + 0.5);
        vec3 tint = mix(uColor * 0.94, uColor * 1.06, fresnel * 0.45 + crest * 0.22);
        float alpha = uOpacity * (0.86 + fresnel * 0.16);

        vec2 flow = vUv * uNoiseScale;
        float s = uTime * uNoiseScroll;
        flow += vec2(1.0, 0.58) * s;
        flow += vec2(-0.42, 0.91) * s * 0.38;

        float lattice =
          sin(flow.x * 6.2831853) * sin(flow.y * 6.2831853) * 0.38 +
          sin(dot(flow, vec2(4.15, 2.88)) * 6.2831853 + uTime * 0.31) * 0.32 +
          sin(dot(flow, vec2(-2.05, 5.2)) * 4.7123889 - uTime * 0.26) * 0.30;
        lattice = lattice * 0.5 + 0.5;

        vec2 ncell = floor(flow * 14.0);
        float grain = hash21(ncell + fract(flow) * 0.001);
        float detail = mix(lattice, lattice * 0.92 + grain * 0.16, 0.35);

        float lift = mix(1.0 - uNoiseStrength * 0.55, 1.0 + uNoiseStrength * 0.75, detail);
        vec3 col = tint * lift;

        float spot = exp(-distance(vUv, uPointer) * 3.8);
        col = mix(col, min(vec3(1.0), col * 1.22), spot * uPointerSpot);

        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: true,
    side: DoubleSide,
  });
}

function createWaveMaterial(
  color: number,
  isLine: boolean,
  accent: Vector3
): ShaderMaterial {
  const { grid, wave } = CONFIG;
  const c = new Color(color);
  const pointSize = isLine ? 0 : grid.pointSize;
  const pointSizeFloat = pointSize % 1 === 0 ? `${pointSize}.0` : String(pointSize);

  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: wave.amplitude },
      uSpeed: { value: wave.speed },
      uColor: { value: new Vector3(c.r, c.g, c.b) },
      uOpacity: { value: grid.opacity },
      uAccent: { value: accent.clone() },
      uAccentMix: { value: grid.accentMix },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uAmplitude;
      uniform float uSpeed;
      varying float vDisp;
      void main() {
        float t = uTime * uSpeed;
        float y = uAmplitude * (
          sin(position.x * 3.0 + t) * cos(position.z * 2.5 + t * 0.8) +
          sin(position.x * 5.0 + t * 1.3) * 0.4 * cos(position.z * 4.0 + t * 0.6) +
          sin((position.x + position.z) * 2.0 + t * 0.7) * 0.5
        );
        vec3 pos = position + vec3(0.0, y, 0.0);
        vDisp = y / max(uAmplitude, 0.0001);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        ${isLine ? '' : `gl_PointSize = ${pointSizeFloat};`}
      }
    `,
    fragmentShader: isLine
      ? `
      uniform vec3 uColor;
      uniform vec3 uAccent;
      uniform float uOpacity;
      uniform float uAccentMix;
      varying float vDisp;
      void main() {
        float crest = smoothstep(0.18, 0.95, vDisp * 0.5 + 0.5);
        vec3 col = mix(uColor, mix(uColor, uAccent, 0.88), crest * uAccentMix * 0.48);
        gl_FragColor = vec4(col, uOpacity);
      }
    `
      : `
      uniform vec3 uColor;
      uniform vec3 uAccent;
      uniform float uOpacity;
      uniform float uAccentMix;
      uniform float uTime;
      varying float vDisp;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r2 = dot(c, c);
        float alpha = uOpacity * (1.0 - smoothstep(0.1, 0.48, r2));
        if (alpha < 0.015) discard;
        float crest = smoothstep(0.08, 1.0, vDisp * 0.5 + 0.5);
        vec3 col = mix(uColor, mix(uColor, uAccent, 0.92), crest * uAccentMix * 0.72);
        float pulse = 0.94 + 0.06 * sin(uTime * 1.15 + vDisp * 4.5);
        gl_FragColor = vec4(col, alpha * pulse);
      }
    `,
    transparent: true,
    depthWrite: !isLine,
    side: DoubleSide,
  });
}

function getRendererProfile(): {
  lite: boolean;
  gridSegments: number;
  maxPixelRatio: number;
  useAntialias: boolean;
  powerPreference: 'default' | 'high-performance';
} {
  const { renderer: renConfig, grid } = CONFIG;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
  };
  const lite =
    Boolean(nav.connection?.saveData) ||
    window.matchMedia('(pointer: coarse)').matches ||
    window.innerWidth <= 768;
  return {
    lite,
    gridSegments: lite ? 12 : grid.segments,
    maxPixelRatio: lite
      ? 1
      : Math.min(window.devicePixelRatio, renConfig.maxPixelRatio),
    useAntialias: lite ? false : (renConfig.antialias ?? false),
    /* “high-performance” can pick a failing GPU context on some phones/tablets */
    powerPreference: lite ? 'default' : (renConfig.powerPreference ?? 'high-performance'),
  };
}

function init(): void {
  const container = document.getElementById(CONFIG.containerId);
  if (!container) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  const containerEl: HTMLElement = container;

  const { camera: camConfig, grid } = CONFIG;

  const profile = getRendererProfile();
  const { lite, gridSegments, maxPixelRatio, useAntialias, powerPreference } = profile;

  const width = containerEl.clientWidth;
  const height = containerEl.clientHeight;

  /** Avoid WebGL with 0×0 backing store (first paint / mobile toolbars). */
  if (width < 2 || height < 2) {
    const ro = new ResizeObserver(() => {
      const w = containerEl.clientWidth;
      const h = containerEl.clientHeight;
      if (w >= 2 && h >= 2) {
        ro.disconnect();
        init();
      }
    });
    ro.observe(containerEl);
    return;
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(
    camConfig.fov,
    width / height,
    camConfig.near,
    camConfig.far
  );
  const lookAt = camConfig.lookAt;
  camera.position.set(camConfig.position.x, camConfig.position.y, camConfig.position.z);
  camera.lookAt(lookAt.x, lookAt.y, lookAt.z);

  const scrollConfig = camConfig.scroll;
  const targetCameraPosition = new Vector3(
    camConfig.position.x,
    camConfig.position.y,
    camConfig.position.z
  );

  function updateCameraTargetFromScroll(): void {
    if (!scrollConfig) return;
    const y = typeof window !== 'undefined' ? window.scrollY : 0;
    const t = Math.min(1, Math.max(0, y / scrollConfig.thresholdPixels));
    const a = camConfig.position;
    const b = scrollConfig.positionWhenScrolled;
    targetCameraPosition.set(
      a.x + t * (b.x - a.x),
      a.y + t * (b.y - a.y),
      a.z + t * (b.z - a.z)
    );
  }
  updateCameraTargetFromScroll();
  window.addEventListener('scroll', updateCameraTargetFromScroll, { passive: true });

  const lerpSpeed = scrollConfig?.lerpSpeed ?? 0.08;

  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: useAntialias,
    powerPreference,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(maxPixelRatio);
  renderer.setClearColor(0x000000, 0);
  containerEl.appendChild(renderer.domElement);

  const accent = readAccentRgb();

  const isLight =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: light)').matches;
  const lineColor = isLight ? grid.lineColor : 0x989898;
  const pointColor = isLight ? grid.pointColor : 0x2a6478;
  const accentMix = isLight ? grid.accentMix : 0.22;
  const planeOverrides = isLight
    ? undefined
    : {
        color: 0x101018,
        opacity: 0.44,
        pointerSpot: 0.42,
        surfaceNoise: {
          scale: 4.2,
          scrollSpeed: 0.038,
          strength: 0.06,
        },
      };

  const lineGeo = createGridLineGeometry(gridSegments);
  const lineMat = createWaveMaterial(lineColor, true, accent);
  (lineMat.uniforms.uAccentMix as Uniform).value = accentMix;

  const pointsGeo = createGridPointsGeometry(gridSegments);
  const pointsMat = createWaveMaterial(pointColor, false, accent);
  (pointsMat.uniforms.uAccentMix as Uniform).value = accentMix;

  const gridGroup = new Group();
  gridGroup.position.set(grid.position.x, grid.position.y, grid.position.z);
  const baseRot = grid.rotation;
  gridGroup.rotation.set(baseRot.x, baseRot.y, baseRot.z);
  const idle = grid.idleMotion ?? {
    amp: { x: 0.024, y: 0.028, z: 0.016 },
    speed: { x: 0.2, y: 0.17, z: 0.23 },
  };

  const stackCfg = grid.stack ?? { count: 1, step: { x: 0, y: 0, z: 0 } };
  const stackCount = lite ? Math.min(2, stackCfg.count) : stackCfg.count;
  const layerCount = Math.max(1, Math.floor(stackCount));
  const sx = stackCfg.step?.x ?? 0;
  const sy = stackCfg.step?.y ?? 0;
  const sz = stackCfg.step?.z ?? 0;

  let planeMat: ShaderMaterial | null = null;
  let planeGeo: BufferGeometry | null = null;
  const pointerTarget = new Vector2(0.5, 0.5);
  const pointerSmooth = new Vector2(0.5, 0.5);
  const ptrTiltSmooth = { x: 0, y: 0 };
  const ptrAmp = grid.pointerParallax ?? { x: 0.11, y: 0.13 };
  const ptrFollowRate = grid.pointerFollowRate ?? 16;
  const ptrRotFollowRate = grid.pointerRotFollowRate ?? 9;

  function onPointerMove(ev: PointerEvent): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w < 1 || h < 1) return;
    pointerTarget.set(
      Math.min(1, Math.max(0, ev.clientX / w)),
      Math.min(1, Math.max(0, ev.clientY / h))
    );
  }
  document.body.addEventListener('pointermove', onPointerMove, { passive: true });

  if (grid.plane?.enabled) {
    planeGeo = createGridPlaneGeometry(gridSegments);
    planeMat = createPlaneMaterial(planeOverrides);
  }

  for (let i = 0; i < layerCount; i++) {
    const ox = i * sx;
    const oy = i * sy;
    const oz = i * sz;
    if (planeGeo && planeMat) {
      const gridPlane = new Mesh(planeGeo, planeMat);
      gridPlane.position.set(ox, oy, oz);
      gridGroup.add(gridPlane);
    }
    const gridLines = new LineSegments(lineGeo, lineMat);
    gridLines.position.set(ox, oy, oz);
    gridGroup.add(gridLines);
    const gridPoints = new Points(pointsGeo, pointsMat);
    gridPoints.position.set(ox, oy, oz);
    gridGroup.add(gridPoints);
  }

  scene.add(gridGroup);

  const timer = new Timer();
  timer.connect(document);
  let rafId: number;

  function expSmooth(dt: number, rate: number): number {
    const d = Math.min(Math.max(dt, 0), 0.05);
    return 1 - Math.exp(-rate * d);
  }

  function animate(timestamp?: number): void {
    rafId = requestAnimationFrame(animate);
    timer.update(timestamp ?? performance.now());
    const dt = timer.getDelta();
    const t = timer.getElapsed();
    (lineMat.uniforms.uTime as Uniform).value = t;
    (pointsMat.uniforms.uTime as Uniform).value = t;
    if (planeMat) (planeMat.uniforms.uTime as Uniform).value = t;

    const uvK = expSmooth(dt, ptrFollowRate);
    pointerSmooth.x += (pointerTarget.x - pointerSmooth.x) * uvK;
    pointerSmooth.y += (pointerTarget.y - pointerSmooth.y) * uvK;
    if (planeMat) {
      (planeMat.uniforms.uPointer as Uniform).value.copy(pointerSmooth);
    }

    const px = (pointerSmooth.x - 0.5) * 2;
    const py = (pointerSmooth.y - 0.5) * 2;
    const tiltTargetX = py * ptrAmp.x;
    const tiltTargetY = px * ptrAmp.y;
    const rotK = expSmooth(dt, ptrRotFollowRate);
    ptrTiltSmooth.x += (tiltTargetX - ptrTiltSmooth.x) * rotK;
    ptrTiltSmooth.y += (tiltTargetY - ptrTiltSmooth.y) * rotK;

    const idleX = Math.sin(t * idle.speed.x) * idle.amp.x;
    const idleY = Math.cos(t * idle.speed.y * 0.92) * idle.amp.y;
    gridGroup.rotation.x = baseRot.x + idleX + ptrTiltSmooth.x;
    gridGroup.rotation.y = baseRot.y + idleY + ptrTiltSmooth.y;
    gridGroup.rotation.z =
      baseRot.z + Math.sin(t * idle.speed.z * 1.05) * idle.amp.z;
    if (scrollConfig) {
      camera.position.lerp(targetCameraPosition, lerpSpeed);
      camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
    }
    renderer.render(scene, camera);
  }

  // First frame after import (already deferred by loader); start rAF loop.
  const runLoop = (): void => {
    timer.update(performance.now());
    (lineMat.uniforms.uTime as Uniform).value = timer.getElapsed();
    (pointsMat.uniforms.uTime as Uniform).value = timer.getElapsed();
    if (planeMat) (planeMat.uniforms.uTime as Uniform).value = timer.getElapsed();
    renderer.render(scene, camera);
    animate(performance.now());
  };
  requestAnimationFrame(runLoop);

  function onResize(): void {
    const w = containerEl.clientWidth;
    const h = containerEl.clientHeight;
    if (w < 2 || h < 2) return;
    const { maxPixelRatio: pr } = getRendererProfile();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(pr);
  }

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(containerEl);

  const vv = window.visualViewport;
  const onViewportResize = (): void => {
    onResize();
  };
  if (vv) {
    vv.addEventListener('resize', onViewportResize, { passive: true });
    vv.addEventListener('scroll', onViewportResize, { passive: true });
  }

  const cleanup = (): void => {
    cancelAnimationFrame(rafId);
    timer.dispose();
    window.removeEventListener('scroll', updateCameraTargetFromScroll);
    document.body.removeEventListener('pointermove', onPointerMove);
    resizeObserver.disconnect();
    if (vv) {
      vv.removeEventListener('resize', onViewportResize);
      vv.removeEventListener('scroll', onViewportResize);
    }
    renderer.dispose();
    lineGeo.dispose();
    pointsGeo.dispose();
    lineMat.dispose();
    pointsMat.dispose();
    if (planeGeo) planeGeo.dispose();
    if (planeMat) planeMat.dispose();
    if (containerEl.contains(renderer.domElement)) {
      containerEl.removeChild(renderer.domElement);
    }
  };

  /**
   * `beforeunload` + full dispose breaks the browser back-forward cache: the home page
   * is restored with no canvas/WebGL. Only tear down when the page is actually discarded
   * (`pagehide` + `persisted === false`). When `persisted === true`, skip cleanup; on
   * `pageshow` + `persisted`, restart rAF (it was frozen while the page was cached).
   */
  function resumeAfterBFCache(): void {
    cancelAnimationFrame(rafId);
    const now = performance.now();
    timer.update(now);
    onResize();
    renderer.render(scene, camera);
    animate(now);
  }

  function onPageHide(ev: PageTransitionEvent): void {
    if (!ev.persisted) {
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      cleanup();
    }
  }

  function onPageShow(ev: PageTransitionEvent): void {
    if (ev.persisted) {
      resumeAfterBFCache();
    }
  }

  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);

  renderer.domElement.addEventListener(
    'webglcontextlost',
    (e) => {
      e.preventDefault();
    },
    false
  );
}

function runInit(): void {
  try {
    init();
  } catch (err) {
    console.error('[three] Scene failed to load:', err);
  }
}

// Prevent "Uncaught (in promise) timeout" from appearing as unhandled when init/import fails
window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event.reason?.message ?? event.reason ?? '');
  if (msg.toLowerCase().includes('timeout')) {
    event.preventDefault();
    console.error('[three] Load timed out:', event.reason);
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInit);
} else {
  runInit();
}
