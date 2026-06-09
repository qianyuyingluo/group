import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';

export function createRegularPolygonPoints(n, radius, z = 0, phase = 0) {
  return Array.from({ length: n }, (_, i) => {
    const theta = phase + (2 * Math.PI * i) / n;
    return new THREE.Vector3(radius * Math.cos(theta), radius * Math.sin(theta), z);
  });
}

export function ringBonds(startIndex, n, close = true) {
  const bonds = [];
  for (let i = 0; i < n - 1; i += 1) bonds.push([startIndex + i, startIndex + i + 1]);
  if (close && n > 2) bonds.push([startIndex + n - 1, startIndex]);
  return bonds;
}

export function starBonds(centerIndex, startIndex, n) {
  return Array.from({ length: n }, (_, i) => [centerIndex, startIndex + i]);
}

export function atom(position, color, radius = SIZES.atom, name = 'atom') {
  return { position, color, radius, name };
}

export function colorForIndex(index) {
  const colors = [
    COLORS.atoms.red,
    COLORS.atoms.blue,
    COLORS.atoms.gold,
    COLORS.atoms.green,
    COLORS.atoms.violet,
    COLORS.atoms.orange,
  ];
  return colors[index % colors.length];
}
