import * as THREE from 'three';
import { CAMERA } from '../config.js';

export function createCamera(width, height) {
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, width / height, CAMERA.near, CAMERA.far);
  camera.position.set(...CAMERA.position);
  return camera;
}
