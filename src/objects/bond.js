import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';

const Y_AXIS = new THREE.Vector3(0, 1, 0);

export function createBond(start, end, radius = SIZES.bond, color = COLORS.bond) {
  const geometry = new THREE.CylinderGeometry(radius, radius, 1, 24);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.42,
    metalness: 0.05,
  });

  const bond = new THREE.Mesh(geometry, material);
  bond.castShadow = true;
  bond.receiveShadow = true;
  bond.userData.kind = 'bond';
  updateBond(bond, start, end);

  return bond;
}

export function updateBond(bond, start, end) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = Math.max(direction.length(), 0.0001);
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  bond.position.copy(midpoint);
  bond.scale.set(1, length, 1);
  bond.quaternion.setFromUnitVectors(Y_AXIS, direction.normalize());
}
