import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createControls(camera, element) {
  const controls = new OrbitControls(camera, element);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.68;
  controls.zoomSpeed = 0.78;
  controls.panSpeed = 0.62;
  controls.screenSpacePanning = false;
  controls.minDistance = 2.4;
  controls.maxDistance = 10;
  controls.target.set(0, 0, 0);
  return controls;
}
