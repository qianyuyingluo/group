import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';
import { createBallStick } from '../objects/ballStick.js';
import { atom, createRegularPolygonPoints, ringBonds } from './helpers.js';

export function generateDn(n) {
  return doubleRing(n, 0.56, 0, `D${n}-double-ring`);
}

export function generateDnh(n) {
  return doubleRing(n, 0.56, 0, `D${n}h-horizontal-double-ring`);
}

export function generateDnd(n) {
  return doubleRing(n, 0.62, Math.PI / n, `D${n}d-staggered-double-ring`);
}

function doubleRing(n, z, phaseOffset, name) {
  const top = createRegularPolygonPoints(n, 1.03, z, 0);
  const bottom = createRegularPolygonPoints(n, 1.03, -z, phaseOffset);
  const atoms = [
    atom(new THREE.Vector3(0, 0, 0), COLORS.atoms.core, SIZES.atomLarge, 'Center'),
    ...top.map((position, index) => atom(position, COLORS.atoms.blue, SIZES.atom, `U${index + 1}`)),
    ...bottom.map((position, index) => atom(position, COLORS.atoms.blue, SIZES.atom, `L${index + 1}`)),
  ];
  const bonds = [
    ...ringBonds(1, n),
    ...ringBonds(1 + n, n),
    ...Array.from({ length: n }, (_, index) => [1 + index, 1 + n + index]),
    ...Array.from({ length: n }, (_, index) => [0, 1 + index]),
    ...Array.from({ length: n }, (_, index) => [0, 1 + n + index]),
  ];
  return createBallStick({ atoms, bonds, name });
}
