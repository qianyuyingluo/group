import * as THREE from 'three';
import { SIZES } from '../config.js';

export function createAtom(position, radius = SIZES.atom, color = 0xffffff, name = 'atom') {
  const geometry = new THREE.SphereGeometry(radius, 40, 24);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.32,
    metalness: 0.08,
  });

  const atom = new THREE.Mesh(geometry, material);
  atom.position.copy(position);
  atom.castShadow = true;
  atom.receiveShadow = true;
  atom.userData.name = name;
  atom.userData.kind = 'atom';
  atom.userData.radius = radius;
  atom.userData.color = color;

  return atom;
}
