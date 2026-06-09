import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';
import { createBallStick } from '../objects/ballStick.js';
import { atom } from './helpers.js';

export function generateOctahedral() {
  const r = 1.08;
  const vertices = [
    new THREE.Vector3(r, 0, 0),
    new THREE.Vector3(-r, 0, 0),
    new THREE.Vector3(0, r, 0),
    new THREE.Vector3(0, -r, 0),
    new THREE.Vector3(0, 0, r),
    new THREE.Vector3(0, 0, -r),
  ];
  const atoms = [
    atom(new THREE.Vector3(0, 0, 0), COLORS.atoms.core, SIZES.atomLarge, 'Center'),
    ...vertices.map((position, index) => atom(position, COLORS.atoms.blue, SIZES.atom, `O${index + 1}`)),
  ];
  const bonds = [
    ...vertices.map((_, index) => [0, index + 1]),
    [1, 3],
    [1, 4],
    [2, 3],
    [2, 4],
    [1, 5],
    [1, 6],
    [2, 5],
    [2, 6],
    [3, 5],
    [3, 6],
    [4, 5],
    [4, 6],
  ];
  return createBallStick({ atoms, bonds, name: 'octahedral-model' });
}
