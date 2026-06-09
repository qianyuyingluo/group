import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';
import { createBallStick, createCenterAtom } from '../objects/ballStick.js';
import { atom, createRegularPolygonPoints, ringBonds, starBonds } from './helpers.js';

export function generateCnh(n) {
  const center = createCenterAtom(new THREE.Vector3(0, 0, 0), { name: 'Center', radius: SIZES.atom });
  const outer = createRegularPolygonPoints(n, 1.18, 0, Math.PI / n).map((position, index) => atom(position, COLORS.atoms.blue, SIZES.atom, `P${index + 1}`));
  const inner = n > 2
    ? createRegularPolygonPoints(n, 0.58, 0, Math.PI / n + Math.PI / n).map((position, index) => atom(position, COLORS.atoms.core, SIZES.atomSmall, `Q${index + 1}`))
    : [];
  const atoms = [center, ...outer, ...inner];
  const bonds = [
    ...starBonds(0, 1, n),
    ...ringBonds(1, n),
    ...inner.map((_, index) => [0, 1 + n + index]),
  ];
  return createBallStick({ atoms, bonds, name: `C${n}h-planar` });
}

export function generateSn(n) {
  const upper = createRegularPolygonPoints(n, 1.0, 0.48, 0);
  const lower = createRegularPolygonPoints(n, 1.0, -0.48, (2 * Math.PI) / n);
  const atoms = [
    ...upper.map((position, index) => atom(position, COLORS.atoms.violet, SIZES.atom, `U${index + 1}`)),
    ...lower.map((position, index) => atom(position, COLORS.atoms.violet, SIZES.atom, `L${index + 1}`)),
  ];
  const bonds = [
    ...ringBonds(0, n),
    ...ringBonds(n, n),
    ...Array.from({ length: n }, (_, index) => [index, n + index]),
    ...Array.from({ length: n }, (_, index) => [index, n + ((index + n - 1) % n)]),
  ];
  return createBallStick({ atoms, bonds, name: `S${n}-staggered` });
}
