import * as THREE from 'three';
import { normalized, vec3, verticalPlaneNormal } from './vectors.js';

export function identityMatrix() {
  return new THREE.Matrix4().identity();
}

export function rotationMatrix(axis, theta) {
  const q = new THREE.Quaternion();
  q.setFromAxisAngle(axis.clone().normalize(), theta);

  const m = new THREE.Matrix4();
  m.makeRotationFromQuaternion(q);
  return m;
}

export function Cn(axis, n, k = 1) {
  return rotationMatrix(axis.clone().normalize(), (2 * Math.PI * k) / n);
}

export function inversionMatrix() {
  return new THREE.Matrix4().set(
    -1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, -1, 0,
    0, 0, 0, 1,
  );
}

// Reflection in a plane through the origin. The plane is defined by its normal.
export function reflectionMatrix(normal) {
  const n = normal.clone().normalize();
  const { x, y, z } = n;

  return new THREE.Matrix4().set(
    1 - 2 * x * x, -2 * x * y, -2 * x * z, 0,
    -2 * y * x, 1 - 2 * y * y, -2 * y * z, 0,
    -2 * z * x, -2 * z * y, 1 - 2 * z * z, 0,
    0, 0, 0, 1,
  );
}

export function verticalMirrorMatrix(phi) {
  return reflectionMatrix(verticalPlaneNormal(phi));
}

// Sn = Cn rotation followed by reflection through the plane normal to axis.
export function Sn(axis, n, k = 1) {
  const rotation = Cn(axis, n, k);
  const mirror = reflectionMatrix(axis);
  return mirror.multiply(rotation);
}

export function operationMatrix(operation) {
  switch (operation.type) {
    case 'identity':
      return identityMatrix();
    case 'rotation':
      return Cn(normalized(operation.axis), operation.n, operation.k ?? 1);
    case 'inversion':
      return inversionMatrix();
    case 'reflectionHorizontal':
      return reflectionMatrix(new THREE.Vector3(0, 0, 1));
    case 'reflectionVertical':
      return verticalMirrorMatrix(operation.angle ?? 0);
    case 'reflectionPlane':
      return reflectionMatrix(normalized(operation.normal));
    case 'improper':
      return Sn(normalized(operation.axis), operation.n, operation.k ?? 1);
    case 'rotationInversion': {
      const inversion = inversionMatrix();
      return inversion.multiply(Cn(normalized(operation.axis), operation.n, operation.k ?? 1));
    }
    default:
      return identityMatrix();
  }
}

export function operationAxis(operation) {
  if (operation.axis) return normalized(operation.axis);
  if (operation.type === 'reflectionVertical') return new THREE.Vector3(0, 0, 1);
  return vec3([0, 0, 1]);
}

export function operationPlaneNormal(operation) {
  if (operation.type === 'reflectionHorizontal') return new THREE.Vector3(0, 0, 1);
  if (operation.type === 'reflectionVertical') return verticalPlaneNormal(operation.angle ?? 0);
  if (operation.type === 'reflectionPlane') return normalized(operation.normal);
  if (operation.type === 'improper') return normalized(operation.axis);
  return null;
}
