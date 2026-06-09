import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';
import { createBallStick } from '../objects/ballStick.js';
import { atom } from './helpers.js';

export function generateTetrahedral() {
  const r = 0.92;
  const vertices = [
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(1, -1, -1),
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(-1, -1, 1),
  ].map((point) => point.normalize().multiplyScalar(r));

  const atoms = [
    atom(new THREE.Vector3(0, 0, 0), COLORS.atoms.core, SIZES.atomLarge, 'Center'),
    ...vertices.map((position, index) => atom(position, COLORS.atoms.orange, SIZES.atom, `V${index + 1}`)),
  ];
  const bonds = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 3],
    [2, 4],
    [3, 4],
  ];

  return createBallStick({ atoms, bonds, name: 'tetrahedral-model' });
}

export function generateThModel() {
  const r = 0.9;
  const vertices = [
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(1, -1, -1),
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(-1, -1, 1),
  ].map((point) => point.normalize().multiplyScalar(r));
  const inverted = vertices.map((point) => point.clone().multiplyScalar(-1));
  const atoms = [
    atom(new THREE.Vector3(0, 0, 0), COLORS.atoms.core, SIZES.atomLarge, 'Center'),
    ...vertices.map((position, index) => atom(position, COLORS.atoms.orange, SIZES.atom, `T${index + 1}`)),
    ...inverted.map((position, index) => atom(position, COLORS.atoms.orange, SIZES.atom, `T${index + 1}'`)),
  ];
  const bonds = [
    ...Array.from({ length: 8 }, (_, index) => [0, index + 1]),
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 3],
    [2, 4],
    [3, 4],
    [5, 6],
    [5, 7],
    [5, 8],
    [6, 7],
    [6, 8],
    [7, 8],
  ];
  return createBallStick({ atoms, bonds, name: 'th-inversion-tetrahedra' });
}
