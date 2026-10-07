// Shared pixel-grid helpers. Everything on the page snaps to this unit: one
// scene "art pixel" is PX CSS pixels, and the pixel font is only ever set at
// multiples of 16px so its dots land on 1 / 2 / 4 / 8 px.

export const PX = 4;

export function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

export const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
