// GLSL for the two pixel scenes: the hero skyline and the desk behind the
// contact section. Both are drawn in low-res "art pixel" space by one
// fragment shader; `uView` picks which. WebGL1 / GLSL ES 1.00.

import { hexToVec3 } from './pixel';

const c = (hex: string) => {
  const [r, g, b] = hexToVec3(hex);
  return `vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`;
};

export const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform float uView;
uniform vec3 uSky[16];
uniform vec3 uCloud[4];
uniform vec3 uGround;
uniform vec3 uAccent;
uniform float uLight;
uniform float uStars;
uniform vec3 uSun;
uniform vec3 uMoon;
uniform float uMoonRight;
// Skyline: how far the hero has scrolled away. Terminal: how far it has scrolled in.
uniform float uProgress;
// Skyline parallax, in art pixels: how far nearer layers have lifted, and how
// many rows the hero's bottom edge has already clipped off the scene.
uniform float uLift;
uniform float uCut;

// Page background the scenes dissolve into.
const vec3 PAGE = ${c('#07070a')};
// Rows over which a scene dithers out to the page.
const float FADE = 32.0;

// Pseudo-random value in [0, 1) for a pixel position. The multiplier is small
// and irrational-looking so whole-pixel inputs don't fall into a short cycle;
// a large one like 123.34 repeats every 50 pixels and tiles the starfield.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Ordered dither thresholds in [0, 1).
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

vec3 skyColor(float idx) {
  vec3 col = uSky[0];
  for (int k = 1; k < 16; k++) {
    if (float(k) <= idx) col = uSky[k];
  }
  return col;
}

vec3 cloudColor(float idx) {
  vec3 col = uCloud[0];
  for (int k = 1; k < 4; k++) {
    if (float(k) <= idx) col = uCloud[k];
  }
  return col;
}

// Square retro sun: concentric bands.
vec4 sunSprite(vec2 p) {
  if (uSun.z < 0.5) return vec4(0.0);
  vec2 l = floor((p - uSun.xy) / uSun.z) + 5.0;
  if (l.x < 0.0 || l.x > 9.0 || l.y < 0.0 || l.y > 9.0) return vec4(0.0);
  float ring = min(min(l.x, l.y), min(9.0 - l.x, 9.0 - l.y));
  vec3 col = ring < 0.5 ? ${c('#d75a12')} : ring < 1.5 ? ${c('#ffb52e')} : ring < 2.5 ? ${c('#ffd85a')} : ${c('#fff2a0')};
  return vec4(col, 1.0);
}

// Square moon with craters; the unlit half follows the real lunar phase.
vec4 moonSprite(vec2 p, vec3 at) {
  if (at.z < 0.5) return vec4(0.0);
  vec2 l = floor((p - at.xy) / at.z) + 5.0;
  if (l.x < 0.0 || l.x > 9.0 || l.y < 0.0 || l.y > 9.0) return vec4(0.0);
  float ring = min(min(l.x, l.y), min(9.0 - l.x, 9.0 - l.y));
  vec3 outline = ${c('#4b4660')};
  vec3 mid = ${c('#c3b79d')};
  vec3 light = ${c('#efe7cf')};
  vec3 dark = ${c('#7b718a')};
  vec3 crater = ${c('#8d7d68')};
  if (ring < 0.5) return vec4(outline, 1.0);
  if (ring < 1.5) return vec4(mid, 1.0);
  bool lit = uMoonRight > 0.5 ? l.x >= 5.0 : l.x < 5.0;
  if (!lit) return vec4(dark, 1.0);
  bool isCrater =
    (l.y == 2.0 && l.x >= 3.0 && l.x <= 5.0) ||
    (l.y == 3.0 && l.x == 2.0) ||
    (l.x == 7.0 && (l.y == 6.0 || l.y == 7.0)) ||
    (l.x == 4.0 && l.y == 6.0);
  bool isShade = (l.x >= 6.0 && l.y <= 3.0) || (l.x <= 3.0 && l.y >= 6.0);
  return vec4(isCrater ? crater : isShade ? dark : light, 1.0);
}

// One skyline layer. Each cell of width \`cw\` holds two buildings whose
// rooflines fall between topMin and topMax (fractions of the canvas height).
void skyline(
  vec2 p, float cw, float topMin, float topMax, float gap, float seed,
  vec2 win, vec3 body, float winAmt, float beacons, float lift, inout vec3 col
) {
  float lx = p.x + seed * 53.0;
  float cell = floor(lx / cw);
  float fx = lx - cell * cw;
  float split = floor(cw * (0.38 + 0.24 * hash(vec2(cell, seed))));
  float isR = step(split, fx);
  float bid = cell * 2.0 + isR;
  float bx = fx - isR * split;
  float bw = mix(split, cw - split, isR) - gap;
  if (bx >= bw) return;

  float dy = p.y + floor(uLift * lift) - floor(uRes.y * mix(topMin, topMax, hash(vec2(bid, seed + 1.0))));
  float roof = hash(vec2(bid, seed + 2.0));

  if (dy < 0.0) {
    // Rooftop furniture above the roofline.
    float ax = floor(bw * 0.5);
    if (roof > 0.78) {
      if (bx == ax && dy >= -8.0) { col = body; return; }
      if (beacons > 0.5 && bx == ax && dy == -9.0 && mod(floor(uTime + roof * 10.0), 2.0) < 1.0) {
        col = ${c('#ff4033')};
      }
    } else if (roof > 0.5) {
      if (bx >= 2.0 && bx < bw - 2.0 && dy >= -4.0) col = body;
    } else if (roof > 0.38) {
      if (bx >= 1.0 && bx < 5.0 && dy >= -3.0) col = body;
    }
    return;
  }

  col = bx < 1.0 ? body * 1.3 + 0.012 : body;

  float wx = bx - 2.0;
  float wy = dy - 3.0;
  if (wx >= 0.0 && wy >= 0.0 && bx < bw - 2.0) {
    vec2 wc = floor(vec2(wx, wy) / win);
    vec2 wf = vec2(wx, wy) - wc * win;
    float tall = win.y > 3.5 ? 2.0 : 1.0;
    if (wf.x < 1.0 && wf.y < tall) {
      float hw = hash(wc + vec2(bid * 3.7, seed * 9.1));
      float chance = 0.06 + 0.2 * uLight;
      // A sparse subset of windows switches on and off, slowly.
      float flick = hash(wc + vec2(bid, floor(uTime * 0.2 + hw * 8.0)));
      if (hw < chance && !(hw < chance * 0.25 && flick < 0.35)) {
        vec3 wcol = vec3(1.0, 0.92 - 0.14 * uLight, 0.70 - 0.27 * uLight);
        col = mix(body, wcol, winAmt * (0.45 + 0.55 * uLight));
      }
    }
  }
}

vec3 skylineScene(vec2 p) {
  float H = uRes.y;

  // Sky: 16 palette colours, dithered between neighbours.
  float horizon = floor(H * 0.86);
  float t = clamp(p.y / horizon, 0.0, 0.999);
  float f = pow(t, 1.3) * 15.0;
  float band = floor(f) + step(bayer4(p) + 0.03, clamp((fract(f) - 0.25) / 0.75, 0.0, 1.0));
  vec3 col = p.y < horizon ? skyColor(band) : uGround;

  if (uStars > 0.01 && p.y < horizon * 0.8) {
    float h = hash(p);
    if (h < 0.0035 * (1.0 - t * 0.8)) {
      float b = hash(p + 17.0);
      float tw = floor((0.6 + 0.4 * sin(uTime * 1.4 + b * 40.0)) * 4.0) / 4.0;
      vec3 tint = b > 0.85 ? vec3(1.0, 0.82, 0.59) : b > 0.55 ? vec3(0.78, 0.73, 0.92) : vec3(0.69, 0.78, 0.94);
      col = mix(col, tint, (0.3 + 0.7 * b) * tw * uStars);
    }
  }

  // Clouds drifting in three rows, each row at its own speed. Every cloud is a
  // flat-bottomed base under four bumps of its own sizes and spacing, so no two
  // share a silhouette; the crest catches the light and the belly is in shade.
  float cloudY = p.y - floor(H * 0.08);
  float row = floor(cloudY / 20.0);
  if (row >= 0.0 && row < 3.0) {
    float cx = p.x + floor(uTime * (1.2 + row * 0.8)) + row * 41.0;
    float cell = floor(cx / 112.0);
    vec2 id = vec2(cell, row * 7.0 + 3.0);
    if (hash(id) > 0.4) {
      float w = 26.0 + floor(hash(id + 1.0) * 46.0);
      float lx = cx - cell * 112.0 - floor(hash(id + 2.0) * (112.0 - w));
      // Height above the cloud's flat bottom.
      float up = row * 20.0 + 13.0 + floor(hash(id + 3.0) * 6.0) - cloudY;
      if (lx >= 0.0 && lx < w && up >= 0.0) {
        float top = lx >= 2.0 && lx < w - 2.0 ? 2.0 : 0.0;
        for (int k = 0; k < 4; k++) {
          float fk = float(k);
          float c = w * (fk + 0.5) / 4.0 + (hash(id + 20.0 + fk) - 0.5) * 6.0;
          float r = min(3.0 + floor(hash(id + 10.0 + fk) * 7.0), min(c, w - c));
          float dx = lx - c;
          if (abs(dx) < r) top = max(top, floor(sqrt(r * r - dx * dx) + 0.5));
        }
        // uCloud is sorted dark to light.
        if (up < top) col = cloudColor(up >= top - 1.5 ? 3.0 : up < 1.0 ? 0.0 : 1.0 + step(0.5, hash(id + 5.0)));
      }
    }
  }

  // A shooting star every few seconds, once the stars are out: a short streak
  // falling down and to the left from a different spot each time.
  float shot = floor(uTime / 7.0);
  float shotAge = uTime - shot * 7.0;
  if (uStars > 0.3 && shotAge < 0.6) {
    vec2 head = floor(vec2(uRes.x * (0.25 + 0.7 * hash(vec2(shot, 1.0))), H * (0.04 + 0.2 * hash(vec2(shot, 2.0)))) + vec2(-90.0, 45.0) * shotAge);
    for (int k = 0; k < 8; k++) {
      float fk = float(k);
      if (p.y == head.y - fk && p.x >= head.x + fk * 2.0 && p.x < head.x + fk * 2.0 + 2.0) {
        col = mix(col, vec3(1.0, 0.96, 0.88), (1.0 - fk / 8.0) * uStars);
      }
    }
  }

  // Sun and moon, each inside a dithered halo.
  float sd = max(abs(p.x - uSun.x), abs(p.y - uSun.y)) / max(uSun.z, 1.0);
  if (uSun.z > 0.5 && sd < 9.0 && (1.0 - (sd - 5.0) / 4.0) * 0.55 > bayer4(p)) col = mix(col, vec3(1.0, 0.73, 0.25), 0.22);
  float md = max(abs(p.x - uMoon.x), abs(p.y - uMoon.y)) / max(uMoon.z, 1.0);
  if (uMoon.z > 0.5 && md < 8.0 && (1.0 - (md - 5.0) / 3.0) * 0.45 > bayer4(p)) col = mix(col, vec3(0.86, 0.83, 0.75), 0.14);
  vec4 moon = moonSprite(p, uMoon);
  col = mix(col, moon.rgb, moon.a);
  vec4 sun = sunSprite(p);
  col = mix(col, sun.rgb, sun.a);

  // A plane crossing the sky: a short fuselage and a blinking light.
  float planeX = mod(floor(uTime * 10.0), uRes.x + 240.0) - 60.0;
  if (p.y == floor(H * 0.08)) {
    if (p.x >= planeX && p.x < planeX + 3.0) col = mix(col, vec3(0.62, 0.64, 0.72), 0.5 + 0.3 * uLight);
    if (p.x == planeX + 3.0 && mod(floor(uTime * 2.0), 2.0) < 1.0) col = ${c('#ff4033')};
  }

  // Four layers that fade toward the sky colour with distance. Nearer layers
  // lift faster on scroll, so the skylines separate.
  vec3 haze = skyColor(13.0);
  vec3 nearCol = ${c('#050912')};
  skyline(p, 26.0, 0.50, 0.74, 0.0, 1.0, vec2(2.0, 3.0), mix(nearCol, haze, 0.55), 0.45, 0.0, 0.02, col);
  skyline(p, 34.0, 0.60, 0.84, 0.0, 2.0, vec2(3.0, 3.0), mix(nearCol, haze, 0.34), 0.65, 0.0, 0.05, col);
  skyline(p, 44.0, 0.72, 0.92, 3.0, 3.0, vec2(3.0, 4.0), mix(nearCol, haze, 0.16), 0.85, 1.0, 0.09, col);
  skyline(p, 64.0, 0.86, 1.04, 14.0, 4.0, vec2(3.0, 4.0), nearCol, 1.0, 1.0, 0.14, col);

  // Dissolve into the page above the hero's bottom edge. The dither band grows
  // as the hero leaves, so by the end the whole scene is breaking up.
  float fade = FADE + uProgress * H * 0.45;
  if ((H - uCut - 1.0 - p.y) / fade < bayer4(p) + 0.03) col = PAGE;
  return col;
}

// The closing scene: a desk on a rooftop under the night sky, seen front-on,
// with the city low on the horizon behind it. It is always night here,
// whatever the clock says. The monitor is off until the section scrolls in,
// then boots and fills with code line by line.
vec3 deskScene(vec2 p) {
  float W = uRes.x;
  float H = uRes.y;
  // Side by side with the contact copy only from 1200px (300 art px) up —
  // narrower than that the copy is full width, so the desk goes underneath it.
  // Side by side, it is a little smaller and sits against the right edge so it
  // stays clear of the links.
  bool narrow = W < 300.0;
  float dw = narrow ? min(150.0, W - 8.0) : 120.0;
  float cx = narrow ? floor(W * 0.5) : W - 10.0 - floor(dw * 0.5);
  float floorY = H - 12.0;
  float left = cx - floor(dw * 0.5);
  float right = left + dw;
  float deskY = floorY - 42.0;
  float mw = min(72.0, dw - 24.0);
  float mh = floor(mw * 0.62);
  float mx = cx - floor(mw * 0.5) - 6.0;
  float my = deskY - 9.0 - mh;
  float mcx = mx + floor(mw * 0.5);
  float boot = clamp((uProgress - 0.35) / 0.5, 0.0, 1.0);
  bool on = boot > 0.0;

  // Night sky with no frame: it eases out of the page colour at the top, so the
  // section has no visible edge, into the night palette's bands lower down.
  float t = clamp(p.y / floorY, 0.0, 0.999);
  float f = pow(t, 1.3) * 15.0;
  vec3 col = skyColor(floor(f) + step(bayer4(p) + 0.03, clamp((fract(f) - 0.25) / 0.75, 0.0, 1.0)));
  col = mix(PAGE, col, smoothstep(0.0, H * 0.4, p.y));

  // Starfield. It thins out toward the top edge, and it fills in as the
  // section scrolls into view: every star has its own moment to switch on.
  float h = hash(p);
  if (h < 0.0022 * smoothstep(0.0, 0.3, t) * (1.0 - t * 0.5) && hash(p + 71.0) < uProgress * 1.5) {
    float b = hash(p + 17.0);
    float tw = floor((0.6 + 0.4 * sin(uTime * 1.4 + b * 40.0)) * 4.0) / 4.0;
    vec3 tint = b > 0.85 ? vec3(1.0, 0.82, 0.59) : b > 0.55 ? vec3(0.78, 0.73, 0.92) : vec3(0.69, 0.78, 0.94);
    col = mix(col, tint, (0.3 + 0.7 * b) * tw);
  }

  // No moon here: the page's moon (components/Moon.tsx) settles into this sky.

  // The city, far off on the horizon: two rows of the hero's buildings, the
  // back row taller and hazier. The rooftop below covers their feet.
  vec3 haze = skyColor(13.0);
  vec3 nearCol = ${c('#050912')};
  skyline(p, 30.0, (floorY - 40.0) / H, (floorY - 18.0) / H, 0.0, 7.0, vec2(2.0, 3.0), mix(nearCol, haze, 0.45), 0.5, 1.0, 0.0, col);
  skyline(p, 40.0, (floorY - 24.0) / H, (floorY - 8.0) / H, 2.0, 8.0, vec2(3.0, 3.0), mix(nearCol, haze, 0.15), 0.8, 0.0, 0.0, col);

  // Rooftop.
  if (p.y >= floorY) col = p.y < floorY + 1.0 ? ${c('#262636')} : ${c('#0a0a10')};

  // Desk: top, two legs, a drawer.
  if (p.x >= left && p.x < right && p.y >= deskY && p.y < deskY + 3.0) {
    col = p.y < deskY + 1.0 ? ${c('#5a4658')} : ${c('#3a2c3c')};
  }
  if (p.y >= deskY + 3.0 && p.y < floorY) {
    if ((p.x >= left + 3.0 && p.x < left + 6.0) || (p.x >= right - 6.0 && p.x < right - 3.0)) col = ${c('#2a2030')};
    if (p.x >= right - 34.0 && p.x < right - 6.0 && p.y < deskY + 20.0) {
      col = p.y >= deskY + 19.0 ? ${c('#221a28')} : ${c('#33273a')};
      if (p.y == deskY + 11.0 && p.x >= right - 23.0 && p.x < right - 17.0) col = ${c('#8a7da0')};
    }
  }

  // Monitor stand.
  if (p.x >= mcx - 3.0 && p.x < mcx + 3.0 && p.y >= my + mh && p.y < deskY - 2.0) col = ${c('#1c1c28')};
  if (p.x >= mcx - 12.0 && p.x < mcx + 12.0 && p.y >= deskY - 2.0 && p.y < deskY) col = ${c('#2a2a3a')};

  // Monitor.
  vec2 m = p - vec2(mx, my);
  if (m.x >= 0.0 && m.x < mw && m.y >= 0.0 && m.y < mh) {
    if (m.x < 2.0 || m.x >= mw - 2.0 || m.y < 2.0 || m.y >= mh - 2.0) {
      col = m.y < 1.0 ? ${c('#3a3a4a')} : ${c('#1c1c28')};
      if (m.x == mw - 4.0 && m.y == mh - 1.0) col = on ? ${c('#36c2a8')} : ${c('#e2522b')};
    } else {
      col = on ? ${c('#0b1020')} : ${c('#06070c')};
      vec2 t = m - 4.0;
      float lines = floor((mh - 8.0) / 4.0);
      float line = floor(t.y / 4.0);
      // Lines already written, plus one still being typed.
      float written = min(floor(boot * lines), lines - 1.0);
      if (on && t.x >= 0.0 && t.x < mw - 8.0 && line >= 0.0 && line <= written && t.y - line * 4.0 < 2.0) {
        float cxl = t.x - floor(hash(vec2(line, 3.0)) * 3.0) * 4.0;
        float len = 10.0 + floor(hash(vec2(line, 7.0)) * (mw - 30.0));
        float typed = line < written ? len : min(len, mod(floor(uTime * 10.0), len + 14.0));
        if (cxl >= 0.0 && cxl < typed) {
          float word = floor(cxl / 6.0);
          if (cxl - word * 6.0 < 5.0) {
            float hc = hash(vec2(word, line));
            col = (hc < 0.3 ? uAccent : hc < 0.55 ? ${c('#36c2a8')} : hc < 0.8 ? ${c('#8a7da0')} : ${c('#f5e9d8')}) * 0.85;
          }
        }
        if (line == written && cxl >= typed && cxl < typed + 2.0 && mod(floor(uTime * 2.0), 2.0) < 1.0) col = ${c('#f5e9d8')};
      }
    }
  }

  // Keyboard and mouse.
  if (p.x >= mcx - 20.0 && p.x < mcx + 16.0 && p.y >= deskY - 3.0 && p.y < deskY) {
    col = p.y < deskY - 1.0 && mod(p.x, 2.0) < 1.0 ? ${c('#4a4770')} : ${c('#1c1c28')};
  }
  if (p.x >= mcx + 20.0 && p.x < mcx + 24.0 && p.y >= deskY - 2.0 && p.y < deskY) col = ${c('#4a4770')};

  // Mug, with steam.
  float mugX = mx + mw + 8.0;
  if (p.x >= mugX && p.x < mugX + 6.0 && p.y >= deskY - 8.0 && p.y < deskY) {
    col = p.x >= mugX + 5.0 ? ${c('#8d7d68')} : ${c('#c3b79d')};
  }
  if (p.x == mugX + 7.0 && p.y >= deskY - 6.0 && p.y < deskY - 2.0) col = ${c('#8d7d68')};
  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    float sx = mugX + 2.0 + (mod(floor(uTime * 1.5) + fk, 2.0) < 1.0 ? 0.0 : 1.0);
    if (p.x == sx && p.y == deskY - 11.0 - fk * 2.0) col = mix(col, ${c('#8a7da0')}, 0.6 - fk * 0.12);
  }

  // Plant, where there is room for one.
  if (!narrow) {
    float potX = left + 10.0;
    float up = deskY - 6.0 - p.y;
    float lx = p.x - (potX + 3.5);
    if (up > 0.0 && up < 13.0 && abs(lx) < 1.0 + up * 0.45 && hash(vec2(p.x, floor(p.y / 2.0))) > 0.35) {
      col = hash(p + 2.0) > 0.5 ? ${c('#36c2a8')} : ${c('#1f6b5e')};
    }
    float inset = p.y >= deskY - 3.0 ? 1.0 : 0.0;
    if (p.x >= potX + inset && p.x < potX + 7.0 - inset && p.y >= deskY - 6.0 && p.y < deskY) col = ${c('#b06a4a')};
  }

  // Office chair, pushed in at the desk and swivelling idly from side to side.
  // Seen from behind: the backrest narrows and slides as it turns, and the arms
  // and wheels follow the same angle.
  float sway = sin(uTime * 0.7) * 1.1;
  float turn = abs(cos(sway));
  float chx = mcx - 2.0;
  float seatY = deskY + 12.0;
  float backTop = deskY - 6.0;
  float bcx = chx + floor(sin(sway) * 4.0 + 0.5);
  float bw = max(2.0, floor(9.0 * turn + 0.5));
  float ax = floor(9.0 * turn + 0.5);
  vec3 chairEdge = ${c('#3a3a52')};
  vec3 chairBody = ${c('#24243a')};
  vec3 chairMetal = ${c('#1c1c28')};
  // Column and base.
  if (p.x >= chx - 1.0 && p.x < chx + 1.0 && p.y >= seatY + 3.0 && p.y < floorY - 3.0) col = chairMetal;
  if (p.y == floorY - 3.0 && abs(p.x - chx) < 8.0) col = ${c('#2a2a3a')};
  for (int k = 0; k < 3; k++) {
    float wx = chx + floor(sin(sway + float(k) * 2.094) * 7.0 + 0.5);
    if (p.x >= wx - 1.0 && p.x < wx + 1.0 && p.y >= floorY - 2.0 && p.y < floorY) col = chairMetal;
  }
  // Seat.
  if (p.y >= seatY && p.y < seatY + 3.0 && abs(p.x - chx) < 8.0 + floor(2.0 * (1.0 - turn))) {
    col = p.y == seatY ? chairEdge : chairBody;
  }
  // Arms: a post and a pad on each side.
  for (int k = 0; k < 2; k++) {
    float side = k == 0 ? -1.0 : 1.0;
    float px0 = chx + side * ax;
    if (p.x == px0 && p.y >= seatY - 4.0 && p.y < seatY) col = chairMetal;
    if (p.y == seatY - 4.0 && abs(p.x - px0) < 2.0) col = chairEdge;
  }
  // Backrest, with rounded top corners and a lit rim.
  float bx = abs(p.x - bcx);
  if (p.y >= backTop && p.y < seatY - 1.0 && bx < bw && !(p.y == backTop && bx >= bw - 1.0)) {
    col = bx >= bw - 1.0 || p.y == backTop ? chairEdge : chairBody;
  }
  if (p.y == seatY - 1.0 && abs(p.x - bcx) < 1.0) col = chairMetal;

  return col;
}

void main() {
  vec2 p = vec2(floor(gl_FragCoord.x), uRes.y - 1.0 - floor(gl_FragCoord.y));
  if (uView > 0.5) {
    gl_FragColor = vec4(deskScene(p), 1.0);
    return;
  }
  gl_FragColor = vec4(skylineScene(p), 1.0);
}
`;
