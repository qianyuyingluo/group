import * as THREE from 'three';

export function vec3(value, fallback = [0, 0, 1]) {
  const source = Array.isArray(value) ? value : fallback;
  return new THREE.Vector3(source[0], source[1], source[2]);
}

export function normalized(value, fallback = [0, 0, 1]) {
  return vec3(value, fallback).normalize();
}

export function horizontalAxis(angle) {
  return new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).normalize();
}

export function verticalPlaneNormal(angle) {
  return new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0).normalize();
}
