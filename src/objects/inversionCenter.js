import * as THREE from 'three';
import { COLORS } from '../config.js';
import { createLabel } from './labels.js';

export function createInversionCenter(label = 'i') {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color: COLORS.inversion,
    transparent: true,
    opacity: 0.95,
  });
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.inversion,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.09, 32, 16), material);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 16), haloMaterial);
  group.add(halo, core);
  if (label) {
    group.add(createLabel(label, new THREE.Vector3(0.16, 0.16, 0.16), 'scene-label inversion-label'));
  }
  group.userData.kind = 'inversionCenter';
  return group;
}
