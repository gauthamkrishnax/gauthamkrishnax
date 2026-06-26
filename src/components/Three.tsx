import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLenis } from 'lenis/react';
import {
  WEB_SCENE_CONFIG,
  applyResponsiveSceneState,
  type WebSceneConfig,
} from '../config/webSceneConfig';

const SceneConfigTunerLazy = lazy(() =>
  import('./SceneConfigTuner.tsx').then((mod) => ({ default: mod.SceneConfigTuner })),
);

/** Re-export defaults for copying from the tuner UI into `src/config/webSceneConfig.ts`. */
export { WEB_SCENE_CONFIG } from '../config/webSceneConfig';

/**
 * Port of the reference Three.js scene — vanilla WebGL2 only (no three.js).
 * Stack: semi-transparent plane + line grid + points per layer; wave + idle + pointer; scroll camera.
 */
type Vec3 = readonly [number, number, number];

function hexToRgb01(hex: number): [number, number, number] {
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;
  return [r, g, b];
}

function readAccentRgb(cssVar: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  const m = raw.match(/^#([\da-f]{6})$/i);
  if (m) {
    const h = m[1]!;
    return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
  }
  return [0, 0.482, 1];
}

function perspective(fovDeg: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[0 * 4 + r] * b[c * 4 + 0] +
        a[1 * 4 + r] * b[c * 4 + 1] +
        a[2 * 4 + r] * b[c * 4 + 2] +
        a[3 * 4 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function lookAt(eye: Vec3, center: Vec3, up: Vec3): Float32Array {
  let zx = eye[0] - center[0];
  let zy = eye[1] - center[1];
  let zz = eye[2] - center[2];
  let len = Math.hypot(zx, zy, zz);
  if (len < 1e-6) len = 1;
  zx /= len;
  zy /= len;
  zz /= len;
  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  len = Math.hypot(xx, xy, xz);
  if (len < 1e-6) len = 1;
  xx /= len;
  xy /= len;
  xz /= len;
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;
  const m = new Float32Array(16);
  m[0] = xx;
  m[1] = yx;
  m[2] = zx;
  m[3] = 0;
  m[4] = xy;
  m[5] = yy;
  m[6] = zy;
  m[7] = 0;
  m[8] = xz;
  m[9] = yz;
  m[10] = zz;
  m[11] = 0;
  m[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  m[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  m[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  m[15] = 1;
  return m;
}

function mat4Translate(tx: number, ty: number, tz: number): Float32Array {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  m[12] = tx;
  m[13] = ty;
  m[14] = tz;
  return m;
}

function mat4RotateX(a: number): Float32Array {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = c;
  m[6] = s;
  m[9] = -s;
  m[10] = c;
  m[15] = 1;
  return m;
}

function mat4RotateY(a: number): Float32Array {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const m = new Float32Array(16);
  m[0] = c;
  m[2] = -s;
  m[5] = 1;
  m[8] = s;
  m[10] = c;
  m[15] = 1;
  return m;
}

function mat4RotateZ(a: number): Float32Array {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const m = new Float32Array(16);
  m[0] = c;
  m[1] = s;
  m[4] = -s;
  m[5] = c;
  m[10] = m[15] = 1;
  return m;
}

/** Rz * Ry * Rx — matches common “Euler XYZ” object rotation application on column vectors. */
function mat4FromEulerXYZ(rx: number, ry: number, rz: number): Float32Array {
  return multiply(mat4RotateZ(rz), multiply(mat4RotateY(ry), mat4RotateX(rx)));
}

function buildLineGrid(segments: number): Float32Array {
  const n = segments + 1;
  const p: number[] = [];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < segments; i++) {
      const x0 = (i / segments) * 2 - 1;
      const x1 = ((i + 1) / segments) * 2 - 1;
      const z = (j / segments) * 2 - 1;
      p.push(x0, 0, z, x1, 0, z);
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < segments; j++) {
      const x = (i / segments) * 2 - 1;
      const z0 = (j / segments) * 2 - 1;
      const z1 = ((j + 1) / segments) * 2 - 1;
      p.push(x, 0, z0, x, 0, z1);
    }
  }
  return new Float32Array(p);
}

function buildPointGrid(segments: number): Float32Array {
  const n = segments + 1;
  const p: number[] = [];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      p.push((i / segments) * 2 - 1, 0, (j / segments) * 2 - 1);
    }
  }
  return new Float32Array(p);
}

/** XZ plane -1..1, y=0; UV 0..1; 2 tris per cell */
function buildPlaneGrid(segments: number): Float32Array {
  const d = segments;
  const stride = 8;
  const out = new Float32Array(d * d * 6 * stride);
  let w = 0;
  const push = (x: number, y: number, z: number, nx: number, ny: number, nz: number, u: number, v: number) => {
    out[w++] = x;
    out[w++] = y;
    out[w++] = z;
    out[w++] = nx;
    out[w++] = ny;
    out[w++] = nz;
    out[w++] = u;
    out[w++] = v;
  };
  for (let j = 0; j < d; j++) {
    for (let i = 0; i < d; i++) {
      const x0 = (i / d) * 2 - 1;
      const x1 = ((i + 1) / d) * 2 - 1;
      const z0 = (j / d) * 2 - 1;
      const z1 = ((j + 1) / d) * 2 - 1;
      const u00 = i / d,
        u10 = (i + 1) / d;
      const v0 = j / d,
        v1 = (j + 1) / d;
      push(x0, 0, z0, 0, 1, 0, u00, v0);
      push(x1, 0, z0, 0, 1, 0, u10, v0);
      push(x0, 0, z1, 0, 1, 0, u00, v1);
      push(x1, 0, z0, 0, 1, 0, u10, v0);
      push(x1, 0, z1, 0, 1, 0, u10, v1);
      push(x0, 0, z1, 0, 1, 0, u00, v1);
    }
  }
  return out;
}

const WAVE_Y = `
float waveY(vec3 p, float t, float amp, float spd) {
  float tt = t * spd;
  return amp * (
    sin(p.x * 3.0 + tt) * cos(p.z * 2.5 + tt * 0.8) +
    sin(p.x * 5.0 + tt * 1.3) * 0.4 * cos(p.z * 4.0 + tt * 0.6) +
    sin((p.x + p.z) * 2.0 + tt * 0.7) * 0.5
  );
}
`;

const VS_PLANE = `#version 300 es
precision highp float;
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_uv;

uniform mat4 u_mvp;
uniform mat4 u_model;
uniform float u_time;
uniform float u_amplitude;
uniform float u_speed;

out float vDisp;
out vec2 vUv;
out vec3 vWorldNormal;
out vec3 vWorldPos;

${WAVE_Y}

void main() {
  vec3 base = a_position;
  float y = waveY(base, u_time, u_amplitude, u_speed);
  vec3 pos = base + vec3(0.0, y, 0.0);
  vDisp = y / max(u_amplitude, 0.0001);
  vUv = a_uv;
  mat3 R = mat3(u_model[0].xyz, u_model[1].xyz, u_model[2].xyz);
  vWorldNormal = normalize(R * a_normal);
  vWorldPos = (u_model * vec4(pos, 1.0)).xyz;
  gl_Position = u_mvp * vec4(pos, 1.0);
}
`;

const FS_PLANE = `#version 300 es
precision highp float;
in float vDisp;
in vec2 vUv;
in vec3 vWorldNormal;
in vec3 vWorldPos;

uniform vec3 u_color;
uniform float u_opacity;
uniform float u_fresnelPower;
uniform float u_time;
uniform float u_noiseScale;
uniform float u_noiseScroll;
uniform float u_noiseStrength;
uniform vec2 u_pointer;
uniform float u_pointerSpot;
uniform vec3 u_cameraPos;

out vec4 fragColor;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec3 viewDir = normalize(u_cameraPos - vWorldPos);
  float ndv = max(dot(normalize(vWorldNormal), viewDir), 0.0);
  float fresnel = pow(1.0 - ndv, u_fresnelPower);
  float crest = smoothstep(0.12, 1.0, vDisp * 0.5 + 0.5);
  vec3 tint = mix(u_color * 0.94, u_color * 1.06, fresnel * 0.45 + crest * 0.22);
  float alpha = u_opacity * (0.86 + fresnel * 0.16);

  vec2 flow = vUv * u_noiseScale;
  float s = u_time * u_noiseScroll;
  flow += vec2(1.0, 0.58) * s;
  flow += vec2(-0.42, 0.91) * s * 0.38;

  float lattice =
    sin(flow.x * 6.2831853) * sin(flow.y * 6.2831853) * 0.38 +
    sin(dot(flow, vec2(4.15, 2.88)) * 6.2831853 + u_time * 0.31) * 0.32 +
    sin(dot(flow, vec2(-2.05, 5.2)) * 4.7123889 - u_time * 0.26) * 0.30;
  lattice = lattice * 0.5 + 0.5;

  vec2 ncell = floor(flow * 14.0);
  float grain = hash21(ncell + fract(flow) * 0.001);
  float detail = mix(lattice, lattice * 0.92 + grain * 0.16, 0.35);

  float lift = mix(1.0 - u_noiseStrength * 0.55, 1.0 + u_noiseStrength * 0.75, detail);
  vec3 col = tint * lift;

  float spot = exp(-distance(vUv, u_pointer) * 3.8);
  col = mix(col, min(vec3(1.0), col * 1.22), spot * u_pointerSpot);

  fragColor = vec4(col, alpha);
}
`;

const VS_LINE = `#version 300 es
precision highp float;
layout(location = 0) in vec3 a_position;

uniform mat4 u_mvp;
uniform float u_time;
uniform float u_amplitude;
uniform float u_speed;

out float vDisp;

${WAVE_Y}

void main() {
  vec3 base = a_position;
  float y = waveY(base, u_time, u_amplitude, u_speed);
  vec3 pos = base + vec3(0.0, y, 0.0);
  vDisp = y / max(u_amplitude, 0.0001);
  gl_Position = u_mvp * vec4(pos, 1.0);
}
`;

const FS_LINE = `#version 300 es
precision highp float;
in float vDisp;
uniform vec3 u_color;
uniform vec3 u_accent;
uniform float u_opacity;
uniform float u_accentMix;
out vec4 fragColor;

void main() {
  float crest = smoothstep(0.18, 0.95, vDisp * 0.5 + 0.5);
  vec3 col = mix(u_color, mix(u_color, u_accent, 0.88), crest * u_accentMix * 0.48);
  fragColor = vec4(col, u_opacity);
}
`;

const VS_POINT = `#version 300 es
precision highp float;
layout(location = 0) in vec3 a_position;

uniform mat4 u_mvp;
uniform float u_time;
uniform float u_amplitude;
uniform float u_speed;
uniform float u_pointSize;

out float vDisp;

${WAVE_Y}

void main() {
  vec3 base = a_position;
  float y = waveY(base, u_time, u_amplitude, u_speed);
  vec3 pos = base + vec3(0.0, y, 0.0);
  vDisp = y / max(u_amplitude, 0.0001);
  gl_Position = u_mvp * vec4(pos, 1.0);
  gl_PointSize = u_pointSize;
}
`;

const FS_POINT = `#version 300 es
precision highp float;
in float vDisp;
uniform vec3 u_color;
uniform vec3 u_accent;
uniform float u_opacity;
uniform float u_accentMix;
uniform float u_time;
out vec4 fragColor;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c);
  float alpha = u_opacity * (1.0 - smoothstep(0.1, 0.48, r2));
  if (alpha < 0.015) discard;
  float crest = smoothstep(0.08, 1.0, vDisp * 0.5 + 0.5);
  vec3 col = mix(u_color, mix(u_color, u_accent, 0.92), crest * u_accentMix * 0.72);
  float pulse = 0.94 + 0.06 * sin(u_time * 1.15 + vDisp * 4.5);
  fragColor = vec4(col, alpha * pulse);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function createProgram(gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(p));
    gl.deleteProgram(p);
    return null;
  }
  return p;
}

function sceneTunerEnabled() {
  return new URLSearchParams(window.location.search).has('sceneTuner');
}

type ThemeVisual = { isLight: boolean; accent: [number, number, number] };

function Three() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfgRef = useRef<WebSceneConfig>(structuredClone(WEB_SCENE_CONFIG));
  const scrollRef = useRef(0);
  const viewportWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const themeVisualRef = useRef<ThemeVisual>({
    isLight: true,
    accent: [0, 0.482, 1],
  });
  const [webglReady, setWebglReady] = useState<'pending' | 'ok' | 'fail'>('pending');
  const [showSceneTuner, setShowSceneTuner] = useState(() => sceneTunerEnabled());

  useLenis((lenis) => {
    scrollRef.current = lenis.scroll;
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const cfg = cfgRef.current;

    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const saveData = Boolean(nav.connection?.saveData);
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const narrow768 = window.innerWidth <= 768;
    const w0 = window.innerWidth;
    let segments = cfg.grid.segments;
    let maxPr = Math.min(window.devicePixelRatio || 1, cfg.renderer.maxPixelRatio);
    let useAa = cfg.renderer.antialias;
    if (saveData) {
      segments = 12;
      maxPr = 1;
      useAa = false;
    } else if (coarse) {
      segments = w0 <= 480 ? 14 : 16;
      useAa = false;
    } else if (narrow768) {
      segments = 16;
      useAa = w0 >= 640 && cfg.renderer.antialias;
    }

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: useAa,
      depth: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: cfg.renderer.powerPreference,
    }) as WebGL2RenderingContext | null;

    if (!gl) {
      setWebglReady('fail');
      return;
    }

    const progPlane = createProgram(gl, VS_PLANE, FS_PLANE);
    const progLine = createProgram(gl, VS_LINE, FS_LINE);
    const progPoint = createProgram(gl, VS_POINT, FS_POINT);
    if (!progPlane || !progLine || !progPoint) {
      setWebglReady('fail');
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionScale = reducedMotion ? cfg.reducedMotionTimeScale : 1;
    const introDurationSec = reducedMotion ? 0 : 1.15;

    const lineGeo = buildLineGrid(segments);
    const pointGeo = buildPointGrid(segments);
    const planeGeo = buildPlaneGrid(segments);
    const lineVerts = lineGeo.length / 3;
    const pointVerts = pointGeo.length / 3;
    const planeVerts = planeGeo.length / 8;

    const bufLine = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufLine);
    gl.bufferData(gl.ARRAY_BUFFER, lineGeo, gl.STATIC_DRAW);

    const bufPoint = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPoint);
    gl.bufferData(gl.ARRAY_BUFFER, pointGeo, gl.STATIC_DRAW);

    const bufPlane = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPlane);
    gl.bufferData(gl.ARRAY_BUFFER, planeGeo, gl.STATIC_DRAW);

    const vaoLine = gl.createVertexArray();
    gl.bindVertexArray(vaoLine);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufLine);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const vaoPoint = gl.createVertexArray();
    gl.bindVertexArray(vaoPoint);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPoint);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const vaoPlane = gl.createVertexArray();
    gl.bindVertexArray(vaoPlane);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPlane);
    const stride = 8 * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * 4);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 6 * 4);

    gl.bindVertexArray(null);

    const camA = { x: 0, y: 0, z: 0 };
    const camB = { x: 0, y: 0, z: 0 };
    const look = { x: 0, y: 0, z: 0 };
    const baseRot = { x: 0, y: 0, z: 0 };
    const targetCam = { x: 0, y: 0, z: 0 };

    const syncCameraFromConfig = () => {
      applyResponsiveSceneState(cfgRef.current, viewportWidthRef.current, { camA, camB, look, baseRot });
      const c = cfgRef.current;
      const y = scrollRef.current;
      const t = Math.min(1, Math.max(0, y / c.camera.scroll.thresholdPixels));
      targetCam.x = camA.x + t * (camB.x - camA.x);
      targetCam.y = camA.y + t * (camB.y - camA.y);
      targetCam.z = camA.z + t * (camB.z - camA.z);
    };

    const refreshThemeVisual = () => {
      const cfg = cfgRef.current;
      themeVisualRef.current = {
        isLight: document.documentElement.getAttribute('data-theme') !== 'dark',
        accent: readAccentRgb(cfg.accentColorVar),
      };
    };

    scrollRef.current = typeof window !== 'undefined' ? window.scrollY : 0;
    viewportWidthRef.current = typeof window !== 'undefined' ? window.innerWidth : viewportWidthRef.current;
    refreshThemeVisual();

    const themeObserver = new MutationObserver(() => {
      refreshThemeVisual();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    syncCameraFromConfig();

    const pointerTarget = { x: 0.5, y: 0.5 };
    const pointerSmooth = { x: 0.5, y: 0.5 };
    const ptrTiltSmooth = { x: 0, y: 0 };
    let prevT = performance.now();

    const onPointerMove = (ev: PointerEvent) => {
      const ww = viewportWidthRef.current;
      const hh = window.innerHeight;
      if (ww < 1 || hh < 1) return;
      pointerTarget.x = Math.min(1, Math.max(0, ev.clientX / ww));
      pointerTarget.y = Math.min(1, Math.max(0, ev.clientY / hh));
    };

    document.body.addEventListener('pointermove', onPointerMove, { passive: true });

    const locPlane = {
      mvp: gl.getUniformLocation(progPlane, 'u_mvp'),
      model: gl.getUniformLocation(progPlane, 'u_model'),
      time: gl.getUniformLocation(progPlane, 'u_time'),
      amplitude: gl.getUniformLocation(progPlane, 'u_amplitude'),
      speed: gl.getUniformLocation(progPlane, 'u_speed'),
      color: gl.getUniformLocation(progPlane, 'u_color'),
      opacity: gl.getUniformLocation(progPlane, 'u_opacity'),
      fresnelPower: gl.getUniformLocation(progPlane, 'u_fresnelPower'),
      noiseScale: gl.getUniformLocation(progPlane, 'u_noiseScale'),
      noiseScroll: gl.getUniformLocation(progPlane, 'u_noiseScroll'),
      noiseStrength: gl.getUniformLocation(progPlane, 'u_noiseStrength'),
      pointer: gl.getUniformLocation(progPlane, 'u_pointer'),
      pointerSpot: gl.getUniformLocation(progPlane, 'u_pointerSpot'),
      cameraPos: gl.getUniformLocation(progPlane, 'u_cameraPos'),
    };

    const locLine = {
      mvp: gl.getUniformLocation(progLine, 'u_mvp'),
      time: gl.getUniformLocation(progLine, 'u_time'),
      amplitude: gl.getUniformLocation(progLine, 'u_amplitude'),
      speed: gl.getUniformLocation(progLine, 'u_speed'),
      color: gl.getUniformLocation(progLine, 'u_color'),
      accent: gl.getUniformLocation(progLine, 'u_accent'),
      opacity: gl.getUniformLocation(progLine, 'u_opacity'),
      accentMix: gl.getUniformLocation(progLine, 'u_accentMix'),
    };

    const locPoint = {
      mvp: gl.getUniformLocation(progPoint, 'u_mvp'),
      time: gl.getUniformLocation(progPoint, 'u_time'),
      amplitude: gl.getUniformLocation(progPoint, 'u_amplitude'),
      speed: gl.getUniformLocation(progPoint, 'u_speed'),
      pointSize: gl.getUniformLocation(progPoint, 'u_pointSize'),
      color: gl.getUniformLocation(progPoint, 'u_color'),
      accent: gl.getUniformLocation(progPoint, 'u_accent'),
      opacity: gl.getUniformLocation(progPoint, 'u_opacity'),
      accentMix: gl.getUniformLocation(progPoint, 'u_accentMix'),
    };

    const eye = { x: camA.x, y: camA.y, z: camA.z };
    const gridPos = cfg.grid.position;
    const idle = cfg.grid.idleMotion;
    const stackStep = cfg.grid.stack.step;

    let raf = 0;
    let resizeRaf = 0;
    const start = performance.now();

    const applyResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, cfg.renderer.maxPixelRatio);
      const pr = saveData ? 1 : coarse ? dpr : narrow768 ? dpr : maxPr;
      const cw = wrap.clientWidth;
      const ch = wrap.clientHeight;
      if (cw < 1 || ch < 1) return;
      const w = Math.max(2, Math.floor(cw * pr));
      const h = Math.max(2, Math.floor(ch * pr));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    const applyLayout = () => {
      viewportWidthRef.current = window.innerWidth;
      applyResize();
      syncCameraFromConfig();
    };

    const resize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        applyLayout();
      });
    };

    applyLayout();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    window.addEventListener('resize', resize, { passive: true });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    const expSmooth = (dt: number, rate: number) => {
      const d = Math.min(Math.max(dt, 0), 0.05);
      return 1 - Math.exp(-rate * d);
    };

    const draw = (now?: number) => {
      syncCameraFromConfig();
      const cfg = cfgRef.current;
      const ptrFollow = cfg.grid.pointerFollowRate;
      const ptrRotFollow = cfg.grid.pointerRotFollowRate;
      const ptrAmp = cfg.grid.pointerParallax;
      const lerpCam = cfg.camera.scroll.lerpSpeed;

      const { isLight, accent } = themeVisualRef.current;
      const lineRgb = hexToRgb01(isLight ? cfg.grid.lineColor : 0x989898);
      const pointRgb = hexToRgb01(isLight ? cfg.grid.pointColor : 0x2a6478);
      const accentMix = isLight ? cfg.grid.accentMix : 0.22;
      const planeRgb = hexToRgb01(isLight ? cfg.grid.plane.color : 0x101018);
      const planeOpacity = isLight ? cfg.grid.plane.opacity : 0.44;
      const planeSpot = isLight ? cfg.grid.plane.pointerSpot : 0.42;
      const noise = cfg.grid.plane.surfaceNoise;

      const n = now ?? performance.now();
      const dt = Math.min((n - prevT) / 1000, 0.05);
      prevT = n;
      const t = ((n - start) / 1000) * motionScale;

      let introFade = 1;
      let introPointScale = 1;
      if (introDurationSec > 0) {
        const u = Math.min(1, (n - start) / 1000 / introDurationSec);
        introFade = 1 - (1 - u) ** 3;
        introPointScale = 0.35 + 0.65 * introFade;
      }

      const uvK = expSmooth(dt, ptrFollow);
      pointerSmooth.x += (pointerTarget.x - pointerSmooth.x) * uvK;
      pointerSmooth.y += (pointerTarget.y - pointerSmooth.y) * uvK;

      const px = (pointerSmooth.x - 0.5) * 2;
      const py = (pointerSmooth.y - 0.5) * 2;
      const tiltTargetX = py * ptrAmp.x;
      const tiltTargetY = px * ptrAmp.y;
      const rotK = expSmooth(dt, ptrRotFollow);
      ptrTiltSmooth.x += (tiltTargetX - ptrTiltSmooth.x) * rotK;
      ptrTiltSmooth.y += (tiltTargetY - ptrTiltSmooth.y) * rotK;

      const idleX = Math.sin(t * idle.speed.x) * idle.amp.x;
      const idleY = Math.cos(t * idle.speed.y * 0.92) * idle.amp.y;
      const rx = baseRot.x + idleX + ptrTiltSmooth.x;
      const ry = baseRot.y + idleY + ptrTiltSmooth.y;
      const rz = baseRot.z + Math.sin(t * idle.speed.z * 1.05) * idle.amp.z;

      eye.x += (targetCam.x - eye.x) * lerpCam;
      eye.y += (targetCam.y - eye.y) * lerpCam;
      eye.z += (targetCam.z - eye.z) * lerpCam;

      const aspect = canvas.width / canvas.height;
      const proj = perspective(cfg.camera.fov, aspect, cfg.camera.near, cfg.camera.far);
      const view = lookAt([eye.x, eye.y, eye.z], [look.x, look.y, look.z], [0, 1, 0]);
      const vp = multiply(proj, view);

      const Tg = mat4Translate(gridPos.x, gridPos.y, gridPos.z);
      const Rg = mat4FromEulerXYZ(rx, ry, rz);
      const modelGroup = multiply(Tg, Rg);

      const stack = [stackStep.x, stackStep.y, stackStep.z] as const;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const setLinePointWave = (
        loc: typeof locLine | typeof locPoint,
        prog: WebGLProgram,
        mvp: Float32Array,
      ) => {
        gl.useProgram(prog);
        gl.uniformMatrix4fv(loc.mvp, false, mvp);
        gl.uniform1f(loc.time!, t);
        gl.uniform1f(loc.amplitude!, cfg.wave.amplitude);
        gl.uniform1f(loc.speed!, cfg.wave.speed);
      };

      const setPlaneWave = (mvp: Float32Array, layerModel: Float32Array) => {
        gl.useProgram(progPlane);
        gl.uniformMatrix4fv(locPlane.mvp, false, mvp);
        gl.uniformMatrix4fv(locPlane.model, false, layerModel);
        gl.uniform1f(locPlane.time!, t);
        gl.uniform1f(locPlane.amplitude!, cfg.wave.amplitude);
        gl.uniform1f(locPlane.speed!, cfg.wave.speed);
      };

      let nStack = Math.max(1, Math.floor(cfg.grid.stack.count));
      if (saveData) nStack = Math.min(2, nStack);

      for (let i = 0; i < nStack; i++) {
        const ox = i * stack[0];
        const oy = i * stack[1];
        const oz = i * stack[2];
        const layerModel = multiply(modelGroup, mat4Translate(ox, oy, oz));
        const mvp = multiply(vp, layerModel);

        if (cfg.grid.plane.enabled) {
          gl.depthMask(true);
          gl.bindVertexArray(vaoPlane);
          setPlaneWave(mvp, layerModel);
          gl.uniform3f(locPlane.color!, planeRgb[0], planeRgb[1], planeRgb[2]);
          gl.uniform1f(locPlane.opacity!, planeOpacity * introFade);
          gl.uniform1f(locPlane.fresnelPower!, cfg.grid.fresnelPower);
          gl.uniform1f(locPlane.noiseScale!, noise.scale);
          gl.uniform1f(locPlane.noiseScroll!, noise.scrollSpeed);
          gl.uniform1f(locPlane.noiseStrength!, noise.strength);
          gl.uniform2f(locPlane.pointer!, pointerSmooth.x, pointerSmooth.y);
          gl.uniform1f(locPlane.pointerSpot!, planeSpot);
          gl.uniform3f(locPlane.cameraPos!, eye.x, eye.y, eye.z);
          gl.drawArrays(gl.TRIANGLES, 0, planeVerts);
        }

        gl.depthMask(true);
        setLinePointWave(locLine, progLine, mvp);
        gl.uniform3f(locLine.color!, lineRgb[0], lineRgb[1], lineRgb[2]);
        gl.uniform3f(locLine.accent!, accent[0], accent[1], accent[2]);
        gl.uniform1f(locLine.opacity!, cfg.grid.opacity * introFade);
        gl.uniform1f(locLine.accentMix!, accentMix);
        gl.bindVertexArray(vaoLine);
        gl.drawArrays(gl.LINES, 0, lineVerts);

        gl.depthMask(false);
        setLinePointWave(locPoint, progPoint, mvp);
        gl.uniform1f(locPoint.pointSize!, cfg.grid.pointSize * introPointScale);
        gl.uniform3f(locPoint.color!, pointRgb[0], pointRgb[1], pointRgb[2]);
        gl.uniform3f(locPoint.accent!, accent[0], accent[1], accent[2]);
        gl.uniform1f(locPoint.opacity!, cfg.grid.opacity * introFade);
        gl.uniform1f(locPoint.accentMix!, accentMix);
        gl.bindVertexArray(vaoPoint);
        gl.drawArrays(gl.POINTS, 0, pointVerts);
        gl.depthMask(true);
      }

      raf = requestAnimationFrame(draw);
    };

    setWebglReady('ok');
    raf = requestAnimationFrame(draw);
    prevT = performance.now();

    // Pause the render loop when the hero scrolls out of view — no point running
    // WebGL while the visitor is reading About or Works. (Hidden background tabs
    // are already paused by the browser's requestAnimationFrame throttling.)
    const visObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? true;
        if (visible) {
          if (!raf) {
            prevT = performance.now();
            raf = requestAnimationFrame(draw);
          }
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );
    visObserver.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      visObserver.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', resize);
      document.body.removeEventListener('pointermove', onPointerMove);
      themeObserver.disconnect();
      gl.deleteVertexArray(vaoLine);
      gl.deleteVertexArray(vaoPoint);
      gl.deleteVertexArray(vaoPlane);
      gl.deleteBuffer(bufLine);
      gl.deleteBuffer(bufPoint);
      gl.deleteBuffer(bufPlane);
      gl.deleteProgram(progPlane);
      gl.deleteProgram(progLine);
      gl.deleteProgram(progPoint);
    };
  }, []);

  const fallbackStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity: webglReady === 'fail' ? 1 : 0,
    background: 'linear-gradient(135deg, #1a1a22, #0d0d12)',
  };

  const tunerAllowed = sceneTunerEnabled();

  return (
    <>
      <div
        ref={wrapRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
        data-webgl={webglReady === 'ok' ? 'active' : webglReady === 'fail' ? 'unavailable' : 'pending'}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            maxWidth: 'none',
            maxHeight: 'none',
            display: 'block',
            opacity: webglReady === 'ok' ? 1 : webglReady === 'pending' ? 1 : 0,
            transition: 'opacity 0.35s ease',
          }}
        />
        <div style={fallbackStyle} aria-hidden={webglReady !== 'fail'} />
      </div>
      {tunerAllowed && showSceneTuner && (
        <Suspense fallback={null}>
          <SceneConfigTunerLazy cfgRef={cfgRef} onClose={() => setShowSceneTuner(false)} />
        </Suspense>
      )}
      {tunerAllowed && !showSceneTuner && (
        <button
          type="button"
          onClick={() => setShowSceneTuner(true)}
          style={{
            position: 'fixed',
            bottom: 'var(--space-sm)',
            right: 'var(--space-sm)',
            zIndex: 10001,
            padding: 'var(--space-xs) var(--space-sm)',
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid rgba(255,255,255,0.25)',
            background: 'rgba(0,0,0,0.65)',
            color: '#eee',
          }}
        >
          Scene tune
        </button>
      )}
    </>
  );
}

export default Three;
