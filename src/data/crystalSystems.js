export const crystalSystems = [
  { key: 'triclinic', label: 'Triclinic', zh: '三斜', color: '#58d6ff' },
  { key: 'monoclinic', label: 'Monoclinic', zh: '单斜', color: '#8ddf73' },
  { key: 'orthorhombic', label: 'Orthorhombic', zh: '正交', color: '#ffcf5d' },
  { key: 'tetragonal', label: 'Tetragonal', zh: '四方', color: '#ff8a65' },
  { key: 'trigonal', label: 'Trigonal / Rhombohedral', zh: '三方 / 菱方', color: '#bd9cff' },
  { key: 'hexagonal', label: 'Hexagonal', zh: '六方', color: '#64d8cb' },
  { key: 'cubic', label: 'Cubic', zh: '立方', color: '#ff6f91' },
];

export function getCrystalSystem(key) {
  return crystalSystems.find((system) => system.key === key);
}
