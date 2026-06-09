import { pointGroups } from '../src/data/pointGroups.js';
import { operationMatrix } from '../src/math/operations.js';
import { generateModel } from '../src/generators/generateModel.js';

const POSITION_TOLERANCE = 1e-4;
const EXPECTED_ORDERS = {
  C1: 1,
  Ci: 2,
  Cs: 2,
  C2: 2,
  C2h: 4,
  C2v: 4,
  D2: 4,
  D2h: 8,
  C4: 4,
  S4: 4,
  C4h: 8,
  D2d: 8,
  C4v: 8,
  D4: 8,
  D4h: 16,
  C3: 3,
  C3i: 6,
  C3v: 6,
  D3: 6,
  D3d: 12,
  C3h: 6,
  C6: 6,
  C6h: 12,
  D3h: 12,
  C6v: 12,
  D6: 12,
  D6h: 24,
  T: 12,
  Th: 24,
  O: 24,
  Td: 24,
  Oh: 48,
};

const failures = [];

for (const pointGroup of pointGroups) {
  if (pointGroup.operations.length !== EXPECTED_ORDERS[pointGroup.key]) {
    failures.push(`${pointGroup.key}: expected ${EXPECTED_ORDERS[pointGroup.key]} operations, got ${pointGroup.operations.length}`);
    continue;
  }

  const model = generateModel(pointGroup);
  const atoms = model.userData.atomMeshes.map((atom) => ({
    position: atom.position.clone(),
    radius: atom.userData.radius,
    color: atom.userData.color,
    name: atom.userData.name,
  }));

  for (const operation of pointGroup.operations) {
    const matrix = operationMatrix(operation);
    const remaining = atoms.map((_, index) => index);

    for (const atom of atoms) {
      const target = atom.position.clone().applyMatrix4(matrix);
      const matchOffset = remaining.findIndex((candidateIndex) => {
        const candidate = atoms[candidateIndex];
        return atom.radius === candidate.radius
          && atom.color === candidate.color
          && target.distanceTo(candidate.position) <= POSITION_TOLERANCE;
      });

      if (matchOffset === -1) {
        failures.push(`${pointGroup.key} ${operation.name}: ${atom.name} -> (${target.x.toFixed(3)}, ${target.y.toFixed(3)}, ${target.z.toFixed(3)}) has no matching atom`);
        break;
      }

      remaining.splice(matchOffset, 1);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`validated ${pointGroups.length} point groups`);
