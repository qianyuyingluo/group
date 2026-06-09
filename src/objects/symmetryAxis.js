import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';
import { createLabel } from './labels.js';

const Y_AXIS = new THREE.Vector3(0, 1, 0);

export function createSymmetryAxis({
  direction,
  label = 'C',
  length = 3.0,
  color = COLORS.axisPrimary,
  dashed = false,
  radius = SIZES.axisRadius,
}) {
  const group = new THREE.Group();
  const axis = direction.clone().normalize();
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: new THREE.Color(color).multiplyScalar(0.32),
    roughness: 0.22,
    metalness: 0.08,
  });

  if (dashed) {
    const dashCount = 10;
    for (let i = 0; i < dashCount; i += 1) {
      if (i % 2 === 1) continue;
      const segmentLength = length / dashCount;
      const center = axis.clone().multiplyScalar(-length / 2 + segmentLength * (i + 0.5));
      const segment = makeCylinder(segmentLength, radius, material);
      segment.position.copy(center);
      segment.quaternion.setFromUnitVectors(Y_AXIS, axis);
      group.add(segment);
    }
  } else {
    const shaft = makeCylinder(length, radius, material);
    shaft.quaternion.setFromUnitVectors(Y_AXIS, axis);
    group.add(shaft);
  }

  const cone = new THREE.Mesh(new THREE.ConeGeometry(radius * 4.2, radius * 11, 32), material);
  cone.position.copy(axis.clone().multiplyScalar(length / 2 + radius * 4));
  cone.quaternion.setFromUnitVectors(Y_AXIS, axis);
  group.add(cone);

  group.add(createLabel(label, axis.clone().multiplyScalar(length / 2 + 0.28), 'scene-label axis-label'));
  group.userData.kind = 'symmetryAxis';
  return group;
}

function makeCylinder(length, radius, material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 24), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
