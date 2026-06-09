const z = [0, 0, 1];

export const pointGroups = [
  group('C1', 'triclinic', '1', 'genericAsymmetric', 'C1', null, ['E'], [
    op('E', 'identity'),
  ]),
  group('Ci', 'triclinic', '-1', 'inversionPair', 'Ci', null, ['E', 'i'], [
    op('E', 'identity'),
    op('i', 'inversion'),
  ]),
  group('Cs', 'monoclinic', 'm', 'mirrorPair', 'Cs', null, ['E', 'σ'], [
    op('E', 'identity'),
    op('σ', 'reflectionPlane', { normal: [0, 1, 0], element: 'σ' }),
  ]),
  group('C2', 'monoclinic', '2', 'Cn', 'Cn', 2, ['E', 'C2'], [
    op('E', 'identity'),
    op('C2', 'rotation', { n: 2, k: 1, axis: z, element: 'C2' }),
  ]),
  group('C2h', 'monoclinic', '2/m', 'Cnh', 'Cnh', 2, ['E', 'C2', 'σh', 'i'], operationsCnh(2)),

  group('C2v', 'orthorhombic', 'mm2', 'Cnv', 'Cnv', 2, ['E', 'C2', '2σv'], operationsCnv(2)),
  group('D2', 'orthorhombic', '222', 'Dn', 'Dn', 2, ['E', '3C2'], operationsDn(2)),
  group('D2h', 'orthorhombic', 'mmm', 'Dnh', 'Dnh', 2, ['E', '3C2', 'i', '3σ'], operationsDnh(2)),

  group('C4', 'tetragonal', '4', 'Cn', 'Cn', 4, ['E', '2C4', 'C2'], operationsCn(4)),
  group('S4', 'tetragonal', '-4', 'Sn', 'Sn', 4, ['E', 'C2', '2S4'], operationsS4()),
  group('C4h', 'tetragonal', '4/m', 'Cnh', 'Cnh', 4, ['E', '2C4', 'C2', 'σh', 'i', '2S4'], operationsCnh(4)),
  group('D2d', 'tetragonal', '-42m', 'Dnd', 'Dnd', 2, ['E', '2S4', '2C2′', '2σd'], operationsDnd(2)),
  group('C4v', 'tetragonal', '4mm', 'Cnv', 'Cnv', 4, ['E', '2C4', 'C2', '4σv'], operationsCnv(4)),
  group('D4', 'tetragonal', '422', 'Dn', 'Dn', 4, ['E', '2C4', 'C2', '4C2′'], operationsDn(4)),
  group('D4h', 'tetragonal', '4/mmm', 'Dnh', 'Dnh', 4, ['E', '2C4', 'C2', '4C2′', 'i', 'σh', '4σv'], operationsDnh(4)),

  group('C3', 'trigonal', '3', 'Cn', 'Cn', 3, ['E', '2C3'], operationsCn(3)),
  group('C3i', 'trigonal', '-3', 'Cni', 'Cni', 3, ['E', '2C3', 'i', '2S6'], operationsCni(3)),
  group('C3v', 'trigonal', '3m', 'trigonalPyramid', 'Cnv', 3, ['E', '2C3', '3σv'], operationsCnv(3)),
  group('D3', 'trigonal', '32', 'Dn', 'Dn', 3, ['E', '2C3', '3C2′'], operationsDn(3)),
  group('D3d', 'trigonal', '-3m', 'Dnd', 'Dnd', 3, ['E', '2C3', '3C2′', 'i', '3σd', '2S6'], operationsDnd(3)),

  group('C3h', 'hexagonal', '-6', 'Cnh', 'Cnh', 3, ['E', '2C3', 'σh', '2S3'], operationsCnh(3)),
  group('C6', 'hexagonal', '6', 'Cn', 'Cn', 6, ['E', '2C6', '2C3', 'C2'], operationsCn(6)),
  group('C6h', 'hexagonal', '6/m', 'Cnh', 'Cnh', 6, ['E', '2C6', '2C3', 'C2', 'σh', 'i'], operationsCnh(6)),
  group('D3h', 'hexagonal', '-62m', 'Dnh', 'Dnh', 3, ['E', '2C3', '3C2′', 'σh', '3σv'], operationsDnh(3)),
  group('C6v', 'hexagonal', '6mm', 'Cnv', 'Cnv', 6, ['E', '2C6', '2C3', 'C2', '6σv'], operationsCnv(6)),
  group('D6', 'hexagonal', '622', 'Dn', 'Dn', 6, ['E', '2C6', '2C3', 'C2', '6C2′'], operationsDn(6)),
  group('D6h', 'hexagonal', '6/mmm', 'Dnh', 'Dnh', 6, ['E', '2C6', '2C3', 'C2', '6C2′', 'i', 'σh', '6σv'], operationsDnh(6)),

  group('T', 'cubic', '23', 'tetrahedral', 'T', null, ['E', '8C3', '3C2'], operationsT()),
  group('Th', 'cubic', 'm-3', 'tetrahedral', 'Th', null, ['E', '8C3', '3C2', 'i', '3σh'], operationsTh()),
  group('O', 'cubic', '432', 'octahedral', 'O', null, ['E', '8C3', '6C4', '3C2', '6C2′'], operationsO()),
  group('Td', 'cubic', '-43m', 'tetrahedral', 'Td', null, ['E', '8C3', '3C2', '6S4', '6σd'], operationsTd()),
  group('Oh', 'cubic', 'm-3m', 'octahedral', 'Oh', null, ['E', '8C3', '6C4', '3C2', '6C2′', 'i', 'mirror planes'], operationsOh()),
];

export function getPointGroup(key) {
  return pointGroups.find((item) => item.key === key);
}

function group(schoenflies, crystalSystem, hermannMauguin, model, family, n, elements, operations) {
  return {
    key: schoenflies,
    schoenflies,
    crystalSystem,
    hermannMauguin,
    model,
    family,
    n,
    symmetryElements: elements,
    operations,
  };
}

function op(name, type, extra = {}) {
  return { name, type, ...extra };
}

function operationsCn(n) {
  return [
    op('E', 'identity'),
    ...Array.from({ length: n - 1 }, (_, i) => {
      const k = i + 1;
      return op(rotationName('C', n, k), 'rotation', { n, k, axis: z, element: `C${n}` });
    }),
  ];
}

function operationsCnv(n) {
  return [
    ...operationsCn(n),
    ...Array.from({ length: n }, (_, i) => op(`σv${i + 1}`, 'reflectionVertical', {
      angle: (2 * Math.PI * i) / n,
      element: `σv${i + 1}`,
    })),
  ];
}

function operationsCnh(n) {
  return [
    ...operationsCn(n),
    ...Array.from({ length: n }, (_, i) => op(horizontalProductName(n, i), horizontalProductType(n, i), {
      n,
      k: i,
      axis: z,
      element: i === 0 ? 'σh' : horizontalProductElement(n, i),
    })),
  ];
}

function operationsCni(n) {
  return [
    ...operationsCn(n),
    op('i', 'inversion', { element: 'i' }),
    ...Array.from({ length: n - 1 }, (_, i) => op(`i·${rotationName('C', n, i + 1)}`, 'rotationInversion', {
      n,
      k: i + 1,
      axis: z,
      element: 'i',
    })),
  ];
}

function operationsS4() {
  return [
    op('E', 'identity'),
    op('S4', 'improper', { n: 4, k: 1, axis: z, element: 'S4' }),
    op('C2', 'rotation', { n: 2, k: 1, axis: z, element: 'C2' }),
    op('S4³', 'improper', { n: 4, k: 3, axis: z, element: 'S4' }),
  ];
}

function operationsDn(n) {
  return [
    ...operationsCn(n),
    ...Array.from({ length: n }, (_, i) => op(`C2′${i + 1}`, 'rotation', {
      n: 2,
      k: 1,
      axis: [Math.cos((Math.PI * i) / n), Math.sin((Math.PI * i) / n), 0],
      element: `C2′${i + 1}`,
    })),
  ];
}

function operationsDnh(n) {
  return [
    ...operationsDn(n),
    ...Array.from({ length: n }, (_, i) => op(horizontalProductName(n, i), horizontalProductType(n, i), {
      n,
      k: i,
      axis: z,
      element: i === 0 ? 'σh' : horizontalProductElement(n, i),
    })),
    ...Array.from({ length: n }, (_, i) => op(`σv${i + 1}`, 'reflectionVertical', {
      angle: (Math.PI * i) / n,
      element: `σv${i + 1}`,
    })),
  ];
}

function operationsDnd(n) {
  return [
    ...operationsCn(n),
    ...Array.from({ length: n }, (_, i) => op(`C2′${i + 1}`, 'rotation', {
      n: 2,
      k: 1,
      axis: [Math.cos(((i + 0.5) * Math.PI) / n), Math.sin(((i + 0.5) * Math.PI) / n), 0],
      element: `C2′${i + 1}`,
    })),
    ...Array.from({ length: n }, (_, i) => op(`σd${i + 1}`, 'reflectionVertical', {
      angle: (Math.PI * i) / n,
      element: `σd${i + 1}`,
    })),
    ...Array.from({ length: n }, (_, i) => op(`S${2 * n}${sup(2 * i + 1)}`, 'improper', {
      n: 2 * n,
      k: 2 * i + 1,
      axis: z,
      element: `S${2 * n}`,
    })),
  ];
}

function operationsT() {
  return [
    op('E', 'identity'),
    ...bodyDiagonalOps(3),
    ...cartesianC2Ops(),
  ];
}

function operationsTh() {
  return withInversionProducts(operationsT());
}

function operationsTd() {
  return [
    ...operationsT(),
    ...cartesianImproperOps(),
    ...diagonalMirrorOps(),
  ];
}

function operationsO() {
  return [
    op('E', 'identity'),
    ...bodyDiagonalOps(3),
    ...cartesianC4Ops(),
    ...cartesianC2Ops(),
    ...edgeC2Ops(),
  ];
}

function operationsOh() {
  return withInversionProducts(operationsO());
}

function withInversionProducts(rotationGroup) {
  return [
    ...rotationGroup,
    op('i', 'inversion', { element: 'i' }),
    ...rotationGroup
      .filter((operation) => operation.type !== 'identity')
      .map((operation) => op(`i·${operation.name}`, 'rotationInversion', {
        n: operation.n,
        k: operation.k,
        axis: operation.axis,
        element: 'i',
      })),
  ];
}

function bodyDiagonalOps(n) {
  const axes = [
    [1, 1, 1],
    [1, -1, 1],
    [-1, 1, 1],
    [-1, -1, 1],
  ];
  return axes.flatMap((axis, index) => [
    op(`C3 a${index + 1}`, 'rotation', { n, k: 1, axis, element: 'C3' }),
    op(`C3² a${index + 1}`, 'rotation', { n, k: 2, axis, element: 'C3' }),
  ]);
}

function cartesianC2Ops() {
  return [
    op('C2 x', 'rotation', { n: 2, k: 1, axis: [1, 0, 0], element: 'C2' }),
    op('C2 y', 'rotation', { n: 2, k: 1, axis: [0, 1, 0], element: 'C2' }),
    op('C2 z', 'rotation', { n: 2, k: 1, axis: [0, 0, 1], element: 'C2' }),
  ];
}

function cartesianC4Ops() {
  return [[1, 0, 0], [0, 1, 0], [0, 0, 1]].flatMap((axis, index) => [
    op(`C4 ${index + 1}`, 'rotation', { n: 4, k: 1, axis, element: 'C4' }),
    op(`C4³ ${index + 1}`, 'rotation', { n: 4, k: 3, axis, element: 'C4' }),
  ]);
}

function cartesianImproperOps() {
  return [[1, 0, 0], [0, 1, 0], [0, 0, 1]].flatMap((axis, index) => [
    op(`S4 ${index + 1}`, 'improper', { n: 4, k: 1, axis, element: 'S4' }),
    op(`S4³ ${index + 1}`, 'improper', { n: 4, k: 3, axis, element: 'S4' }),
  ]);
}

function edgeC2Ops() {
  return [
    [1, 1, 0],
    [1, -1, 0],
    [1, 0, 1],
    [1, 0, -1],
    [0, 1, 1],
    [0, 1, -1],
  ].map((axis, index) => op(`C2′ ${index + 1}`, 'rotation', { n: 2, k: 1, axis, element: 'C2′' }));
}

function diagonalMirrorOps() {
  return [
    [1, -1, 0],
    [1, 1, 0],
    [1, 0, -1],
    [1, 0, 1],
    [0, 1, -1],
    [0, 1, 1],
  ].map((normal, index) => op(`σd ${index + 1}`, 'reflectionPlane', { normal, element: 'σd' }));
}

function rotationName(prefix, n, k) {
  if (k === 1) return `${prefix}${n}`;
  return `${prefix}${n}${sup(k)}`;
}

function horizontalProductName(n, k) {
  if (k === 0) return 'σh';
  if (n % 2 === 0 && k === n / 2) return 'i';
  return `S${n}${sup(k)}`;
}

function horizontalProductElement(n, k) {
  if (n % 2 === 0 && k === n / 2) return 'i';
  return `S${n}`;
}

function horizontalProductType(n, k) {
  if (k === 0) return 'reflectionHorizontal';
  if (n % 2 === 0 && k === n / 2) return 'inversion';
  return 'improper';
}

function sup(k) {
  const map = { 0: '⁰', 1: '', 2: '²', 3: '³', 4: '⁴', 5: '⁵' };
  return map[k] ?? `^${k}`;
}
