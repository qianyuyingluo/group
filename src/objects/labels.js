import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export function createLabel(text, position, className = 'scene-label') {
  const node = document.createElement('div');
  node.className = className;
  node.textContent = text;

  const label = new CSS2DObject(node);
  label.position.copy(position ?? new THREE.Vector3());
  label.userData.kind = 'label';
  label.userData.text = text;
  return label;
}
