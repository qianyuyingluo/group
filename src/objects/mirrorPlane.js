import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';
import { createLabel } from './labels.js';

const Z_AXIS = new THREE.Vector3(0, 0, 1);

export function createMirrorPlane({
  normal,
  label = 'σ',
  size = SIZES.mirrorSize,
  color = COLORS.mirror,
  opacity = 0.18,
}) {
  const group = new THREE.Group();
  const n = normal.clone().normalize();
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.quaternion.setFromUnitVectors(Z_AXIS, n);
  group.add(plane);

  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: Math.min(opacity + 0.28, 0.75) }),
  );
  edge.quaternion.copy(plane.quaternion);
  group.add(edge);

  if (label) {
    const labelPosition = vectorOnPlane(n).multiplyScalar(size * 0.36);
    group.add(createLabel(label, labelPosition, 'scene-label mirror-label'));
  }
  group.userData.kind = 'mirrorPlane';
  return group;
}

function vectorOnPlane(normal) {
  const candidate = Math.abs(normal.z) > 0.8 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
  return candidate.sub(normal.clone().multiplyScalar(candidate.dot(normal))).normalize();
}
