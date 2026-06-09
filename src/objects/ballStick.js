import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';
import { createAtom } from './atom.js';
import { createBond, updateBond } from './bond.js';

const palette = [
  COLORS.atoms.red,
  COLORS.atoms.blue,
  COLORS.atoms.gold,
  COLORS.atoms.green,
  COLORS.atoms.violet,
  COLORS.atoms.orange,
];

export function createBallStick({ atoms, bonds, name = 'model' }) {
  const group = new THREE.Group();
  group.name = name;
  group.userData.kind = 'ballStick';
  group.userData.atomMeshes = [];
  group.userData.bondMeshes = [];
  group.userData.bondPairs = bonds;
  group.userData.basePositions = atoms.map((atom) => atom.position.clone());

  atoms.forEach((atom, index) => {
    const mesh = createAtom(
      atom.position,
      atom.radius ?? SIZES.atom,
      atom.color ?? palette[index % palette.length],
      atom.name ?? `A${index + 1}`,
    );
    group.userData.atomMeshes.push(mesh);
    group.add(mesh);
  });

  bonds.forEach(([from, to]) => {
    const bond = createBond(atoms[from].position, atoms[to].position, SIZES.bond, COLORS.bond);
    group.userData.bondMeshes.push(bond);
    group.add(bond);
  });

  return group;
}

export function createCenterAtom(position = new THREE.Vector3(), options = {}) {
  return {
    name: options.name ?? 'Center',
    position,
    radius: options.radius ?? SIZES.atomLarge,
    color: options.color ?? COLORS.atoms.core,
  };
}

export function resetBallStick(group) {
  const atoms = group.userData.atomMeshes ?? [];
  const basePositions = group.userData.basePositions ?? [];
  atoms.forEach((atom, index) => atom.position.copy(basePositions[index]));
  updateBallStickBonds(group);
}

export function updateBallStickBonds(group) {
  const atoms = group.userData.atomMeshes ?? [];
  const bonds = group.userData.bondMeshes ?? [];
  const pairs = group.userData.bondPairs ?? [];

  bonds.forEach((bond, index) => {
    const [from, to] = pairs[index];
    const start = atoms[from].position;
    const end = atoms[to].position;
    updateBond(bond, start, end);
  });
}

export function disposeObject(object) {
  object.traverse((child) => {
    child.element?.remove?.();
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose?.());
    } else {
      child.material?.dispose?.();
    }
  });
}
