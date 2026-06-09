import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';
import { createBallStick } from '../objects/ballStick.js';
import { atom, createRegularPolygonPoints, ringBonds } from './helpers.js';

export function generateCnv(n) {
  const base = createRegularPolygonPoints(n, 1.12, -0.48, Math.PI / n);
  const atoms = [
    atom(new THREE.Vector3(0, 0, 1.08), COLORS.atoms.blue, SIZES.atomLarge, 'Apex'),
    atom(new THREE.Vector3(0, 0, 0.08), COLORS.atoms.green, SIZES.atom, 'Core'),
    ...base.map((position, index) => atom(position, COLORS.atoms.gold, SIZES.atom, `B${index + 1}`)),
  ];

  const bonds = [
    [0, 1],
    ...base.map((_, index) => [0, index + 2]),
    ...base.map((_, index) => [1, index + 2]),
    ...ringBonds(2, n),
  ];

  return createBallStick({ atoms, bonds, name: `C${n}v-pyramid` });
}
