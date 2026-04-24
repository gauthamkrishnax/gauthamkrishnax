import { useReducer, useState, type MutableRefObject } from 'react';
import { WEB_SCENE_CONFIG, type WebSceneConfig } from '../config/webSceneConfig';
import styles from './sceneConfigTuner.module.css';

function assignDeep(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const k of Object.keys(source)) {
    const sk = source[k];
    const tk = target[k];
    if (
      sk !== null &&
      typeof sk === 'object' &&
      !Array.isArray(sk) &&
      tk !== null &&
      typeof tk === 'object'
    ) {
      assignDeep(tk as Record<string, unknown>, sk as Record<string, unknown>);
    } else {
      target[k] = sk;
    }
  }
}

function Slider({
  label,
  value,
  min,
  max,
  step = 0.001,
  fmt = (v: number) => v.toPrecision(4),
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  fmt?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className={styles.row}>
      <span className={styles.lab}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className={styles.num}>{fmt(value)}</span>
    </label>
  );
}

function DegSlider({
  label,
  rad,
  min,
  max,
  step = 0.5,
  onRad,
}: {
  label: string;
  rad: number;
  min: number;
  max: number;
  step?: number;
  onRad: (r: number) => void;
}) {
  const deg = (rad * 180) / Math.PI;
  return (
    <Slider
      label={label}
      value={deg}
      min={min}
      max={max}
      step={step}
      fmt={(v) => `${v.toFixed(1)}°`}
      onChange={(d) => onRad((d * Math.PI) / 180)}
    />
  );
}

export function SceneConfigTuner({
  cfgRef,
  onClose,
}: {
  cfgRef: MutableRefObject<WebSceneConfig>;
  onClose: () => void;
}) {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const [exportOpen, setExportOpen] = useState(false);
  const c = cfgRef.current;
  const nr = c.responsive.narrow;

  const reset = () => {
    assignDeep(c as unknown as Record<string, unknown>, structuredClone(WEB_SCENE_CONFIG) as unknown as Record<string, unknown>);
    bump();
  };

  const copyJson = async () => {
    const text = JSON.stringify(cfgRef.current, null, 2);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setExportOpen(true);
      bump();
    }
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.title}>Scene config</span>
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={reset}>
            Reset
          </button>
          <button type="button" className={styles.btn} onClick={() => void copyJson()}>
            Copy JSON
          </button>
          <button type="button" className={styles.btn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <p className={styles.hint}>
        Live preview. Copy JSON and merge into <code>src/config/webSceneConfig.ts</code>. Grid <code>segments</code> needs a reload after
        change.
      </p>

      <details className={styles.details} open>
        <summary className={styles.summary}>Camera (base)</summary>
        <div className={styles.body}>
          <Slider label="FOV°" value={c.camera.fov} min={28} max={85} step={0.5} fmt={(v) => `${v.toFixed(0)}°`} onChange={(v) => { c.camera.fov = v; bump(); }} />
          <Slider label="Near" value={c.camera.near} min={0.005} max={0.5} step={0.005} onChange={(v) => { c.camera.near = v; bump(); }} />
          <Slider label="Far" value={c.camera.far} min={2} max={30} step={0.5} onChange={(v) => { c.camera.far = v; bump(); }} />
          <Slider label="Pos X" value={c.camera.position.x} min={-6} max={6} step={0.02} onChange={(v) => { c.camera.position.x = v; bump(); }} />
          <Slider label="Pos Y" value={c.camera.position.y} min={-3} max={4} step={0.02} onChange={(v) => { c.camera.position.y = v; bump(); }} />
          <Slider label="Pos Z" value={c.camera.position.z} min={-4} max={8} step={0.02} onChange={(v) => { c.camera.position.z = v; bump(); }} />
          <Slider label="Look X" value={c.camera.lookAt.x} min={-4} max={4} step={0.02} onChange={(v) => { c.camera.lookAt.x = v; bump(); }} />
          <Slider label="Look Y" value={c.camera.lookAt.y} min={-4} max={4} step={0.02} onChange={(v) => { c.camera.lookAt.y = v; bump(); }} />
          <Slider label="Look Z" value={c.camera.lookAt.z} min={-4} max={8} step={0.02} onChange={(v) => { c.camera.lookAt.z = v; bump(); }} />
          <Slider label="Scroll end X" value={c.camera.scroll.positionWhenScrolled.x} min={-6} max={6} step={0.02} onChange={(v) => { c.camera.scroll.positionWhenScrolled.x = v; bump(); }} />
          <Slider label="Scroll end Y" value={c.camera.scroll.positionWhenScrolled.y} min={-2} max={4} step={0.02} onChange={(v) => { c.camera.scroll.positionWhenScrolled.y = v; bump(); }} />
          <Slider label="Scroll end Z" value={c.camera.scroll.positionWhenScrolled.z} min={-4} max={8} step={0.02} onChange={(v) => { c.camera.scroll.positionWhenScrolled.z = v; bump(); }} />
          <Slider label="Scroll threshold px" value={c.camera.scroll.thresholdPixels} min={80} max={1400} step={10} fmt={(v) => String(Math.round(v))} onChange={(v) => { c.camera.scroll.thresholdPixels = v; bump(); }} />
          <Slider label="Camera lerp" value={c.camera.scroll.lerpSpeed} min={0.02} max={0.35} step={0.005} onChange={(v) => { c.camera.scroll.lerpSpeed = v; bump(); }} />
        </div>
      </details>

      <details className={styles.details} open>
        <summary className={styles.summary}>Grid</summary>
        <div className={styles.body}>
          <Slider label="Segments (reload)" value={c.grid.segments} min={8} max={40} step={1} fmt={(v) => String(Math.round(v))} onChange={(v) => { c.grid.segments = Math.round(v); bump(); }} />
          <Slider label="Opacity" value={c.grid.opacity} min={0} max={1} step={0.02} onChange={(v) => { c.grid.opacity = v; bump(); }} />
          <Slider label="Point size" value={c.grid.pointSize} min={1} max={36} step={0.5} onChange={(v) => { c.grid.pointSize = v; bump(); }} />
          <Slider label="Grid pos X" value={c.grid.position.x} min={-3} max={3} step={0.02} onChange={(v) => { c.grid.position.x = v; bump(); }} />
          <Slider label="Grid pos Y" value={c.grid.position.y} min={-3} max={3} step={0.02} onChange={(v) => { c.grid.position.y = v; bump(); }} />
          <Slider label="Grid pos Z" value={c.grid.position.z} min={-3} max={2} step={0.02} onChange={(v) => { c.grid.position.z = v; bump(); }} />
          <DegSlider label="Base rot X" rad={c.grid.rotationRad.x} min={-90} max={90} onRad={(v) => { c.grid.rotationRad.x = v; bump(); }} />
          <DegSlider label="Base rot Y" rad={c.grid.rotationRad.y} min={-120} max={120} onRad={(v) => { c.grid.rotationRad.y = v; bump(); }} />
          <DegSlider label="Base rot Z" rad={c.grid.rotationRad.z} min={-90} max={90} onRad={(v) => { c.grid.rotationRad.z = v; bump(); }} />
          <Slider label="Parallax X" value={c.grid.pointerParallax.x} min={0} max={0.35} step={0.005} onChange={(v) => { c.grid.pointerParallax.x = v; bump(); }} />
          <Slider label="Parallax Y" value={c.grid.pointerParallax.y} min={0} max={0.35} step={0.005} onChange={(v) => { c.grid.pointerParallax.y = v; bump(); }} />
          <Slider label="Pointer follow" value={c.grid.pointerFollowRate} min={2} max={40} step={0.5} onChange={(v) => { c.grid.pointerFollowRate = v; bump(); }} />
          <Slider label="Pointer rot follow" value={c.grid.pointerRotFollowRate} min={2} max={24} step={0.5} onChange={(v) => { c.grid.pointerRotFollowRate = v; bump(); }} />
          <Slider label="Fresnel" value={c.grid.fresnelPower} min={0.5} max={6} step={0.05} onChange={(v) => { c.grid.fresnelPower = v; bump(); }} />
          <Slider label="Accent mix" value={c.grid.accentMix} min={0} max={1} step={0.02} onChange={(v) => { c.grid.accentMix = v; bump(); }} />
          <Slider label="Stack count" value={c.grid.stack.count} min={1} max={14} step={1} fmt={(v) => String(Math.round(v))} onChange={(v) => { c.grid.stack.count = Math.round(v); bump(); }} />
          <Slider label="Stack step X" value={c.grid.stack.step.x} min={-0.35} max={0.35} step={0.01} onChange={(v) => { c.grid.stack.step.x = v; bump(); }} />
          <Slider label="Stack step Y" value={c.grid.stack.step.y} min={-0.35} max={0.5} step={0.01} onChange={(v) => { c.grid.stack.step.y = v; bump(); }} />
          <Slider label="Stack step Z" value={c.grid.stack.step.z} min={-0.6} max={0.2} step={0.01} onChange={(v) => { c.grid.stack.step.z = v; bump(); }} />
          <label className={styles.chk}>
            <input type="checkbox" checked={c.grid.plane.enabled} onChange={(e) => { c.grid.plane.enabled = e.target.checked; bump(); }} />
            Plane enabled
          </label>
        </div>
      </details>

      <details className={styles.details}>
        <summary className={styles.summary}>Plane & noise</summary>
        <div className={styles.body}>
          <Slider label="Plane opacity" value={c.grid.plane.opacity} min={0} max={1} step={0.02} onChange={(v) => { c.grid.plane.opacity = v; bump(); }} />
          <Slider label="Pointer spot" value={c.grid.plane.pointerSpot} min={0} max={1} step={0.02} onChange={(v) => { c.grid.plane.pointerSpot = v; bump(); }} />
          <Slider label="Noise scale" value={c.grid.plane.surfaceNoise.scale} min={0.5} max={12} step={0.05} onChange={(v) => { c.grid.plane.surfaceNoise.scale = v; bump(); }} />
          <Slider label="Noise scroll" value={c.grid.plane.surfaceNoise.scrollSpeed} min={0} max={0.15} step={0.001} onChange={(v) => { c.grid.plane.surfaceNoise.scrollSpeed = v; bump(); }} />
          <Slider label="Noise strength" value={c.grid.plane.surfaceNoise.strength} min={0} max={0.25} step={0.005} onChange={(v) => { c.grid.plane.surfaceNoise.strength = v; bump(); }} />
        </div>
      </details>

      <details className={styles.details}>
        <summary className={styles.summary}>Wave</summary>
        <div className={styles.body}>
          <Slider label="Amplitude" value={c.wave.amplitude} min={0} max={0.45} step={0.005} onChange={(v) => { c.wave.amplitude = v; bump(); }} />
          <Slider label="Speed" value={c.wave.speed} min={0} max={3} step={0.02} onChange={(v) => { c.wave.speed = v; bump(); }} />
        </div>
      </details>

      <details className={styles.details}>
        <summary className={styles.summary}>Idle motion</summary>
        <div className={styles.body}>
          <Slider label="Amp X" value={c.grid.idleMotion.amp.x} min={0} max={0.08} step={0.001} onChange={(v) => { c.grid.idleMotion.amp.x = v; bump(); }} />
          <Slider label="Amp Y" value={c.grid.idleMotion.amp.y} min={0} max={0.08} step={0.001} onChange={(v) => { c.grid.idleMotion.amp.y = v; bump(); }} />
          <Slider label="Amp Z" value={c.grid.idleMotion.amp.z} min={0} max={0.08} step={0.001} onChange={(v) => { c.grid.idleMotion.amp.z = v; bump(); }} />
          <Slider label="Speed X" value={c.grid.idleMotion.speed.x} min={0} max={0.8} step={0.01} onChange={(v) => { c.grid.idleMotion.speed.x = v; bump(); }} />
          <Slider label="Speed Y" value={c.grid.idleMotion.speed.y} min={0} max={0.8} step={0.01} onChange={(v) => { c.grid.idleMotion.speed.y = v; bump(); }} />
          <Slider label="Speed Z" value={c.grid.idleMotion.speed.z} min={0} max={0.8} step={0.01} onChange={(v) => { c.grid.idleMotion.speed.z = v; bump(); }} />
        </div>
      </details>

      <details className={styles.details} open>
        <summary className={styles.summary}>Responsive (&lt; max width)</summary>
        <div className={styles.body}>
          <Slider label="Breakpoint px" value={c.responsive.maxWidthPx} min={480} max={2200} step={10} fmt={(v) => String(Math.round(v))} onChange={(v) => { c.responsive.maxWidthPx = Math.round(v); bump(); }} />
          <Slider label="Narrow cam pos X" value={nr.camera.position.x} min={-8} max={8} step={0.05} onChange={(v) => { nr.camera.position.x = v; bump(); }} />
          <Slider label="Narrow cam pos Y" value={nr.camera.position.y} min={-4} max={4} step={0.05} onChange={(v) => { nr.camera.position.y = v; bump(); }} />
          <Slider label="Narrow cam pos Z" value={nr.camera.position.z} min={-8} max={8} step={0.05} onChange={(v) => { nr.camera.position.z = v; bump(); }} />
          <Slider label="Narrow look X" value={nr.camera.lookAt.x} min={-6} max={6} step={0.05} onChange={(v) => { nr.camera.lookAt.x = v; bump(); }} />
          <Slider label="Narrow look Y" value={nr.camera.lookAt.y} min={-6} max={6} step={0.05} onChange={(v) => { nr.camera.lookAt.y = v; bump(); }} />
          <Slider label="Narrow look Z" value={nr.camera.lookAt.z} min={-6} max={8} step={0.05} onChange={(v) => { nr.camera.lookAt.z = v; bump(); }} />
          <Slider label="Narrow scroll end X" value={nr.camera.scroll.positionWhenScrolled.x} min={-8} max={8} step={0.05} onChange={(v) => { nr.camera.scroll.positionWhenScrolled.x = v; bump(); }} />
          <Slider label="Narrow scroll end Y" value={nr.camera.scroll.positionWhenScrolled.y} min={-4} max={6} step={0.05} onChange={(v) => { nr.camera.scroll.positionWhenScrolled.y = v; bump(); }} />
          <Slider label="Narrow scroll end Z" value={nr.camera.scroll.positionWhenScrolled.z} min={-8} max={8} step={0.05} onChange={(v) => { nr.camera.scroll.positionWhenScrolled.z = v; bump(); }} />
          <DegSlider label="Narrow rot X" rad={nr.grid.rotationRad.x} min={-90} max={90} onRad={(v) => { nr.grid.rotationRad.x = v; bump(); }} />
          <DegSlider label="Narrow rot Y" rad={nr.grid.rotationRad.y} min={-120} max={120} onRad={(v) => { nr.grid.rotationRad.y = v; bump(); }} />
          <DegSlider label="Narrow rot Z" rad={nr.grid.rotationRad.z} min={-90} max={90} onRad={(v) => { nr.grid.rotationRad.z = v; bump(); }} />
        </div>
      </details>

      {exportOpen && (
        <textarea className={styles.textarea} readOnly value={JSON.stringify(cfgRef.current, null, 2)} onFocus={(e) => e.currentTarget.select()} />
      )}
    </aside>
  );
}
