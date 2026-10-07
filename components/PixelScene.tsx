'use client';

import { useEffect, useRef, useState } from 'react';
import { getInterpolatedPreset, getMoonPhase } from '@/lib/time-presets';
import { onLenisScroll } from '@/lib/lenis-store';
import { PX, hexToVec3 } from '@/lib/pixel';
import { FRAG, VERT } from '@/lib/scene-shader';

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Window lights: 1 at night, 0 around noon. */
function getLightLevel(hour: number): number {
  return Math.max(1 - smoothstep(6.2, 8.4, hour), smoothstep(17.2, 19.4, hour));
}

function getStarVisibility(hour: number): number {
  if (hour <= 5 || hour >= 20.5) return 1;
  if (hour >= 8 && hour <= 17) return 0;
  if (hour < 8) return Math.max(0, (8 - hour) / 3);
  return Math.max(0, (hour - 17) / 3.5);
}

// The skyline scrolls at this fraction of the page's speed behind the hero.
const PARALLAX = 0.72;

/** Position on the retro day/night arc, or null while below the horizon. */
function arc(t: number, w: number, horizon: number, lift: number): [number, number] | null {
  if (t < 0 || t > 1) return null;
  // Rises on the right and sets on the left, so at dusk the moon hangs over the
  // city on the right, clear of the left-aligned copy.
  // Kept a little inside the edges so a narrow screen never cuts it in half.
  const x = Math.min(w - 16, Math.max(16, w + 25 - t * (w + 50)));
  return [Math.round(x), Math.round(horizon - Math.sin(t * Math.PI) * horizon * lift)];
}

const UNIFORMS = [
  'uRes', 'uTime', 'uView', 'uSky', 'uCloud', 'uGround', 'uAccent', 'uLight', 'uStars', 'uSun', 'uMoon', 'uMoonRight',
  'uProgress', 'uLift', 'uCut',
] as const;
type UniformName = (typeof UNIFORMS)[number];

/**
 * A pixel-art scene filling its (positioned) parent: the hero skyline or the
 * server room behind the contact section. One low-res WebGL canvas, one art
 * pixel = PX CSS px, drawn only while it is on screen. Each scene reacts to
 * scroll: the skyline lags behind the page with its layers separating, and
 * dissolves into the page through a dither; the server room boots as it arrives.
 */
export default function PixelScene({
  view,
  hour = 0,
  fps = 30,
  className = '',
}: {
  view: 'skyline' | 'desk';
  /** Time of day, 0..24. The desk scene leaves it at 0: it is always night there. */
  hour?: number;
  fps?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hourRef = useRef(hour);
  const dirtyRef = useRef(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    hourRef.current = hour;
    dirtyRef.current = true;
  }, [hour]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const moonRight = getMoonPhase() < 0.5 ? 1 : 0;
    const start = performance.now();
    let gl: WebGLRenderingContext | null = null;
    let uniforms = {} as Record<UniformName, WebGLUniformLocation | null>;
    let raf = 0;
    let last = 0;
    let visible = false;
    let progress = 0;
    // CSS px the host section has scrolled past the top of the viewport.
    let scrolled = 0;
    // The scene is transformed for parallax, so measure the section it sits in.
    const host = wrap.parentElement ?? wrap;

    function setup(): boolean {
      gl = canvas!.getContext('webgl', {
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power',
      });
      if (!gl) return false;

      const program = gl.createProgram();
      for (const [type, source] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]] as const) {
        const shader = gl.createShader(type);
        if (!shader || !program) return false;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('[PixelScene] shader compile failed:', gl.getShaderInfoLog(shader));
          return false;
        }
        gl.attachShader(program, shader);
      }
      if (!program) return false;
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('[PixelScene] program link failed:', gl.getProgramInfoLog(program));
        return false;
      }
      gl.useProgram(program);

      // One oversized triangle covers the canvas.
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      uniforms = {} as Record<UniformName, WebGLUniformLocation | null>;
      for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name);
      resize();
      return true;
    }

    function resize() {
      const w = Math.max(1, Math.ceil(wrap!.clientWidth / PX));
      const h = Math.max(1, Math.ceil(wrap!.clientHeight / PX));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        canvas!.style.width = `${w * PX}px`;
        canvas!.style.height = `${h * PX}px`;
      }
      gl?.viewport(0, 0, w, h);
      dirtyRef.current = true;
    }

    // Skyline: 0 at rest, 1 once scrolled a full section height away.
    // Terminal: 0 as its top enters the viewport, 1 when it reaches the top.
    // Called from the Lenis scroll tick, so the parallax transform lands in the
    // same frame as the content (see lenis-store).
    function measureProgress() {
      const rect = host.getBoundingClientRect();
      const next =
        view === 'skyline'
          ? Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)))
          : Math.max(0, Math.min(1, (window.innerHeight - rect.top) / Math.max(1, window.innerHeight)));
      if (view === 'skyline' && !reduceMotion) {
        scrolled = Math.max(0, Math.min(rect.height, -rect.top));
        wrap!.style.transform = `translate3d(0, ${(scrolled * PARALLAX).toFixed(1)}px, 0)`;
      }
      if (next !== progress) {
        progress = next;
        dirtyRef.current = true;
      }
    }

    function draw(now: number) {
      if (!gl) return;
      const w = canvas!.width;
      const h = canvas!.height;
      const hr = hourRef.current;
      const preset = getInterpolatedPreset(hr);
      const horizon = Math.floor(h * 0.86);
      const sun = arc((hr - 5) / 14, w, horizon, 0.9);
      // The moon is drawn by components/Moon.tsx, which travels the whole page.
      const moon: [number, number] | null = null;

      // On a narrow screen the copy spans the full width, so keep the sun in
      // the upper sky where it cannot sit behind it.
      if (w < 160) {
        if (sun) sun[1] = Math.min(sun[1], Math.round(h * 0.2));
      }

      gl.uniform2f(uniforms.uRes, w, h);
      gl.uniform1f(uniforms.uTime, reduceMotion ? 0 : (now - start) / 1000);
      gl.uniform1f(uniforms.uView, view === 'skyline' ? 0 : 1);
      gl.uniform3fv(uniforms.uSky, preset.skyColors.flatMap(hexToVec3));
      // Dark to light, so the shader can shade a cloud's belly and light its crest.
      const clouds = preset.cloudColors.map(hexToVec3).sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
      gl.uniform3fv(uniforms.uCloud, clouds.flat());
      gl.uniform3fv(uniforms.uGround, hexToVec3(preset.groundColor));
      gl.uniform3fv(uniforms.uAccent, hexToVec3(preset.accentColor));
      gl.uniform1f(uniforms.uLight, getLightLevel(hr));
      gl.uniform1f(uniforms.uStars, getStarVisibility(hr));
      gl.uniform3f(uniforms.uSun, sun?.[0] ?? 0, sun?.[1] ?? 0, sun ? Math.max(1, Math.round((h * 0.067) / 5)) : 0);
      gl.uniform3f(uniforms.uMoon, moon?.[0] ?? 0, moon?.[1] ?? 0, moon ? Math.max(1, Math.round((h * 0.045) / 5)) : 0);
      gl.uniform1f(uniforms.uMoonRight, moonRight);
      gl.uniform1f(uniforms.uProgress, reduceMotion && view === 'skyline' ? 0 : progress);
      gl.uniform1f(uniforms.uLift, scrolled / PX);
      gl.uniform1f(uniforms.uCut, (scrolled * PARALLAX) / PX);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // Runs only while the scene is on screen.
    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      const due = !reduceMotion && now - last >= 1000 / fps;
      if (!dirtyRef.current && !due) return;
      dirtyRef.current = false;
      last = now;
      draw(now);
    }

    if (!setup()) {
      const id = window.setTimeout(() => setFailed(true), 0);
      return () => window.clearTimeout(id);
    }

    // Paint once up front so the canvas is never a blank block, then start
    // rendering a little before the scene scrolls into view.
    draw(start);
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        cancelAnimationFrame(raf);
        if (visible) {
          measureProgress();
          dirtyRef.current = true;
          raf = requestAnimationFrame(loop);
        }
      },
      { rootMargin: '25% 0px' }
    );
    const offScroll = onLenisScroll(() => {
      if (visible) measureProgress();
    });
    visibility.observe(host);
    const resizer = new ResizeObserver(resize);
    resizer.observe(wrap);

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    const onRestored = () => {
      if (setup() && visible) raf = requestAnimationFrame(loop);
    };
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    return () => {
      cancelAnimationFrame(raf);
      visibility.disconnect();
      offScroll();
      resizer.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [view, fps]);

  // No WebGL: the skyline falls back to a flat sky; the terminal to nothing.
  const fallback = failed && view === 'skyline' ? getInterpolatedPreset(hour) : null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      data-scene={view}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={
        fallback
          ? { background: `linear-gradient(to bottom, ${fallback.skyColors[0]}, ${fallback.skyColors[12]} 70%, var(--color-v2-bg))` }
          : undefined
      }
    >
      {!failed && <canvas ref={canvasRef} className="block" style={{ imageRendering: 'pixelated' }} />}
    </div>
  );
}
