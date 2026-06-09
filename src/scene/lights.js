import * as THREE from 'three';

export function addLights(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.68);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  scene.add(key);

  const rim = new THREE.PointLight(0x55ccff, 1.7, 12);
  rim.position.set(-3.8, 1.8, -3.2);
  scene.add(rim);

  const warm = new THREE.PointLight(0xffa657, 0.85, 9);
  warm.position.set(2.6, -1.2, 3.4);
  scene.add(warm);
}
