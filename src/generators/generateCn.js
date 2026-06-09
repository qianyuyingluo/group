import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';
import { createBallStick, createCenterAtom } from '../objects/ballStick.js';
import { atom, colorForIndex, createRegularPolygonPoints, ringBonds, starBonds } from './helpers.js';

export function generateC1() {
  const atoms = [
    atom(new THREE.Vector3(-0.62, -0.35, 0.28), COLORS.atoms.red, SIZES.atomLarge, 'A'),
    atom(new THREE.Vector3(0.42, -0.1, -0.44), COLORS.atoms.blue, SIZES.atom, 'B'),
    atom(new THREE.Vector3(0.94, 0.48, 0.3), COLORS.atoms.gold, SIZES.atomSmall, 'C'),
    atom(new THREE.Vector3(-0.12, 0.72, 0.86), COLORS.atoms.green, SIZES.atom, 'D'),
  ];
  return createBallStick({ atoms, bonds: [[0, 1], [1, 2], [1, 3]], name: 'C1-asymmetric' });
}

export function generateCi() {
  const seeds = [
    new THREE.Vector3(0.9, 0.35, 0.55),
    new THREE.Vector3(0.38, -0.9, 0.18),
    new THREE.Vector3(0.18, 0.58, -0.86),
  ];
  const atoms = seeds.flatMap((point, index) => [
    atom(point.clone(), colorForIndex(index), SIZES.atom, `A${index + 1}`),
    atom(point.clone().multiplyScalar(-1), colorForIndex(index), SIZES.atom, `A${index + 1}'`),
  ]);
  return createBallStick({ atoms, bonds: [[0, 2], [2, 4], [1, 3], [3, 5], [0, 1]], name: 'Ci-inversion-pairs' });
}

export function generateCs() {
  const atoms = [
    atom(new THREE.Vector3(0, 0, 0.15), COLORS.atoms.core, SIZES.atomLarge, 'Center'),
    atom(new THREE.Vector3(0.82, 0.42, -0.28), COLORS.atoms.red, SIZES.atom, 'A'),
    atom(new THREE.Vector3(0.82, -0.42, -0.28), COLORS.atoms.red, SIZES.atom, "A'"),
    atom(new THREE.Vector3(-0.62, 0.55, 0.58), COLORS.atoms.blue, SIZES.atomSmall, 'B'),
    atom(new THREE.Vector3(-0.62, -0.55, 0.58), COLORS.atoms.blue, SIZES.atomSmall, "B'"),
  ];
  return createBallStick({ atoms, bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 3], [2, 4]], name: 'Cs-mirror-pairs' });
}

export function generateCn(n) {
  const center = createCenterAtom(new THREE.Vector3(0, 0, 0), { name: 'Center' });
  const ring = createRegularPolygonPoints(n, 1.05, -0.12, Math.PI / n).map((position, index) => atom(position, COLORS.atoms.gold, SIZES.atom, `R${index + 1}`));
  const top = atom(new THREE.Vector3(0, 0, 1.05), COLORS.atoms.green, SIZES.atomSmall, 'Top');
  const bottom = atom(new THREE.Vector3(0, 0, -1.05), COLORS.atoms.violet, SIZES.atomSmall, 'Bottom');
  const atoms = [center, top, bottom, ...ring];
  const bonds = [[0, 1], [0, 2], ...starBonds(0, 3, n), ...ringBonds(3, n)];
  return createBallStick({ atoms, bonds, name: `C${n}-ring` });
}

export function generateCni(n) {
  const top = createRegularPolygonPoints(n, 0.98, 0.48, 0);
  const bottom = createRegularPolygonPoints(n, 0.98, -0.48, Math.PI);
  const atoms = [
    atom(new THREE.Vector3(0, 0, 0), COLORS.atoms.core, SIZES.atomLarge, 'Center'),
    ...top.map((position, index) => atom(position, COLORS.atoms.blue, SIZES.atom, `U${index + 1}`)),
    ...bottom.map((position, index) => atom(position, COLORS.atoms.blue, SIZES.atom, `L${index + 1}`)),
  ];
  const bonds = [
    ...ringBonds(1, n),
    ...ringBonds(1 + n, n),
    ...Array.from({ length: n }, (_, index) => [0, 1 + index]),
    ...Array.from({ length: n }, (_, index) => [0, 1 + n + index]),
  ];
  return createBallStick({ atoms, bonds, name: `C${n}i-inversion-rings` });
}
