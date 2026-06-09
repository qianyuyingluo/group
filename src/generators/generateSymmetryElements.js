import * as THREE from 'three';
import { COLORS, SIZES } from '../config.js';
import { createInversionCenter } from '../objects/inversionCenter.js';
import { createMirrorPlane } from '../objects/mirrorPlane.js';
import { createSymmetryAxis } from '../objects/symmetryAxis.js';
import { horizontalAxis, verticalPlaneNormal } from '../math/vectors.js';

const Z = new THREE.Vector3(0, 0, 1);

export function generateSymmetryElements(pointGroup) {
  const group = new THREE.Group();
  group.name = 'symmetry-elements';

  addPrimaryElements(group, pointGroup);
  addFamilyElements(group, pointGroup);
  addCubicElements(group, pointGroup);

  return group;
}

function addPrimaryElements(group, pointGroup) {
  if (pointGroup.family === 'C1' || pointGroup.key === 'C1') return;
  if (pointGroup.key === 'Ci') {
    group.add(createInversionCenter('i'));
    return;
  }
  if (pointGroup.key === 'Cs') {
    group.add(createMirrorPlane({ normal: new THREE.Vector3(0, 1, 0), label: 'σ' }));
    return;
  }
  if (pointGroup.family === 'Sn') {
    group.add(createSymmetryAxis({ direction: Z, label: `S${pointGroup.n}`, color: COLORS.axisImproper, dashed: true, length: 3.4 }));
    return;
  }
  if (pointGroup.n) {
    group.add(createSymmetryAxis({ direction: Z, label: `C${pointGroup.n}`, color: COLORS.axisPrimary, length: 3.45 }));
  }
}

function addFamilyElements(group, pointGroup) {
  const { family, n } = pointGroup;
  if (!n) return;

  if (family === 'Cnv') {
    addVerticalMirrors(group, n, 0, 'σv');
  }

  if (family === 'Cnh') {
    group.add(createMirrorPlane({ normal: Z, label: 'σh', color: COLORS.mirrorAlt }));
    if (pointGroup.symmetryElements.includes('i')) group.add(createInversionCenter('i'));
  }

  if (family === 'Cni') {
    group.add(createSymmetryAxis({ direction: Z, label: `S${2 * n}`, color: COLORS.axisImproper, dashed: true, length: 3.35 }));
    group.add(createInversionCenter('i'));
  }

  if (family === 'Dn' || family === 'Dnh') {
    addC2Axes(group, n);
  }

  if (family === 'Dnd') {
    addC2Axes(group, n, Math.PI / (2 * n));
  }

  if (family === 'Dnh') {
    group.add(createMirrorPlane({ normal: Z, label: 'σh', color: COLORS.mirrorAlt }));
    addVerticalMirrors(group, n, 0, 'σv');
    if (pointGroup.symmetryElements.includes('i')) group.add(createInversionCenter('i'));
  }

  if (family === 'Dnd') {
    addVerticalMirrors(group, n, 0, 'σd');
    if (pointGroup.symmetryElements.includes('i')) group.add(createInversionCenter('i'));
  }
}

function addCubicElements(group, pointGroup) {
  if (!['T', 'Th', 'Td', 'O', 'Oh'].includes(pointGroup.family)) return;

  const bodyDiagonals = [
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(1, -1, 1),
    new THREE.Vector3(-1, 1, 1),
    new THREE.Vector3(-1, -1, 1),
  ];
  bodyDiagonals.forEach((axis, index) => {
    group.add(createSymmetryAxis({
      direction: axis.normalize(),
      label: `C3 ${index + 1}`,
      color: COLORS.axisPrimary,
      length: 3.15,
      radius: SIZES.c2AxisRadius,
    }));
  });

  if (['O', 'Oh'].includes(pointGroup.family)) {
    [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    ].forEach((axis, index) => {
      group.add(createSymmetryAxis({
        direction: axis,
        label: `C4 ${index + 1}`,
        color: COLORS.axisSecondary,
        length: 3.35,
      }));
    });
  }

  if (['Th', 'Oh'].includes(pointGroup.family)) {
    group.add(createInversionCenter('i'));
  }

  if (['Td', 'Oh', 'Th'].includes(pointGroup.family)) {
    group.add(createMirrorPlane({ normal: new THREE.Vector3(1, -1, 0), label: 'σd', color: COLORS.mirror }));
    group.add(createMirrorPlane({ normal: new THREE.Vector3(0, 1, -1), label: 'σd', color: COLORS.mirror }));
    if (pointGroup.family !== 'Td') {
      group.add(createMirrorPlane({ normal: new THREE.Vector3(0, 0, 1), label: 'σ', color: COLORS.mirrorAlt }));
    }
  }
}

function addC2Axes(group, n, phase = 0) {
  for (let i = 0; i < n; i += 1) {
    group.add(createSymmetryAxis({
      direction: horizontalAxis(phase + (Math.PI * i) / n),
      label: `C2′${i + 1}`,
      color: COLORS.axisSecondary,
      length: 2.55,
      radius: SIZES.c2AxisRadius,
    }));
  }
}

function addVerticalMirrors(group, n, phase, labelPrefix) {
  for (let i = 0; i < n; i += 1) {
    const angle = phase + (Math.PI * i) / n;
    group.add(createMirrorPlane({
      normal: verticalPlaneNormal(angle),
      label: `${labelPrefix}${i + 1}`,
      color: labelPrefix === 'σd' ? COLORS.mirrorAlt : COLORS.mirror,
      opacity: 0.15,
    }));
  }
}
