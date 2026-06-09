import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';
import { operationAxis, operationMatrix, operationPlaneNormal, reflectionMatrix } from '../math/operations.js';
import { updateBallStickBonds } from '../objects/ballStick.js';

export async function animateOperation(model, operation, overlayGroup, options = {}) {
  if (!model) return;
  const atoms = model.userData.atomMeshes ?? [];
  if (atoms.length === 0) return;

  clearOverlay(overlayGroup);
  const startPositions = atoms.map((atom) => atom.position.clone());
  const matrix = operationMatrix(operation);
  const targetPositions = startPositions.map((position) => position.clone().applyMatrix4(matrix));

  if (operation.type === 'identity') {
    return;
  }

  addGhost(startPositions, overlayGroup);
  addTrajectories(startPositions, targetPositions, overlayGroup);

  const duration = options.duration ?? 900;

  if (operation.type === 'rotation') {
    const axis = operationAxis(operation);
    const angle = (2 * Math.PI * (operation.k ?? 1)) / operation.n;
    await animateRotationPositions(model, startPositions, axis, angle, duration);
    return;
  }

  if (operation.type === 'improper') {
    const axis = operationAxis(operation);
    const angle = (2 * Math.PI * (operation.k ?? 1)) / operation.n;
    await animateRotationPositions(model, startPositions, axis, angle, duration * 0.52);
    const afterRotation = atoms.map((atom) => atom.position.clone());
    const normal = operationPlaneNormal(operation) ?? axis;
    const mirror = reflectionMatrix(normal);
    const reflected = afterRotation.map((position) => position.clone().applyMatrix4(mirror));
    await animateLinearPositions(model, afterRotation, reflected, duration * 0.48);
    return;
  }

  await animateLinearPositions(model, startPositions, targetPositions, duration);
}

export function clearOverlay(group) {
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
    child.traverse((node) => {
      node.element?.remove?.();
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) node.material.forEach((material) => material.dispose?.());
      else node.material?.dispose?.();
    });
  }
}

function animateRotationPositions(model, startPositions, axis, angle, duration) {
  return tween(duration, (t) => {
    const eased = easeInOutCubic(t);
    const matrix = new THREE.Matrix4().makeRotationAxis(axis.clone().normalize(), angle * eased);
    const atoms = model.userData.atomMeshes ?? [];
    atoms.forEach((atom, index) => {
      atom.position.copy(startPositions[index]).applyMatrix4(matrix);
    });
    updateBallStickBonds(model);
  });
}

function animateLinearPositions(model, startPositions, targetPositions, duration) {
  return tween(duration, (t) => {
    const eased = easeInOutCubic(t);
    const atoms = model.userData.atomMeshes ?? [];
    atoms.forEach((atom, index) => {
      atom.position.copy(startPositions[index]).lerp(targetPositions[index], eased);
    });
    updateBallStickBonds(model);
  });
}

function tween(duration, update) {
  const startTime = performance.now();
  return new Promise((resolve) => {
    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      update(t);
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

function addGhost(positions, group) {
  const material = new THREE.MeshBasicMaterial({
    color: COLORS.ghost,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  positions.forEach((position) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(SIZES.atom * 0.95, 24, 12), material.clone());
    mesh.position.copy(position);
    group.add(mesh);
  });
}

function addTrajectories(startPositions, targetPositions, group) {
  const positions = [];
  startPositions.forEach((start, index) => {
    const target = targetPositions[index];
    positions.push(start.x, start.y, start.z, target.x, target.y, target.z);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: COLORS.trajectory,
    transparent: true,
    opacity: 0.38,
  });
  group.add(new THREE.LineSegments(geometry, material));
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
