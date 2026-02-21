type ThreeModule = typeof import('three');

// ─── Config (all tunable) ─────────────────────────────────────────────────────
const CONFIG = {
  containerId: 'three-canvas',

  grid: {
    segments: 20,
    opacity: 1,
    lineColor: 0xD7D7D7,
    pointColor: 0xD6D6D6,
    pointSize: 5,
    position: { x: -0.18, y: 0.05, z: -0.68 },
    rotation: { x: Math.PI * 25/ 180, y: -Math.PI * 60/ 180, z: 0 }, // radians
    plane: {
      enabled: true,
      color: 0xFEFEFE,
      opacity: 0.2,
    },
    highlight: {
      enabled: true,
      color: 0xDFEBFF,
      radius: 1,
      intensity: 1,
      followLerp: 0.06, // 0–1: lower = more delay/smoother follow after mouse move
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
    maxPixelRatio: 1.2,
    antialias: false,
    powerPreference: 'high-performance' as const,
  },
} as const;

// ─── Grid geometry ────────────────────────────────────────────────────────────
function createGridLineGeometry(THREE: ThreeModule): import('three').BufferGeometry {
  const { segments } = CONFIG.grid;
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

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

function createGridPointsGeometry(THREE: ThreeModule): import('three').BufferGeometry {
  const { segments } = CONFIG.grid;
  const n = segments + 1;
  const positions: number[] = [];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = (i / segments) * 2 - 1;
      const z = (j / segments) * 2 - 1;
      positions.push(x, 0, z);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

function createGridPlaneGeometry(THREE: ThreeModule): import('three').BufferGeometry {
  const { segments } = CONFIG.grid;
  const geo = new THREE.PlaneGeometry(2, 2, segments, segments);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createPlaneMaterial(THREE: ThreeModule): import('three').ShaderMaterial {
  const { grid, wave } = CONFIG;
  const planeConfig = grid.plane ?? { enabled: true, color: 0xE8E8E8, opacity: 0.22 };
  const c = new THREE.Color(planeConfig.color);
  const highlight = grid.highlight;
  const highlightColor = new THREE.Color(highlight?.color ?? 0xff6600);

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: wave.amplitude },
      uSpeed: { value: wave.speed },
      uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
      uOpacity: { value: planeConfig.opacity },
      uMouseGrid: { value: new THREE.Vector2(-10, -10) },
      uHighlightRadius: { value: highlight?.radius ?? 0.5 },
      uHighlightColor: { value: new THREE.Vector3(highlightColor.r, highlightColor.g, highlightColor.b) },
      uHighlightIntensity: { value: highlight?.enabled ? (highlight?.intensity ?? 0.7) : 0 },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uAmplitude;
      uniform float uSpeed;
      uniform vec2 uMouseGrid;
      uniform float uHighlightRadius;
      varying float vHighlight;
      void main() {
        float t = uTime * uSpeed;
        float y = uAmplitude * (
          sin(position.x * 3.0 + t) * cos(position.z * 2.5 + t * 0.8) +
          sin(position.x * 5.0 + t * 1.3) * 0.4 * cos(position.z * 4.0 + t * 0.6) +
          sin((position.x + position.z) * 2.0 + t * 0.7) * 0.5
        );
        vec3 pos = position + vec3(0.0, y, 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        float d = distance(position.xz, uMouseGrid);
        vHighlight = 1.0 - smoothstep(0.0, uHighlightRadius, d);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform vec3 uHighlightColor;
      uniform float uHighlightIntensity;
      varying float vHighlight;
      void main() {
        vec3 col = mix(uColor, uHighlightColor, vHighlight * uHighlightIntensity);
        gl_FragColor = vec4(col, uOpacity);
      }
    `,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
}

function createWaveMaterial(
  THREE: ThreeModule,
  color: number,
  isLine: boolean
): import('three').ShaderMaterial {
  const { grid, wave } = CONFIG;
  const c = new THREE.Color(color);
  const pointSize = isLine ? 0 : grid.pointSize;
  const pointSizeFloat = pointSize % 1 === 0 ? `${pointSize}.0` : String(pointSize);
  const highlight = grid.highlight;
  const highlightColor = new THREE.Color(highlight?.color ?? 0xff6600);

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: wave.amplitude },
      uSpeed: { value: wave.speed },
      uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
      uOpacity: { value: grid.opacity },
      uMouseGrid: { value: new THREE.Vector2(-10, -10) },
      uHighlightRadius: { value: highlight?.radius ?? 0.5 },
      uHighlightColor: { value: new THREE.Vector3(highlightColor.r, highlightColor.g, highlightColor.b) },
      uHighlightIntensity: { value: highlight?.enabled ? (highlight?.intensity ?? 0.7) : 0 },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uAmplitude;
      uniform float uSpeed;
      uniform vec2 uMouseGrid;
      uniform float uHighlightRadius;
      varying float vHighlight;
      void main() {
        float t = uTime * uSpeed;
        float y = uAmplitude * (
          sin(position.x * 3.0 + t) * cos(position.z * 2.5 + t * 0.8) +
          sin(position.x * 5.0 + t * 1.3) * 0.4 * cos(position.z * 4.0 + t * 0.6) +
          sin((position.x + position.z) * 2.0 + t * 0.7) * 0.5
        );
        vec3 pos = position + vec3(0.0, y, 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        float d = distance(position.xz, uMouseGrid);
        vHighlight = 1.0 - smoothstep(0.0, uHighlightRadius, d);
        ${isLine ? '' : `gl_PointSize = ${pointSizeFloat};`}
      }
    `,
    fragmentShader: isLine
      ? `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform vec3 uHighlightColor;
      uniform float uHighlightIntensity;
      varying float vHighlight;
      void main() {
        vec3 col = mix(uColor, uHighlightColor, vHighlight * uHighlightIntensity);
        gl_FragColor = vec4(col, uOpacity);
      }
    `
      : `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform vec3 uHighlightColor;
      uniform float uHighlightIntensity;
      varying float vHighlight;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        if (dot(c, c) > 0.25) discard;
        vec3 col = mix(uColor, uHighlightColor, vHighlight * uHighlightIntensity);
        gl_FragColor = vec4(col, uOpacity);
      }
    `,
    transparent: true,
    depthWrite: !isLine,
    side: THREE.DoubleSide,
  });
}

async function init(): Promise<void> {
  let THREE: ThreeModule;
  try {
    THREE = await import('three');
  } catch (err) {
    console.error('[three] Dynamic import failed:', err);
    throw err;
  }

  const container = document.getElementById(CONFIG.containerId);
  if (!container) return;
  const containerEl: HTMLElement = container;

  const width = containerEl.clientWidth;
  const height = containerEl.clientHeight;
  const { camera: camConfig, renderer: renConfig, grid } = CONFIG;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    camConfig.fov,
    width / height,
    camConfig.near,
    camConfig.far
  );
  const lookAt = camConfig.lookAt;
  camera.position.set(camConfig.position.x, camConfig.position.y, camConfig.position.z);
  camera.lookAt(lookAt.x, lookAt.y, lookAt.z);

  const scrollConfig = camConfig.scroll;
  const targetCameraPosition = new THREE.Vector3(
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

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: renConfig.antialias ?? false,
    powerPreference: renConfig.powerPreference ?? 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, renConfig.maxPixelRatio));
  renderer.setClearColor(0x000000, 0);
  containerEl.appendChild(renderer.domElement);

  const lineGeo = createGridLineGeometry(THREE);
  const lineMat = createWaveMaterial(THREE, grid.lineColor, true);
  const gridLines = new THREE.LineSegments(lineGeo, lineMat);

  const pointsGeo = createGridPointsGeometry(THREE);
  const pointsMat = createWaveMaterial(THREE, grid.pointColor, false);
  const gridPoints = new THREE.Points(pointsGeo, pointsMat);

  const gridGroup = new THREE.Group();
  gridGroup.position.set(grid.position.x, grid.position.y, grid.position.z);
  gridGroup.rotation.set(grid.rotation.x, grid.rotation.y, grid.rotation.z);

  let planeMat: import('three').ShaderMaterial | null = null;
  let planeGeo: import('three').BufferGeometry | null = null;
  if (grid.plane?.enabled) {
    planeGeo = createGridPlaneGeometry(THREE);
    planeMat = createPlaneMaterial(THREE);
    const gridPlane = new THREE.Mesh(planeGeo, planeMat);
    gridGroup.add(gridPlane);
  }

  gridGroup.add(gridLines);
  gridGroup.add(gridPoints);
  scene.add(gridGroup);

  const highlightLerp = grid.highlight?.followLerp ?? 0.06;
  let mouseGridX = -10;
  let mouseGridZ = -10;
  let targetMouseGridX = -10;
  let targetMouseGridZ = -10;

  function onMouseMove(e: MouseEvent): void {
    targetMouseGridZ = 1 - 2 * (e.clientX / window.innerWidth);
    targetMouseGridX = -1 + 2 * (e.clientY / window.innerHeight);
  }
  function onMouseLeave(): void {
    targetMouseGridX = -10;
    targetMouseGridZ = -10;
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mouseleave', onMouseLeave, { passive: true });

  const timer = new THREE.Timer();
  let rafId: number;

  function animate(timestamp?: number): void {
    rafId = requestAnimationFrame(animate);
    timer.update(timestamp ?? performance.now());
    const t = timer.getElapsed();
    mouseGridX += (targetMouseGridX - mouseGridX) * highlightLerp;
    mouseGridZ += (targetMouseGridZ - mouseGridZ) * highlightLerp;
    (lineMat.uniforms.uTime as import('three').Uniform).value = t;
    (pointsMat.uniforms.uTime as import('three').Uniform).value = t;
    lineMat.uniforms.uMouseGrid.value.set(mouseGridX, mouseGridZ);
    pointsMat.uniforms.uMouseGrid.value.set(mouseGridX, mouseGridZ);
    if (planeMat) {
      (planeMat.uniforms.uTime as import('three').Uniform).value = t;
      planeMat.uniforms.uMouseGrid.value.set(mouseGridX, mouseGridZ);
    }
    if (scrollConfig) {
      camera.position.lerp(targetCameraPosition, lerpSpeed);
      camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
    }
    renderer.render(scene, camera);
  }

  // Warm up WebGL (shader compile, etc.) outside rAF to avoid "handler took Xms" violation
  const runLoop = (): void => {
    timer.update(performance.now());
    (lineMat.uniforms.uTime as import('three').Uniform).value = timer.getElapsed();
    (pointsMat.uniforms.uTime as import('three').Uniform).value = timer.getElapsed();
    if (planeMat) (planeMat.uniforms.uTime as import('three').Uniform).value = timer.getElapsed();
    renderer.render(scene, camera);
    animate();
  };
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(runLoop, { timeout: 300 });
  } else {
    setTimeout(runLoop, 0);
  }

  function onResize(): void {
    const w = containerEl.clientWidth;
    const h = containerEl.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(containerEl);

  const cleanup = (): void => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('scroll', updateCameraTargetFromScroll);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseleave', onMouseLeave);
    resizeObserver.disconnect();
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

  window.addEventListener('beforeunload', cleanup);
}

function runInit(): void {
  init().catch((err) => {
    console.error('[three] Scene failed to load:', err);
  });
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
