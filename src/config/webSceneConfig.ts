/**
 * Default WebGL hero scene — tuned via `SceneConfigTuner` (dev), then values copied here.
 */
export const WEB_SCENE_CONFIG = {
  grid: {
    segments: 20,
    opacity: 1,
    lineColor: 0xbababa,
    pointColor: 0xdadada,
    pointSize: 10,
    position: { x: 0.2, y: -0.6, z: -0.9 },
    rotationRad: { x: (Math.PI * 25) / 180, y: (-Math.PI * 60) / 180, z: 0 },
    idleMotion: {
      amp: { x: 0.024, y: 0.028, z: 0.016 },
      speed: { x: 0.2, y: 0.17, z: 0.23 },
    },
    plane: {
      enabled: true,
      color: 0xfafafa,
      opacity: 0.38,
      surfaceNoise: { scale: 4.2, scrollSpeed: 0.038, strength: 0.07 },
      pointerSpot: 0.36,
    },
    accentMix: 0,
    pointerParallax: { x: 0.11, y: 0.13 },
    pointerFollowRate: 16,
    pointerRotFollowRate: 9,
    fresnelPower: 2.35,
    stack: { count: 8, step: { x: -0.1, y: 0.2, z: -0.3 } },
  },
  wave: { amplitude: 0.1, speed: 0.9 },
  camera: {
    fov: 50,
    near: 0.01,
    far: 10,
    position: { x: 0.5, y: 0.4, z: 1.4 },
    lookAt: { x: 0, y: 0, z: 0 },
    scroll: {
      thresholdPixels: 400,
      positionWhenScrolled: { x: 0.5, y: 1, z: 0.8 },
      lerpSpeed: 0.08,
    },
  },
  responsive: {
    maxWidthPx: 1400,
    narrow: {
      camera: {
        position: { x: -0.95, y: -0.85, z: -2.4 },
        lookAt: { x: 2.35, y: -1.6, z: -2.2 },
        scroll: {
          positionWhenScrolled: { x: 0, y: 0, z: -2.4 },
        },
      },
      grid: {
        rotationRad: {
          x: -0.4974188368183839,
          y: -0.15707963267948966,
          z: -0.6544984694978736,
        },
      },
    },
  },
  renderer: { maxPixelRatio: 2.2, antialias: true, powerPreference: 'high-performance' as const },
  accentColorVar: '--color-blue-500',
  reducedMotionTimeScale: 0.15,
};

export type WebSceneConfig = typeof WEB_SCENE_CONFIG;

export type SceneVec3 = { x: number; y: number; z: number };

/** When `window.innerWidth` is strictly less than `maxWidthPx`, merge `narrow` over base camera + grid rotation. */
export function applyResponsiveSceneState(
  cfg: WebSceneConfig,
  innerWidth: number,
  out: { camA: SceneVec3; camB: SceneVec3; look: SceneVec3; baseRot: SceneVec3 },
) {
  const c = cfg.camera;
  const r = cfg.responsive;
  const useNarrow = innerWidth < r.maxWidthPx;
  const n = useNarrow ? r.narrow : undefined;

  const pos = { ...c.position, ...n?.camera?.position };
  const lk = { ...c.lookAt, ...n?.camera?.lookAt };
  const scrolled = { ...c.scroll.positionWhenScrolled, ...n?.camera?.scroll?.positionWhenScrolled };
  const rot = { ...cfg.grid.rotationRad, ...n?.grid?.rotationRad };

  out.camA.x = pos.x;
  out.camA.y = pos.y;
  out.camA.z = pos.z;
  out.look.x = lk.x;
  out.look.y = lk.y;
  out.look.z = lk.z;
  out.camB.x = scrolled.x;
  out.camB.y = scrolled.y;
  out.camB.z = scrolled.z;
  out.baseRot.x = rot.x;
  out.baseRot.y = rot.y;
  out.baseRot.z = rot.z;
}
